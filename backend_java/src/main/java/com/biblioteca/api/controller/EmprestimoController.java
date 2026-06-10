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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/emprestimos")
public class EmprestimoController {

    private final EmprestimoService emprestimoService;

    public EmprestimoController(EmprestimoService emprestimoService) {
        this.emprestimoService = emprestimoService;
    }

    @PostMapping
    public ResponseEntity<ApiDtos.LoanItemResponse> solicitar(@Valid @RequestBody ApiDtos.LoanRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(emprestimoService.solicitarEmprestimo(request));
    }

    @PostMapping("/registrar")
    public ResponseEntity<ApiDtos.LoanItemResponse> registrar(@Valid @RequestBody ApiDtos.LoanRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(emprestimoService.registrarEmprestimo(request));
    }

    @PostMapping("/{id}/aprovar")
    public ResponseEntity<ApiDtos.LoanItemResponse> aprovar(
            @PathVariable Integer id,
            @RequestBody(required = false) ApiDtos.ApproveLoanRequest request
    ) {
        ApiDtos.ApproveLoanRequest payload = request != null ? request : new ApiDtos.ApproveLoanRequest(null, null);
        return ResponseEntity.ok(emprestimoService.aprovarEmprestimo(id, payload));
    }

    @PostMapping("/{id}/recusar")
    public ResponseEntity<ApiDtos.LoanItemResponse> recusar(
            @PathVariable Integer id,
            @RequestBody(required = false) ApiDtos.ApproveLoanRequest request
    ) {
        ApiDtos.ApproveLoanRequest payload = request != null ? request : new ApiDtos.ApproveLoanRequest(null, null);
        return ResponseEntity.ok(emprestimoService.recusarEmprestimo(id, payload));
    }

    @GetMapping("/pendentes")
    public ResponseEntity<List<ApiDtos.LoanItemResponse>> listarPendentes() {
        return ResponseEntity.ok(emprestimoService.listarPendentes());
    }

    @GetMapping("/cliente/{id}")
    public ResponseEntity<ApiDtos.LoanListResponse> listarPorCliente(@PathVariable Integer id) {
        return ResponseEntity.ok(emprestimoService.listarPorCliente(id));
    }

    @GetMapping("/ativos")
    public ResponseEntity<List<ApiDtos.LoanItemResponse>> listarAtivos(@RequestParam(value = "busca", required = false) String busca) {
        return ResponseEntity.ok(emprestimoService.listarAtivos(busca));
    }

    @GetMapping("/recentes")
    public ResponseEntity<List<ApiDtos.LoanItemResponse>> listarRecentes() {
        return ResponseEntity.ok(emprestimoService.listarRecentes());
    }

    @GetMapping("/atrasados")
    public ResponseEntity<List<ApiDtos.LoanItemResponse>> listarAtrasados(@RequestParam(value = "busca", required = false) String busca) {
        return ResponseEntity.ok(emprestimoService.listarAtrasados(busca));
    }

    @PostMapping("/{id}/devolver")
    public ResponseEntity<ApiDtos.ReturnResponse> devolver(@PathVariable Integer id) {
        return ResponseEntity.ok(emprestimoService.registrarDevolucao(id));
    }
}
