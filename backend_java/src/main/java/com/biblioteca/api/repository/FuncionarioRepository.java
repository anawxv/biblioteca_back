package com.biblioteca.api.repository;

import com.biblioteca.api.model.Funcionario;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FuncionarioRepository extends JpaRepository<Funcionario, Integer> {

    @EntityGraph(attributePaths = {"usuario"})
    @Query("select f from Funcionario f where f.idFuncionario = :id")
    Optional<Funcionario> findDetailedById(@Param("id") Integer id);

    @EntityGraph(attributePaths = {"usuario"})
    @Query("""
            select f
            from Funcionario f
            join f.usuario u
            where u.ativo = true
            order by u.nome asc
            """)
    List<Funcionario> findActiveDetailed();

    @EntityGraph(attributePaths = {"usuario"})
    @Query("""
            select f
            from Funcionario f
            join f.usuario u
            where u.ativo = true
              and (
                :search is null
                or lower(u.nome) like lower(concat('%', :search, '%'))
                or lower(u.email) like lower(concat('%', :search, '%'))
                or lower(coalesce(u.telefone, '')) like lower(concat('%', :search, '%'))
              )
            order by u.nome asc
            """)
    List<Funcionario> findActiveDetailedBySearch(@Param("search") String search);
}
