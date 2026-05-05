package com.biblioteca.api.repository;

import com.biblioteca.api.model.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoriaRepository extends JpaRepository<Categoria, Integer> {

    List<Categoria> findByAtivoTrueOrderByNomeAsc();

    Optional<Categoria> findByIdCategoriaAndAtivoTrue(Integer idCategoria);
}
