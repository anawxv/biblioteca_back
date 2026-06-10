package com.biblioteca.api.service;

import com.biblioteca.api.dto.ApiDtos;
import com.biblioteca.api.exception.BusinessException;
import com.biblioteca.api.model.Usuario;
import com.biblioteca.api.repository.MultaRepository;
import com.biblioteca.api.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final MultaRepository multaRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            UsuarioRepository usuarioRepository,
            MultaRepository multaRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.usuarioRepository = usuarioRepository;
        this.multaRepository = multaRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public ApiDtos.AuthResponse login(ApiDtos.LoginRequest request) {
        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new BusinessException("E-mail ou senha invalidos."));

        if (!Boolean.TRUE.equals(usuario.getAtivo())) {
            throw new BusinessException("Usuario inativo.");
        }

        if (!senhaValida(usuario.getSenhaHash(), request.senha())) {
            throw new BusinessException("E-mail ou senha invalidos.");
        }

        if (!isBcryptHash(usuario.getSenhaHash())) {
            usuario.setSenhaHash(passwordEncoder.encode(request.senha()));
            usuarioRepository.save(usuario);
        }

        return new ApiDtos.AuthResponse(
                usuario.getIdUsuario(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getTipoUsuario().name()
        );
    }

    private boolean isBcryptHash(String senhaHash) {
        return senhaHash != null
                && (senhaHash.startsWith("$2a$")
                || senhaHash.startsWith("$2b$")
                || senhaHash.startsWith("$2y$"));
    }

    private boolean senhaValida(String senhaHash, String senhaInformada) {
        if (isBcryptHash(senhaHash)) {
            return passwordEncoder.matches(senhaInformada, senhaHash);
        }
        return senhaHash != null && senhaHash.equals(senhaInformada);
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
