package com.muua.gallery.service;

import com.muua.gallery.dto.ArtworkCreateDTO;
import com.muua.gallery.entity.Artist;
import com.muua.gallery.entity.Artwork;
import com.muua.gallery.repository.ArtistRepository;
import com.muua.gallery.repository.ArtworkRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ArtworkService {

    private final ArtworkRepository artworkRepository;
    private final ArtistRepository artistRepository;

    public List<Artwork> getAllArtworks() {
        return artworkRepository.findAll();
    }

    public Optional<Artwork> getArtworkById(Long id) {
        return artworkRepository.findById(id);
    }

    public List<Artwork> getArtworksByArtistId(Long artistId) {
        return artworkRepository.findByArtistId(artistId);
    }

    public List<Artwork> searchArtworks(String query) {
        if (query == null || query.isEmpty()) {
            return getAllArtworks();
        }
        return artworkRepository.findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(query, query);
    }

    public List<Artwork> filterByTechnique(String technique) {
        if (technique == null || technique.isEmpty()) {
            return getAllArtworks();
        }
        return artworkRepository.findByTechniqueIgnoreCase(technique);
    }

    public List<Artwork> filterByYear(Integer year) {
        if (year == null) {
            return getAllArtworks();
        }
        return artworkRepository.findByYear(year);
    }

    public List<Artwork> filterByYearRange(Integer startYear, Integer endYear) {
        if (startYear == null || endYear == null) {
            return getAllArtworks();
        }
        return artworkRepository.findByYearBetween(startYear, endYear);
    }

    public List<String> getDistinctTechniques() {
        return artworkRepository.findDistinctTechniques();
    }

    public List<Integer> getDistinctYears() {
        return artworkRepository.findDistinctYears();
    }

    @Transactional
    public void deleteArtwork(Long id) {
        artworkRepository.deleteById(id);
    }

    @Transactional
    public Artwork createArtwork(ArtworkCreateDTO dto) {
        Artist artist = artistRepository.findByNameIgnoreCase(dto.getArtistName())
                .orElseGet(() -> artistRepository.save(
                        Artist.builder()
                                .name(dto.getArtistName())
                                .build()
                ));

        Artwork artwork = Artwork.builder()
                .title(dto.getTitle())
                .artist(artist)
                .technique(dto.getTechnique())
                .dimensions(dto.getDimensions())
                .year(dto.getYear())
                .description(dto.getDescription())
                .image(dto.getImage())
                .build();

        return artworkRepository.save(artwork);
    }

}
