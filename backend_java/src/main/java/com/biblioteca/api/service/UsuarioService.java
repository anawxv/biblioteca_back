package com.biblioteca.api.service;

import com.biblioteca.api.dto.ApiDtos;
import com.biblioteca.api.exception.BusinessException;
import com.biblioteca.api.model.Cliente;
import com.biblioteca.api.model.CodigoFuncionario;
import com.biblioteca.api.model.Funcionario;
import com.biblioteca.api.model.TipoUsuario;
import com.biblioteca.api.model.Usuario;
import com.biblioteca.api.repository.ClienteRepository;
import com.biblioteca.api.repository.CodigoFuncionarioRepository;
import com.biblioteca.api.repository.FuncionarioRepository;
import com.biblioteca.api.repository.UsuarioRepository;
import jakarta.persistence.EntityManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final ClienteRepository clienteRepository;
    private final FuncionarioRepository funcionarioRepository;
    private final CodigoFuncionarioRepository codigoFuncionarioRepository;
    private final EntityManager entityManager;
    private final AuthService authService;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(
            UsuarioRepository usuarioRepository,
            ClienteRepository clienteRepository,
            FuncionarioRepository funcionarioRepository,
            CodigoFuncionarioRepository codigoFuncionarioRepository,
            EntityManager entityManager,
            AuthService authService,
            PasswordEncoder passwordEncoder
    ) {
        this.usuarioRepository = usuarioRepository;
        this.clienteRepository = clienteRepository;
        this.funcionarioRepository = funcionarioRepository;
        this.codigoFuncionarioRepository = codigoFuncionarioRepository;
        this.entityManager = entityManager;
        this.authService = authService;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public ApiDtos.RegisterResponse cadastrar(ApiDtos.CreateUserRequest request) {
        TipoUsuario tipoUsuario = TipoUsuario.fromInput(request.role());
        String email = request.email().trim().toLowerCase();
        CodigoFuncionario codigoFuncionario = null;

        if (usuarioRepository.existsByEmailIgnoreCase(email)) {
            throw new BusinessException("Este e-mail ja esta cadastrado.");
        }

        if (tipoUsuario == TipoUsuario.FUNCIONARIO) {
            codigoFuncionario = validarCodigoFuncionario(request.codigoAutorizacao());
        }

        Usuario usuario = new Usuario();
        usuario.setNome(request.name().trim());
        usuario.setEmail(email);
        usuario.setSenhaHash(passwordEncoder.encode(request.password()));
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
            entityManager.persist(cliente);
            entityManager.flush();
        } else {
            Funcionario funcionario = new Funcionario();
            funcionario.setIdFuncionario(usuarioSalvo.getIdUsuario());
            funcionario.setUsuario(usuarioSalvo);
            funcionario.setCargo("BIBLIOTECARIO");
            funcionario.setAdministrador(false);
            entityManager.persist(funcionario);
            codigoFuncionario.setUsado(true);
            codigoFuncionario.setUsadoEm(java.time.LocalDateTime.now());
            codigoFuncionarioRepository.save(codigoFuncionario);
            entityManager.flush();
        }

        return new ApiDtos.RegisterResponse(
                "Usuario cadastrado com sucesso.",
                usuarioSalvo.getIdUsuario(),
                usuarioSalvo.getNome(),
                usuarioSalvo.getEmail(),
                usuarioSalvo.getTipoUsuario().name()
        );
    }

    private CodigoFuncionario validarCodigoFuncionario(String codigo) {
        if (codigo == null || codigo.trim().isEmpty()) {
            throw new BusinessException("Codigo de autorizacao e obrigatorio para cadastro de funcionario.");
        }

        CodigoFuncionario codigoFuncionario = codigoFuncionarioRepository.findByCodigoIgnoreCase(codigo.trim())
                .orElseThrow(() -> new BusinessException("Codigo de autorizacao inexistente."));

        if (!Boolean.TRUE.equals(codigoFuncionario.getAtivo())) {
            throw new BusinessException("Codigo de autorizacao inativo.");
        }
        if (Boolean.TRUE.equals(codigoFuncionario.getUsado())) {
            throw new BusinessException("Codigo de autorizacao ja usado.");
        }

        return codigoFuncionario;
    }

    public List<ApiDtos.UserSummary> listarClientes(String busca) {
        String search = busca == null || busca.trim().isEmpty() ? null : busca.trim();
        List<Cliente> clientes = search == null
                ? clienteRepository.findActiveDetailed()
                : clienteRepository.findActiveDetailedBySearch(search);
        return clientes
                .stream()
                .map(Cliente::getUsuario)
                .map(authService::toUserSummary)
                .toList();
    }

    public List<ApiDtos.UserSummary> listarFuncionarios(String busca) {
        String search = busca == null || busca.trim().isEmpty() ? null : busca.trim();
        List<Funcionario> funcionarios = search == null
                ? funcionarioRepository.findActiveDetailed()
                : funcionarioRepository.findActiveDetailedBySearch(search);
        return funcionarios
                .stream()
                .map(Funcionario::getUsuario)
                .map(authService::toUserSummary)
                .toList();
    }
}
