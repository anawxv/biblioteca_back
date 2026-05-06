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

    public UsuarioService(
            UsuarioRepository usuarioRepository,
            ClienteRepository clienteRepository,
            FuncionarioRepository funcionarioRepository
    ) {
        this.usuarioRepository = usuarioRepository;
        this.clienteRepository = clienteRepository;
        this.funcionarioRepository = funcionarioRepository;
    }

    @Transactional
    public ApiDtos.RegisterResponse cadastrar(ApiDtos.CreateUserRequest request) {
        TipoUsuario tipoUsuario = TipoUsuario.fromInput(request.role());
        String email = request.email().trim().toLowerCase();

        if (usuarioRepository.existsByEmailIgnoreCase(email)) {
            throw new BusinessException("Este e-mail ja esta cadastrado.");
        }

        Usuario usuario = new Usuario();
        usuario.setNome(request.name().trim());
        usuario.setEmail(email);
        usuario.setSenhaHash(request.password());
        usuario.setTelefone(request.phone().trim());
        usuario.setTipoUsuario(tipoUsuario);
        usuario.setAtivo(true);
        usuario.setBloqueado(false);

        Usuario usuarioSalvo = usuarioRepository.saveAndFlush(usuario);

        if (tipoUsuario == TipoUsuario.CLIENTE) {
            Cliente cliente = new Cliente();
            cliente.setIdCliente(usuarioSalvo.getIdUsuario());
            cliente.setUsuario(usuarioSalvo);
            cliente.setLimiteEmprestimos(3);
            clienteRepository.saveAndFlush(cliente);
        } else {
            Funcionario funcionario = new Funcionario();
            funcionario.setIdFuncionario(usuarioSalvo.getIdUsuario());
            funcionario.setUsuario(usuarioSalvo);
            funcionario.setCargo("BIBLIOTECARIO");
            funcionario.setAdministrador(false);
            funcionarioRepository.saveAndFlush(funcionario);
        }

        return new ApiDtos.RegisterResponse(
                "Usuario cadastrado com sucesso.",
                usuarioSalvo.getIdUsuario(),
                usuarioSalvo.getNome(),
                usuarioSalvo.getEmail(),
                usuarioSalvo.getTipoUsuario().name()
        );
    }
}
