package com.biblioteca.api.service;

import com.biblioteca.api.dto.ApiDtos;
import com.biblioteca.api.model.Emprestimo;
import com.biblioteca.api.model.Multa;
import com.biblioteca.api.model.StatusEmprestimo;
import com.biblioteca.api.repository.ClienteRepository;
import com.biblioteca.api.repository.EmprestimoRepository;
import com.biblioteca.api.repository.LivroRepository;
import com.biblioteca.api.repository.MultaRepository;
import com.biblioteca.api.repository.FuncionarioRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class DashboardService {

    private final LivroRepository livroRepository;
    private final ClienteRepository clienteRepository;
    private final EmprestimoRepository emprestimoRepository;
    private final MultaRepository multaRepository;
    private final FuncionarioRepository funcionarioRepository;
    private final EmprestimoService emprestimoService;
    private final LivroService livroService;

    public DashboardService(
            LivroRepository livroRepository,
            ClienteRepository clienteRepository,
            EmprestimoRepository emprestimoRepository,
            MultaRepository multaRepository,
            FuncionarioRepository funcionarioRepository,
            EmprestimoService emprestimoService,
            LivroService livroService
    ) {
        this.livroRepository = livroRepository;
        this.clienteRepository = clienteRepository;
        this.emprestimoRepository = emprestimoRepository;
        this.multaRepository = multaRepository;
        this.funcionarioRepository = funcionarioRepository;
        this.emprestimoService = emprestimoService;
        this.livroService = livroService;
    }

    public ApiDtos.DashboardResponse carregarDashboard() {
        long livrosNoAcervo = livroRepository.countByAtivoTrue();
        long clientesCadastrados = clienteRepository.countActiveClients();
        long funcionariosCadastrados = funcionarioRepository.count();
        long emprestimosAtivos = emprestimoRepository.countActiveOpenLoans(EmprestimoRepository.EXCLUDED_OPEN_STATUSES);
        long emprestimosAtrasados = emprestimoRepository.countOverdueOpenLoans(LocalDate.now(), EmprestimoRepository.EXCLUDED_OPEN_STATUSES);
        long emprestimosDevolvidos = emprestimoRepository.countByStatus(StatusEmprestimo.DEVOLVIDO);
        BigDecimal multasPendentes = multaRepository.sumPendingFines();
        long livrosIndisponiveis = livroRepository.countByAtivoTrueAndQuantidadeDisponivelLessThanEqual(0);

        List<ApiDtos.LoanItemResponse> recentLoans = emprestimoRepository.findAllByOrderByDataEmprestimoDesc(PageRequest.of(0, 4))
                .stream()
                .map(emprestimoService::toLoanItemResponse)
                .toList();

        List<ApiDtos.ChartPointResponse> loansByMonth = buildLoansByMonth();
        ApiDtos.ReturnsStats returnsStats = buildReturnsStats();
        List<String> alertas = buildAlertas(emprestimosAtrasados, multasPendentes, livrosIndisponiveis);

        return new ApiDtos.DashboardResponse(
                livrosNoAcervo,
                clientesCadastrados,
                funcionariosCadastrados,
                emprestimosAtivos,
                emprestimosAtrasados,
                emprestimosDevolvidos,
                multasPendentes,
                livrosIndisponiveis,
                recentLoans,
                loansByMonth,
                returnsStats,
                alertas
        );
    }

    public List<ApiDtos.BookResponse> listarLivrosMaisEmprestados() {
        return livroService.listarLivrosMaisEmprestados();
    }

    public List<ApiDtos.BookResponse> listarLivrosRecentes() {
        return livroService.listarLivrosRecentes();
    }

    public List<ApiDtos.ChartPointResponse> listarGenerosMaisConsumidos() {
        return emprestimoRepository.findTopGenres(EmprestimoRepository.EXCLUDED_OPEN_STATUSES, PageRequest.of(0, 6))
                .stream()
                .map(item -> new ApiDtos.ChartPointResponse(item.getLabel(), item.getTotal()))
                .toList();
    }

    public List<ApiDtos.ChartPointResponse> listarEmprestimosPorMes() {
        return buildLoansByMonth();
    }

    public ApiDtos.ReturnsStats listarDevolucoesPrazoAtrasadas() {
        return buildReturnsStats();
    }

    public List<ApiDtos.LoanItemResponse> listarAtrasos() {
        return emprestimoService.listarAtrasados(null);
    }

    public List<ApiDtos.FineResponse> listarMultasPendentes() {
        return multaRepository.findByPagaFalseOrderByCriadaEmDesc()
                .stream()
                .map(this::toFineResponse)
                .toList();
    }

    private List<ApiDtos.ChartPointResponse> buildLoansByMonth() {
        Locale locale = Locale.forLanguageTag("pt-BR");
        Map<String, Long> counters = new LinkedHashMap<>();

        for (Emprestimo emprestimo : emprestimoRepository.findAllByOrderByDataEmprestimoAsc()) {
            String label = emprestimo.getDataEmprestimo()
                    .getMonth()
                    .getDisplayName(TextStyle.SHORT, locale)
                    .replace(".", "");
            counters.put(label, counters.getOrDefault(label, 0L) + 1);
        }

        return counters.entrySet()
                .stream()
                .map(entry -> new ApiDtos.ChartPointResponse(entry.getKey(), entry.getValue()))
                .toList();
    }

    private ApiDtos.ReturnsStats buildReturnsStats() {
        long onTime = 0;
        long late = 0;

        for (Emprestimo emprestimo : emprestimoRepository.findAll()) {
            if (emprestimo.getDataDevolucao() == null) {
                continue;
            }

            if (emprestimo.getDataDevolucao().isAfter(emprestimo.getDataPrevistaDevolucao())) {
                late++;
            } else {
                onTime++;
            }
        }

        return new ApiDtos.ReturnsStats(onTime, late);
    }

    private ApiDtos.FineResponse toFineResponse(Multa multa) {
        return new ApiDtos.FineResponse(
                multa.getIdMulta(),
                multa.getValor(),
                multa.getPaga(),
                multa.getMotivo(),
                multa.getCriadaEm(),
                emprestimoService.toLoanItemResponse(multa.getEmprestimo())
        );
    }

    private List<String> buildAlertas(long emprestimosAtrasados, BigDecimal multasPendentes, long livrosIndisponiveis) {
        java.util.ArrayList<String> alertas = new java.util.ArrayList<>();
        if (emprestimosAtrasados > 0) {
            alertas.add("Existem emprestimos atrasados.");
        }
        if (multasPendentes.compareTo(BigDecimal.ZERO) > 0) {
            alertas.add("Existem multas pendentes.");
        }
        if (livrosIndisponiveis > 0) {
            alertas.add("Existem livros indisponiveis.");
        }
        return alertas;
    }
}
