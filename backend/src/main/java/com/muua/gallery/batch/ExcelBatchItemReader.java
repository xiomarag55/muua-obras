package com.muua.gallery.batch;

import lombok.extern.slf4j.Slf4j;
import org.apache.poi.openxml4j.opc.OPCPackage;
import org.apache.poi.openxml4j.opc.PackagePart;
import org.apache.poi.openxml4j.opc.PackageRelationship;
import org.apache.poi.openxml4j.opc.PackageRelationshipCollection;
import org.apache.poi.openxml4j.opc.PackagingURIHelper;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.util.IOUtils;
import org.apache.poi.util.XMLHelper;
import org.apache.poi.xssf.eventusermodel.ReadOnlySharedStringsTable;
import org.apache.poi.xssf.eventusermodel.XSSFReader;
import org.apache.poi.xssf.eventusermodel.XSSFSheetXMLHandler;
import org.apache.poi.xssf.model.StylesTable;
import org.apache.poi.xssf.usermodel.XSSFComment;
import org.springframework.batch.item.ExecutionContext;
import org.springframework.batch.item.ItemReader;
import org.springframework.batch.item.ItemStream;
import org.springframework.batch.item.ItemStreamException;
import org.xml.sax.Attributes;
import org.xml.sax.InputSource;
import org.xml.sax.XMLReader;
import org.xml.sax.helpers.DefaultHandler;

import javax.xml.parsers.SAXParserFactory;
import java.io.File;
import java.io.InputStream;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;

/**
 * Lee un Excel XLSX fila a fila usando SAX (streaming) en un hilo productor y
 * expone los datos al chunk de Spring Batch mediante una cola bloqueante.
 *
 * Ventajas:
 *  - El hilo SAX nunca bloquea más allá de QUEUE_CAPACITY filas en memoria.
 *  - El hilo principal de Spring Batch consume a su propio ritmo (chunk size).
 *  - El OPCPackage queda abierto sólo durante el parsing y se cierra solo.
 */
@Slf4j
public class ExcelBatchItemReader implements ItemReader<ExcelRowData>, ItemStream {

    private static final int QUEUE_CAPACITY      = 150;
    private static final int POLL_TIMEOUT_SECONDS = 120;

    private final String filePath;

    private LinkedBlockingQueue<ExcelRowData> queue;
    private Thread parserThread;
    private volatile Exception parserException;

    // Centinela que indica fin de stream (nunca se devuelve al caller)
    private static final ExcelRowData END_MARKER = new ExcelRowData();
    static { END_MARKER.setEndOfStream(true); }

    public ExcelBatchItemReader(String filePath) {
        this.filePath = filePath;
    }

    // ─── ItemStream ──────────────────────────────────────────────────────────

    @Override
    public void open(ExecutionContext executionContext) throws ItemStreamException {
        queue = new LinkedBlockingQueue<>(QUEUE_CAPACITY);
        parserThread = new Thread(this::runParser, "excel-batch-parser");
        parserThread.setDaemon(true);
        parserThread.start();
        log.info("Parser Excel iniciado para: {}", filePath);
    }

    @Override
    public void update(ExecutionContext executionContext) throws ItemStreamException { }

    @Override
    public void close() throws ItemStreamException {
        if (parserThread != null && parserThread.isAlive()) {
            parserThread.interrupt();
        }
    }

    // ─── ItemReader ──────────────────────────────────────────────────────────

    @Override
    public ExcelRowData read() throws Exception {
        if (parserException != null) throw parserException;

        ExcelRowData item = queue.poll(POLL_TIMEOUT_SECONDS, TimeUnit.SECONDS);
        if (item == null) {
            throw new RuntimeException("Timeout esperando filas del parser Excel (" + POLL_TIMEOUT_SECONDS + "s)");
        }
        if (item.isEndOfStream()) {
            if (parserException != null) throw parserException;
            return null; // señal de fin para Spring Batch
        }
        return item;
    }

    // ─── Hilo productor (SAX parser) ─────────────────────────────────────────

    private void runParser() {
        IOUtils.setByteArrayMaxOverride(-1);
        try (OPCPackage pkg = OPCPackage.open(new File(filePath))) {
            Map<Integer, PackagePart> imageParts = extraerPartsImagenes(pkg);

            XSSFReader xssfReader = new XSSFReader(pkg);
            ReadOnlySharedStringsTable strings = new ReadOnlySharedStringsTable(pkg);
            StylesTable styles = xssfReader.getStylesTable();

            SheetHandler handler = new SheetHandler(queue, imageParts);
            XMLReader xmlReader = XMLHelper.newXMLReader();
            xmlReader.setContentHandler(
                    new XSSFSheetXMLHandler(styles, null, strings, handler, new DataFormatter(), false)
            );

            XSSFReader.SheetIterator sheets = (XSSFReader.SheetIterator) xssfReader.getSheetsData();
            if (sheets.hasNext()) {
                try (InputStream sheetStream = sheets.next()) {
                    xmlReader.parse(new InputSource(sheetStream));
                }
            }
            log.info("Parser Excel terminado. Filas producidas: {}", handler.getRowCount());
        } catch (Exception e) {
            parserException = e;
            log.error("Error en parser Excel: {}", e.getMessage(), e);
        } finally {
            try {
                queue.put(END_MARKER);
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
            }
        }
    }

    // ─── Extracción de imágenes (refs, no bytes) ──────────────────────────────

    private Map<Integer, PackagePart> extraerPartsImagenes(OPCPackage pkg) {
        Map<Integer, PackagePart> result = new HashMap<>();
        try {
            List<PackagePart> drawingParts = pkg.getPartsByContentType(
                    "application/vnd.openxmlformats-officedocument.drawing+xml");

            for (PackagePart drawingPart : drawingParts) {
                Map<Integer, String> rowToRId = parseDrawingForRowImageMap(drawingPart);
                PackageRelationshipCollection rels = drawingPart.getRelationships();

                for (Map.Entry<Integer, String> entry : rowToRId.entrySet()) {
                    PackageRelationship rel = rels.getRelationshipByID(entry.getValue());
                    if (rel == null) continue;

                    String dir = drawingPart.getPartName().getName();
                    dir = dir.substring(0, dir.lastIndexOf('/'));
                    String absPath = resolveRelativePath(dir, rel.getTargetURI().toString());
                    try {
                        PackagePart imgPart = pkg.getPart(PackagingURIHelper.createPartName(absPath));
                        if (imgPart != null) result.put(entry.getKey(), imgPart);
                    } catch (Exception ignored) { }
                }
            }
        } catch (Exception e) {
            log.warn("No se pudo construir mapa de imágenes: {}", e.getMessage());
        }
        log.info("Imágenes mapeadas en drawing: {}", result.size());
        return result;
    }

    private String resolveRelativePath(String base, String relative) {
        relative = relative.replace("\\", "/");
        while (relative.startsWith("../")) {
            int slash = base.lastIndexOf('/');
            if (slash > 0) base = base.substring(0, slash);
            relative = relative.substring(3);
        }
        return base + "/" + relative;
    }

    private Map<Integer, String> parseDrawingForRowImageMap(PackagePart drawingPart) throws Exception {
        Map<Integer, String> rowToRId = new HashMap<>();
        final boolean[] inFrom  = {false};
        final boolean[] inRow   = {false};
        final int[]     row     = {-1};
        final String[]  rId     = {null};
        final StringBuilder rowText = new StringBuilder();

        SAXParserFactory factory = SAXParserFactory.newInstance();
        factory.setNamespaceAware(true);
        factory.setFeature("http://xml.org/sax/features/external-general-entities", false);
        factory.setFeature("http://xml.org/sax/features/external-parameter-entities", false);

        factory.newSAXParser().parse(drawingPart.getInputStream(), new DefaultHandler() {
            @Override
            public void startElement(String uri, String local, String qName, Attributes attrs) {
                if ("from".equals(local))  { inFrom[0] = true; row[0] = -1; }
                if (inFrom[0] && "row".equals(local)) { inRow[0] = true; rowText.setLength(0); }
                if ("blip".equals(local)) {
                    for (int i = 0; i < attrs.getLength(); i++) {
                        if (attrs.getQName(i).endsWith(":embed") || "embed".equals(attrs.getQName(i))) {
                            rId[0] = attrs.getValue(i);
                            break;
                        }
                    }
                }
            }

            @Override
            public void characters(char[] ch, int start, int length) {
                if (inRow[0]) rowText.append(ch, start, length);
            }

            @Override
            public void endElement(String uri, String local, String qName) {
                if (inRow[0] && "row".equals(local)) {
                    try { row[0] = Integer.parseInt(rowText.toString().trim()); }
                    catch (NumberFormatException ignored) { }
                    inRow[0] = false;
                }
                if ("from".equals(local)) inFrom[0] = false;
                if ("twoCellAnchor".equals(local) || "oneCellAnchor".equals(local)) {
                    if (row[0] >= 0 && rId[0] != null) rowToRId.put(row[0], rId[0]);
                    row[0] = -1;
                    rId[0] = null;
                }
            }
        });
        return rowToRId;
    }

    // ─── Handler SAX que puebla la cola ──────────────────────────────────────

    private static class SheetHandler implements XSSFSheetXMLHandler.SheetContentsHandler {

        private static final org.slf4j.Logger log =
                org.slf4j.LoggerFactory.getLogger(SheetHandler.class);

        private final LinkedBlockingQueue<ExcelRowData> queue;
        private final Map<Integer, PackagePart>         imageParts;
        private final Map<String, String>               currentRow = new LinkedHashMap<>();
        private int currentRowNum;
        private int rowCount = 0;

        SheetHandler(LinkedBlockingQueue<ExcelRowData> queue,
                     Map<Integer, PackagePart> imageParts) {
            this.queue      = queue;
            this.imageParts = imageParts;
        }

        int getRowCount() { return rowCount; }

        @Override
        public void startRow(int rowNum) {
            currentRowNum = rowNum;
            currentRow.clear();
        }

        @Override
        public void endRow(int rowNum) {
            if (rowNum == 0) return; // cabecera

            ExcelRowData rowData = new ExcelRowData();
            rowData.setRowNum(rowNum);
            rowData.setCells(new LinkedHashMap<>(currentRow));

            PackagePart imgPart = imageParts.get(rowNum);
            if (imgPart != null) {
                try (InputStream is = imgPart.getInputStream()) {
                    rowData.setImageBytes(IOUtils.toByteArray(is));
                    rowData.setImageFileName("foto_fila_" + rowNum);
                } catch (Exception e) {
                    log.debug("Sin imagen para fila {}: {}", rowNum, e.getMessage());
                }
            }

            try {
                queue.put(rowData); // bloquea si la cola está llena (backpressure)
                rowCount++;
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
            }
        }

        @Override
        public void cell(String cellRef, String formattedValue, XSSFComment comment) {
            if (cellRef == null || formattedValue == null) return;
            currentRow.put(String.valueOf(colIndex(cellRef)), formattedValue.trim());
        }

        private int colIndex(String cellRef) {
            int col = 0;
            for (char c : cellRef.toCharArray()) {
                if (!Character.isLetter(c)) break;
                col = col * 26 + (c - 'A' + 1);
            }
            return col - 1;
        }
    }
}
