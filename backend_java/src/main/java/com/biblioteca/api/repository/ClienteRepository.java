package com.biblioteca.api.repository;

import com.biblioteca.api.model.Cliente;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.List;

public interface ClienteRepository extends JpaRepository<Cliente, Integer> {

    @EntityGraph(attributePaths = {"usuario"})
    @Query("select c from Cliente c where c.idCliente = :id")
    Optional<Cliente> findDetailedById(@Param("id") Integer id);

    @Query("select count(c) from Cliente c join c.usuario u where u.ativo = true")
    long countActiveClients();

    @EntityGraph(attributePaths = {"usuario"})
    @Query("""
            select c
            from Cliente c
            join c.usuario u
            where u.ativo = true
              and (
                :search is null
                or lower(u.nome) like lower(concat('%', :search, '%'))
                or lower(u.email) like lower(concat('%', :search, '%'))
                or lower(coalesce(u.telefone, '')) like lower(concat('%', :search, '%'))
              )
            order by u.nome asc
            """)
    List<Cliente> findActiveDetailedBySearch(@Param("search") String search);

    @EntityGraph(attributePaths = {"usuario"})
    @Query("""
            select c
            from Cliente c
            join c.usuario u
            where u.ativo = true
            order by u.nome asc
            """)
    List<Cliente> findActiveDetailed();
}
