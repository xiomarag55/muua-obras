package com.muua.gallery.batch;

import lombok.Data;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * DTO que transporta una fila del Excel entre el reader, el processor y el writer.
 * cells: mapa índice-columna (0-based) → valor de celda como String.
 * imageBytes: bytes de la imagen embebida en esa fila (null si no tiene).
 * endOfStream: true sólo para el elemento centinela que señala fin de lectura.
 */
@Data
public class ExcelRowData {

    private int rowNum;
    private Map<String, String> cells = new LinkedHashMap<>();
    private byte[] imageBytes;
    private String imageFileName;
    private boolean endOfStream;
}
