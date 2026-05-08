package com.biblioteca.api.repository;

import com.biblioteca.api.model.Livro;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface LivroRepository extends JpaRepository<Livro, Integer> {

    @EntityGraph(attributePaths = {"categoria", "generosExtras", "subgeneros"})
    @Query("""
            select l
            from Livro l
            where l.ativo = true
              and (
                :search is null
                or lower(l.titulo) like lower(concat('%', :search, '%'))
                or lower(l.autor) like lower(concat('%', :search, '%'))
                or lower(l.categoria.nome) like lower(concat('%', :search, '%'))
                or exists (
                    select g
                    from l.generosExtras g
                    where lower(g.nome) like lower(concat('%', :search, '%'))
                )
                or exists (
                    select s
                    from l.subgeneros s
                    where lower(s.nome) like lower(concat('%', :search, '%'))
                )
              )
            order by l.titulo asc
            """)
    List<Livro> findActiveBySearch(@Param("search") String search);

    @EntityGraph(attributePaths = {"categoria", "generosExtras", "subgeneros"})
    @Query("select l from Livro l where l.ativo = true and l.idLivro = :id")
    Optional<Livro> findActiveDetailedById(@Param("id") Integer id);

    @EntityGraph(attributePaths = {"categoria", "generosExtras", "subgeneros"})
    @Query("select l from Livro l where l.idLivro = :id")
    Optional<Livro> findDetailedById(@Param("id") Integer id);

    @EntityGraph(attributePaths = {"categoria", "generosExtras", "subgeneros"})
    List<Livro> findTop6ByAtivoTrueOrderByCriadoEmDesc();

    long countByAtivoTrue();

    long countByAtivoTrueAndQuantidadeDisponivelLessThanEqual(Integer quantidadeDisponivel);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            update Livro l
               set l.ativo = false,
                   l.atualizadoEm = :updatedAt
             where l.idLivro = :id
               and l.ativo = true
            """)
    int softDelete(@Param("id") Integer id, @Param("updatedAt") LocalDateTime updatedAt);

    Optional<Livro> findByIdLivro(Integer idLivro);

    boolean existsByIsbnIgnoreCaseAndIdLivroNot(String isbn, Integer idLivro);
}
