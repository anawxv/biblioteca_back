package com.biblioteca.api.controller;

import com.biblioteca.api.dto.ApiDtos;
import com.biblioteca.api.service.LivroService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/livros")
public class LivroController {

    private final LivroService livroService;

    public LivroController(LivroService livroService) {
        this.livroService = livroService;
    }

    @GetMapping
    public ResponseEntity<List<ApiDtos.BookResponse>> listar(@RequestParam(value = "busca", required = false) String busca) {
        return ResponseEntity.ok(livroService.listarLivros(busca));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiDtos.BookResponse> detalhar(@PathVariable Integer id) {
        return ResponseEntity.ok(livroService.detalharLivro(id));
    }

    @PostMapping
    public ResponseEntity<ApiDtos.BookResponse> adicionar(@Valid @RequestBody ApiDtos.BookRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(livroService.adicionarLivro(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiDtos.DeleteResponse> excluir(@PathVariable Integer id) {
        return ResponseEntity.ok(livroService.excluirLivro(id));
    }
}
