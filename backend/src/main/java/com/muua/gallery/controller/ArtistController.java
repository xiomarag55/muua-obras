package com.muua.gallery.controller;

import com.muua.gallery.entity.Artist;
import com.muua.gallery.service.ArtistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/artists")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"}, maxAge = 3600)
public class ArtistController {

    private final ArtistService artistService;

    @GetMapping
    public ResponseEntity<List<Artist>> getAllArtists() {
        List<Artist> artists = artistService.getAllArtists();
        return ResponseEntity.ok(artists);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Artist> getArtistById(@PathVariable Long id) {
        return artistService.getArtistById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public ResponseEntity<List<Artist>> searchArtists(@RequestParam(required = false) String q) {
        List<Artist> artists = artistService.searchArtists(q);
        return ResponseEntity.ok(artists);
    }

    @GetMapping("/region")
    public ResponseEntity<List<Artist>> filterByRegion(@RequestParam(required = false) String region) {
        List<Artist> artists = artistService.filterByRegion(region);
        return ResponseEntity.ok(artists);
    }

    @GetMapping("/technique")
    public ResponseEntity<List<Artist>> filterByTechnique(@RequestParam(required = false) String technique) {
        List<Artist> artists = artistService.filterByTechnique(technique);
        return ResponseEntity.ok(artists);
    }

}
