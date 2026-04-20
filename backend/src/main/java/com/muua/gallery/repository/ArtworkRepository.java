package com.muua.gallery.repository;

import com.muua.gallery.entity.Artwork;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ArtworkRepository extends JpaRepository<Artwork, Long> {

    List<Artwork> findByArtistId(Long artistId);

    List<Artwork> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String title, String description);

    List<Artwork> findByTechniqueIgnoreCase(String technique);

    List<Artwork> findByYear(Integer year);

    List<Artwork> findByYearBetween(Integer startYear, Integer endYear);

    @Query("SELECT DISTINCT a.technique FROM Artwork a WHERE a.technique IS NOT NULL ORDER BY a.technique")
    List<String> findDistinctTechniques();

    @Query("SELECT DISTINCT a.year FROM Artwork a WHERE a.year IS NOT NULL ORDER BY a.year DESC")
    List<Integer> findDistinctYears();

}
