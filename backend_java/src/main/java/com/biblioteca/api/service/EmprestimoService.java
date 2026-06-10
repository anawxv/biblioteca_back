package com.biblioteca.api.service;

import com.biblioteca.api.dto.ApiDtos;
import com.biblioteca.api.exception.BusinessException;
import com.biblioteca.api.exception.NotFoundException;
import com.biblioteca.api.model.Cliente;
import com.biblioteca.api.model.Emprestimo;
import com.biblioteca.api.model.ExemplarLivro;
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

    private static final int DEFAULT_PRAZO_DIAS = 30;
    private static final BigDecimal MULTA_DIARIA = new BigDecimal("2.00");
    private static final List<StatusEmprestimo> EXCLUDED_OPEN_STATUSES = EmprestimoRepository.EXCLUDED_OPEN_STATUSES;

    private final ClienteRepository clienteRepository;
    private final FuncionarioRepository funcionarioRepository;
    private final LivroRepository livroRepository;
    private final EmprestimoRepository emprestimoRepository;
    private final MultaRepository multaRepository;
    private final ReservaRepository reservaRepository;
    private final LivroService livroService;
    private final AuthService authService;
    private final ExemplarLivroService exemplarLivroService;

    public EmprestimoService(
            ClienteRepository clienteRepository,
            FuncionarioRepository funcionarioRepository,
            LivroRepository livroRepository,
            EmprestimoRepository emprestimoRepository,
            MultaRepository multaRepository,
            ReservaRepository reservaRepository,
            LivroService livroService,
            AuthService authService,
            ExemplarLivroService exemplarLivroService
    ) {
        this.clienteRepository = clienteRepository;
        this.funcionarioRepository = funcionarioRepository;
        this.livroRepository = livroRepository;
        this.emprestimoRepository = emprestimoRepository;
        this.multaRepository = multaRepository;
        this.reservaRepository = reservaRepository;
        this.livroService = livroService;
        this.authService = authService;
        this.exemplarLivroService = exemplarLivroService;
    }

    @Transactional
<<<<<<< HEAD
    public ApiDtos.LoanItemResponse solicitarEmprestimo(ApiDtos.LoanRequest request) {
=======
    public ApiDtos.LoanItemResponse registrarEmprestimo(ApiDtos.LoanRequest request) {
        
>>>>>>> f1c942b357e26ea8407126567397b833e9cf7c6f
        Cliente cliente = clienteRepository.findDetailedById(request.clienteId())
                .orElseThrow(() -> new NotFoundException("Cliente nao encontrado."));

        Livro livro = livroRepository.findActiveDetailedById(request.livroId())
                .orElseThrow(() -> new NotFoundException("Livro nao encontrado."));

        validateCliente(cliente);
        validateLivro(livro);
        ensureLoanLimit(cliente);

<<<<<<< HEAD
        emprestimoRepository.findByClientIdAndLivroIdAndStatus(
                cliente.getIdCliente(),
                livro.getIdLivro(),
                StatusEmprestimo.PENDENTE
        ).ifPresent(existing -> {
            throw new BusinessException("Ja existe uma solicitacao pendente para este livro.");
        });
=======
       
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
>>>>>>> f1c942b357e26ea8407126567397b833e9cf7c6f

        LocalDate today = LocalDate.now();
        Emprestimo emprestimo = new Emprestimo();
        emprestimo.setCliente(cliente);
        emprestimo.setLivro(livro);
        emprestimo.setDataEmprestimo(today);
        emprestimo.setDataPrevistaDevolucao(today);
        emprestimo.setStatus(StatusEmprestimo.PENDENTE);
        emprestimo.setObservacao(request.observacao());

<<<<<<< HEAD
=======
        livro.setQuantidadeDisponivel(livro.getQuantidadeDisponivel() - 1);
        
>>>>>>> f1c942b357e26ea8407126567397b833e9cf7c6f
        emprestimoRepository.save(emprestimo);
        return toLoanItemResponse(emprestimo);
    }

<<<<<<< HEAD
    @Transactional
    public ApiDtos.LoanItemResponse registrarEmprestimo(ApiDtos.LoanRequest request) {
        return emprestimoRepository.findByClientIdAndLivroIdAndStatus(
                request.clienteId(),
                request.livroId(),
                StatusEmprestimo.PENDENTE
        )
                .map(pending -> aprovarEmprestimo(pending.getIdEmprestimo(), request.funcionarioId(), request.observacao()))
                .orElseGet(() -> registrarEmprestimoDireto(request));
    }

    @Transactional
    public ApiDtos.LoanItemResponse aprovarEmprestimo(Integer emprestimoId, ApiDtos.ApproveLoanRequest request) {
        return aprovarEmprestimo(emprestimoId, request.funcionarioId(), request.observacao());
    }

    @Transactional
    public ApiDtos.LoanItemResponse recusarEmprestimo(Integer emprestimoId, ApiDtos.ApproveLoanRequest request) {
        Emprestimo emprestimo = emprestimoRepository.findDetailedById(emprestimoId)
                .orElseThrow(() -> new NotFoundException("Solicitacao nao encontrada."));

        if (emprestimo.getStatus() != StatusEmprestimo.PENDENTE) {
            throw new BusinessException("Somente solicitacoes pendentes podem ser recusadas.");
        }

        validateCliente(emprestimo.getCliente());

        if (request.funcionarioId() != null) {
            Funcionario funcionario = funcionarioRepository.findDetailedById(request.funcionarioId())
                    .orElseThrow(() -> new NotFoundException("Funcionario nao encontrado."));
            emprestimo.setFuncionario(funcionario);
        }

        emprestimo.setStatus(StatusEmprestimo.RECUSADA);
        if (request.observacao() != null && !request.observacao().isBlank()) {
            emprestimo.setObservacao(request.observacao());
        }

        emprestimoRepository.save(emprestimo);
        return toLoanItemResponse(emprestimo);
    }

    public List<ApiDtos.LoanItemResponse> listarPendentes() {
        return emprestimoRepository.findDetailedByStatus(StatusEmprestimo.PENDENTE)
                .stream()
                .map(this::toLoanItemResponse)
                .toList();
    }

    public ApiDtos.LoanListResponse listarPorCliente(Integer clienteId) {
        clienteRepository.findDetailedById(clienteId)
                .orElseThrow(() -> new NotFoundException("Cliente nao encontrado."));

        List<ApiDtos.LoanItemResponse> loans = emprestimoRepository.findDetailedByClientId(clienteId)
                .stream()
                .map(this::toLoanItemResponse)
                .toList();

        List<ApiDtos.LoanItemResponse> ativos = loans.stream()
                .filter(item -> item.returnedAt() == null && isApprovedOpenStatus(item.status()))
                .toList();

        List<ApiDtos.LoanItemResponse> historico = loans.stream()
                .filter(item -> item.returnedAt() != null
                        || StatusEmprestimo.RECUSADA.name().equals(item.status())
                        || StatusEmprestimo.CANCELADO.name().equals(item.status()))
                .toList();

        return new ApiDtos.LoanListResponse(ativos, historico);
    }

=======
>>>>>>> f1c942b357e26ea8407126567397b833e9cf7c6f
    @Transactional
    public ApiDtos.ReturnResponse registrarDevolucao(Integer emprestimoId) {
        Emprestimo emprestimo = emprestimoRepository.findDetailedById(emprestimoId)
                .orElseThrow(() -> new NotFoundException("Emprestimo nao encontrado."));

        if (emprestimo.getStatus() == StatusEmprestimo.PENDENTE) {
            throw new BusinessException("Solicitacao pendente nao pode ser devolvida.");
        }

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

        exemplarLivroService.liberarExemplar(emprestimo.getExemplar());

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

<<<<<<< HEAD
        ApiDtos.LoanItemResponse item = toLoanItemResponse(emprestimo);
        return new ApiDtos.ReturnResponse(
                late
                        ? "Devolucao registrada com multa por atraso."
                        : "Devolucao registrada com sucesso.",
                item.id(),
                item.client(),
                item.book(),
                item.funcionarioId(),
                item.borrowedAt(),
                item.dueDate(),
                item.returnedAt(),
                item.status(),
                item.statusVisual(),
                item.observacao(),
                late,
                fineAmount
        );
    }

    ApiDtos.LoanItemResponse toLoanItemResponse(Emprestimo emprestimo) {
        Cliente cliente = emprestimo.getCliente();
        Usuario usuarioCliente = emprestimo.getCliente().getUsuario();
        ApiDtos.UserSummary client = authService.toUserSummary(usuarioCliente);
        ApiDtos.BookResponse book = livroService.toBookResponse(emprestimo.getLivro(), 0L);

        Integer funcionarioId = emprestimo.getFuncionario() != null ? emprestimo.getFuncionario().getIdFuncionario() : null;
        String statusTecnico = resolveTechnicalStatus(emprestimo).name();
        String statusVisual = resolveVisualStatus(emprestimo);
        ExemplarLivro exemplar = emprestimo.getExemplar();
        Integer idExemplar = exemplar != null ? exemplar.getIdExemplar() : null;
        String codigoTombo = exemplar != null ? exemplar.getCodigoTombo() : null;

        return new ApiDtos.LoanItemResponse(
                emprestimo.getIdEmprestimo(),
                emprestimo.getIdEmprestimo(),
                cliente.getIdCliente(),
                usuarioCliente.getNome(),
                usuarioCliente.getEmail(),
                client,
                emprestimo.getLivro().getIdLivro(),
                emprestimo.getLivro().getTitulo(),
                emprestimo.getLivro().getAutor(),
                emprestimo.getLivro().getImagemCapa(),
                book,
                idExemplar,
                codigoTombo,
                funcionarioId,
                emprestimo.getDataEmprestimo(),
                emprestimo.getDataEmprestimo(),
                emprestimo.getDataPrevistaDevolucao(),
                emprestimo.getDataPrevistaDevolucao(),
                emprestimo.getDataDevolucao(),
                emprestimo.getDataDevolucao(),
                statusTecnico,
                statusVisual,
                emprestimo.getObservacao()
        );
=======
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
>>>>>>> f1c942b357e26ea8407126567397b833e9cf7c6f
    }

    public List<ApiDtos.LoanItemResponse> listarAtivos(String busca) {
        String search = normalizeSearch(busca);
        List<Emprestimo> emprestimos = search == null
                ? emprestimoRepository.findActiveDetailed(EXCLUDED_OPEN_STATUSES)
                : emprestimoRepository.findActiveDetailed(EXCLUDED_OPEN_STATUSES, search);
        return emprestimos
                .stream()
                .map(this::toLoanItemResponse)
                .toList();
    }

    public List<ApiDtos.LoanItemResponse> listarRecentes() {
        return emprestimoRepository.findAllByOrderByDataEmprestimoDesc(org.springframework.data.domain.PageRequest.of(0, 20))
                .stream()
                .map(this::toLoanItemResponse)
                .toList();
    }

    public List<ApiDtos.LoanItemResponse> listarAtrasados(String busca) {
        String search = normalizeSearch(busca);
        List<Emprestimo> emprestimos = search == null
                ? emprestimoRepository.findOverdueDetailed(LocalDate.now(), EXCLUDED_OPEN_STATUSES)
                : emprestimoRepository.findOverdueDetailed(LocalDate.now(), EXCLUDED_OPEN_STATUSES, search);
        return emprestimos
                .stream()
                .map(this::toLoanItemResponse)
                .toList();
    }

    private ApiDtos.LoanItemResponse aprovarEmprestimo(Integer emprestimoId, Integer funcionarioId, String observacao) {
        Emprestimo emprestimo = emprestimoRepository.findDetailedById(emprestimoId)
                .orElseThrow(() -> new NotFoundException("Solicitacao nao encontrada."));

        if (emprestimo.getStatus() != StatusEmprestimo.PENDENTE) {
            throw new BusinessException("Somente solicitacoes pendentes podem ser aprovadas.");
        }

        Cliente cliente = emprestimo.getCliente();
        Livro livro = emprestimo.getLivro();

        validateCliente(cliente);
        validateLivroForApproval(livro);
        ensureLoanLimit(cliente);

        Funcionario funcionario = null;
        if (funcionarioId != null) {
            funcionario = funcionarioRepository.findDetailedById(funcionarioId)
                    .orElseThrow(() -> new NotFoundException("Funcionario nao encontrado."));
        }

        ExemplarLivro exemplar = exemplarLivroService.reservarPrimeiroDisponivel(livro);
        if (exemplar == null) {
            throw new BusinessException("Nenhum exemplar disponivel para este livro.");
        }

        LocalDate today = LocalDate.now();
        emprestimo.setFuncionario(funcionario);
        emprestimo.setExemplar(exemplar);
        emprestimo.setDataEmprestimo(today);
        emprestimo.setDataPrevistaDevolucao(today.plusDays(DEFAULT_PRAZO_DIAS));
        emprestimo.setStatus(StatusEmprestimo.ATIVO);
        if (observacao != null && !observacao.isBlank()) {
            emprestimo.setObservacao(observacao);
        }

        livro.setQuantidadeDisponivel(livro.getQuantidadeDisponivel() - 1);
        emprestimoRepository.save(emprestimo);
        livroRepository.save(livro);

        return toLoanItemResponse(emprestimo);
    }

    private ApiDtos.LoanItemResponse registrarEmprestimoDireto(ApiDtos.LoanRequest request) {
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
        validateLivroForApproval(livro);
        ensureLoanLimit(cliente);

        ExemplarLivro exemplar = exemplarLivroService.reservarPrimeiroDisponivel(livro);
        if (exemplar == null) {
            throw new BusinessException("Nenhum exemplar disponivel para este livro.");
        }

        LocalDate today = LocalDate.now();
        Emprestimo emprestimo = new Emprestimo();
        emprestimo.setCliente(cliente);
        emprestimo.setLivro(livro);
        emprestimo.setFuncionario(funcionario);
        emprestimo.setDataEmprestimo(today);
        emprestimo.setDataPrevistaDevolucao(today.plusDays(DEFAULT_PRAZO_DIAS));
        emprestimo.setStatus(StatusEmprestimo.ATIVO);
        emprestimo.setObservacao(request.observacao());
        emprestimo.setExemplar(exemplar);

        livro.setQuantidadeDisponivel(livro.getQuantidadeDisponivel() - 1);
        emprestimoRepository.save(emprestimo);
        livroRepository.save(livro);

        return toLoanItemResponse(emprestimo);
    }

    private void validateCliente(Cliente cliente) {
        Usuario usuario = cliente.getUsuario();
        if (!Boolean.TRUE.equals(usuario.getAtivo())) throw new BusinessException("Cliente inativo.");
        if (Boolean.TRUE.equals(usuario.getBloqueado())) throw new BusinessException("Cliente bloqueado.");

        BigDecimal pendingFines = multaRepository.sumPendingFinesByClientId(cliente.getIdCliente());
        if (pendingFines != null && pendingFines.compareTo(BigDecimal.ZERO) > 0) {
            throw new BusinessException("Cliente possui multa pendente.");
        }
        long overdueLoans = emprestimoRepository.countOverdueLoansByClientId(
                cliente.getIdCliente(),
                LocalDate.now(),
                EXCLUDED_OPEN_STATUSES
        );
        if (overdueLoans > 0) {
            throw new BusinessException("Cliente possui emprestimo em atraso.");
        }
    }

    private void validateLivro(Livro livro) {
        if (!Boolean.TRUE.equals(livro.getAtivo())) throw new BusinessException("Livro inativo.");
        if (livro.getQuantidadeDisponivel() == null || livro.getQuantidadeDisponivel() <= 0) {
            throw new BusinessException("Livro indisponivel no estoque.");
        }
    }

<<<<<<< HEAD
    private void validateLivroForApproval(Livro livro) {
        if (!Boolean.TRUE.equals(livro.getAtivo())) {
            throw new BusinessException("Livro inativo.");
        }
        if (livro.getQuantidadeDisponivel() == null || livro.getQuantidadeDisponivel() <= 0) {
            throw new BusinessException("Livro indisponivel.");
        }
    }

    private void ensureLoanLimit(Cliente cliente) {
        long openLoans = emprestimoRepository.countOpenLoansByClientId(cliente.getIdCliente(), EXCLUDED_OPEN_STATUSES);
        if (openLoans >= cliente.getLimiteEmprestimos()) {
            throw new BusinessException("Cliente atingiu o limite de emprestimos.");
        }
    }

    private boolean isApprovedOpenStatus(String status) {
        return StatusEmprestimo.ATIVO.name().equals(status) || StatusEmprestimo.ATRASADO.name().equals(status);
=======
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
>>>>>>> f1c942b357e26ea8407126567397b833e9cf7c6f
    }

    private String resolveVisualStatus(Emprestimo emprestimo) {
        if (emprestimo.getStatus() == StatusEmprestimo.PENDENTE) {
            return "Pendente";
        }
        if (emprestimo.getStatus() == StatusEmprestimo.RECUSADA) {
            return "Recusada";
        }
        if (emprestimo.getDataDevolucao() != null || emprestimo.getStatus() == StatusEmprestimo.DEVOLVIDO) {
            return "Devolvido";
        }
        LocalDate baseDate = emprestimo.getDataDevolucao() != null ? emprestimo.getDataDevolucao() : LocalDate.now();
        long diff = ChronoUnit.DAYS.between(baseDate, emprestimo.getDataPrevistaDevolucao());
        if (diff < 0) return "Atrasado";
        if (diff <= 2) return "Devolucao breve";
        return "No prazo";
    }
<<<<<<< HEAD

    private StatusEmprestimo resolveTechnicalStatus(Emprestimo emprestimo) {
        if (emprestimo.getStatus() == StatusEmprestimo.PENDENTE) {
            return StatusEmprestimo.PENDENTE;
        }
        if (emprestimo.getStatus() == StatusEmprestimo.RECUSADA) {
            return StatusEmprestimo.RECUSADA;
        }
        if (emprestimo.getDataDevolucao() != null || emprestimo.getStatus() == StatusEmprestimo.DEVOLVIDO) {
            return StatusEmprestimo.DEVOLVIDO;
        }
        if (emprestimo.getDataPrevistaDevolucao() != null && emprestimo.getDataPrevistaDevolucao().isBefore(LocalDate.now())) {
            return StatusEmprestimo.ATRASADO;
        }
        return StatusEmprestimo.ATIVO;
    }

    private String normalizeSearch(String busca) {
        if (busca == null || busca.trim().isEmpty()) {
            return null;
        }
        return busca.trim();
    }
}
=======
}
>>>>>>> f1c942b357e26ea8407126567397b833e9cf7c6f
