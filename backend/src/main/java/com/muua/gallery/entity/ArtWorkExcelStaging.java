package com.muua.gallery.entity;

import jakarta.persistence.*;
import lombok.Data;

/**
 * Tabla temporal que guarda los datos del Excel durante la fase 1 del batch.
 * La fase 2 (workers paralelos) lee de aquí, sube la imagen a Cloudinary
 * y escribe el resultado final en artwork_excel.
 * El JobCleanupListener elimina estos registros al terminar el job.
 */
@Entity
@Data
@Table(name = "artwork_excel_staging",
       indexes = @Index(name = "idx_staging_job_key", columnList = "job_key"))
public class ArtWorkExcelStaging {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "job_key", nullable = false)
    private String jobKey;

    private String codigo;

    @Column(name = "ubicacion_permanente") private String ubicacionPermanente;
    @Column(name = "ubicacion_temporal")   private String ubicacionTemporal;

    private String apellido;
    private String nombre;
    private String titulo;

    @Column(name = "registro_fotografico") private String registroFotografico;
    @Column(name = "fecha_obra")           private String fechaObra;

    private String tecnica;
    private String tema;
    private String presentacion;

    @Column(name = "codigo_barras")   private String codigoBarras;
    @Column(name = "documento_legal") private String documentoLegal;
    @Column(name = "mes_ingreso")     private String mesIngreso;
    @Column(name = "anio_ingreso")    private String anioIngreso;

    private String formato;
    private String dimensiones;
    private String procedencia;

    @Column(name = "avaluo_comercial") private String avaluoComercial;
    private String observaciones;

    @Column(name = "estado_conservacion") private String estadoConservacion;
    private String responsable;

    /** Ruta al archivo temporal con los bytes de la imagen (null si no tiene foto). */
    @Column(name = "image_temp_path")
    private String imageTempPath;
}
