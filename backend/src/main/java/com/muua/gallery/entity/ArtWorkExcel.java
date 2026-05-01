package com.muua.gallery.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "artwork_excel")
public class ArtWorkExcel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String codigo;

    @Column(name = "ubicacion_permanente")
    private String ubicacionPermanente;

    @Column(name = "ubicacion_temporal")
    private String ubicacionTemporal;

    private String apellido;
    private String nombre;
    private String titulo;

    @Column(name = "registro_fotografico")
    private String registroFotografico;

    @Column(name = "fecha_obra")
    private String fechaObra;

    private String tecnica;
    private String tema;
    private String presentacion;

    @Column(name = "codigo_barras")
    private String codigoBarras;

    @Column(name = "documento_legal")
    private String documentoLegal;

    @Column(name = "mes_ingreso")
    private String mesIngreso;

    @Column(name = "anio_ingreso")
    private String anioIngreso;

    private String formato;
    private String dimensiones;
    private String procedencia;

    @Column(name = "avaluo_comercial")
    private String avaluoComercial;

    private String observaciones;

    @Column(name = "estado_conservacion")
    private String estadoConservacion;

    private String responsable;

    @JsonIgnore
    @Column(name = "foto", columnDefinition = "BYTEA")
    private byte[] foto;

    @Column(name = "foto_nombre")
    private String fotoNombre;

    /** URL pública en Cloudinary. Null en registros importados antes de Spring Batch. */
    @Column(name = "foto_url")
    private String fotoUrl;
}
