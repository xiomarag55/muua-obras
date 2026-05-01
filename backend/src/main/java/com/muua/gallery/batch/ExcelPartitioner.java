package com.muua.gallery.batch;

import com.muua.gallery.repository.ArtWorkExcelStagingRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.partition.support.Partitioner;
import org.springframework.batch.item.ExecutionContext;

import java.util.HashMap;
import java.util.Map;

/**
 * Divide los registros de la tabla de staging en N rangos de IDs,
 * uno por cada worker que procesará en paralelo.
 *
 * Se llama UNA SOLA VEZ por el master step, después de que stagingStep
 * ha terminado de escribir todos los registros.
 */
@Slf4j
public class ExcelPartitioner implements Partitioner {

    private final ArtWorkExcelStagingRepository repository;
    private final String jobKey;

    public ExcelPartitioner(ArtWorkExcelStagingRepository repository, String jobKey) {
        this.repository = repository;
        this.jobKey     = jobKey;
    }

    @Override
    public Map<String, ExecutionContext> partition(int gridSize) {
        Long minId = repository.findMinIdByJobKey(jobKey);
        Long maxId = repository.findMaxIdByJobKey(jobKey);

        // Sin registros → devuelve una sola partición vacía para que el job no falle
        if (minId == null || maxId == null) {
            log.warn("Staging vacío para jobKey {}: sin registros que particionar", jobKey);
            ExecutionContext ctx = new ExecutionContext();
            ctx.putLong("minId", 0L);
            ctx.putLong("maxId", -1L); // rango imposible → reader devolverá null inmediatamente
            ctx.putString("jobKey", jobKey);
            return Map.of("partition0", ctx);
        }

        long total     = maxId - minId + 1;
        long rangeSize = Math.max(1L, (long) Math.ceil((double) total / gridSize));
        Map<String, ExecutionContext> result = new HashMap<>();

        for (int i = 0; i < gridSize; i++) {
            long start = minId + (long) i * rangeSize;
            if (start > maxId) break;
            long end = Math.min(start + rangeSize - 1, maxId);

            ExecutionContext ctx = new ExecutionContext();
            ctx.putLong("minId",  start);
            ctx.putLong("maxId",  end);
            ctx.putString("jobKey", jobKey);
            result.put("partition" + i, ctx);

            log.info("Partición {} — IDs {} a {} ({} registros)", i, start, end, end - start + 1);
        }

        log.info("Total particiones creadas: {} para {} registros", result.size(), total);
        return result;
    }
}
