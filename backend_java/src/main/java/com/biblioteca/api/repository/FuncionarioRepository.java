package com.biblioteca.api.repository;

import com.biblioteca.api.model.Funcionario;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface FuncionarioRepository extends JpaRepository<Funcionario, Integer> {

    @EntityGraph(attributePaths = {"usuario"})
    @Query("select f from Funcionario f where f.idFuncionario = :id")
    Optional<Funcionario> findDetailedById(@Param("id") Integer id);
}
