package com.biblioteca.api.service;

import com.biblioteca.api.dto.ApiDtos;
import com.biblioteca.api.exception.BusinessException;
import com.biblioteca.api.exception.NotFoundException;
import com.biblioteca.api.model.Cliente;
import com.biblioteca.api.model.Favorito;
import com.biblioteca.api.model.FavoritoId;
import com.biblioteca.api.model.Livro;
import com.biblioteca.api.repository.ClienteRepository;
import com.biblioteca.api.repository.FavoritoRepository;
import com.biblioteca.api.repository.LivroRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FavoritoService {

    private final FavoritoRepository favoritoRepository;
    private final ClienteRepository clienteRepository;
    private final LivroRepository livroRepository;
    private final LivroService livroService;

    public FavoritoService(
            FavoritoRepository favoritoRepository,
            ClienteRepository clienteRepository,
            LivroRepository livroRepository,
            LivroService livroService
    ) {
        this.favoritoRepository = favoritoRepository;
        this.clienteRepository = clienteRepository;
        this.livroRepository = livroRepository;
        this.livroService = livroService;
    }

    public List<ApiDtos.FavoriteResponse> listarPorCliente(Integer clienteId) {
        clienteRepository.findDetailedById(clienteId)
                .orElseThrow(() -> new NotFoundException("Cliente nao encontrado."));

        return favoritoRepository.findDetailedByClientId(clienteId)
                .stream()
                .map(this::toFavoriteResponse)
                .toList();
    }

    @Transactional
    public ApiDtos.FavoriteResponse adicionar(ApiDtos.FavoriteRequest request) {
        Cliente cliente = clienteRepository.findDetailedById(request.clienteId())
                .orElseThrow(() -> new NotFoundException("Cliente nao encontrado."));
        Livro livro = livroRepository.findActiveDetailedById(request.livroId())
                .orElseThrow(() -> new NotFoundException("Livro nao encontrado."));

        FavoritoId id = new FavoritoId(cliente.getIdCliente(), livro.getIdLivro());
        if (favoritoRepository.existsById(id)) {
            throw new BusinessException("Livro ja esta nos favoritos do cliente.");
        }

        Favorito favorito = new Favorito();
        favorito.setId(id);
        favorito.setCliente(cliente);
        favorito.setLivro(livro);

        return toFavoriteResponse(favoritoRepository.save(favorito));
    }

    @Transactional
    public ApiDtos.DeleteResponse remover(Integer clienteId, Integer livroId) {
        FavoritoId id = new FavoritoId(clienteId, livroId);
        if (!favoritoRepository.existsById(id)) {
            throw new NotFoundException("Favorito nao encontrado.");
        }

        favoritoRepository.deleteById(id);
        return new ApiDtos.DeleteResponse(true, livroId, "Favorito removido com sucesso.");
    }

    private ApiDtos.FavoriteResponse toFavoriteResponse(Favorito favorito) {
        return new ApiDtos.FavoriteResponse(
                favorito.getCliente().getIdCliente(),
                livroService.toBookResponse(favorito.getLivro(), 0L),
                favorito.getCriadoEm()
        );
    }
}
