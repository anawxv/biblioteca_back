package com.biblioteca.api.controller;

import com.biblioteca.api.dto.ApiDtos;
import com.biblioteca.api.service.MultaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/multas")
public class MultaController {

    private final MultaService multaService;

    public MultaController(MultaService multaService) {
        this.multaService = multaService;
    }

    @GetMapping("/pendentes")
    public ResponseEntity<List<ApiDtos.FineResponse>> listarPendentes() {
        return ResponseEntity.ok(multaService.listarPendentes());
    }
}
