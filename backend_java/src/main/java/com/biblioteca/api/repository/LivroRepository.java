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

    @Query(value = """
            select distinct l.id_livro
              from livro l
              left join categoria c on c.id_categoria = l.id_categoria
              left join livro_genero lg on lg.id_livro = l.id_livro
              left join genero g on g.id_genero = lg.id_genero
              left join livro_subgenero ls on ls.id_livro = l.id_livro
              left join subgenero s on s.id_subgenero = ls.id_subgenero
             where l.ativo = true
               and (
                 :search is null
                 or lower(cast(l.titulo as text)) like lower(concat('%', cast(:search as text), '%'))
                 or lower(cast(l.autor as text)) like lower(concat('%', cast(:search as text), '%'))
                 or lower(cast(l.isbn as text)) like lower(concat('%', cast(:search as text), '%'))
                 or lower(cast(l.descricao as text)) like lower(concat('%', cast(:search as text), '%'))
                 or lower(cast(l.editora as text)) like lower(concat('%', cast(:search as text), '%'))
                 or lower(cast(c.nome as text)) like lower(concat('%', cast(:search as text), '%'))
                 or lower(cast(g.nome as text)) like lower(concat('%', cast(:search as text), '%'))
                 or lower(cast(s.nome as text)) like lower(concat('%', cast(:search as text), '%'))
               )
             order by l.id_livro asc
            """, nativeQuery = true)
    List<Integer> findActiveIdsBySearch(@Param("search") String search);

    @EntityGraph(attributePaths = {"categoria", "generosExtras", "subgeneros"})
    @Query("select distinct l from Livro l where l.ativo = true and l.idLivro in :ids order by l.titulo asc")
    List<Livro> findActiveDetailedByIds(@Param("ids") List<Integer> ids);

    @EntityGraph(attributePaths = {"categoria", "generosExtras", "subgeneros"})
    @Query("select l from Livro l where l.ativo = true and l.idLivro = :id")
    Optional<Livro> findActiveDetailedById(@Param("id") Integer id);

    @EntityGraph(attributePaths = {"categoria", "generosExtras", "subgeneros"})
    @Query("select l from Livro l where l.idLivro = :id")
    Optional<Livro> findDetailedById(@Param("id") Integer id);

    @EntityGraph(attributePaths = {"categoria", "generosExtras", "subgeneros"})
    List<Livro> findTop6ByAtivoTrueOrderByCriadoEmDesc();

    @EntityGraph(attributePaths = {"categoria", "generosExtras", "subgeneros"})
    @Query("""
            select distinct l
            from Livro l
            where l.ativo = true
              and l.quantidadeDisponivel <= 0
              and (
                :search is null
                or lower(l.titulo) like lower(concat('%', :search, '%'))
                or lower(l.autor) like lower(concat('%', :search, '%'))
                or lower(l.categoria.nome) like lower(concat('%', :search, '%'))
              )
            order by l.titulo asc
            """)
    List<Livro> findUnavailableBySearch(@Param("search") String search);

    @EntityGraph(attributePaths = {"categoria", "generosExtras", "subgeneros"})
    @Query("""
            select distinct l
            from Livro l
            where l.ativo = true
              and l.quantidadeDisponivel <= 0
            order by l.titulo asc
            """)
    List<Livro> findUnavailable();

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
