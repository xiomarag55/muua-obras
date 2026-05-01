package com.muua.gallery.batch;

import com.muua.gallery.entity.ArtWorkExcelStaging;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.item.ItemProcessor;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Set;

/**
 * Fase 1: convierte una fila del Excel en un registro de staging.
 * - Descarta duplicados (por codigo ya existente en artwork_excel).
 * - Guarda los bytes de la imagen en un archivo temporal en disco
 *   (evita acumular todos los bytes en memoria o en la BD).
 * - NO hace ninguna llamada a Cloudinary: eso es trabajo de la fase 2.
 */
@Slf4j
public class ExcelToStagingProcessor implements ItemProcessor<ExcelRowData, ArtWorkExcelStaging> {

    private final String       jobKey;
    private final String       tempDir;
    private final Set<String>  codigosExistentes;

    public ExcelToStagingProcessor(String jobKey, String tempDir, Set<String> codigosExistentes) {
        this.jobKey            = jobKey;
        this.tempDir           = tempDir;
        this.codigosExistentes = codigosExistentes;
    }

    @Override
    public ArtWorkExcelStaging process(ExcelRowData row) throws Exception {
        String codigo = cell(row, "0");

        if (!codigo.isBlank() && codigosExistentes.contains(codigo)) {
            return null; // Spring Batch filtra automáticamente los null
        }

        ArtWorkExcelStaging staging = mapToStaging(row);
        staging.setJobKey(jobKey);

        byte[] imgBytes = row.getImageBytes();
        if (imgBytes != null && imgBytes.length > 0) {
            staging.setImageTempPath(guardarImagenTemp(imgBytes, row.getRowNum()));
        }

        if (!codigo.isBlank()) codigosExistentes.add(codigo);
        return staging;
    }

    private String guardarImagenTemp(byte[] bytes, int rowNum) throws IOException {
        Path dir = Paths.get(tempDir, jobKey, "images");
        Files.createDirectories(dir);
        String ext  = esPng(bytes) ? ".png" : ".jpg";
        Path   file = dir.resolve("row_" + rowNum + ext);
        Files.write(file, bytes);
        return file.toString();
    }

    private boolean esPng(byte[] b) {
        return b.length > 3
                && b[0] == (byte) 0x89 && b[1] == (byte) 'P'
                && b[2] == (byte) 'N'   && b[3] == (byte) 'G';
    }

    private ArtWorkExcelStaging mapToStaging(ExcelRowData row) {
        ArtWorkExcelStaging s = new ArtWorkExcelStaging();
        s.setCodigo(             cell(row, "0"));
        s.setUbicacionPermanente(cell(row, "1"));
        s.setUbicacionTemporal(  cell(row, "2"));
        s.setApellido(           cell(row, "3"));
        s.setNombre(             cell(row, "4"));
        s.setTitulo(             cell(row, "5"));
        s.setRegistroFotografico(cell(row, "6"));
        s.setFechaObra(          cell(row, "7"));
        s.setTecnica(            cell(row, "8"));
        s.setTema(               cell(row, "9"));
        s.setPresentacion(       cell(row, "10"));
        s.setCodigoBarras(       cell(row, "11"));
        s.setDocumentoLegal(     cell(row, "12"));
        s.setMesIngreso(         cell(row, "13"));
        s.setAnioIngreso(        cell(row, "14"));
        s.setFormato(            cell(row, "15"));
        s.setDimensiones(        cell(row, "16"));
        s.setProcedencia(        cell(row, "17"));
        s.setAvaluoComercial(    cell(row, "18"));
        s.setObservaciones(      cell(row, "19"));
        s.setEstadoConservacion( cell(row, "20"));
        s.setResponsable(        cell(row, "21"));
        return s;
    }

    private String cell(ExcelRowData row, String idx) {
        return row.getCells().getOrDefault(idx, "");
    }
}
