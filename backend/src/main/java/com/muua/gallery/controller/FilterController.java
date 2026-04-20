package com.muua.gallery.controller;

import com.muua.gallery.dto.FilterOptionsDTO;
import com.muua.gallery.service.ArtistService;
import com.muua.gallery.service.ArtworkService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/filters")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"}, maxAge = 3600)
public class FilterController {

    private final ArtistService artistService;
    private final ArtworkService artworkService;

    @GetMapping
    public ResponseEntity<FilterOptionsDTO> getFilterOptions() {
        FilterOptionsDTO options = FilterOptionsDTO.builder()
                .techniques(artworkService.getDistinctTechniques())
                .regions(artistService.getDistinctRegions())
                .years(artworkService.getDistinctYears())
                .build();
        return ResponseEntity.ok(options);
    }

    @GetMapping("/techniques")
    public ResponseEntity<List<String>> getTechniques() {
        List<String> techniques = artworkService.getDistinctTechniques();
        return ResponseEntity.ok(techniques);
    }

    @GetMapping("/regions")
    public ResponseEntity<List<String>> getRegions() {
        List<String> regions = artistService.getDistinctRegions();
        return ResponseEntity.ok(regions);
    }

    @GetMapping("/years")
    public ResponseEntity<List<Integer>> getYears() {
        List<Integer> years = artworkService.getDistinctYears();
        return ResponseEntity.ok(years);
    }

}
