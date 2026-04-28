package com.biblioteca.api.repository;

import com.biblioteca.api.model.Multa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.Optional;

public interface MultaRepository extends JpaRepository<Multa, Integer> {

    Optional<Multa> findByEmprestimo_IdEmprestimo(Integer idEmprestimo);

    @Query("select coalesce(sum(m.valor), 0) from Multa m where m.paga = false")
    BigDecimal sumPendingFines();

    @Query("""
            select coalesce(sum(m.valor), 0)
            from Multa m
            join m.emprestimo e
            where e.cliente.idCliente = :clientId
              and m.paga = false
            """)
    BigDecimal sumPendingFinesByClientId(@Param("clientId") Integer clientId);
}
