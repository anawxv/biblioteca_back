package com.biblioteca.api.repository;

import com.biblioteca.api.model.Reserva;
import com.biblioteca.api.model.StatusReserva;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReservaRepository extends JpaRepository<Reserva, Integer> {

    @EntityGraph(attributePaths = {"cliente", "cliente.usuario", "livro", "livro.categoria"})
    @Query("select r from Reserva r where r.cliente.idCliente = :clientId order by r.dataReserva desc")
    List<Reserva> findDetailedByClientId(@Param("clientId") Integer clientId);

    @EntityGraph(attributePaths = {"cliente", "cliente.usuario", "livro", "livro.categoria"})
    @Query("select r from Reserva r where r.idReserva = :id")
    Optional<Reserva> findDetailedById(@Param("id") Integer id);

  
    boolean existsByLivro_IdLivroAndStatus(Integer idLivro, StatusReserva status);

   
    boolean existsByCliente_IdClienteAndLivro_IdLivroAndStatus(Integer idCliente, Integer idLivro, StatusReserva status);
    
    long countByLivro_IdLivroAndStatus(Integer idLivro, StatusReserva status);
}