package com.muua.gallery.repository;

import com.muua.gallery.entity.ArtWorkExcel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ArtWorkExcelRepository extends JpaRepository<ArtWorkExcel, Long> {
    List<ArtWorkExcel> findByApellidoContainingIgnoreCase(String apellido);
    List<ArtWorkExcel> findByTecnica(String tecnica);
    List<ArtWorkExcel> findByAnioIngreso(String anio);

    @Query("SELECT a.codigo FROM ArtWorkExcel a WHERE a.codigo IS NOT NULL AND a.codigo <> ''")
    List<String> findAllCodigos();
}
