package com.biblioteca.api.service;

import com.biblioteca.api.dto.ApiDtos;
import com.biblioteca.api.exception.BusinessException;
import com.biblioteca.api.exception.NotFoundException;
import com.biblioteca.api.model.Categoria;
import com.biblioteca.api.model.Genero;
import com.biblioteca.api.model.HistoricoLivro;
import com.biblioteca.api.model.Livro;
import com.biblioteca.api.model.Subgenero;
import com.biblioteca.api.repository.CategoriaRepository;
import com.biblioteca.api.repository.EmprestimoRepository;
import com.biblioteca.api.repository.GeneroRepository;
import com.biblioteca.api.repository.HistoricoLivroRepository;
import com.biblioteca.api.repository.LivroRepository;
import com.biblioteca.api.repository.SubgeneroRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class LivroService {

    private final LivroRepository livroRepository;
    private final CategoriaRepository categoriaRepository;
    private final EmprestimoRepository emprestimoRepository;
    private final GeneroRepository generoRepository;
    private final SubgeneroRepository subgeneroRepository;
    private final HistoricoLivroRepository historicoLivroRepository;

    public LivroService(
            LivroRepository livroRepository,
            CategoriaRepository categoriaRepository,
            EmprestimoRepository emprestimoRepository,
            GeneroRepository generoRepository,
            SubgeneroRepository subgeneroRepository,
            HistoricoLivroRepository historicoLivroRepository
    ) {
        this.livroRepository = livroRepository;
        this.categoriaRepository = categoriaRepository;
        this.emprestimoRepository = emprestimoRepository;
        this.generoRepository = generoRepository;
        this.subgeneroRepository = subgeneroRepository;
        this.historicoLivroRepository = historicoLivroRepository;
    }

    public List<ApiDtos.BookResponse> listarLivros(String busca) {
        String search = normalizeSearch(busca);
        List<Integer> ids = livroRepository.findActiveIdsBySearch(search);
        if (ids.isEmpty()) {
            return List.of();
        }
        return livroRepository.findActiveDetailedByIds(ids)
                .stream()
                .map(livro -> toBookResponse(livro, 0L))
                .toList();
    }

    public ApiDtos.BookResponse detalharLivro(Integer id) {
        Livro livro = livroRepository.findActiveDetailedById(id)
                .orElseThrow(() -> new NotFoundException("Livro nao encontrado."));
        return toBookResponse(livro, 0L);
    }

    @Transactional
    public ApiDtos.BookResponse adicionarLivro(ApiDtos.BookRequest request) {
        Categoria categoria = categoriaRepository.findByIdCategoriaAndAtivoTrue(request.categoryId())
                .orElseThrow(() -> new NotFoundException("Categoria nao encontrada."));

        validarLivroRequest(request, null);

        Livro livro = new Livro();
        livro.setTitulo(request.title().trim());
        livro.setAutor(request.author().trim());
        livro.setIsbn(request.isbn());
        livro.setDescricao(request.description());
        livro.setAnoPublicacao(request.publishedYear());
        livro.setPaginas(request.pages());
        livro.setEditora(request.publisher());
        int quantidadeTotal = request.quantityTotal() == null ? 0 : request.quantityTotal();
        int quantidadeDisponivel = request.availableQuantity() == null ? quantidadeTotal : request.availableQuantity();
        livro.setQuantidadeTotal(quantidadeTotal);
        livro.setQuantidadeDisponivel(quantidadeDisponivel);
        livro.setCategoria(categoria);
        livro.setImagemCapa(request.coverImage());
        livro.setGenerosExtras(resolveGeneros(request));
        livro.setSubgeneros(resolveSubgeneros(request));
        livro.setAtivo(true);

        Livro salvo = livroRepository.save(livro);
        registrarHistorico(salvo, "CRIADO", null, snapshot(salvo));
        return toBookResponse(salvo, 0L);
    }

    @Transactional
    public ApiDtos.BookResponse atualizarLivro(Integer id, ApiDtos.BookRequest request) {
        Livro livro = livroRepository.findDetailedById(id)
                .orElseThrow(() -> new NotFoundException("Livro nao encontrado."));
        Categoria categoria = categoriaRepository.findByIdCategoriaAndAtivoTrue(request.categoryId())
                .orElseThrow(() -> new NotFoundException("Categoria nao encontrada."));

        validarLivroRequest(request, id);
        String anterior = snapshot(livro);

        int quantidadeTotal = request.quantityTotal() == null ? 0 : request.quantityTotal();
        int quantidadeDisponivel = request.availableQuantity() == null ? quantidadeTotal : request.availableQuantity();

        livro.setTitulo(request.title().trim());
        livro.setAutor(request.author().trim());
        livro.setIsbn(blankToNull(request.isbn()));
        livro.setDescricao(request.description());
        livro.setAnoPublicacao(request.publishedYear());
        livro.setPaginas(request.pages());
        livro.setEditora(request.publisher());
        livro.setQuantidadeTotal(quantidadeTotal);
        livro.setQuantidadeDisponivel(quantidadeDisponivel);
        livro.setCategoria(categoria);
        livro.setImagemCapa(request.coverImage());
        livro.setGenerosExtras(resolveGeneros(request));
        livro.setSubgeneros(resolveSubgeneros(request));
        livro.setAtualizadoEm(LocalDateTime.now());

        Livro salvo = livroRepository.save(livro);
        registrarHistorico(salvo, "EDITADO", anterior, snapshot(salvo));
        return toBookResponse(salvo, 0L);
    }

    @Transactional
    public ApiDtos.DeleteResponse excluirLivro(Integer id) {
        Livro livro = livroRepository.findByIdLivro(id)
                .orElseThrow(() -> new NotFoundException("Livro nao encontrado."));
        String anterior = snapshot(livro);
        int updated = livroRepository.softDelete(id, LocalDateTime.now());
        if (updated == 0) {
            throw new NotFoundException("Livro nao encontrado.");
        }
        livro.setAtivo(false);
        registrarHistorico(livro, "EXCLUIDO_LOGICAMENTE", anterior, snapshot(livro));

        return new ApiDtos.DeleteResponse(true, id, "Livro excluido logicamente com sucesso.");
    }

    public List<ApiDtos.HistoricoLivroResponse> listarHistoricoLivro(Integer idLivro) {
        if (!livroRepository.existsById(idLivro)) {
            throw new NotFoundException("Livro nao encontrado.");
        }
        return historicoLivroRepository.findByLivroIdLivroOrderByCriadoEmDesc(idLivro)
                .stream()
                .map(item -> new ApiDtos.HistoricoLivroResponse(
                        item.getIdHistorico(),
                        item.getLivro() == null ? null : item.getLivro().getIdLivro(),
                        item.getAcao(),
                        item.getCriadoEm(),
                        item.getDadosAnteriores(),
                        item.getDadosNovos()
                ))
                .toList();
    }

    public List<ApiDtos.HistoricoLivroResponse> listarHistoricoLivros() {
        return historicoLivroRepository.findTop50ByOrderByCriadoEmDesc()
                .stream()
                .map(this::toHistoricoResponse)
                .toList();
    }

    public List<ApiDtos.BookResponse> listarLivrosIndisponiveis(String busca) {
        String search = normalizeSearch(busca);
        List<Livro> livros = search == null
                ? livroRepository.findUnavailable()
                : livroRepository.findUnavailableBySearch(search);
        return livros
                .stream()
                .map(livro -> toBookResponse(livro, 0L))
                .toList();
    }

    public List<ApiDtos.BookResponse> listarLivrosRecentes() {
        return livroRepository.findTop6ByAtivoTrueOrderByCriadoEmDesc()
                .stream()
                .map(livro -> toBookResponse(livro, 0L))
                .toList();
    }

    public List<ApiDtos.BookResponse> listarLivrosMaisEmprestados() {
        List<EmprestimoRepository.BookLoanCountProjection> ranking =
                emprestimoRepository.findTopBorrowedBooks(EmprestimoRepository.EXCLUDED_OPEN_STATUSES, PageRequest.of(0, 10));

        Map<Integer, Long> countsByBookId = ranking.stream()
                .collect(Collectors.toMap(EmprestimoRepository.BookLoanCountProjection::getLivroId, EmprestimoRepository.BookLoanCountProjection::getTotal));

        Map<Integer, Livro> booksById = new HashMap<>();
        for (Integer bookId : countsByBookId.keySet()) {
            livroRepository.findActiveDetailedById(bookId).ifPresent(livro -> booksById.put(bookId, livro));
        }

        return ranking.stream()
                .map(item -> booksById.containsKey(item.getLivroId())
                        ? toBookResponse(booksById.get(item.getLivroId()), item.getTotal())
                        : null)
                .filter(item -> item != null)
                .toList();
    }

    ApiDtos.BookResponse toBookResponse(Livro livro, Long loanCount) {
        String status = determineStatus(livro);
        List<String> generos = livro.getGenerosExtras() == null ? List.of() : livro.getGenerosExtras()
                .stream()
                .map(Genero::getNome)
                .sorted()
                .toList();
        List<String> subgeneros = livro.getSubgeneros() == null ? List.of() : livro.getSubgeneros()
                .stream()
                .map(Subgenero::getNome)
                .sorted()
                .toList();
        String categoriaNome = livro.getCategoria() == null ? null : livro.getCategoria().getNome();
        return new ApiDtos.BookResponse(
                livro.getIdLivro(),
                livro.getTitulo(),
                livro.getAutor(),
                categoriaNome,
                livro.getIsbn(),
                livro.getPaginas(),
                livro.getDescricao(),
                status,
                livro.getQuantidadeTotal(),
                livro.getQuantidadeDisponivel(),
                livro.getAnoPublicacao(),
                livro.getEditora(),
                livro.getImagemCapa(),
                generos,
                subgeneros,
                livro.getAtivo(),
                "disponivel".equals(status),
                livro.getCriadoEm(),
                loanCount == null ? 0L : loanCount
        );
    }

    private String normalizeSearch(String busca) {
        if (busca == null) {
            return null;
        }

        String normalized = busca.trim();
        return normalized.isEmpty() ? null : normalized;
    }

    private String determineStatus(Livro livro) {
        if (!Boolean.TRUE.equals(livro.getAtivo())) {
            return "indisponivel";
        }
        return livro.getQuantidadeDisponivel() != null && livro.getQuantidadeDisponivel() > 0
                ? "disponivel"
                : "indisponivel";
    }

    private void validarLivroRequest(ApiDtos.BookRequest request, Integer livroIdAtual) {
        if (request.title() == null || request.title().trim().isEmpty()) {
            throw new BusinessException("Titulo e obrigatorio.");
        }
        if (request.author() == null || request.author().trim().isEmpty()) {
            throw new BusinessException("Autor e obrigatorio.");
        }
        int quantidadeTotal = request.quantityTotal() == null ? 0 : request.quantityTotal();
        int quantidadeDisponivel = request.availableQuantity() == null ? quantidadeTotal : request.availableQuantity();
        if (quantidadeTotal < 0 || quantidadeDisponivel < 0) {
            throw new BusinessException("Quantidades nao podem ser negativas.");
        }
        if (quantidadeDisponivel > quantidadeTotal) {
            throw new BusinessException("Quantidade disponivel nao pode ser maior que a quantidade total.");
        }
        if (request.pages() != null && request.pages() <= 0) {
            throw new BusinessException("Paginas deve ser maior que zero.");
        }
        if (request.publishedYear() != null && (request.publishedYear() < 1000 || request.publishedYear() > 2100)) {
            throw new BusinessException("Ano de publicacao deve estar entre 1000 e 2100.");
        }
        String isbn = blankToNull(request.isbn());
        if (isbn != null && livroRepository.existsByIsbnIgnoreCaseAndIdLivroNot(isbn, livroIdAtual == null ? -1 : livroIdAtual)) {
            throw new BusinessException("ISBN ja cadastrado em outro livro.");
        }
    }

    private Set<Genero> resolveGeneros(ApiDtos.BookRequest request) {
        Set<Genero> generos = new LinkedHashSet<>();
        if (request.idsGenerosExtras() != null && !request.idsGenerosExtras().isEmpty()) {
            generos.addAll(generoRepository.findByIdGeneroInAndAtivoTrue(request.idsGenerosExtras()));
        }
        if (request.generosExtras() != null) {
            for (String nome : request.generosExtras()) {
                String normalized = blankToNull(nome);
                if (normalized != null) {
                    Genero genero = generoRepository.findByNomeIgnoreCase(normalized)
                            .orElseGet(() -> {
                                Genero novo = new Genero();
                                novo.setNome(normalized);
                                return generoRepository.save(novo);
                            });
                    generos.add(genero);
                }
            }
        }
        return generos;
    }

    private Set<Subgenero> resolveSubgeneros(ApiDtos.BookRequest request) {
        if (request.idsSubgeneros() == null || request.idsSubgeneros().isEmpty()) {
            return new LinkedHashSet<>();
        }
        return new LinkedHashSet<>(subgeneroRepository.findByIdSubgeneroInAndAtivoTrue(request.idsSubgeneros()));
    }

    private void registrarHistorico(Livro livro, String acao, String dadosAnteriores, String dadosNovos) {
        HistoricoLivro historico = new HistoricoLivro();
        historico.setLivro(livro);
        historico.setAcao(acao);
        historico.setDadosAnteriores(dadosAnteriores);
        historico.setDadosNovos(dadosNovos);
        historicoLivroRepository.save(historico);
    }

    private ApiDtos.HistoricoLivroResponse toHistoricoResponse(HistoricoLivro item) {
        return new ApiDtos.HistoricoLivroResponse(
                item.getIdHistorico(),
                item.getLivro() == null ? null : item.getLivro().getIdLivro(),
                item.getAcao(),
                item.getCriadoEm(),
                item.getDadosAnteriores(),
                item.getDadosNovos()
        );
    }

    private String snapshot(Livro livro) {
        if (livro == null) {
            return null;
        }
        return "id=%s; titulo=%s; autor=%s; isbn=%s; categoria=%s; total=%s; disponivel=%s; ativo=%s"
                .formatted(
                        livro.getIdLivro(),
                        livro.getTitulo(),
                        livro.getAutor(),
                        livro.getIsbn(),
                        livro.getCategoria() == null ? null : livro.getCategoria().getNome(),
                        livro.getQuantidadeTotal(),
                        livro.getQuantidadeDisponivel(),
                        livro.getAtivo()
                );
    }

    private String blankToNull(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        return value.trim();
    }
}
