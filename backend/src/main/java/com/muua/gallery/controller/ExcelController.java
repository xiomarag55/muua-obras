package com.muua.gallery.controller;

import com.muua.gallery.entity.ArtWorkExcel;
import com.muua.gallery.service.BatchJobService;
import com.muua.gallery.service.ExcelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/excel")
@RequiredArgsConstructor
public class ExcelController {

    private final ExcelService   excelService;
    private final BatchJobService batchJobService;

    /**
     * Recibe el Excel, lo guarda en disco y lanza el job en un worker asíncrono.
     * Devuelve inmediatamente con el ID del job para que el frontend pueda hacer polling.
     */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> uploadExcel(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "El archivo está vacío."));
        }
        try {
            long jobId = batchJobService.lanzarJob(file);
            return ResponseEntity.accepted().body(Map.of(
                    "jobId",   jobId,
                    "mensaje", "El archivo fue recibido y está siendo procesado en segundo plano.",
                    "statusUrl", "/api/excel/batch/status/" + jobId
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "No se pudo iniciar el procesamiento: " + e.getMessage()));
        }
    }

    /**
     * Permite al frontend hacer polling del estado del job.
     * estado posibles: STARTING, STARTED, COMPLETED, FAILED, STOPPED
     */
    @GetMapping("/batch/status/{jobId}")
    public ResponseEntity<Map<String, Object>> jobStatus(@PathVariable long jobId) {
        Map<String, Object> estado = batchJobService.obtenerEstado(jobId);
        return ResponseEntity.ok(estado);
    }

    @GetMapping
    public ResponseEntity<List<ArtWorkExcel>> findAll() {
        return ResponseEntity.ok(excelService.findAll());
    }

    /**
     * Para registros nuevos (Cloudinary) redirige a la URL pública.
     * Para registros legacy (bytes en BD) devuelve la imagen directamente.
     */
    @GetMapping("/{id}/foto")
    public ResponseEntity<?> getImage(@PathVariable Long id) {
        ArtWorkExcel obra = excelService.findById(id);
        if (obra == null) {
            return ResponseEntity.notFound().build();
        }

        // Registro nuevo: imagen en Cloudinary
        if (obra.getFotoUrl() != null && !obra.getFotoUrl().isBlank()) {
            return ResponseEntity.status(302)
                    .header("Location", obra.getFotoUrl())
                    .build();
        }

        // Registro legacy: bytes en BD
        byte[] foto = obra.getFoto();
        if (foto == null || foto.length == 0) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .contentType(detectarTipo(foto))
                .body(foto);
    }

    private MediaType detectarTipo(byte[] bytes) {
        if (bytes.length > 3
                && bytes[0] == (byte) 0x89
                && bytes[1] == (byte) 'P'
                && bytes[2] == (byte) 'N'
                && bytes[3] == (byte) 'G') {
            return MediaType.IMAGE_PNG;
        }
        return MediaType.IMAGE_JPEG;
    }
}
