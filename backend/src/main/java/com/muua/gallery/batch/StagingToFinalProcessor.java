package com.muua.gallery.batch;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.muua.gallery.entity.ArtWorkExcel;
import com.muua.gallery.entity.ArtWorkExcelStaging;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.item.ItemProcessor;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;

/**
 * Fase 2 (worker): lee un registro de staging, sube la imagen a Cloudinary
 * y construye la entidad final ArtWorkExcel con la URL pública.
 *
 * Si Cloudinary falla, la obra se guarda igualmente pero sin foto
 * (fotoUrl = null) — no pierde el texto del inventario.
 */
@Slf4j
@RequiredArgsConstructor
public class StagingToFinalProcessor implements ItemProcessor<ArtWorkExcelStaging, ArtWorkExcel> {

    private final Cloudinary cloudinary;

    @Override
    public ArtWorkExcel process(ArtWorkExcelStaging staging) {
        ArtWorkExcel obra = mapToEntity(staging);

        if (staging.getImageTempPath() != null) {
            subirACloudinary(staging, obra);
        }

        return obra;
    }

    private void subirACloudinary(ArtWorkExcelStaging staging, ArtWorkExcel obra) {
        Path tempFile = Paths.get(staging.getImageTempPath());
        try {
            byte[] bytes = Files.readAllBytes(tempFile);

            String publicId = (staging.getCodigo() == null || staging.getCodigo().isBlank())
                    ? "obra_id_" + staging.getId()
                    : "obra_" + staging.getCodigo().replaceAll("[^a-zA-Z0-9_-]", "_");

            @SuppressWarnings("unchecked")
            Map<String, Object> result = cloudinary.uploader().upload(
                    bytes,
                    ObjectUtils.asMap(
                            "folder",        "muua/inventario",
                            "public_id",     publicId,
                            "resource_type", "image",
                            "overwrite",     true
                    )
            );
            obra.setFotoUrl((String) result.get("secure_url"));
            log.debug("Cloudinary OK — staging {} → {}", staging.getId(), obra.getFotoUrl());

        } catch (Exception e) {
            log.warn("Cloudinary falló (staging {}): {}. Obra guardada sin foto.",
                    staging.getId(), e.getMessage());
        } finally {
            // Elimina el temp file sin importar si el upload fue exitoso o no
            try { Files.deleteIfExists(tempFile); }
            catch (Exception ignored) { }
        }
    }

    private ArtWorkExcel mapToEntity(ArtWorkExcelStaging s) {
        ArtWorkExcel o = new ArtWorkExcel();
        o.setCodigo(             s.getCodigo());
        o.setUbicacionPermanente(s.getUbicacionPermanente());
        o.setUbicacionTemporal(  s.getUbicacionTemporal());
        o.setApellido(           s.getApellido());
        o.setNombre(             s.getNombre());
        o.setTitulo(             s.getTitulo());
        o.setRegistroFotografico(s.getRegistroFotografico());
        o.setFechaObra(          s.getFechaObra());
        o.setTecnica(            s.getTecnica());
        o.setTema(               s.getTema());
        o.setPresentacion(       s.getPresentacion());
        o.setCodigoBarras(       s.getCodigoBarras());
        o.setDocumentoLegal(     s.getDocumentoLegal());
        o.setMesIngreso(         s.getMesIngreso());
        o.setAnioIngreso(        s.getAnioIngreso());
        o.setFormato(            s.getFormato());
        o.setDimensiones(        s.getDimensiones());
        o.setProcedencia(        s.getProcedencia());
        o.setAvaluoComercial(    s.getAvaluoComercial());
        o.setObservaciones(      s.getObservaciones());
        o.setEstadoConservacion( s.getEstadoConservacion());
        o.setResponsable(        s.getResponsable());
        return o;
    }
}
