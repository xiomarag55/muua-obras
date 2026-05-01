package com.muua.gallery.controller;

import com.muua.gallery.dto.FilterOptionsDTO;
import com.muua.gallery.repository.ArtWorkExcelRepository;
import com.muua.gallery.service.ArtistService;
import com.muua.gallery.service.ArtworkService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/filters")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"}, maxAge = 3600)
public class FilterController {

    private final ArtistService artistService;
    private final ArtworkService artworkService;
    private final ArtWorkExcelRepository artWorkExcelRepository;

    @GetMapping
    public ResponseEntity<FilterOptionsDTO> getFilterOptions() {
        Set<String> tecnicas = new LinkedHashSet<>(artworkService.getDistinctTechniques());
        tecnicas.addAll(artWorkExcelRepository.findDistinctTecnicas());

        Set<String> regiones = new LinkedHashSet<>(artistService.getDistinctRegions());
        regiones.addAll(artWorkExcelRepository.findDistinctProcedencias());

        FilterOptionsDTO options = FilterOptionsDTO.builder()
                .techniques(List.copyOf(tecnicas))
                .regions(List.copyOf(regiones))
                .years(artworkService.getDistinctYears())
                .build();
        return ResponseEntity.ok(options);
    }

    @GetMapping("/techniques")
    public ResponseEntity<List<String>> getTechniques() {
        Set<String> tecnicas = new LinkedHashSet<>(artworkService.getDistinctTechniques());
        tecnicas.addAll(artWorkExcelRepository.findDistinctTecnicas());
        return ResponseEntity.ok(List.copyOf(tecnicas));
    }

    @GetMapping("/regions")
    public ResponseEntity<List<String>> getRegions() {
        Set<String> regiones = new LinkedHashSet<>(artistService.getDistinctRegions());
        regiones.addAll(artWorkExcelRepository.findDistinctProcedencias());
        return ResponseEntity.ok(List.copyOf(regiones));
    }

    @GetMapping("/years")
    public ResponseEntity<List<Integer>> getYears() {
        return ResponseEntity.ok(artworkService.getDistinctYears());
    }

    @GetMapping("/inventario")
    public ResponseEntity<Map<String, List<String>>> getInventarioFilters() {
        return ResponseEntity.ok(Map.of(
                "tecnicas",     artWorkExcelRepository.findDistinctTecnicas(),
                "anios",        artWorkExcelRepository.findDistinctAnios(),
                "procedencias", artWorkExcelRepository.findDistinctProcedencias()
        ));
    }
}
