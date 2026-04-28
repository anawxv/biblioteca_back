package com.biblioteca.api.controller;

import com.biblioteca.api.dto.ApiDtos;
import com.biblioteca.api.service.EmprestimoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/emprestimos")
public class EmprestimoController {

    private final EmprestimoService emprestimoService;

    public EmprestimoController(EmprestimoService emprestimoService) {
        this.emprestimoService = emprestimoService;
    }

    @PostMapping
    public ResponseEntity<ApiDtos.LoanItemResponse> solicitar(@Valid @RequestBody ApiDtos.LoanRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(emprestimoService.registrarEmprestimo(request));
    }

    @GetMapping("/cliente/{id}")
    public ResponseEntity<ApiDtos.LoanListResponse> listarPorCliente(@PathVariable Integer id) {
        return ResponseEntity.ok(emprestimoService.listarPorCliente(id));
    }

    @PostMapping("/{id}/devolver")
    public ResponseEntity<ApiDtos.ReturnResponse> devolver(@PathVariable Integer id) {
        return ResponseEntity.ok(emprestimoService.registrarDevolucao(id));
    }
}
