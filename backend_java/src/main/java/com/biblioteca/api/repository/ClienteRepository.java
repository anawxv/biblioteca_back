package com.biblioteca.api.repository;

import com.biblioteca.api.model.Cliente;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.Optional;
import java.util.List;

public interface ClienteRepository extends JpaRepository<Cliente, Integer> {

    @EntityGraph(attributePaths = {"usuario"})
    @Query("select c from Cliente c where c.idCliente = :id")
    Optional<Cliente> findDetailedById(Integer id);

    @EntityGraph(attributePaths = {"usuario"})
    List<Cliente> findAll();

    // ADICIONE ESTA LINHA ABAIXO PARA SUMIR O ERRO DO DASHBOARD:
    @Query("SELECT COUNT(c) FROM Cliente c JOIN c.usuario u WHERE u.ativo = true")
    long countActiveClients();
<<<<<<< HEAD

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
=======
}
>>>>>>> f1c942b357e26ea8407126567397b833e9cf7c6f
