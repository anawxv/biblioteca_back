package com.biblioteca.api.service;

import com.biblioteca.api.repository.CategoriaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;

    public CategoriaService(CategoriaRepository categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    public List<String> listarCategorias() {
        return categoriaRepository.findByAtivoTrueOrderByNomeAsc()
                .stream()
                .map(categoria -> categoria.getNome())
                .toList();
    }
}
