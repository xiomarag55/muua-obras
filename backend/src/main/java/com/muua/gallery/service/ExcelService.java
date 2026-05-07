package com.muua.gallery.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.muua.gallery.entity.ArtWorkExcel;
import com.muua.gallery.repository.ArtWorkExcelRepository;
import lombok.AllArgsConstructor;
import org.apache.poi.openxml4j.opc.*;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.util.IOUtils;
import org.apache.poi.util.XMLHelper;
import org.apache.poi.xssf.eventusermodel.ReadOnlySharedStringsTable;
import org.apache.poi.xssf.eventusermodel.XSSFReader;
import org.apache.poi.xssf.eventusermodel.XSSFSheetXMLHandler;
import org.apache.poi.xssf.model.StylesTable;
import org.apache.poi.xssf.usermodel.XSSFComment;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.xml.sax.Attributes;
import org.xml.sax.InputSource;
import org.xml.sax.XMLReader;
import org.xml.sax.helpers.DefaultHandler;

import javax.xml.parsers.SAXParserFactory;
import java.io.InputStream;
import java.util.*;

/**
 * Procesa archivos Excel grandes usando el modelo de streaming SAX de Apache POI.
 * <p>
 * Diferencia clave con XSSFWorkbook (DOM):
 * - DOM:       carga TODO el archivo en heap → ~10x el tamaño del archivo → OOM con archivos grandes
 * - Streaming: procesa fila por fila via callbacks SAX → memoria constante (~50 filas a la vez)
 * <p>
 * Flujo:
 * 1. OPCPackage.open(stream) → escribe a archivo temporal en disco, heap mínimo
 * 2. Extrae mapping de imágenes leyendo drawing XML (solo metadatos, sin cargar bytes aún)
 * 3. SAX parser recorre sheet1.xml fila por fila
 * 4. Por cada fila: construye entidad, carga imagen bajo demanda, agrega al lote
 * 5. Cada 50 filas → saveAll() → limpia la lista → GC puede liberar memoria
 */
@Service
@AllArgsConstructor
public class ExcelService {

    private static final Logger log = LoggerFactory.getLogger(ExcelService.class);
    private static final int BATCH_SIZE = 50;

    private final ArtWorkExcelRepository repository;
    private final Cloudinary cloudinary;

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
                    repository, codigosExistentes, imageParts, BATCH_SIZE, cloudinary
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

    // ─── Extracción de imágenes (multi-estrategia) ──────────────────────────────

    private Map<Integer, PackagePart> extraerPartsImagenes(OPCPackage pkg) {
        Map<Integer, PackagePart> result = new HashMap<>();
        try {
            // Estrategia 1: drawing parts por content-type estándar
            List<PackagePart> drawingParts = pkg.getPartsByContentType(
                    "application/vnd.openxmlformats-officedocument.drawing+xml");

            // Estrategia 2: via relaciones de la hoja si el content-type falla
            if (drawingParts.isEmpty()) {
                log.info("No drawing parts por content-type, buscando via relaciones de hoja...");
                drawingParts = getDrawingPartsViaSheetRels(pkg);
            }
            log.info("Drawing parts encontrados: {}", drawingParts.size());

            for (PackagePart drawingPart : drawingParts) {
                Map<Integer, String> rowToRId = parseDrawingForRowImageMap(drawingPart);
                PackageRelationshipCollection rels = drawingPart.getRelationships();

                // Todas las relaciones de imagen del drawing (r:embed + r:link + cualquier otra)
                List<String> allImageRIds = new ArrayList<>();
                for (PackageRelationship rel : rels) {
                    if (rel.getRelationshipType().endsWith("/image")) {
                        allImageRIds.add(rel.getId());
                    }
                }

                log.info("Drawing '{}' → {} anchors con fila, {} rIds vía blip, {} relaciones imagen totales",
                        drawingPart.getPartName(), rowToRId.size(), rowToRId.size(), allImageRIds.size());

                // Estrategia 3a: mapeo fila→imagen via blip (preciso, preserva orden de filas)
                if (!rowToRId.isEmpty()) {
                    for (Map.Entry<Integer, String> e : rowToRId.entrySet()) {
                        PackagePart img = resolveImagePart(pkg, drawingPart, rels, e.getValue());
                        if (img != null) result.put(e.getKey(), img);
                    }
                }

                // Estrategia 3b: si las relaciones reales superan lo encontrado por blip,
                // usar TODAS las relaciones de imagen ordenadas por número de rId
                if (allImageRIds.size() > result.size()) {
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

            // Estrategia 4: recorrer TODAS las partes de imagen del paquete OPC y usar
            // si hay más que las encontradas via drawing
            Map<Integer, PackagePart> mediaResult = getImagesByMediaContent(pkg);
            if (mediaResult.size() > result.size()) {
                log.info("Strategy 4: {} media parts > {} via drawing — usando media del paquete",
                        mediaResult.size(), result.size());
                result = mediaResult;
            }

        } catch (Exception e) {
            log.warn("No se pudo construir el mapa de imágenes: {}", e.getMessage());
        }
        log.info("Imágenes mapeadas en total: {}", result.size());
        return result;
    }

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
                        } catch (Exception ignored) {
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.warn("getDrawingPartsViaSheetRels falló: {}", e.getMessage());
        }
        return out;
    }

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

    private Map<Integer, PackagePart> getImagesByMediaContent(OPCPackage pkg) {
        Map<Integer, PackagePart> result = new HashMap<>();
        try {
            List<PackagePart> imgs = pkg.getPartsByName(
                    java.util.regex.Pattern.compile("/xl/media/.*",
                            java.util.regex.Pattern.CASE_INSENSITIVE));
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

    private static int extractNumber(String s) {
        StringBuilder sb = new StringBuilder();
        for (char c : s.toCharArray()) {
            if (Character.isDigit(c)) sb.append(c);
            else if (sb.length() > 0) break;
        }
        if (sb.length() == 0) return Integer.MAX_VALUE;
        try { return Integer.parseInt(sb.toString()); }
        catch (NumberFormatException e) { return Integer.MAX_VALUE; }
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

    private Map<Integer, String> parseDrawingForRowImageMap(PackagePart drawingPart) throws Exception {
        Map<Integer, String> rowToRId = new HashMap<>();
        final boolean[] inFrom = {false};
        final boolean[] inRow = {false};
        final int[] row = {-1};
        final String[] rId = {null};
        final StringBuilder rowText = new StringBuilder();

        SAXParserFactory factory = SAXParserFactory.newInstance();
        factory.setNamespaceAware(true);
        factory.setFeature("http://xml.org/sax/features/external-general-entities", false);
        factory.setFeature("http://xml.org/sax/features/external-parameter-entities", false);

        factory.newSAXParser().parse(drawingPart.getInputStream(), new DefaultHandler() {
            @Override
            public void startElement(String uri, String local, String qName, Attributes attrs) {
                if ("from".equals(local)) {
                    inFrom[0] = true;
                    row[0] = -1;
                }
                if (inFrom[0] && "row".equals(local)) {
                    inRow[0] = true;
                    rowText.setLength(0);
                }
                if ("blip".equals(local)) {
                    for (int i = 0; i < attrs.getLength(); i++) {
                        String aLocal = attrs.getLocalName(i);
                        String aQName = attrs.getQName(i);
                        if ("embed".equals(aLocal) || "link".equals(aLocal)
                                || aQName.endsWith(":embed") || aQName.endsWith(":link")) {
                            String val = attrs.getValue(i);
                            if (val != null && !val.isEmpty()) {
                                rId[0] = val;
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
                    try {
                        row[0] = Integer.parseInt(rowText.toString().trim());
                    } catch (NumberFormatException ignored) {
                    }
                    inRow[0] = false;
                }
                if ("from".equals(local)) inFrom[0] = false;
                if ("twoCellAnchor".equals(local) || "oneCellAnchor".equals(local)
                        || "absoluteAnchor".equals(local)) {
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

        private final ArtWorkExcelRepository repository;
        private final Set<String> codigosExistentes;
        private final Map<Integer, PackagePart> imageParts;
        private final int batchSize;
        private final Cloudinary cloudinary;
        private final List<ArtWorkExcel> batch = new ArrayList<>();
        private final Map<String, String> currentRow = new LinkedHashMap<>();
        private int savedCount = 0;
        private int omittedCount = 0;
        private int currentRowNum;

        RowBatchProcessor(ArtWorkExcelRepository repository, Set<String> codigosExistentes,
                          Map<Integer, PackagePart> imageParts, int batchSize, Cloudinary cloudinary) {
            this.repository = repository;
            this.codigosExistentes = codigosExistentes;
            this.imageParts = imageParts;
            this.batchSize = batchSize;
            this.cloudinary = cloudinary;
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
            obra.setCodigo(codigo);
            obra.setUbicacionPermanente(col("1"));
            obra.setUbicacionTemporal(col("2"));
            obra.setApellido(col("3"));
            obra.setNombre(col("4"));
            obra.setTitulo(col("5"));
            obra.setRegistroFotografico(col("6"));
            obra.setFechaObra(col("7"));
            obra.setTecnica(col("8"));
            obra.setTema(col("9"));
            obra.setPresentacion(col("10"));
            obra.setCodigoBarras(col("11"));
            obra.setDocumentoLegal(col("12"));
            obra.setMesIngreso(col("13"));
            obra.setAnioIngreso(col("14"));
            obra.setFormato(col("15"));
            obra.setDimensiones(col("16"));
            obra.setProcedencia(col("17"));
            obra.setAvaluoComercial(col("18"));
            obra.setObservaciones(col("19"));
            obra.setEstadoConservacion(col("20"));
            obra.setResponsable(col("21"));

            // Sube la imagen a Cloudinary (on-demand, una por fila)
            PackagePart imgPart = imageParts.get(rowNum);
            if (imgPart != null && cloudinary != null) {
                try (InputStream is = imgPart.getInputStream()) {
                    byte[] bytes = IOUtils.toByteArray(is);
                    if (bytes == null || bytes.length == 0) {
                        System.out.println("LA IMAGEN ESTA VACIA");
                        log.warn("Imagen vacía en fila {}", rowNum);
                        return; // o continue según tu lógica
                    }
                    @SuppressWarnings("unchecked")
                    Map<String, Object> resultado = cloudinary.uploader().upload(
                            bytes,
                            ObjectUtils.asMap("folder", "muua/inventario", "resource_type", "image")
                    );
                    obra.setFotoUrl((String) resultado.get("secure_url"));
                    obra.setFotoNombre("foto_fila_" + rowNum);
                } catch (Exception e) {
                    log.warn("Error subiendo imagen fila {} a Cloudinary: {}", rowNum, e.getMessage());
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

        int getSavedCount() {
            return savedCount;
        }

        int getOmittedCount() {
            return omittedCount;
        }

        private void saveBatch() {
            repository.saveAll(batch);
            savedCount += batch.size();
            log.debug("Lote guardado: {} filas (total acumulado: {})", batch.size(), savedCount);
            batch.clear();
        }

        private String col(String idx) {
            return currentRow.getOrDefault(idx, "");
        }

        /**
         * Convierte "A1" → 0, "B3" → 1, "AA5" → 26, etc.
         */
        private int colIndex(String cellRef) {
            int col = 0;
            for (char c : cellRef.toCharArray()) {
                if (!Character.isLetter(c)) break;
                col = col * 26 + (c - 'A' + 1);
            }
            return col - 1;
        }
    }

    public String delete() {
        repository.deleteAll();
        return "deleted";
    }

    public void deleteById(Long id) {
        repository.deleteById(id);
    }

    public ArtWorkExcel update(Long id, ArtWorkExcel updated) {
        ArtWorkExcel existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Obra no encontrada: " + id));
        existing.setCodigo(updated.getCodigo());
        existing.setApellido(updated.getApellido());
        existing.setNombre(updated.getNombre());
        existing.setTitulo(updated.getTitulo());
        existing.setTecnica(updated.getTecnica());
        existing.setFechaObra(updated.getFechaObra());
        existing.setDimensiones(updated.getDimensiones());
        existing.setFormato(updated.getFormato());
        existing.setTema(updated.getTema());
        existing.setProcedencia(updated.getProcedencia());
        existing.setAvaluoComercial(updated.getAvaluoComercial());
        existing.setEstadoConservacion(updated.getEstadoConservacion());
        existing.setObservaciones(updated.getObservaciones());
        existing.setUbicacionPermanente(updated.getUbicacionPermanente());
        existing.setUbicacionTemporal(updated.getUbicacionTemporal());
        existing.setResponsable(updated.getResponsable());
        existing.setMesIngreso(updated.getMesIngreso());
        existing.setAnioIngreso(updated.getAnioIngreso());
        return repository.save(existing);
    }

    public List<ArtWorkExcel> findAll() {
        return repository.findAll();
    }

    public ArtWorkExcel findById(Long id) {
        return repository.findById(id).orElse(null);
    }
}
