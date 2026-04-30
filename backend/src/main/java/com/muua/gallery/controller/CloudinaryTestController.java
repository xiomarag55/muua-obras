package com.muua.gallery.controller;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/test")
@RequiredArgsConstructor
@Tag(name = "Pruebas", description = "Endpoints temporales para verificar integraciones")
public class CloudinaryTestController {

    private final Cloudinary cloudinary;

    /**
     * Sube una imagen a Cloudinary y devuelve la URL pública.
     * Úsalo desde Swagger: http://localhost:8080/api/swagger-ui.html
     */
    @Operation(summary = "Subir imagen de prueba a Cloudinary",
               description = "Acepta cualquier imagen (JPG, PNG, etc.) y la sube a la carpeta muua/test en Cloudinary. " +
                             "Si devuelve secure_url el servicio está configurado correctamente.")
    @PostMapping(value = "/cloudinary", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> subirImagenTest(
            @RequestParam("imagen") MultipartFile imagen) {

        if (imagen.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "El archivo está vacío"));
        }

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> resultado = cloudinary.uploader().upload(
                    imagen.getBytes(),
                    ObjectUtils.asMap(
                            "folder",        "muua/test",
                            "resource_type", "image"
                    )
            );

            return ResponseEntity.ok(Map.of(
                    "ok",         true,
                    "secure_url", resultado.get("secure_url"),
                    "public_id",  resultado.get("public_id"),
                    "formato",    resultado.get("format"),
                    "bytes",      resultado.get("bytes"),
                    "ancho",      resultado.get("width"),
                    "alto",       resultado.get("height")
            ));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "ok",    false,
                    "error", e.getMessage()
            ));
        }
    }
}
