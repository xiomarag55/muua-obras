package com.muua.gallery.dto;

import lombok.Data;

@Data
public class ArtworkCreateDTO {
    private String title;
    private String artistName;
    private String technique;
    private String dimensions;
    private Integer year;
    private String description;
    private String image;
}
