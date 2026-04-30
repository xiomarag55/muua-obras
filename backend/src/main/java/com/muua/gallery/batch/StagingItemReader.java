package com.muua.gallery.batch;

import com.muua.gallery.entity.ArtWorkExcelStaging;
import com.muua.gallery.repository.ArtWorkExcelStagingRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.item.ExecutionContext;
import org.springframework.batch.item.ItemReader;
import org.springframework.batch.item.ItemStream;
import org.springframework.batch.item.ItemStreamException;

import java.util.Collections;
import java.util.Iterator;
import java.util.List;

/**
 * Cada instancia es creada con @StepScope para un worker específico.
 * Lee únicamente los registros de staging cuyo ID está en el rango
 * [minId, maxId] asignado por el Partitioner.
 */
@Slf4j
public class StagingItemReader implements ItemReader<ArtWorkExcelStaging>, ItemStream {

    private final ArtWorkExcelStagingRepository repository;
    private final Long   minId;
    private final Long   maxId;
    private final String jobKey;

    private Iterator<ArtWorkExcelStaging> iterator;

    public StagingItemReader(ArtWorkExcelStagingRepository repository,
                             Long minId, Long maxId, String jobKey) {
        this.repository = repository;
        this.minId      = minId;
        this.maxId      = maxId;
        this.jobKey     = jobKey;
    }

    @Override
    public void open(ExecutionContext executionContext) throws ItemStreamException {
        if (minId == null || maxId == null || minId > maxId) {
            iterator = Collections.emptyIterator();
            return;
        }
        List<ArtWorkExcelStaging> items = repository.findByJobKeyAndIdBetween(jobKey, minId, maxId);
        iterator = items.iterator();
        log.info("Worker [{}-{}]: {} registros asignados", minId, maxId, items.size());
    }

    @Override
    public ArtWorkExcelStaging read() {
        return (iterator != null && iterator.hasNext()) ? iterator.next() : null;
    }

    @Override public void update(ExecutionContext executionContext) {}
    @Override public void close() {}
}
