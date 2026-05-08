package com.biblioteca.api.repository;

import com.biblioteca.api.model.HistoricoLivro;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HistoricoLivroRepository extends JpaRepository<HistoricoLivro, Integer> {

    List<HistoricoLivro> findByLivroIdLivroOrderByCriadoEmDesc(Integer idLivro);
}
