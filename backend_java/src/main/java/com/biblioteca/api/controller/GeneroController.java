package com.biblioteca.api.controller;

import com.biblioteca.api.repository.GeneroRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/generos")
public class GeneroController {

    private final GeneroRepository generoRepository;

    public GeneroController(GeneroRepository generoRepository) {
        this.generoRepository = generoRepository;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listar() {
        return ResponseEntity.ok(generoRepository.findByAtivoTrueOrderByNomeAsc()
                .stream()
                .map(genero -> Map.<String, Object>of(
                        "id", genero.getIdGenero(),
                        "name", genero.getNome(),
                        "nome", genero.getNome()
                ))
                .toList());
    }
}
