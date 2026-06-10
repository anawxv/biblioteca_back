package com.biblioteca.api.service;

import com.biblioteca.api.dto.ApiDtos;
import com.biblioteca.api.repository.MultaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MultaService {

    private final MultaRepository multaRepository;
    private final EmprestimoService emprestimoService;

    public MultaService(MultaRepository multaRepository, EmprestimoService emprestimoService) {
        this.multaRepository = multaRepository;
        this.emprestimoService = emprestimoService;
    }

    public List<ApiDtos.FineResponse> listarPendentes() {
        return multaRepository.findByPagaFalseOrderByCriadaEmDesc()
                .stream()
                .map(multa -> new ApiDtos.FineResponse(
                        multa.getIdMulta(),
                        multa.getValor(),
                        multa.getPaga(),
                        multa.getMotivo(),
                        multa.getCriadaEm(),
                        emprestimoService.toLoanItemResponse(multa.getEmprestimo())
                ))
                .toList();
    }
}
