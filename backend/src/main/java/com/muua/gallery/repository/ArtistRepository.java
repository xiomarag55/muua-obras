package com.muua.gallery.repository;

import com.muua.gallery.entity.Artist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ArtistRepository extends JpaRepository<Artist, Long> {

    List<Artist> findByNameContainingIgnoreCaseOrBioContainingIgnoreCase(String name, String bio);

    List<Artist> findByRegionIgnoreCase(String region);

    List<Artist> findByTechniqueIgnoreCase(String technique);

    @Query("SELECT DISTINCT a.region FROM Artist a WHERE a.region IS NOT NULL ORDER BY a.region")
    List<String> findDistinctRegions();

    @Query("SELECT DISTINCT a.technique FROM Artist a WHERE a.technique IS NOT NULL ORDER BY a.technique")
    List<String> findDistinctTechniques();

}
