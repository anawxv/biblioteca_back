package com.biblioteca.api.repository;

import com.biblioteca.api.model.Subgenero;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface SubgeneroRepository extends JpaRepository<Subgenero, Integer> {

    List<Subgenero> findByCategoriaIdCategoriaAndAtivoTrueOrderByNomeAsc(Integer idCategoria);

    List<Subgenero> findByIdSubgeneroInAndAtivoTrue(Collection<Integer> ids);
}
