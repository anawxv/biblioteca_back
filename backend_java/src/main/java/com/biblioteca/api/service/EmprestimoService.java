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
import com.biblioteca.api.model.StatusReserva;
import com.biblioteca.api.model.Usuario;
import com.biblioteca.api.repository.ClienteRepository;
import com.biblioteca.api.repository.EmprestimoRepository;
import com.biblioteca.api.repository.FuncionarioRepository;
import com.biblioteca.api.repository.LivroRepository;
import com.biblioteca.api.repository.MultaRepository;
import com.biblioteca.api.repository.ReservaRepository;
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
    private final ReservaRepository reservaRepository;
    private final LivroService livroService;
    private final AuthService authService;

    public EmprestimoService(
            ClienteRepository clienteRepository,
            FuncionarioRepository funcionarioRepository,
            LivroRepository livroRepository,
            EmprestimoRepository emprestimoRepository,
            MultaRepository multaRepository,
            ReservaRepository reservaRepository,
            LivroService livroService,
            AuthService authService
    ) {
        this.clienteRepository = clienteRepository;
        this.funcionarioRepository = funcionarioRepository;
        this.livroRepository = livroRepository;
        this.emprestimoRepository = emprestimoRepository;
        this.multaRepository = multaRepository;
        this.reservaRepository = reservaRepository;
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

        // Lógica de Reserva para múltiplas unidades
        long totalReservasAtivas = reservaRepository.countByLivro_IdLivroAndStatus(
                livro.getIdLivro(), StatusReserva.ATIVA);

        boolean clienteAtualTemReserva = reservaRepository.existsByCliente_IdClienteAndLivro_IdLivroAndStatus(
                cliente.getIdCliente(), livro.getIdLivro(), StatusReserva.ATIVA);

        if (!clienteAtualTemReserva && livro.getQuantidadeDisponivel() <= totalReservasAtivas) {
            throw new BusinessException("Todas as unidades disponiveis deste livro estao reservadas para outros usuarios.");
        }
        
        long openLoans = emprestimoRepository.countOpenLoansByClientId(cliente.getIdCliente(), StatusEmprestimo.CANCELADO);
        if (openLoans >= cliente.getLimiteEmprestimos()) {
            throw new BusinessException("Cliente atingiu o limite de emprestimos.");
        }

        Emprestimo emprestimo = new Emprestimo();
        emprestimo.setCliente(cliente);
        emprestimo.setLivro(livro);
        emprestimo.setFuncionario(funcionario);
        emprestimo.setDataEmprestimo(LocalDate.now());
        emprestimo.setDataPrevistaDevolucao(LocalDate.now().plusDays(DEFAULT_PRAZO_DIAS));
        emprestimo.setStatus(StatusEmprestimo.ATIVO);
        emprestimo.setObservacao(request.observacao());

        livro.setQuantidadeDisponivel(livro.getQuantidadeDisponivel() - 1);
        
        emprestimoRepository.save(emprestimo);
        livroRepository.save(livro);

        return toLoanItemResponse(emprestimo);
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
        livro.setQuantidadeDisponivel(currentAvailable + 1);

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

        return toReturnResponse(emprestimo, late, fineAmount);
    }

    public ApiDtos.LoanListResponse listarPorCliente(Integer clienteId) {
        clienteRepository.findDetailedById(clienteId)
                .orElseThrow(() -> new NotFoundException("Cliente nao encontrado."));

        List<ApiDtos.LoanItemResponse> loans = emprestimoRepository.findDetailedByClientId(clienteId)
                .stream()
                .map(this::toLoanItemResponse)
                .toList();

        List<ApiDtos.LoanItemResponse> ativos = loans.stream().filter(i -> i.returnedAt() == null).toList();
        List<ApiDtos.LoanItemResponse> historico = loans.stream().filter(i -> i.returnedAt() != null).toList();

        return new ApiDtos.LoanListResponse(ativos, historico);
    }

    private void validateCliente(Cliente cliente) {
        Usuario usuario = cliente.getUsuario();
        if (!Boolean.TRUE.equals(usuario.getAtivo())) throw new BusinessException("Cliente inativo.");
        if (Boolean.TRUE.equals(usuario.getBloqueado())) throw new BusinessException("Cliente bloqueado.");

        BigDecimal pendingFines = multaRepository.sumPendingFinesByClientId(cliente.getIdCliente());
        if (pendingFines != null && pendingFines.compareTo(BigDecimal.ZERO) > 0) {
            throw new BusinessException("Cliente possui multa pendente.");
        }
    }

    private void validateLivro(Livro livro) {
        if (!Boolean.TRUE.equals(livro.getAtivo())) throw new BusinessException("Livro inativo.");
        if (livro.getQuantidadeDisponivel() == null || livro.getQuantidadeDisponivel() <= 0) {
            throw new BusinessException("Livro indisponivel no estoque.");
        }
    }

    ApiDtos.LoanItemResponse toLoanItemResponse(Emprestimo emprestimo) {
        ApiDtos.UserSummary client = authService.toUserSummary(emprestimo.getCliente().getUsuario());
        ApiDtos.BookResponse book = livroService.toBookResponse(emprestimo.getLivro(), 0L);
        Integer funcId = emprestimo.getFuncionario() != null ? emprestimo.getFuncionario().getIdFuncionario() : null;

        return new ApiDtos.LoanItemResponse(
                emprestimo.getIdEmprestimo(), client, book, funcId,
                emprestimo.getDataEmprestimo(), emprestimo.getDataPrevistaDevolucao(),
                emprestimo.getDataDevolucao(), resolveVisualStatus(emprestimo), emprestimo.getObservacao()
        );
    }

    private ApiDtos.ReturnResponse toReturnResponse(Emprestimo e, boolean late, BigDecimal fine) {
        ApiDtos.LoanItemResponse item = toLoanItemResponse(e);
        return new ApiDtos.ReturnResponse(
                late ? "Devolucao com multa." : "Sucesso.",
                item.id(), item.client(), item.book(), item.funcionarioId(),
                item.borrowedAt(), item.dueDate(), item.returnedAt(),
                item.status(), item.observacao(), late, fine
        );
    }

    private String resolveVisualStatus(Emprestimo emprestimo) {
        LocalDate baseDate = emprestimo.getDataDevolucao() != null ? emprestimo.getDataDevolucao() : LocalDate.now();
        long diff = ChronoUnit.DAYS.between(baseDate, emprestimo.getDataPrevistaDevolucao());
        if (diff < 0) return "Atrasado";
        if (diff <= 2) return "Devolucao breve";
        return "No prazo";
    }
}