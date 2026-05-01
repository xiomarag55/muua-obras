package com.muua.gallery.batch;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.muua.gallery.entity.ArtWorkExcel;
import com.muua.gallery.repository.ArtWorkExcelRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.item.ItemProcessor;

import java.util.Map;
import java.util.Set;

/**
 * Por cada fila del Excel:
 *  1. Descarta duplicados (codigo ya existente en BD).
 *  2. Sube la imagen a Cloudinary si la fila tiene bytes.
 *  3. Construye y devuelve la entidad con fotoUrl.
 *
 * Devolver null = Spring Batch filtra (omite) el item sin error.
 */
@Slf4j
public class ExcelBatchItemProcessor implements ItemProcessor<ExcelRowData, ArtWorkExcel> {

    private final Cloudinary cloudinary;
    private final Set<String> codigosExistentes;

    public ExcelBatchItemProcessor(Cloudinary cloudinary, Set<String> codigosExistentes) {
        this.cloudinary        = cloudinary;
        this.codigosExistentes = codigosExistentes;
    }

    @Override
    public ArtWorkExcel process(ExcelRowData row) throws Exception {
        String codigo = cell(row, "0");

        if (!codigo.isBlank() && codigosExistentes.contains(codigo)) {
            return null; // duplicado → Spring Batch lo omite
        }

        ArtWorkExcel obra = mapToEntity(row);

        // Subir imagen a Cloudinary si existe
        byte[] imgBytes = row.getImageBytes();
        if (imgBytes != null && imgBytes.length > 0) {
            try {
                String publicId = codigo.isBlank()
                        ? "obra_fila_" + row.getRowNum()
                        : "obra_" + codigo.replaceAll("[^a-zA-Z0-9_-]", "_");

                @SuppressWarnings("unchecked")
                Map<String, Object> result = cloudinary.uploader().upload(
                        imgBytes,
                        ObjectUtils.asMap(
                                "folder",        "muua/inventario",
                                "public_id",     publicId,
                                "resource_type", "image",
                                "overwrite",     true
                        )
                );
                obra.setFotoUrl((String) result.get("secure_url"));
                log.debug("Imagen subida a Cloudinary para fila {}: {}", row.getRowNum(), obra.getFotoUrl());
            } catch (Exception e) {
                log.warn("Fallo subiendo imagen a Cloudinary (fila {}): {}. Se guarda sin foto.",
                        row.getRowNum(), e.getMessage());
            }
        }

        if (!codigo.isBlank()) codigosExistentes.add(codigo);
        return obra;
    }

    private ArtWorkExcel mapToEntity(ExcelRowData row) {
        ArtWorkExcel o = new ArtWorkExcel();
        o.setCodigo(             cell(row, "0"));
        o.setUbicacionPermanente(cell(row, "1"));
        o.setUbicacionTemporal(  cell(row, "2"));
        o.setApellido(           cell(row, "3"));
        o.setNombre(             cell(row, "4"));
        o.setTitulo(             cell(row, "5"));
        o.setRegistroFotografico(cell(row, "6"));
        o.setFechaObra(          cell(row, "7"));
        o.setTecnica(            cell(row, "8"));
        o.setTema(               cell(row, "9"));
        o.setPresentacion(       cell(row, "10"));
        o.setCodigoBarras(       cell(row, "11"));
        o.setDocumentoLegal(     cell(row, "12"));
        o.setMesIngreso(         cell(row, "13"));
        o.setAnioIngreso(        cell(row, "14"));
        o.setFormato(            cell(row, "15"));
        o.setDimensiones(        cell(row, "16"));
        o.setProcedencia(        cell(row, "17"));
        o.setAvaluoComercial(    cell(row, "18"));
        o.setObservaciones(      cell(row, "19"));
        o.setEstadoConservacion( cell(row, "20"));
        o.setResponsable(        cell(row, "21"));
        return o;
    }

    private String cell(ExcelRowData row, String idx) {
        return row.getCells().getOrDefault(idx, "");
    }
}
