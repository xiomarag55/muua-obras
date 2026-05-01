package com.muua.gallery.batch;

import com.muua.gallery.entity.ArtWorkExcelStaging;
import com.muua.gallery.repository.ArtWorkExcelStagingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.item.Chunk;
import org.springframework.batch.item.ItemWriter;

@Slf4j
@RequiredArgsConstructor
public class StagingItemWriter implements ItemWriter<ArtWorkExcelStaging> {

    private final ArtWorkExcelStagingRepository repository;

    @Override
    public void write(Chunk<? extends ArtWorkExcelStaging> chunk) throws Exception {
        repository.saveAll(chunk.getItems());
        log.debug("Staging: {} registros guardados en este chunk", chunk.getItems().size());
    }
}
