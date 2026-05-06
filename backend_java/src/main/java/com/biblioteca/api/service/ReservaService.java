package com.biblioteca.api.service;

import com.biblioteca.api.dto.ApiDtos;
import com.biblioteca.api.exception.BusinessException;
import com.biblioteca.api.exception.NotFoundException;
import com.biblioteca.api.model.Cliente;
import com.biblioteca.api.model.Livro;
import com.biblioteca.api.model.Reserva;
import com.biblioteca.api.model.StatusReserva;
import com.biblioteca.api.repository.ClienteRepository;
import com.biblioteca.api.repository.LivroRepository;
import com.biblioteca.api.repository.ReservaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ReservaService {

    private final ReservaRepository reservaRepository;
    private final ClienteRepository clienteRepository;
    private final LivroRepository livroRepository;
    private final AuthService authService;
    private final LivroService livroService;

    public ReservaService(
            ReservaRepository reservaRepository,
            ClienteRepository clienteRepository,
            LivroRepository livroRepository,
            AuthService authService,
            LivroService livroService
    ) {
        this.reservaRepository = reservaRepository;
        this.clienteRepository = clienteRepository;
        this.livroRepository = livroRepository;
        this.authService = authService;
        this.livroService = livroService;
    }

    public List<ApiDtos.ReservationResponse> listarPorCliente(Integer clienteId) {
        clienteRepository.findDetailedById(clienteId)
                .orElseThrow(() -> new NotFoundException("Cliente nao encontrado."));

        return reservaRepository.findDetailedByClientId(clienteId)
                .stream()
                .map(this::toReservationResponse)
                .toList();
    }

    @Transactional
    public ApiDtos.ReservationResponse reservar(ApiDtos.ReservationRequest request) {
        Cliente cliente = clienteRepository.findDetailedById(request.clienteId())
                .orElseThrow(() -> new NotFoundException("Cliente nao encontrado."));
        Livro livro = livroRepository.findActiveDetailedById(request.livroId())
                .orElseThrow(() -> new NotFoundException("Livro nao encontrado."));

        if (reservaRepository.existsByCliente_IdClienteAndLivro_IdLivroAndStatus(
                cliente.getIdCliente(), livro.getIdLivro(), StatusReserva.ATIVA)) {
            throw new BusinessException("Cliente ja possui reserva ativa para este livro.");
        }

        Reserva reserva = new Reserva();
        reserva.setCliente(cliente);
        reserva.setLivro(livro);
        reserva.setStatus(StatusReserva.ATIVA);

        return toReservationResponse(reservaRepository.save(reserva));
    }

    @Transactional
    public ApiDtos.ReservationResponse cancelar(Integer reservaId) {
        Reserva reserva = reservaRepository.findDetailedById(reservaId)
                .orElseThrow(() -> new NotFoundException("Reserva nao encontrada."));

        if (reserva.getStatus() != StatusReserva.ATIVA) {
            throw new BusinessException("Apenas reservas ativas podem ser canceladas.");
        }

        reserva.setStatus(StatusReserva.CANCELADA);
        return toReservationResponse(reservaRepository.save(reserva));
    }

    private ApiDtos.ReservationResponse toReservationResponse(Reserva reserva) {
        return new ApiDtos.ReservationResponse(
                reserva.getIdReserva(),
                authService.toUserSummary(reserva.getCliente().getUsuario()),
                livroService.toBookResponse(reserva.getLivro(), 0L),
                reserva.getDataReserva(),
                reserva.getStatus().name()
        );
    }
}
