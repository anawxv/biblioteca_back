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

    List<StatusEmprestimo> EXCLUDED_OPEN_STATUSES = List.of(
            StatusEmprestimo.CANCELADO,
            StatusEmprestimo.PENDENTE,
            StatusEmprestimo.RECUSADA
    );

    @EntityGraph(attributePaths = {"cliente", "cliente.usuario", "livro", "livro.categoria", "funcionario", "funcionario.usuario", "exemplar"})
    @Query("select e from Emprestimo e where e.cliente.idCliente = :clientId order by e.dataEmprestimo desc")
    List<Emprestimo> findDetailedByClientId(@Param("clientId") Integer clientId);

    @EntityGraph(attributePaths = {"cliente", "cliente.usuario", "livro", "livro.categoria", "funcionario", "funcionario.usuario", "exemplar"})
    @Query("select e from Emprestimo e where e.idEmprestimo = :id")
    Optional<Emprestimo> findDetailedById(@Param("id") Integer id);

    @EntityGraph(attributePaths = {"cliente", "cliente.usuario", "livro", "livro.categoria", "funcionario", "funcionario.usuario", "exemplar"})
    Page<Emprestimo> findAllByOrderByDataEmprestimoDesc(Pageable pageable);

    List<Emprestimo> findAllByOrderByDataEmprestimoAsc();

    @Query("""
            select count(e)
            from Emprestimo e
            where e.cliente.idCliente = :clientId
              and e.dataDevolucao is null
              and e.status not in :excluded
            """)
    long countOpenLoansByClientId(
            @Param("clientId") Integer clientId,
            @Param("excluded") List<StatusEmprestimo> excluded
    );

    @Query("""
            select count(e)
            from Emprestimo e
            where e.dataDevolucao is null
              and e.status not in :excluded
            """)
    long countActiveOpenLoans(@Param("excluded") List<StatusEmprestimo> excluded);

    @Query("""
            select count(e)
            from Emprestimo e
            where e.dataDevolucao is null
              and e.dataPrevistaDevolucao < :today
              and e.status not in :excluded
            """)
    long countOverdueOpenLoans(
            @Param("today") LocalDate today,
            @Param("excluded") List<StatusEmprestimo> excluded
    );

    @Query("""
            select count(e)
            from Emprestimo e
            where e.cliente.idCliente = :clientId
              and e.dataDevolucao is null
              and e.dataPrevistaDevolucao < :today
              and e.status not in :excluded
            """)
    long countOverdueLoansByClientId(
            @Param("clientId") Integer clientId,
            @Param("today") LocalDate today,
            @Param("excluded") List<StatusEmprestimo> excluded
    );

    long countByStatus(StatusEmprestimo status);

    @EntityGraph(attributePaths = {"cliente", "cliente.usuario", "livro", "livro.categoria", "funcionario", "funcionario.usuario", "exemplar"})
    @Query("""
            select e
            from Emprestimo e
            where e.dataDevolucao is null
              and e.status not in :excluded
              and (
                :search is null
                or lower(e.cliente.usuario.nome) like lower(concat('%', :search, '%'))
                or lower(e.cliente.usuario.email) like lower(concat('%', :search, '%'))
                or lower(e.livro.titulo) like lower(concat('%', :search, '%'))
                or lower(e.livro.autor) like lower(concat('%', :search, '%'))
              )
            order by e.dataEmprestimo desc
            """)
    List<Emprestimo> findActiveDetailed(
            @Param("excluded") List<StatusEmprestimo> excluded,
            @Param("search") String search
    );

    @EntityGraph(attributePaths = {"cliente", "cliente.usuario", "livro", "livro.categoria", "funcionario", "funcionario.usuario", "exemplar"})
    @Query("""
            select e
            from Emprestimo e
            where e.dataDevolucao is null
              and e.status not in :excluded
            order by e.dataEmprestimo desc
            """)
    List<Emprestimo> findActiveDetailed(@Param("excluded") List<StatusEmprestimo> excluded);

    @EntityGraph(attributePaths = {"cliente", "cliente.usuario", "livro", "livro.categoria", "funcionario", "funcionario.usuario", "exemplar"})
    @Query("""
            select e
            from Emprestimo e
            where e.status = :status
            order by e.dataEmprestimo desc
            """)
    List<Emprestimo> findDetailedByStatus(@Param("status") StatusEmprestimo status);

    @EntityGraph(attributePaths = {"cliente", "cliente.usuario", "livro", "livro.categoria", "funcionario", "funcionario.usuario", "exemplar"})
    @Query("""
            select e
            from Emprestimo e
            where e.cliente.idCliente = :clientId
              and e.livro.idLivro = :livroId
              and e.status = :status
            """)
    Optional<Emprestimo> findByClientIdAndLivroIdAndStatus(
            @Param("clientId") Integer clientId,
            @Param("livroId") Integer livroId,
            @Param("status") StatusEmprestimo status
    );

    @EntityGraph(attributePaths = {"cliente", "cliente.usuario", "livro", "livro.categoria", "funcionario", "funcionario.usuario", "exemplar"})
    @Query("""
            select e
            from Emprestimo e
            where e.dataDevolucao is null
              and e.dataPrevistaDevolucao < :today
              and e.status not in :excluded
              and (
                :search is null
                or lower(e.cliente.usuario.nome) like lower(concat('%', :search, '%'))
                or lower(e.cliente.usuario.email) like lower(concat('%', :search, '%'))
                or lower(e.livro.titulo) like lower(concat('%', :search, '%'))
                or lower(e.livro.autor) like lower(concat('%', :search, '%'))
              )
            order by e.dataPrevistaDevolucao asc
            """)
    List<Emprestimo> findOverdueDetailed(
            @Param("today") LocalDate today,
            @Param("excluded") List<StatusEmprestimo> excluded,
            @Param("search") String search
    );

    @EntityGraph(attributePaths = {"cliente", "cliente.usuario", "livro", "livro.categoria", "funcionario", "funcionario.usuario", "exemplar"})
    @Query("""
            select e
            from Emprestimo e
            where e.dataDevolucao is null
              and e.dataPrevistaDevolucao < :today
              and e.status not in :excluded
            order by e.dataPrevistaDevolucao asc
            """)
    List<Emprestimo> findOverdueDetailed(
            @Param("today") LocalDate today,
            @Param("excluded") List<StatusEmprestimo> excluded
    );

    @Query("""
            select e.livro.idLivro as livroId, count(e.idEmprestimo) as total
            from Emprestimo e
            where e.livro.ativo = true
              and e.status not in :excluded
            group by e.livro.idLivro
            order by count(e.idEmprestimo) desc
            """)
    List<BookLoanCountProjection> findTopBorrowedBooks(
            @Param("excluded") List<StatusEmprestimo> excluded,
            Pageable pageable
    );

    @Query("""
            select e.livro.categoria.nome as label, count(e.idEmprestimo) as total
            from Emprestimo e
            where e.livro.ativo = true
              and e.status not in :excluded
            group by e.livro.categoria.nome
            order by count(e.idEmprestimo) desc
            """)
    List<CategoryConsumptionProjection> findTopGenres(
            @Param("excluded") List<StatusEmprestimo> excluded,
            Pageable pageable
    );

    interface BookLoanCountProjection {
        Integer getLivroId();
        long getTotal();
    }

    interface CategoryConsumptionProjection {
        String getLabel();
        long getTotal();
    }
}
