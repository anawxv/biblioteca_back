package com.biblioteca.api.service;

import com.biblioteca.api.dto.ApiDtos;
import com.biblioteca.api.exception.BusinessException;
import com.biblioteca.api.model.Usuario;
import com.biblioteca.api.repository.MultaRepository;
import com.biblioteca.api.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final MultaRepository multaRepository;

    public AuthService(UsuarioRepository usuarioRepository, MultaRepository multaRepository) {
        this.usuarioRepository = usuarioRepository;
        this.multaRepository = multaRepository;
    }

    public ApiDtos.AuthResponse login(ApiDtos.LoginRequest request) {
        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new BusinessException("E-mail ou senha invalidos."));

        if (!Boolean.TRUE.equals(usuario.getAtivo())) {
            throw new BusinessException("Usuario inativo.");
        }

        if (!usuario.getSenhaHash().equals(request.senha())) {
            throw new BusinessException("E-mail ou senha invalidos.");
        }

        return new ApiDtos.AuthResponse(
                "mock-session-" + usuario.getIdUsuario(),
                toUserSummary(usuario)
        );
    }

    ApiDtos.UserSummary toUserSummary(Usuario usuario) {
        BigDecimal pendingFine = usuario.getTipoUsuario().name().equals("CLIENTE")
                ? multaRepository.sumPendingFinesByClientId(usuario.getIdUsuario())
                : BigDecimal.ZERO;

        return new ApiDtos.UserSummary(
                usuario.getIdUsuario(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getTelefone(),
                usuario.getTipoUsuario().toApiValue(),
                usuario.getAtivo(),
                usuario.getBloqueado(),
                pendingFine
        );
    }
}
