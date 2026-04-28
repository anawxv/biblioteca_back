package com.biblioteca.api.repository;

import com.biblioteca.api.model.Emprestimo;
import com.biblioteca.api.model.StatusEmprestimo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface EmprestimoRepository extends JpaRepository<Emprestimo, Integer> {

    @EntityGraph(attributePaths = {"cliente", "cliente.usuario", "livro", "livro.categoria", "funcionario", "funcionario.usuario"})
    @Query("select e from Emprestimo e where e.cliente.idCliente = :clientId order by e.dataEmprestimo desc")
    List<Emprestimo> findDetailedByClientId(@Param("clientId") Integer clientId);

    @EntityGraph(attributePaths = {"cliente", "cliente.usuario", "livro", "livro.categoria", "funcionario", "funcionario.usuario"})
    @Query("select e from Emprestimo e where e.idEmprestimo = :id")
    Optional<Emprestimo> findDetailedById(@Param("id") Integer id);

    @EntityGraph(attributePaths = {"cliente", "cliente.usuario", "livro", "livro.categoria", "funcionario", "funcionario.usuario"})
    Page<Emprestimo> findAllByOrderByDataEmprestimoDesc(Pageable pageable);

    List<Emprestimo> findAllByOrderByDataEmprestimoAsc();

    @Query("""
            select count(e)
            from Emprestimo e
            where e.cliente.idCliente = :clientId
              and e.dataDevolucao is null
              and e.status <> :cancelled
            """)
    long countOpenLoansByClientId(@Param("clientId") Integer clientId, @Param("cancelled") StatusEmprestimo cancelled);

    @Query("""
            select count(e)
            from Emprestimo e
            where e.dataDevolucao is null
              and e.status <> :cancelled
            """)
    long countActiveOpenLoans(@Param("cancelled") StatusEmprestimo cancelled);

    @Query("""
            select count(e)
            from Emprestimo e
            where e.dataDevolucao is null
              and e.dataPrevistaDevolucao < :today
              and e.status <> :cancelled
            """)
    long countOverdueOpenLoans(@Param("today") LocalDate today, @Param("cancelled") StatusEmprestimo cancelled);

    @Query("""
            select e.livro.idLivro as livroId, count(e.idEmprestimo) as total
            from Emprestimo e
            where e.livro.ativo = true
            group by e.livro.idLivro
            order by count(e.idEmprestimo) desc
            """)
    List<BookLoanCountProjection> findTopBorrowedBooks(Pageable pageable);

    @Query("""
            select e.livro.categoria.nome as label, count(e.idEmprestimo) as total
            from Emprestimo e
            where e.livro.ativo = true
            group by e.livro.categoria.nome
            order by count(e.idEmprestimo) desc
            """)
    List<CategoryConsumptionProjection> findTopGenres(Pageable pageable);

    interface BookLoanCountProjection {
        Integer getLivroId();
        long getTotal();
    }

    interface CategoryConsumptionProjection {
        String getLabel();
        long getTotal();
    }
}
