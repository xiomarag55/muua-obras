package com.muua.gallery.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.StepExecution;
import org.springframework.batch.core.explore.JobExplorer;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
public class BatchJobService {

    private final JobLauncher asyncJobLauncher;
    private final Job         excelImportJob;
    private final JobExplorer jobExplorer;

    @Value("${batch.temp-dir}")
    private String tempDir;

    public BatchJobService(@Qualifier("asyncJobLauncher") JobLauncher asyncJobLauncher,
                           Job excelImportJob,
                           JobExplorer jobExplorer) {
        this.asyncJobLauncher = asyncJobLauncher;
        this.excelImportJob   = excelImportJob;
        this.jobExplorer      = jobExplorer;
    }

    /**
     * Guarda el Excel en disco y lanza el job de forma asíncrona.
     * @return ID de la ejecución para polling de estado.
     */
    public long lanzarJob(MultipartFile file) throws Exception {
        Path dirPath = Paths.get(tempDir);
        Files.createDirectories(dirPath);

        String jobKey   = UUID.randomUUID().toString();
        String filename = jobKey + "_" + file.getOriginalFilename();
        Path   filePath = dirPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        log.info("Excel guardado: {}. jobKey: {}", filePath, jobKey);

        JobParameters params = new JobParametersBuilder()
                .addString("filePath",  filePath.toString())
                .addString("jobKey",    jobKey)
                .addLong("timestamp",   System.currentTimeMillis())
                .toJobParameters();

        JobExecution execution = asyncJobLauncher.run(excelImportJob, params);
        log.info("Job lanzado. ID: {}", execution.getId());
        return execution.getId();
    }

    /**
     * Consulta el estado del job con detalle de fase y progreso.
     *
     * Respuesta:
     *   estado       — STARTING | STARTED | COMPLETED | FAILED | STOPPED
     *   fase         — LEYENDO_EXCEL | SUBIENDO_IMAGENES | COMPLETADO | FALLIDO
     *   total        — total de registros en staging (después de fase 1)
     *   guardados    — registros escritos en artwork_excel (fase 2)
     *   omitidos     — registros filtrados (duplicados)
     *   porcentaje   — 0-100 (sólo disponible durante/después de fase 2)
     */
    public Map<String, Object> obtenerEstado(long jobExecutionId) {
        JobExecution execution = jobExplorer.getJobExecution(jobExecutionId);
        Map<String, Object> resp = new HashMap<>();

        if (execution == null) {
            resp.put("error", "Job " + jobExecutionId + " no encontrado");
            return resp;
        }

        resp.put("jobId",  jobExecutionId);
        resp.put("estado", execution.getStatus().name());
        resp.put("inicio", execution.getStartTime());
        resp.put("fin",    execution.getEndTime());

        long totalStaging  = 0;
        long guardados     = 0;
        long omitidos      = 0;
        boolean enStaging  = false;
        boolean enWorkers  = false;

        for (StepExecution step : execution.getStepExecutions()) {
            String name = step.getStepName();
            if ("stagingStep".equals(name)) {
                totalStaging = step.getWriteCount();
                omitidos     = step.getFilterCount();
                enStaging    = step.getStatus().isRunning();
            } else if (name.startsWith("workerStep")) {
                guardados += step.getWriteCount();
                if (step.getStatus().isRunning()) enWorkers = true;
            }
        }

        resp.put("total",    totalStaging);
        resp.put("guardados", guardados);
        resp.put("omitidos",  omitidos);

        // Fase legible para el frontend
        String batchEstado = execution.getStatus().name();
        String fase;
        if ("COMPLETED".equals(batchEstado)) {
            fase = "COMPLETADO";
        } else if ("FAILED".equals(batchEstado)) {
            fase = "FALLIDO";
        } else if (enWorkers || (!enStaging && totalStaging > 0 && guardados < totalStaging)) {
            fase = "SUBIENDO_IMAGENES";
        } else {
            fase = "LEYENDO_EXCEL";
        }
        resp.put("fase", fase);

        // Porcentaje (0-100) basado en progreso de fase 2
        int porcentaje = 0;
        if (totalStaging > 0) {
            porcentaje = (int) Math.min(100, (guardados * 100) / totalStaging);
        }
        if ("COMPLETADO".equals(fase)) porcentaje = 100;
        resp.put("porcentaje", porcentaje);

        return resp;
    }
}
