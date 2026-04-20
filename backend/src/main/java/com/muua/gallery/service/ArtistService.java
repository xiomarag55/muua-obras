package com.muua.gallery.service;

import com.muua.gallery.entity.Artist;
import com.muua.gallery.repository.ArtistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ArtistService {

    private final ArtistRepository artistRepository;

    public List<Artist> getAllArtists() {
        return artistRepository.findAll();
    }

    public Optional<Artist> getArtistById(Long id) {
        return artistRepository.findById(id);
    }

    public List<Artist> searchArtists(String query) {
        if (query == null || query.isEmpty()) {
            return getAllArtists();
        }
        return artistRepository.findByNameContainingIgnoreCaseOrBioContainingIgnoreCase(query, query);
    }

    public List<Artist> filterByRegion(String region) {
        if (region == null || region.isEmpty()) {
            return getAllArtists();
        }
        return artistRepository.findByRegionIgnoreCase(region);
    }

    public List<Artist> filterByTechnique(String technique) {
        if (technique == null || technique.isEmpty()) {
            return getAllArtists();
        }
        return artistRepository.findByTechniqueIgnoreCase(technique);
    }

    public List<String> getDistinctRegions() {
        return artistRepository.findDistinctRegions();
    }

    public List<String> getDistinctTechniques() {
        return artistRepository.findDistinctTechniques();
    }

}
