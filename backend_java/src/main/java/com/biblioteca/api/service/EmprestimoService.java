package com.biblioteca.api.service;

import com.biblioteca.api.dto.ApiDtos;
import com.biblioteca.api.exception.BusinessException;
import com.biblioteca.api.exception.NotFoundException;
import com.biblioteca.api.model.Cliente;
import com.biblioteca.api.model.Emprestimo;
import com.biblioteca.api.model.Funcionario;
import com.biblioteca.api.model.Livro;
import com.biblioteca.api.model.Multa;
import com.biblioteca.api.model.StatusEmprestimo;
import com.biblioteca.api.model.Usuario;
import com.biblioteca.api.repository.ClienteRepository;
import com.biblioteca.api.repository.EmprestimoRepository;
import com.biblioteca.api.repository.FuncionarioRepository;
import com.biblioteca.api.repository.LivroRepository;
import com.biblioteca.api.repository.MultaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class EmprestimoService {

    private static final int DEFAULT_PRAZO_DIAS = 15;
    private static final BigDecimal MULTA_DIARIA = new BigDecimal("2.50");

    private final ClienteRepository clienteRepository;
    private final FuncionarioRepository funcionarioRepository;
    private final LivroRepository livroRepository;
    private final EmprestimoRepository emprestimoRepository;
    private final MultaRepository multaRepository;
    private final LivroService livroService;
    private final AuthService authService;

    public EmprestimoService(
            ClienteRepository clienteRepository,
            FuncionarioRepository funcionarioRepository,
            LivroRepository livroRepository,
            EmprestimoRepository emprestimoRepository,
            MultaRepository multaRepository,
            LivroService livroService,
            AuthService authService
    ) {
        this.clienteRepository = clienteRepository;
        this.funcionarioRepository = funcionarioRepository;
        this.livroRepository = livroRepository;
        this.emprestimoRepository = emprestimoRepository;
        this.multaRepository = multaRepository;
        this.livroService = livroService;
        this.authService = authService;
    }

    @Transactional
    public ApiDtos.LoanItemResponse registrarEmprestimo(ApiDtos.LoanRequest request) {
        Cliente cliente = clienteRepository.findDetailedById(request.clienteId())
                .orElseThrow(() -> new NotFoundException("Cliente nao encontrado."));

        Livro livro = livroRepository.findActiveDetailedById(request.livroId())
                .orElseThrow(() -> new NotFoundException("Livro nao encontrado."));

        Funcionario funcionario = null;
        if (request.funcionarioId() != null) {
            funcionario = funcionarioRepository.findDetailedById(request.funcionarioId())
                    .orElseThrow(() -> new NotFoundException("Funcionario nao encontrado."));
        }

        validateCliente(cliente);
        validateLivro(livro);

        long openLoans = emprestimoRepository.countOpenLoansByClientId(cliente.getIdCliente(), StatusEmprestimo.CANCELADO);
        if (openLoans >= cliente.getLimiteEmprestimos()) {
            throw new BusinessException("Cliente atingiu o limite de emprestimos.");
        }

        Emprestimo emprestimo = new Emprestimo();
        emprestimo.setCliente(cliente);
        emprestimo.setLivro(livro);
        emprestimo.setFuncionario(funcionario);
        emprestimo.setDataEmprestimo(LocalDate.now());
        emprestimo.setDataPrevistaDevolucao(LocalDate.now().plusDays(request.prazoDias() == null ? DEFAULT_PRAZO_DIAS : request.prazoDias()));
        emprestimo.setStatus(StatusEmprestimo.ATIVO);
        emprestimo.setObservacao(request.observacao());

        livro.setQuantidadeDisponivel(livro.getQuantidadeDisponivel() - 1);
        emprestimoRepository.save(emprestimo);
        livroRepository.save(livro);

        return toLoanItemResponse(emprestimo);
    }

    public ApiDtos.LoanListResponse listarPorCliente(Integer clienteId) {
        clienteRepository.findDetailedById(clienteId)
                .orElseThrow(() -> new NotFoundException("Cliente nao encontrado."));

        List<ApiDtos.LoanItemResponse> loans = emprestimoRepository.findDetailedByClientId(clienteId)
                .stream()
                .map(this::toLoanItemResponse)
                .toList();

        List<ApiDtos.LoanItemResponse> ativos = loans.stream()
                .filter(item -> item.returnedAt() == null)
                .toList();

        List<ApiDtos.LoanItemResponse> historico = loans.stream()
                .filter(item -> item.returnedAt() != null)
                .toList();

        return new ApiDtos.LoanListResponse(ativos, historico);
    }

    @Transactional
    public ApiDtos.ReturnResponse registrarDevolucao(Integer emprestimoId) {
        Emprestimo emprestimo = emprestimoRepository.findDetailedById(emprestimoId)
                .orElseThrow(() -> new NotFoundException("Emprestimo nao encontrado."));

        if (emprestimo.getDataDevolucao() != null) {
            throw new BusinessException("Este emprestimo ja foi finalizado.");
        }

        LocalDate today = LocalDate.now();
        boolean late = today.isAfter(emprestimo.getDataPrevistaDevolucao());
        BigDecimal fineAmount = BigDecimal.ZERO;

        emprestimo.setDataDevolucao(today);
        emprestimo.setStatus(StatusEmprestimo.DEVOLVIDO);

        Livro livro = emprestimo.getLivro();
        int currentAvailable = livro.getQuantidadeDisponivel() == null ? 0 : livro.getQuantidadeDisponivel();
        int maxTotal = livro.getQuantidadeTotal() == null ? currentAvailable + 1 : livro.getQuantidadeTotal();
        livro.setQuantidadeDisponivel(Math.min(maxTotal, currentAvailable + 1));

        if (late) {
            long daysLate = ChronoUnit.DAYS.between(emprestimo.getDataPrevistaDevolucao(), today);
            fineAmount = MULTA_DIARIA.multiply(BigDecimal.valueOf(daysLate)).setScale(2, RoundingMode.HALF_UP);

            Multa multa = multaRepository.findByEmprestimo_IdEmprestimo(emprestimoId)
                    .orElseGet(Multa::new);
            multa.setEmprestimo(emprestimo);
            multa.setPaga(false);
            multa.setValor(fineAmount);
            multa.setMotivo("Atraso na devolucao do livro.");
            multaRepository.save(multa);
        }

        emprestimoRepository.save(emprestimo);
        livroRepository.save(livro);

        ApiDtos.LoanItemResponse item = toLoanItemResponse(emprestimo);
        return new ApiDtos.ReturnResponse(
                item.id(),
                item.client(),
                item.book(),
                item.funcionarioId(),
                item.borrowedAt(),
                item.dueDate(),
                item.returnedAt(),
                item.status(),
                item.observacao(),
                late,
                fineAmount
        );
    }

    ApiDtos.LoanItemResponse toLoanItemResponse(Emprestimo emprestimo) {
        Usuario usuarioCliente = emprestimo.getCliente().getUsuario();
        ApiDtos.UserSummary client = authService.toUserSummary(usuarioCliente);
        ApiDtos.BookResponse book = livroService.toBookResponse(emprestimo.getLivro(), 0L);

        Integer funcionarioId = emprestimo.getFuncionario() != null ? emprestimo.getFuncionario().getIdFuncionario() : null;

        return new ApiDtos.LoanItemResponse(
                emprestimo.getIdEmprestimo(),
                client,
                book,
                funcionarioId,
                emprestimo.getDataEmprestimo(),
                emprestimo.getDataPrevistaDevolucao(),
                emprestimo.getDataDevolucao(),
                resolveVisualStatus(emprestimo),
                emprestimo.getObservacao()
        );
    }

    private void validateCliente(Cliente cliente) {
        Usuario usuario = cliente.getUsuario();
        if (!Boolean.TRUE.equals(usuario.getAtivo())) {
            throw new BusinessException("Cliente inativo.");
        }
        if (Boolean.TRUE.equals(usuario.getBloqueado())) {
            throw new BusinessException("Cliente bloqueado.");
        }

        BigDecimal pendingFines = multaRepository.sumPendingFinesByClientId(cliente.getIdCliente());
        if (pendingFines.compareTo(BigDecimal.ZERO) > 0) {
            throw new BusinessException("Cliente possui multa pendente.");
        }
    }

    private void validateLivro(Livro livro) {
        if (!Boolean.TRUE.equals(livro.getAtivo())) {
            throw new BusinessException("Livro inativo.");
        }
        if (livro.getQuantidadeDisponivel() == null || livro.getQuantidadeDisponivel() <= 0) {
            throw new BusinessException("Livro indisponivel.");
        }
    }

    private String resolveVisualStatus(Emprestimo emprestimo) {
        LocalDate baseDate = emprestimo.getDataDevolucao() != null ? emprestimo.getDataDevolucao() : LocalDate.now();
        long diffDays = ChronoUnit.DAYS.between(baseDate, emprestimo.getDataPrevistaDevolucao());

        if (diffDays < 0) {
            return "Atrasado";
        }
        if (diffDays <= 2) {
            return "Devolucao breve";
        }
        return "Dentro do prazo";
    }
}
