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
import java.util.ArrayList;
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
 * Estrategias de extracción de imágenes (en orden):
 *  1. Drawing parts por content-type estándar.
 *  2. Drawing parts via relaciones de la hoja (fallback si strategy 1 da vacío).
 *  3. Asignación secuencial image[i] → fila i+1 (si el mapa por fila da vacío).
 */
@Slf4j
public class ExcelBatchItemReader implements ItemReader<ExcelRowData>, ItemStream {

    private static final int QUEUE_CAPACITY       = 150;
    private static final int POLL_TIMEOUT_SECONDS = 120;

    private final String filePath;

    private LinkedBlockingQueue<ExcelRowData> queue;
    private Thread    parserThread;
    private volatile Exception parserException;

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
            return null;
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

    // ─── Extracción de imágenes (multi-estrategia) ───────────────────────────

    private Map<Integer, PackagePart> extraerPartsImagenes(OPCPackage pkg) {
        Map<Integer, PackagePart> result = new HashMap<>();
        try {
            // Estrategia 1: drawing parts por content-type estándar
            List<PackagePart> drawingParts = pkg.getPartsByContentType(
                    "application/vnd.openxmlformats-officedocument.drawing+xml");

            // Estrategia 2: drawing parts via relaciones de la hoja
            if (drawingParts.isEmpty()) {
                log.info("No drawing parts por content-type, buscando via relaciones de hoja...");
                drawingParts = getDrawingPartsViaSheetRels(pkg);
            }
            log.info("Drawing parts encontrados: {}", drawingParts.size());

            for (PackagePart drawingPart : drawingParts) {
                DrawingParseResult parsed = parseDrawingForRowImageMap(drawingPart);
                PackageRelationshipCollection rels = drawingPart.getRelationships();

                // Colectar TODAS las relaciones de imagen del drawing (r:embed + r:link + cualquier otra)
                List<String> allImageRIds = new ArrayList<>();
                for (PackageRelationship rel : rels) {
                    if (rel.getRelationshipType().endsWith("/image")) {
                        allImageRIds.add(rel.getId());
                    }
                }

                log.info("Drawing '{}' → {} anchors con fila, {} rIds vía blip, {} relaciones imagen totales",
                        drawingPart.getPartName(), parsed.rowToRId.size(),
                        parsed.orderedRIds.size(), allImageRIds.size());

                // Estrategia 3a: mapeo fila→imagen via blip (más preciso)
                if (!parsed.rowToRId.isEmpty()) {
                    for (Map.Entry<Integer, String> e : parsed.rowToRId.entrySet()) {
                        PackagePart img = resolveImagePart(pkg, drawingPart, rels, e.getValue());
                        if (img != null) result.put(e.getKey(), img);
                    }
                }

                // Estrategia 3b: si blip dio menos imágenes que las relaciones reales,
                // usar TODAS las relaciones de imagen ordenadas por número de rId
                if (allImageRIds.size() > result.size()) {
                    // Ordenar numéricamente: rId1 < rId2 < rId10 (no alfabético)
                    allImageRIds.sort((a, b) -> Integer.compare(extractNumber(a), extractNumber(b)));
                    result.clear();
                    List<PackagePart> allImgs = new ArrayList<>();
                    for (String rId : allImageRIds) {
                        PackagePart img = resolveImagePart(pkg, drawingPart, rels, rId);
                        if (img != null) allImgs.add(img);
                    }
                    log.info("Estrategia 3b: {} relaciones imagen (orden rId) → filas 1..{}",
                            allImgs.size(), allImgs.size());
                    for (int i = 0; i < allImgs.size(); i++) {
                        result.put(i + 1, allImgs.get(i));
                    }
                }
            }

            // Estrategia 4: buscar TODAS las partes de imagen del paquete OPC y usar
            // si hay más que las encontradas via drawing (el drawing puede no referenciarlas todas)
            Map<Integer, PackagePart> mediaResult = getImagesByMediaContent(pkg);
            if (mediaResult.size() > result.size()) {
                log.info("Strategy 4: {} media parts > {} via drawing — usando media del paquete",
                        mediaResult.size(), result.size());
                result = mediaResult;
            }

        } catch (Exception e) {
            log.warn("No se pudo construir mapa de imágenes: {}", e.getMessage());
        }
        log.info("Imágenes mapeadas en total: {}", result.size());
        return result;
    }

    /** Último recurso: escanea /xl/media/ directamente — independiente del content-type declarado. */
    private Map<Integer, PackagePart> getImagesByMediaContent(OPCPackage pkg) {
        Map<Integer, PackagePart> result = new HashMap<>();
        try {
            List<PackagePart> imgs = pkg.getPartsByName(
                    java.util.regex.Pattern.compile("/xl/media/.*",
                            java.util.regex.Pattern.CASE_INSENSITIVE));
            // Ordenar por número en el nombre: image1 < image2 < image10 (no alfabético)
            imgs.sort((a, b) -> Integer.compare(
                    extractNumber(a.getPartName().getName()),
                    extractNumber(b.getPartName().getName())));
            log.info("Strategy 4 (media scan): {} archivos en /xl/media/", imgs.size());
            for (PackagePart p : imgs) {
                log.info("  Media: {} ({})", p.getPartName(), p.getContentType());
            }
            for (int i = 0; i < imgs.size(); i++) result.put(i + 1, imgs.get(i));
        } catch (Exception e) {
            log.warn("getImagesByMediaContent falló: {}", e.getMessage());
        }
        return result;
    }

    /** Obtiene drawing parts siguiendo las relaciones del worksheet (fallback). */
    private List<PackagePart> getDrawingPartsViaSheetRels(OPCPackage pkg) {
        List<PackagePart> out = new ArrayList<>();
        try {
            List<PackagePart> sheets = pkg.getPartsByContentType(
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml");
            for (PackagePart sheet : sheets) {
                for (PackageRelationship rel : sheet.getRelationships()) {
                    if (rel.getRelationshipType().endsWith("/drawing")) {
                        String dir = sheet.getPartName().getName();
                        dir = dir.substring(0, dir.lastIndexOf('/'));
                        String abs = resolveRelativePath(dir, rel.getTargetURI().toString());
                        try {
                            PackagePart p = pkg.getPart(PackagingURIHelper.createPartName(abs));
                            if (p != null) out.add(p);
                        } catch (Exception ignored) { }
                    }
                }
            }
        } catch (Exception e) {
            log.warn("getDrawingPartsViaSheetRels falló: {}", e.getMessage());
        }
        return out;
    }

    /** Resuelve un rId de relación en el PackagePart de imagen correspondiente. */
    private PackagePart resolveImagePart(OPCPackage pkg, PackagePart drawingPart,
                                          PackageRelationshipCollection rels, String rId) {
        PackageRelationship rel = rels.getRelationshipByID(rId);
        if (rel == null) return null;
        String dir = drawingPart.getPartName().getName();
        dir = dir.substring(0, dir.lastIndexOf('/'));
        String abs = resolveRelativePath(dir, rel.getTargetURI().toString());
        try {
            return pkg.getPart(PackagingURIHelper.createPartName(abs));
        } catch (Exception e) {
            log.debug("No se pudo resolver imagen rId='{}': {}", rId, e.getMessage());
            return null;
        }
    }

    private String resolveRelativePath(String base, String relative) {
        relative = relative.replace("\\", "/");
        if (relative.startsWith("/")) return relative; // ya es ruta absoluta en el paquete OPC
        while (relative.startsWith("../")) {
            int slash = base.lastIndexOf('/');
            if (slash > 0) base = base.substring(0, slash);
            relative = relative.substring(3);
        }
        return base + "/" + relative;
    }

    /** Parsea el XML de un drawing y devuelve: mapa fila→rId y lista ordenada de todos los rIds. */
    private DrawingParseResult parseDrawingForRowImageMap(PackagePart drawingPart) throws Exception {
        DrawingParseResult parseResult = new DrawingParseResult();
        final boolean[]     inFrom    = {false};
        final boolean[]     inRow     = {false};
        final int[]         row       = {-1};
        final String[]      rId       = {null};
        final StringBuilder rowText   = new StringBuilder();

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
                        // Usar getLocalName() como comprobación primaria (más fiable
                        // que getQName() que puede devolver "" según la implementación SAX)
                        String aLocal = attrs.getLocalName(i);
                        String aQName = attrs.getQName(i);
                        if ("embed".equals(aLocal) || "link".equals(aLocal)
                                || aQName.endsWith(":embed") || aQName.endsWith(":link")) {
                            String val = attrs.getValue(i);
                            if (val != null && !val.isEmpty()) {
                                rId[0] = val;
                                if (!parseResult.orderedRIds.contains(val)) {
                                    parseResult.orderedRIds.add(val);
                                }
                            }
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
                if ("twoCellAnchor".equals(local) || "oneCellAnchor".equals(local)
                        || "absoluteAnchor".equals(local)) {
                    if (row[0] >= 0 && rId[0] != null) {
                        parseResult.rowToRId.putIfAbsent(row[0], rId[0]);
                    }
                    row[0] = -1;
                    rId[0] = null;
                }
            }
        });
        return parseResult;
    }

    /** Extrae el primer número entero de una cadena (ej: "rId3"→3, "image10.png"→10). */
    private static int extractNumber(String s) {
        StringBuilder sb = new StringBuilder();
        for (char c : s.toCharArray()) {
            if (Character.isDigit(c)) sb.append(c);
            else if (sb.length() > 0) break; // para en el primer no-dígito tras los dígitos
        }
        if (sb.length() == 0) return Integer.MAX_VALUE;
        try { return Integer.parseInt(sb.toString()); }
        catch (NumberFormatException e) { return Integer.MAX_VALUE; }
    }

    // ─── Inner classes ───────────────────────────────────────────────────────

    private static class DrawingParseResult {
        final Map<Integer, String> rowToRId    = new HashMap<>();
        final List<String>         orderedRIds = new ArrayList<>();
    }

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
                queue.put(rowData);
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
