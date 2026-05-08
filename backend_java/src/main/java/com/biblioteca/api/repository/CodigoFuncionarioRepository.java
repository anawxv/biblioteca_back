package com.biblioteca.api.repository;

import com.biblioteca.api.model.CodigoFuncionario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CodigoFuncionarioRepository extends JpaRepository<CodigoFuncionario, Integer> {

    Optional<CodigoFuncionario> findByCodigoIgnoreCase(String codigo);
}
