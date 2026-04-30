package com.muua.gallery.batch;

import com.muua.gallery.entity.ArtWorkExcel;
import com.muua.gallery.repository.ArtWorkExcelRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.item.Chunk;
import org.springframework.batch.item.ItemWriter;

@Slf4j
@RequiredArgsConstructor
public class ExcelBatchItemWriter implements ItemWriter<ArtWorkExcel> {

    private final ArtWorkExcelRepository repository;

    @Override
    public void write(Chunk<? extends ArtWorkExcel> chunk) throws Exception {
        repository.saveAll(chunk.getItems());
        log.debug("Chunk guardado: {} obras", chunk.getItems().size());
    }
}
