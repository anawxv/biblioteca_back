package com.biblioteca.api.controller;

import com.biblioteca.api.dto.ApiDtos;
import com.biblioteca.api.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public ResponseEntity<ApiDtos.DashboardResponse> dashboard() {
        return ResponseEntity.ok(dashboardService.carregarDashboard());
    }

    @GetMapping("/livros-mais-emprestados")
    public ResponseEntity<List<ApiDtos.BookResponse>> livrosMaisEmprestados() {
        return ResponseEntity.ok(dashboardService.listarLivrosMaisEmprestados());
    }

    @GetMapping("/livros-recentes")
    public ResponseEntity<List<ApiDtos.BookResponse>> livrosRecentes() {
        return ResponseEntity.ok(dashboardService.listarLivrosRecentes());
    }

    @GetMapping("/generos-mais-consumidos")
    public ResponseEntity<List<ApiDtos.ChartPointResponse>> generosMaisConsumidos() {
        return ResponseEntity.ok(dashboardService.listarGenerosMaisConsumidos());
    }
}
