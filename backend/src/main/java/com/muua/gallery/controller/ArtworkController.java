package com.muua.gallery.controller;

import com.muua.gallery.dto.ArtworkCreateDTO;
import com.muua.gallery.entity.Artwork;
import com.muua.gallery.service.ArtworkService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/artworks")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"}, maxAge = 3600)
public class ArtworkController {

    private final ArtworkService artworkService;

    @GetMapping
    public ResponseEntity<List<Artwork>> getAllArtworks() {
        List<Artwork> artworks = artworkService.getAllArtworks();
        return ResponseEntity.ok(artworks);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Artwork> getArtworkById(@PathVariable Long id) {
        return artworkService.getArtworkById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/artist/{artistId}")
    public ResponseEntity<List<Artwork>> getArtworksByArtist(@PathVariable Long artistId) {
        List<Artwork> artworks = artworkService.getArtworksByArtistId(artistId);
        return ResponseEntity.ok(artworks);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Artwork>> searchArtworks(@RequestParam(required = false) String q) {
        List<Artwork> artworks = artworkService.searchArtworks(q);
        return ResponseEntity.ok(artworks);
    }

    @GetMapping("/technique")
    public ResponseEntity<List<Artwork>> filterByTechnique(@RequestParam(required = false) String technique) {
        List<Artwork> artworks = artworkService.filterByTechnique(technique);
        return ResponseEntity.ok(artworks);
    }

    @GetMapping("/year")
    public ResponseEntity<List<Artwork>> filterByYear(@RequestParam(required = false) Integer year) {
        List<Artwork> artworks = artworkService.filterByYear(year);
        return ResponseEntity.ok(artworks);
    }

    @GetMapping("/year-range")
    public ResponseEntity<List<Artwork>> filterByYearRange(
            @RequestParam(required = false) Integer startYear,
            @RequestParam(required = false) Integer endYear) {
        List<Artwork> artworks = artworkService.filterByYearRange(startYear, endYear);
        return ResponseEntity.ok(artworks);
    }

    @PostMapping
    public ResponseEntity<Artwork> createArtwork(@RequestBody ArtworkCreateDTO dto) {
        Artwork artwork = artworkService.createArtwork(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(artwork);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteArtwork(@PathVariable Long id) {
        artworkService.deleteArtwork(id);
        return ResponseEntity.noContent().build();
    }

}
