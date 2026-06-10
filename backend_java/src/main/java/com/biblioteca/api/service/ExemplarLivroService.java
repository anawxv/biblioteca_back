package com.biblioteca.api.service;

import com.biblioteca.api.dto.ApiDtos;
import com.biblioteca.api.exception.NotFoundException;
import com.biblioteca.api.model.ExemplarLivro;
import com.biblioteca.api.model.Livro;
import com.biblioteca.api.model.StatusExemplarLivro;
import com.biblioteca.api.repository.ExemplarLivroRepository;
import com.biblioteca.api.repository.LivroRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ExemplarLivroService {

    private final ExemplarLivroRepository exemplarLivroRepository;
    private final LivroRepository livroRepository;

    public ExemplarLivroService(
            ExemplarLivroRepository exemplarLivroRepository,
            LivroRepository livroRepository
    ) {
        this.exemplarLivroRepository = exemplarLivroRepository;
        this.livroRepository = livroRepository;
    }

    public List<ApiDtos.ExemplarLivroResponse> listarPorLivro(Integer livroId) {
        livroRepository.findActiveDetailedById(livroId)
                .orElseThrow(() -> new NotFoundException("Livro nao encontrado."));

        return exemplarLivroRepository.findByLivro_IdLivroOrderByCodigoTomboAsc(livroId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public ApiDtos.ExemplarLivroResponse obterProximoDisponivel(Integer livroId) {
        livroRepository.findActiveDetailedById(livroId)
                .orElseThrow(() -> new NotFoundException("Livro nao encontrado."));

        return exemplarLivroRepository
                .findByLivro_IdLivroOrderByCodigoTomboAsc(livroId)
                .stream()
                .filter(ex -> Boolean.TRUE.equals(ex.getAtivo()) && ex.getStatus() == StatusExemplarLivro.DISPONIVEL)
                .findFirst()
                .map(this::toResponse)
                .orElse(null);
    }

    @Transactional
    public ExemplarLivro reservarPrimeiroDisponivel(Livro livro) {
        return exemplarLivroRepository
                .findFirstByLivro_IdLivroAndStatusAndAtivoTrueOrderByIdExemplarAsc(
                        livro.getIdLivro(),
                        StatusExemplarLivro.DISPONIVEL
                )
                .map(exemplar -> {
                    exemplar.setStatus(StatusExemplarLivro.EMPRESTADO);
                    return exemplarLivroRepository.save(exemplar);
                })
                .orElse(null);
    }

    @Transactional
    public void liberarExemplar(ExemplarLivro exemplar) {
        if (exemplar == null || !Boolean.TRUE.equals(exemplar.getAtivo())) {
            return;
        }
        exemplar.setStatus(StatusExemplarLivro.DISPONIVEL);
        exemplarLivroRepository.save(exemplar);
    }

    ApiDtos.ExemplarLivroResponse toResponse(ExemplarLivro exemplar) {
        return new ApiDtos.ExemplarLivroResponse(
                exemplar.getIdExemplar(),
                exemplar.getCodigoTombo(),
                exemplar.getStatus().name(),
                exemplar.getAtivo()
        );
    }
}
