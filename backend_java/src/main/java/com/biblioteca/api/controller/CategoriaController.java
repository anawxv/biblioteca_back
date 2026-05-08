package com.biblioteca.api.controller;

import com.biblioteca.api.service.CategoriaService;
import com.biblioteca.api.repository.SubgeneroRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/categorias")
public class CategoriaController {

    private final CategoriaService categoriaService;
    private final SubgeneroRepository subgeneroRepository;

    public CategoriaController(CategoriaService categoriaService, SubgeneroRepository subgeneroRepository) {
        this.categoriaService = categoriaService;
        this.subgeneroRepository = subgeneroRepository;
    }

    @GetMapping
    public ResponseEntity<List<String>> listar() {
        return ResponseEntity.ok(categoriaService.listarCategorias());
    }

    @GetMapping("/{id}/subgeneros")
    public ResponseEntity<List<Map<String, Object>>> listarSubgeneros(@PathVariable Integer id) {
        return ResponseEntity.ok(subgeneroRepository.findByCategoriaIdCategoriaAndAtivoTrueOrderByNomeAsc(id)
                .stream()
                .map(subgenero -> Map.<String, Object>of(
                        "id", subgenero.getIdSubgenero(),
                        "name", subgenero.getNome(),
                        "nome", subgenero.getNome()
                ))
                .toList());
    }
}
