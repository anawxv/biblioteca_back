package com.biblioteca.api.repository;

import com.biblioteca.api.model.Favorito;
import com.biblioteca.api.model.FavoritoId;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FavoritoRepository extends JpaRepository<Favorito, FavoritoId> {

    @EntityGraph(attributePaths = {"cliente", "cliente.usuario", "livro", "livro.categoria"})
    @Query("select f from Favorito f where f.cliente.idCliente = :clientId order by f.criadoEm desc")
    List<Favorito> findDetailedByClientId(@Param("clientId") Integer clientId);
}
