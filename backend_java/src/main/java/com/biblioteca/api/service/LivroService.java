package com.biblioteca.api.service;

import com.biblioteca.api.dto.ApiDtos;
import com.biblioteca.api.exception.BusinessException;
import com.biblioteca.api.exception.NotFoundException;
import com.biblioteca.api.model.Categoria;
import com.biblioteca.api.model.Livro;
import com.biblioteca.api.repository.CategoriaRepository;
import com.biblioteca.api.repository.EmprestimoRepository;
import com.biblioteca.api.repository.LivroRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class LivroService {

    private final LivroRepository livroRepository;
    private final CategoriaRepository categoriaRepository;
    private final EmprestimoRepository emprestimoRepository;

    public LivroService(
            LivroRepository livroRepository,
            CategoriaRepository categoriaRepository,
            EmprestimoRepository emprestimoRepository
    ) {
        this.livroRepository = livroRepository;
        this.categoriaRepository = categoriaRepository;
        this.emprestimoRepository = emprestimoRepository;
    }

    public List<ApiDtos.BookResponse> listarLivros(String busca) {
        String search = normalizeSearch(busca);
        return livroRepository.findActiveBySearch(search)
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

        int quantidadeTotal = request.quantityTotal() == null ? 0 : request.quantityTotal();
        int quantidadeDisponivel = request.availableQuantity() == null ? quantidadeTotal : request.availableQuantity();

        if (quantidadeDisponivel > quantidadeTotal) {
            throw new BusinessException("Quantidade disponivel nao pode ser maior que a quantidade total.");
        }

        Livro livro = new Livro();
        livro.setTitulo(request.title().trim());
        livro.setAutor(request.author().trim());
        livro.setIsbn(request.isbn());
        livro.setDescricao(request.description());
        livro.setAnoPublicacao(request.publishedYear());
        livro.setPaginas(request.pages());
        livro.setEditora(request.publisher());
        livro.setQuantidadeTotal(quantidadeTotal);
        livro.setQuantidadeDisponivel(quantidadeDisponivel);
        livro.setCategoria(categoria);
        livro.setImagemCapa(request.coverImage());
        livro.setAtivo(true);

        Livro salvo = livroRepository.save(livro);
        return toBookResponse(salvo, 0L);
    }

    @Transactional
    public ApiDtos.DeleteResponse excluirLivro(Integer id) {
        int updated = livroRepository.softDelete(id, LocalDateTime.now());
        if (updated == 0) {
            throw new NotFoundException("Livro nao encontrado.");
        }

        return new ApiDtos.DeleteResponse(true, id, "Livro excluido logicamente com sucesso.");
    }

    public List<ApiDtos.BookResponse> listarLivrosRecentes() {
        return livroRepository.findTop6ByAtivoTrueOrderByCriadoEmDesc()
                .stream()
                .map(livro -> toBookResponse(livro, 0L))
                .toList();
    }

    public List<ApiDtos.BookResponse> listarLivrosMaisEmprestados() {
        List<EmprestimoRepository.BookLoanCountProjection> ranking =
                emprestimoRepository.findTopBorrowedBooks(PageRequest.of(0, 6));

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
        return new ApiDtos.BookResponse(
                livro.getIdLivro(),
                livro.getTitulo(),
                livro.getAutor(),
                livro.getCategoria().getNome(),
                livro.getIsbn(),
                livro.getPaginas(),
                livro.getDescricao(),
                determineStatus(livro),
                livro.getQuantidadeTotal(),
                livro.getQuantidadeDisponivel(),
                livro.getAnoPublicacao(),
                livro.getEditora(),
                livro.getImagemCapa(),
                livro.getAtivo(),
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
}
