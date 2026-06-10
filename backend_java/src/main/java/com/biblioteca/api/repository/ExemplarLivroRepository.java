package com.biblioteca.api.repository;

import com.biblioteca.api.model.ExemplarLivro;
import com.biblioteca.api.model.StatusExemplarLivro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;

public interface ExemplarLivroRepository extends JpaRepository<ExemplarLivro, Integer> {

    List<ExemplarLivro> findByLivro_IdLivroOrderByCodigoTomboAsc(Integer livroId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<ExemplarLivro> findFirstByLivro_IdLivroAndStatusAndAtivoTrueOrderByIdExemplarAsc(
            Integer livroId,
            StatusExemplarLivro status
    );

    long countByLivro_IdLivroAndAtivoTrue(Integer livroId);
}
