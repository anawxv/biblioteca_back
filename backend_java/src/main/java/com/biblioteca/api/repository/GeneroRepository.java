package com.biblioteca.api.repository;

import com.biblioteca.api.model.Genero;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface GeneroRepository extends JpaRepository<Genero, Integer> {

    List<Genero> findByAtivoTrueOrderByNomeAsc();

    List<Genero> findByIdGeneroInAndAtivoTrue(Collection<Integer> ids);

    Optional<Genero> findByNomeIgnoreCase(String nome);
}
