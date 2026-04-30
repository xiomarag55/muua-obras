package com.muua.gallery.service;

import com.muua.gallery.entity.ArtWorkExcel;
import com.muua.gallery.repository.ArtWorkExcelRepository;
import lombok.AllArgsConstructor;
import org.apache.poi.util.XMLHelper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.apache.poi.openxml4j.opc.OPCPackage;
import org.apache.poi.openxml4j.opc.PackagePart;
import org.apache.poi.openxml4j.opc.PackageRelationship;
import org.apache.poi.openxml4j.opc.PackageRelationshipCollection;
import org.apache.poi.openxml4j.opc.PackagingURIHelper;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.util.IOUtils;
import org.apache.poi.xssf.eventusermodel.ReadOnlySharedStringsTable;
import org.apache.poi.xssf.eventusermodel.XSSFReader;
import org.apache.poi.xssf.eventusermodel.XSSFSheetXMLHandler;
import org.apache.poi.xssf.model.StylesTable;
import org.apache.poi.xssf.usermodel.XSSFComment;
import org.springframework.stereotype.Service;
import org.xml.sax.Attributes;
import org.xml.sax.InputSource;
import org.xml.sax.XMLReader;
import org.xml.sax.helpers.DefaultHandler;

import javax.xml.parsers.SAXParserFactory;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Procesa archivos Excel grandes usando el modelo de streaming SAX de Apache POI.
 *
 * Diferencia clave con XSSFWorkbook (DOM):
 *   - DOM:       carga TODO el archivo en heap → ~10x el tamaño del archivo → OOM con archivos grandes
 *   - Streaming: procesa fila por fila via callbacks SAX → memoria constante (~50 filas a la vez)
 *
 * Flujo:
 *   1. OPCPackage.open(stream) → escribe a archivo temporal en disco, heap mínimo
 *   2. Extrae mapping de imágenes leyendo drawing XML (solo metadatos, sin cargar bytes aún)
 *   3. SAX parser recorre sheet1.xml fila por fila
 *   4. Por cada fila: construye entidad, carga imagen bajo demanda, agrega al lote
 *   5. Cada 50 filas → saveAll() → limpia la lista → GC puede liberar memoria
 */
@Service
@AllArgsConstructor
public class ExcelService {

    private static final Logger log = LoggerFactory.getLogger(ExcelService.class);
    private static final int BATCH_SIZE = 50;

    private final ArtWorkExcelRepository repository;

    public int processExcel(InputStream inputStream) {
        // Desactiva el límite de tamaño de arreglos de POI (por defecto 100MB)
        IOUtils.setByteArrayMaxOverride(-1);

        try (OPCPackage pkg = OPCPackage.open(inputStream)) {
            Set<String> codigosExistentes = new HashSet<>(repository.findAllCodigos());
            Map<Integer, PackagePart> imageParts = extraerPartsImagenes(pkg);

            XSSFReader xssfReader = new XSSFReader(pkg);
            ReadOnlySharedStringsTable strings = new ReadOnlySharedStringsTable(pkg);
            StylesTable styles = xssfReader.getStylesTable();

            RowBatchProcessor processor = new RowBatchProcessor(
                    repository, codigosExistentes, imageParts, BATCH_SIZE
            );

            XMLReader xmlReader = XMLHelper.newXMLReader();
            xmlReader.setContentHandler(
                    new XSSFSheetXMLHandler(styles, null, strings, processor, new DataFormatter(), false)
            );

            XSSFReader.SheetIterator sheets = (XSSFReader.SheetIterator) xssfReader.getSheetsData();
            if (sheets.hasNext()) {
                try (InputStream sheetStream = sheets.next()) {
                    xmlReader.parse(new InputSource(sheetStream));
                }
            }

            processor.flush();
            log.info("Excel procesado: {} obras guardadas, {} omitidas (duplicadas)",
                    processor.getSavedCount(), processor.getOmittedCount());
            return processor.getSavedCount();

        } catch (Exception e) {
            log.error("Error procesando Excel: {}", e.getMessage(), e);
            throw new RuntimeException(e.getMessage(), e);
        }
    }

    // ─── Extracción de imágenes (solo referencias, sin cargar bytes) ─────────────

    /**
     * Lee el drawing XML del XLSX para construir el mapa: fila (0-index) → PackagePart de la imagen.
     * No carga los bytes de las imágenes — solo guarda la referencia a la parte del ZIP.
     */
    private Map<Integer, PackagePart> extraerPartsImagenes(OPCPackage pkg) {
        Map<Integer, PackagePart> result = new HashMap<>();
        try {
            List<PackagePart> drawingParts = pkg.getPartsByContentType(
                    "application/vnd.openxmlformats-officedocument.drawing+xml"
            );

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
                    } catch (Exception ignored) {}
                }
            }
        } catch (Exception e) {
            log.warn("No se pudo construir el mapa de imágenes: {}", e.getMessage());
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

    /**
     * Parsea el drawing XML con SAX para extraer mapa fila → relationship ID de la imagen.
     * El drawing XML se ve así:
     *   <xdr:twoCellAnchor>
     *     <xdr:from><xdr:row>1</xdr:row>...</xdr:from>
     *     <xdr:pic><xdr:blipFill><a:blip r:embed="rId1"/></xdr:blipFill>
     *   </xdr:twoCellAnchor>
     */
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
                    try { row[0] = Integer.parseInt(rowText.toString().trim()); } catch (NumberFormatException ignored) {}
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

    // ─── Procesador de filas SAX (lotes) ────────────────────────────────────────

    private static class RowBatchProcessor implements XSSFSheetXMLHandler.SheetContentsHandler {

        private static final org.slf4j.Logger log =
                org.slf4j.LoggerFactory.getLogger(RowBatchProcessor.class);

        private final ArtWorkExcelRepository       repository;
        private final Set<String>                  codigosExistentes;
        private final Map<Integer, PackagePart>    imageParts;
        private final int                          batchSize;
        private final List<ArtWorkExcel>           batch        = new ArrayList<>();
        private final Map<String, String>          currentRow   = new LinkedHashMap<>();
        private int savedCount   = 0;
        private int omittedCount = 0;
        private int currentRowNum;

        RowBatchProcessor(ArtWorkExcelRepository repository, Set<String> codigosExistentes,
                          Map<Integer, PackagePart> imageParts, int batchSize) {
            this.repository        = repository;
            this.codigosExistentes = codigosExistentes;
            this.imageParts        = imageParts;
            this.batchSize         = batchSize;
        }

        @Override
        public void startRow(int rowNum) {
            currentRowNum = rowNum;
            currentRow.clear();
        }

        @Override
        public void endRow(int rowNum) {
            if (rowNum == 0) return; // fila de encabezado

            String codigo = col("0");
            if (!codigo.isBlank() && codigosExistentes.contains(codigo)) {
                omittedCount++;
                return;
            }

            ArtWorkExcel obra = new ArtWorkExcel();
            obra.setCodigo(              codigo);
            obra.setUbicacionPermanente( col("1"));
            obra.setUbicacionTemporal(   col("2"));
            obra.setApellido(            col("3"));
            obra.setNombre(              col("4"));
            obra.setTitulo(              col("5"));
            obra.setRegistroFotografico( col("6"));
            obra.setFechaObra(           col("7"));
            obra.setTecnica(             col("8"));
            obra.setTema(                col("9"));
            obra.setPresentacion(        col("10"));
            obra.setCodigoBarras(        col("11"));
            obra.setDocumentoLegal(      col("12"));
            obra.setMesIngreso(          col("13"));
            obra.setAnioIngreso(         col("14"));
            obra.setFormato(             col("15"));
            obra.setDimensiones(         col("16"));
            obra.setProcedencia(         col("17"));
            obra.setAvaluoComercial(     col("18"));
            obra.setObservaciones(       col("19"));
            obra.setEstadoConservacion(  col("20"));
            obra.setResponsable(         col("21"));

            // Carga la imagen solo para esta fila (on-demand, no todo el archivo)
            PackagePart imgPart = imageParts.get(rowNum);
            if (imgPart != null) {
                try (InputStream is = imgPart.getInputStream()) {
                    obra.setFoto(IOUtils.toByteArray(is));
                    obra.setFotoNombre("foto_fila_" + rowNum);
                } catch (Exception e) {
                    log.debug("Sin imagen para fila {}: {}", rowNum, e.getMessage());
                }
            }

            batch.add(obra);
            if (!codigo.isBlank()) codigosExistentes.add(codigo);

            if (batch.size() >= batchSize) saveBatch();
        }

        @Override
        public void cell(String cellRef, String formattedValue, XSSFComment comment) {
            if (cellRef == null || formattedValue == null) return;
            currentRow.put(String.valueOf(colIndex(cellRef)), formattedValue.trim());
        }

        void flush() {
            if (!batch.isEmpty()) saveBatch();
        }

        int getSavedCount()   { return savedCount; }
        int getOmittedCount() { return omittedCount; }

        private void saveBatch() {
            repository.saveAll(batch);
            savedCount += batch.size();
            log.debug("Lote guardado: {} filas (total acumulado: {})", batch.size(), savedCount);
            batch.clear();
        }

        private String col(String idx) {
            return currentRow.getOrDefault(idx, "");
        }

        /** Convierte "A1" → 0, "B3" → 1, "AA5" → 26, etc. */
        private int colIndex(String cellRef) {
            int col = 0;
            for (char c : cellRef.toCharArray()) {
                if (!Character.isLetter(c)) break;
                col = col * 26 + (c - 'A' + 1);
            }
            return col - 1;
        }
    }

    public List<ArtWorkExcel> findAll() {
        return repository.findAll();
    }

    public ArtWorkExcel findById(Long id) {
        return repository.findById(id).orElse(null);
    }
}
