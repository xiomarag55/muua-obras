package com.muua.gallery.config;

import com.cloudinary.Cloudinary;
import com.muua.gallery.batch.*;
import com.muua.gallery.entity.ArtWorkExcel;
import com.muua.gallery.entity.ArtWorkExcelStaging;
import com.muua.gallery.repository.ArtWorkExcelRepository;
import com.muua.gallery.repository.ArtWorkExcelStagingRepository;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.batch.core.launch.support.TaskExecutorJobLauncher;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.task.SimpleAsyncTaskExecutor;
import org.springframework.transaction.PlatformTransactionManager;

import java.util.HashSet;

@Configuration
public class BatchConfig {

    @Value("${batch.temp-dir}")
    private String tempDir;

    @Value("${batch.partitioner.grid-size:4}")
    private int gridSize;

    // ══════════════════════════════════════════════════════════════════════════
    // FASE 1 — Excel → Staging table (single-threaded, SAX streaming)
    // ══════════════════════════════════════════════════════════════════════════

    @Bean
    @StepScope
    public ExcelBatchItemReader excelBatchItemReader(
            @Value("#{jobParameters['filePath']}") String filePath) {
        return new ExcelBatchItemReader(filePath);
    }

    @Bean
    @StepScope
    public ExcelToStagingProcessor excelToStagingProcessor(
            ArtWorkExcelRepository artWorkExcelRepository,
            @Value("#{jobParameters['jobKey']}") String jobKey) {
        return new ExcelToStagingProcessor(
                jobKey,
                tempDir,
                new HashSet<>(artWorkExcelRepository.findAllCodigos())
        );
    }

    @Bean
    public StagingItemWriter stagingItemWriter(ArtWorkExcelStagingRepository stagingRepository) {
        return new StagingItemWriter(stagingRepository);
    }

    @Bean
    public Step stagingStep(JobRepository jobRepository,
                            PlatformTransactionManager transactionManager,
                            ExcelBatchItemReader excelBatchItemReader,
                            ExcelToStagingProcessor excelToStagingProcessor,
                            StagingItemWriter stagingItemWriter) {
        return new StepBuilder("stagingStep", jobRepository)
                .<ExcelRowData, ArtWorkExcelStaging>chunk(50, transactionManager)
                .reader(excelBatchItemReader)
                .processor(excelToStagingProcessor)
                .writer(stagingItemWriter)
                .build();
    }

    // ══════════════════════════════════════════════════════════════════════════
    // FASE 2 — Staging → Cloudinary → artwork_excel (partitioned, parallel)
    // ══════════════════════════════════════════════════════════════════════════

    @Bean
    @StepScope
    public ExcelPartitioner excelPartitioner(
            ArtWorkExcelStagingRepository stagingRepository,
            @Value("#{jobParameters['jobKey']}") String jobKey) {
        return new ExcelPartitioner(stagingRepository, jobKey);
    }

    @Bean
    @StepScope
    public StagingItemReader stagingItemReader(
            ArtWorkExcelStagingRepository stagingRepository,
            @Value("#{stepExecutionContext['minId']}") Long minId,
            @Value("#{stepExecutionContext['maxId']}") Long maxId,
            @Value("#{stepExecutionContext['jobKey']}") String jobKey) {
        return new StagingItemReader(stagingRepository, minId, maxId, jobKey);
    }

    @Bean
    public StagingToFinalProcessor stagingToFinalProcessor(Cloudinary cloudinary) {
        return new StagingToFinalProcessor(cloudinary);
    }

    @Bean
    public ExcelBatchItemWriter excelBatchItemWriter(ArtWorkExcelRepository artWorkExcelRepository) {
        return new ExcelBatchItemWriter(artWorkExcelRepository);
    }

    /** Step que ejecuta cada worker dentro de la partición. */
    @Bean
    public Step workerStep(JobRepository jobRepository,
                           PlatformTransactionManager transactionManager,
                           StagingItemReader stagingItemReader,
                           StagingToFinalProcessor stagingToFinalProcessor,
                           ExcelBatchItemWriter excelBatchItemWriter) {
        return new StepBuilder("workerStep", jobRepository)
                .<ArtWorkExcelStaging, ArtWorkExcel>chunk(25, transactionManager)
                .reader(stagingItemReader)
                .processor(stagingToFinalProcessor)
                .writer(excelBatchItemWriter)
                .build();
    }

    /** Master step que orquesta los workers en paralelo. */
    @Bean
    public Step partitionedStep(JobRepository jobRepository,
                                Step workerStep,
                                ExcelPartitioner excelPartitioner) {
        return new StepBuilder("partitionedStep", jobRepository)
                .partitioner("workerStep", excelPartitioner)
                .step(workerStep)
                .gridSize(gridSize)
                .taskExecutor(new SimpleAsyncTaskExecutor("worker-"))
                .build();
    }

    // ══════════════════════════════════════════════════════════════════════════
    // Listener + Job + Launcher
    // ══════════════════════════════════════════════════════════════════════════

    @Bean
    public JobCleanupListener jobCleanupListener(ArtWorkExcelStagingRepository stagingRepository) {
        return new JobCleanupListener(stagingRepository, tempDir);
    }

    @Bean
    public Job excelImportJob(JobRepository jobRepository,
                              Step stagingStep,
                              Step partitionedStep,
                              JobCleanupListener jobCleanupListener) {
        return new JobBuilder("excelImportJob", jobRepository)
                .preventRestart()
                .start(stagingStep)
                .next(partitionedStep)
                .listener(jobCleanupListener)
                .build();
    }

    @Bean(name = "asyncJobLauncher")
    public JobLauncher asyncJobLauncher(JobRepository jobRepository) throws Exception {
        TaskExecutorJobLauncher launcher = new TaskExecutorJobLauncher();
        launcher.setJobRepository(jobRepository);
        launcher.setTaskExecutor(new SimpleAsyncTaskExecutor("batch-main-"));
        launcher.afterPropertiesSet();
        return launcher;
    }
}
