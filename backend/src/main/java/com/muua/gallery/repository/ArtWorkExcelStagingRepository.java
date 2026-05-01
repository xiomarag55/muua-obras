package com.muua.gallery.repository;

import com.muua.gallery.entity.ArtWorkExcelStaging;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface ArtWorkExcelStagingRepository extends JpaRepository<ArtWorkExcelStaging, Long> {

    List<ArtWorkExcelStaging> findByJobKeyAndIdBetween(String jobKey, Long minId, Long maxId);

    @Query("SELECT MIN(s.id) FROM ArtWorkExcelStaging s WHERE s.jobKey = :jobKey")
    Long findMinIdByJobKey(@Param("jobKey") String jobKey);

    @Query("SELECT MAX(s.id) FROM ArtWorkExcelStaging s WHERE s.jobKey = :jobKey")
    Long findMaxIdByJobKey(@Param("jobKey") String jobKey);

    long countByJobKey(String jobKey);

    @Transactional
    void deleteByJobKey(String jobKey);
}
