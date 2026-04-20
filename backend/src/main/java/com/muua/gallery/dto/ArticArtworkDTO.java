package com.muua.gallery.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class ArticArtworkDTO {

    private Long id;
    private String title;

    @JsonProperty("artist_display")
    private String artistDisplay;

    @JsonProperty("date_display")
    private String dateDisplay;

    @JsonProperty("medium_display")
    private String mediumDisplay;

    private String dimensions;
    private String description;

    @JsonProperty("image_id")
    private String imageId;

    public String getImageUrl() {
        if (imageId != null && !imageId.isBlank()) {
            return "https://www.artic.edu/iiif/2/" + imageId + "/full/400,/0/default.jpg";
        }
        return null;
    }
}
