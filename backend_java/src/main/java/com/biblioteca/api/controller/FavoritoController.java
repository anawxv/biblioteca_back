package com.biblioteca.api.controller;

import com.biblioteca.api.dto.ApiDtos;
import com.biblioteca.api.service.FavoritoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/favoritos")
public class FavoritoController {

    private final FavoritoService favoritoService;

    public FavoritoController(FavoritoService favoritoService) {
        this.favoritoService = favoritoService;
    }

    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<ApiDtos.FavoriteResponse>> listarPorCliente(@PathVariable Integer clienteId) {
        return ResponseEntity.ok(favoritoService.listarPorCliente(clienteId));
    }

    @PostMapping
    public ResponseEntity<ApiDtos.FavoriteResponse> adicionar(@Valid @RequestBody ApiDtos.FavoriteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(favoritoService.adicionar(request));
    }

    @DeleteMapping("/cliente/{clienteId}/livro/{livroId}")
    public ResponseEntity<ApiDtos.DeleteResponse> remover(@PathVariable Integer clienteId, @PathVariable Integer livroId) {
        return ResponseEntity.ok(favoritoService.remover(clienteId, livroId));
    }
}
