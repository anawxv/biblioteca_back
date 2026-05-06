package com.biblioteca.api.controller;

import com.biblioteca.api.dto.ApiDtos;
import com.biblioteca.api.service.ReservaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reservas")
public class ReservaController {

    private final ReservaService reservaService;

    public ReservaController(ReservaService reservaService) {
        this.reservaService = reservaService;
    }

    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<ApiDtos.ReservationResponse>> listarPorCliente(@PathVariable Integer clienteId) {
        return ResponseEntity.ok(reservaService.listarPorCliente(clienteId));
    }

    @PostMapping
    public ResponseEntity<ApiDtos.ReservationResponse> reservar(@Valid @RequestBody ApiDtos.ReservationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reservaService.reservar(request));
    }

    @PatchMapping("/{id}/cancelar")
    public ResponseEntity<ApiDtos.ReservationResponse> cancelar(@PathVariable Integer id) {
        return ResponseEntity.ok(reservaService.cancelar(id));
    }
}
