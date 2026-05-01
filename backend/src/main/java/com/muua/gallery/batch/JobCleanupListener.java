package com.muua.gallery.batch;

import com.muua.gallery.repository.ArtWorkExcelStagingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.JobExecutionListener;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Comparator;
import java.util.stream.Stream;

/**
 * Limpia recursos temporales al terminar el job (éxito o fallo):
 *  1. Elimina los registros de staging para este jobKey.
 *  2. Elimina el directorio temporal de imágenes.
 *  3. Elimina el archivo Excel que fue subido.
 */
@Slf4j
@RequiredArgsConstructor
public class JobCleanupListener implements JobExecutionListener {

    private final ArtWorkExcelStagingRepository stagingRepository;
    private final String tempDir;

    @Override
    public void afterJob(JobExecution jobExecution) {
        String jobKey  = jobExecution.getJobParameters().getString("jobKey");
        String xlsPath = jobExecution.getJobParameters().getString("filePath");

        if (jobKey != null) {
            stagingRepository.deleteByJobKey(jobKey);
            log.info("Staging eliminado para jobKey: {}", jobKey);
            eliminarDirectorio(Paths.get(tempDir, jobKey));
        }

        if (xlsPath != null) {
            try {
                Files.deleteIfExists(Paths.get(xlsPath));
                log.info("Excel temporal eliminado: {}", xlsPath);
            } catch (IOException e) {
                log.warn("No se pudo eliminar el Excel temporal: {}", e.getMessage());
            }
        }
    }

    private void eliminarDirectorio(Path dir) {
        if (!Files.exists(dir)) return;
        try (Stream<Path> walk = Files.walk(dir)) {
            walk.sorted(Comparator.reverseOrder())
                .forEach(p -> { try { Files.delete(p); } catch (IOException ignored) { } });
            log.info("Directorio temporal eliminado: {}", dir);
        } catch (IOException e) {
            log.warn("No se pudo eliminar directorio temporal {}: {}", dir, e.getMessage());
        }
    }
}
