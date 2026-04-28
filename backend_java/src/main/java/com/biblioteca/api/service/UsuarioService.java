package com.biblioteca.api.service;

import com.biblioteca.api.dto.ApiDtos;
import com.biblioteca.api.exception.BusinessException;
import com.biblioteca.api.model.Cliente;
import com.biblioteca.api.model.Funcionario;
import com.biblioteca.api.model.TipoUsuario;
import com.biblioteca.api.model.Usuario;
import com.biblioteca.api.repository.ClienteRepository;
import com.biblioteca.api.repository.FuncionarioRepository;
import com.biblioteca.api.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final ClienteRepository clienteRepository;
    private final FuncionarioRepository funcionarioRepository;
    private final AuthService authService;

    public UsuarioService(
            UsuarioRepository usuarioRepository,
            ClienteRepository clienteRepository,
            FuncionarioRepository funcionarioRepository,
            AuthService authService
    ) {
        this.usuarioRepository = usuarioRepository;
        this.clienteRepository = clienteRepository;
        this.funcionarioRepository = funcionarioRepository;
        this.authService = authService;
    }

    @Transactional
    public ApiDtos.RegisterResponse cadastrar(ApiDtos.CreateUserRequest request) {
        if (usuarioRepository.existsByEmailIgnoreCase(request.email())) {
            throw new BusinessException("Ja existe um usuario cadastrado com este e-mail.");
        }

        TipoUsuario tipoUsuario = TipoUsuario.fromInput(request.role());

        Usuario usuario = new Usuario();
        usuario.setNome(request.name().trim());
        usuario.setEmail(request.email().trim().toLowerCase());
        usuario.setSenhaHash(request.password());
        usuario.setTelefone(request.phone());
        usuario.setTipoUsuario(tipoUsuario);
        usuario.setAtivo(true);
        usuario.setBloqueado(false);

        Usuario usuarioSalvo = usuarioRepository.save(usuario);

        if (tipoUsuario == TipoUsuario.CLIENTE) {
            Cliente cliente = new Cliente();
            cliente.setUsuario(usuarioSalvo);
            cliente.setLimiteEmprestimos(3);
            clienteRepository.save(cliente);
        } else {
            Funcionario funcionario = new Funcionario();
            funcionario.setUsuario(usuarioSalvo);
            funcionario.setCargo("BIBLIOTECARIO");
            funcionario.setAdministrador(false);
            funcionarioRepository.save(funcionario);
        }

        return new ApiDtos.RegisterResponse(
                "Cadastro realizado com sucesso.",
                authService.toUserSummary(usuarioSalvo)
        );
    }
}
