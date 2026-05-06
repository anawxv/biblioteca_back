package com.biblioteca.api.service;

import com.biblioteca.api.dto.ApiDtos;
import com.biblioteca.api.model.Emprestimo;
import com.biblioteca.api.model.StatusEmprestimo;
import com.biblioteca.api.repository.ClienteRepository;
import com.biblioteca.api.repository.EmprestimoRepository;
import com.biblioteca.api.repository.LivroRepository;
import com.biblioteca.api.repository.MultaRepository;
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
    private final EmprestimoService emprestimoService;
    private final LivroService livroService;

    public DashboardService(
            LivroRepository livroRepository,
            ClienteRepository clienteRepository,
            EmprestimoRepository emprestimoRepository,
            MultaRepository multaRepository,
            EmprestimoService emprestimoService,
            LivroService livroService
    ) {
        this.livroRepository = livroRepository;
        this.clienteRepository = clienteRepository;
        this.emprestimoRepository = emprestimoRepository;
        this.multaRepository = multaRepository;
        this.emprestimoService = emprestimoService;
        this.livroService = livroService;
    }

    public ApiDtos.DashboardResponse carregarDashboard() {
        long livrosNoAcervo = livroRepository.countByAtivoTrue();
        long clientesCadastrados = clienteRepository.countActiveClients();
        long emprestimosAtivos = emprestimoRepository.countActiveOpenLoans(StatusEmprestimo.CANCELADO);
        long emprestimosAtrasados = emprestimoRepository.countOverdueOpenLoans(LocalDate.now(), StatusEmprestimo.CANCELADO);
        BigDecimal multasPendentes = multaRepository.sumPendingFines();
        long livrosIndisponiveis = livroRepository.countByAtivoTrueAndQuantidadeDisponivelLessThanEqual(0);

        List<ApiDtos.LoanItemResponse> recentLoans = emprestimoRepository.findAllByOrderByDataEmprestimoDesc(PageRequest.of(0, 4))
                .stream()
                .map(emprestimoService::toLoanItemResponse)
                .toList();

        List<ApiDtos.ChartPointResponse> loansByMonth = buildLoansByMonth();
        ApiDtos.ReturnsStats returnsStats = buildReturnsStats();

        return new ApiDtos.DashboardResponse(
                livrosNoAcervo,
                clientesCadastrados,
                emprestimosAtivos,
                emprestimosAtrasados,
                multasPendentes,
                livrosIndisponiveis,
                recentLoans,
                loansByMonth,
                returnsStats
        );
    }

    public List<ApiDtos.BookResponse> listarLivrosMaisEmprestados() {
        return livroService.listarLivrosMaisEmprestados();
    }

    public List<ApiDtos.BookResponse> listarLivrosRecentes() {
        return livroService.listarLivrosRecentes();
    }

    public List<ApiDtos.ChartPointResponse> listarGenerosMaisConsumidos() {
        return emprestimoRepository.findTopGenres(PageRequest.of(0, 6))
                .stream()
                .map(item -> new ApiDtos.ChartPointResponse(item.getLabel(), item.getTotal()))
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
}
