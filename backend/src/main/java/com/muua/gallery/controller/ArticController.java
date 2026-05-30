package com.muua.gallery.controller;

import com.muua.gallery.dto.ArticPagedResponseDTO;
import com.muua.gallery.service.ArticApiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/artworks/artic")
@RequiredArgsConstructor
public class ArticController {

    private final ArticApiService articApiService;

    @GetMapping
    public ResponseEntity<ArticPagedResponseDTO> getArticArtworks(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "12") int limit) {
        ArticPagedResponseDTO response = articApiService.getArtworks(page, limit);
        return ResponseEntity.ok(response);
    }
}
