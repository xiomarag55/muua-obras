package com.muua.gallery.service;

import com.muua.gallery.dto.ArticPagedResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class ArticApiService {

    private final RestTemplate restTemplate;

    private static final String ARTIC_BASE_URL = "https://api.artic.edu/api/v1";
    private static final String FIELDS = "id,title,artist_display,date_display,medium_display,dimensions,description,image_id";

    public ArticPagedResponseDTO getArtworks(int page, int limit) {
        String url = ARTIC_BASE_URL + "/artworks?page=" + page + "&limit=" + limit + "&fields=" + FIELDS;
        ArticPagedResponseDTO response = restTemplate.getForObject(url, ArticPagedResponseDTO.class);
        if (response == null) {
            return new ArticPagedResponseDTO(java.util.Collections.emptyList(), null);
        }
        return response;
    }
}
