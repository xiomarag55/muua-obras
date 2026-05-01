package com.muua.gallery.repository;

import com.muua.gallery.entity.ArtWorkExcel;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ArtWorkExcelRepository extends JpaRepository<ArtWorkExcel, Long> {
    List<ArtWorkExcel> findByApellidoContainingIgnoreCase(String apellido);
    List<ArtWorkExcel> findByTecnica(String tecnica);
    List<ArtWorkExcel> findByAnioIngreso(String anio);

    @Modifying
    @Transactional
    @Query("DELETE FROM ArtWorkExcel a WHERE a.codigo = :codigo")
    void deleteByCodigo(@Param("codigo") String codigo);

    @Query("SELECT a.codigo FROM ArtWorkExcel a WHERE a.codigo IS NOT NULL AND a.codigo <> ''")
    List<String> findAllCodigos();

    @Query("SELECT DISTINCT a.tecnica FROM ArtWorkExcel a WHERE a.tecnica IS NOT NULL AND a.tecnica <> '' ORDER BY a.tecnica")
    List<String> findDistinctTecnicas();

    @Query("SELECT DISTINCT a.anioIngreso FROM ArtWorkExcel a WHERE a.anioIngreso IS NOT NULL AND a.anioIngreso <> '' ORDER BY a.anioIngreso")
    List<String> findDistinctAnios();

    @Query("SELECT DISTINCT a.procedencia FROM ArtWorkExcel a WHERE a.procedencia IS NOT NULL AND a.procedencia <> '' ORDER BY a.procedencia")
    List<String> findDistinctProcedencias();
}
