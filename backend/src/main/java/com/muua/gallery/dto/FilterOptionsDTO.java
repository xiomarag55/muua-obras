package com.muua.gallery.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FilterOptionsDTO {
    private List<String> techniques;
    private List<String> regions;
    private List<Integer> years;
}
