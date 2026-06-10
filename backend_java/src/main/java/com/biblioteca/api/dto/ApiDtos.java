package com.biblioteca.api.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public final class ApiDtos {

    private ApiDtos() {
    }

    public record LoginRequest(
            @NotBlank(message = "E-mail e obrigatorio.")
            @Email(message = "Informe um e-mail valido.")
            String email,
            @NotBlank(message = "Senha e obrigatoria.")
            @JsonAlias("password")
            String senha
    ) {
    }

    public record UserSummary(
            Integer id,
            String name,
            String email,
            String phone,
            String role,
            Boolean active,
            Boolean blocked,
            BigDecimal pendingFine
    ) {
    }

    public record AuthResponse(
            Integer idUsuario,
            String nome,
            String email,
            String tipoUsuario
    ) {
    }

    public record CreateUserRequest(
            @NotBlank(message = "Nome e obrigatorio.")
            @Size(max = 120, message = "Nome deve ter no maximo 120 caracteres.")
            @JsonAlias("nome")
            String name,
            @NotBlank(message = "E-mail e obrigatorio.")
            @Email(message = "Informe um e-mail valido.")
            String email,
            @NotBlank(message = "Senha e obrigatoria.")
            @JsonAlias("senha")
            String password,
            @NotBlank(message = "Telefone e obrigatorio.")
            @Size(max = 20, message = "Telefone deve ter no maximo 20 caracteres.")
            @JsonAlias("telefone")
            String phone,
            @NotBlank(message = "Tipo de usuario e obrigatorio.")
            @JsonAlias({"tipo_usuario", "tipoUsuario"})
            String role,
            @JsonAlias({"codigo_autorizacao", "codigoAutorizacao", "authorizationCode"})
            String codigoAutorizacao
    ) {
    }

    public record RegisterResponse(
            String message,
            Integer idUsuario,
            String nome,
            String email,
            String tipoUsuario
    ) {
    }

    public record BookRequest(
            @NotBlank(message = "Titulo e obrigatorio.")
            @JsonAlias("titulo")
            String title,
            @NotBlank(message = "Autor e obrigatorio.")
            @JsonAlias("autor")
            String author,
            String isbn,
            @JsonAlias({"descricao", "description"})
            String description,
            @JsonAlias({"ano_publicacao", "anoPublicacao"})
            Integer publishedYear,
            @JsonAlias("paginas")
            Integer pages,
            @JsonAlias("editora")
            String publisher,
            @NotNull(message = "Quantidade total e obrigatoria.")
            @Min(value = 0, message = "Quantidade total nao pode ser negativa.")
            @JsonAlias({"quantidade_total", "quantidadeTotal"})
            Integer quantityTotal,
            @Min(value = 0, message = "Quantidade disponivel nao pode ser negativa.")
            @JsonAlias({"quantidade_disponivel", "quantidadeDisponivel"})
            Integer availableQuantity,
            @NotNull(message = "Categoria e obrigatoria.")
            @JsonAlias({"id_categoria", "idCategoria", "categoriaId", "categoryId"})
            Integer categoryId,
            @JsonAlias({"imagem_capa", "imagemCapa"})
            String coverImage,
            @JsonAlias({"generosExtras", "extraGenres"})
            List<String> generosExtras,
            @JsonAlias({"idsGenerosExtras", "genreIds"})
            List<Integer> idsGenerosExtras,
            @JsonAlias({"idsSubgeneros", "subgenreIds"})
            List<Integer> idsSubgeneros
    ) {
    }

    public record BookResponse(
            Integer idLivro,
            String titulo,
            String autor,
            String categoria,
            String isbn,
            Integer paginas,
            String descricao,
            String status,
            Integer quantidadeTotal,
            Integer quantidadeDisponivel,
            Integer anoPublicacao,
            String editora,
            String imagemCapa,
            List<String> generosExtras,
            List<String> subgeneros,
            Boolean ativo,
            Boolean disponivel,
            LocalDateTime criadoEm,
            Long quantidadeEmprestimos
    ) {
    }

    public record HistoricoLivroResponse(
            Integer idHistorico,
            Integer idLivro,
            String acao,
            LocalDateTime criadoEm,
            String dadosAnteriores,
            String dadosNovos
    ) {
    }

    public record LoanRequest(
            @NotNull(message = "Cliente e obrigatorio.")
            @JsonAlias({"id_cliente", "idCliente", "clientId"})
            Integer clienteId,
            @NotNull(message = "Livro e obrigatorio.")
            @JsonAlias({"id_livro", "idLivro", "bookId"})
            Integer livroId,
            @JsonAlias({"id_funcionario", "idFuncionario"})
            Integer funcionarioId,
            @Min(value = 1, message = "Prazo minimo de 1 dia.")
            @Max(value = 60, message = "Prazo maximo de 60 dias.")
            @JsonAlias({"prazo_dias", "prazo"})
            Integer prazoDias,
            String observacao
    ) {
    }

    public record ApproveLoanRequest(
            @JsonAlias({"id_funcionario", "idFuncionario"})
            Integer funcionarioId,
            String observacao
    ) {
    }

    public record ExemplarLivroResponse(
            Integer idExemplar,
            String codigoTombo,
            String status,
            Boolean ativo
    ) {
    }

    public record LoanItemResponse(
            Integer id,
            Integer idEmprestimo,
            Integer idCliente,
            String nomeCliente,
            String emailCliente,
            UserSummary client,
            Integer idLivro,
            String tituloLivro,
            String autorLivro,
            String imagemCapa,
            BookResponse book,
            Integer idExemplar,
            String codigoTombo,
            Integer funcionarioId,
            LocalDate borrowedAt,
            LocalDate dataEmprestimo,
            LocalDate dueDate,
            LocalDate dataPrevistaDevolucao,
            LocalDate returnedAt,
            LocalDate dataDevolucao,
            String status,
            String statusVisual,
            String observacao
    ) {
    }

    public record LoanListResponse(
            List<LoanItemResponse> ativos,
            List<LoanItemResponse> historico
    ) {
    }

    public record ReturnResponse(
            String message,
            Integer id,
            UserSummary client,
            BookResponse book,
            Integer funcionarioId,
            LocalDate borrowedAt,
            LocalDate dueDate,
            LocalDate returnedAt,
            String status,
            String statusVisual,
            String observacao,
            boolean fineApplied,
            BigDecimal fineAmount
    ) {
    }

    public record FineResponse(
            Integer idMulta,
            BigDecimal valor,
            Boolean paga,
            String motivo,
            LocalDateTime criadaEm,
            LoanItemResponse emprestimo
    ) {
    }

    public record DeleteResponse(
            boolean success,
            Integer id,
            String message
    ) {
    }

    public record FavoriteRequest(
            @NotNull(message = "Cliente e obrigatorio.")
            @JsonAlias({"id_cliente", "idCliente", "clientId"})
            Integer clienteId,
            @NotNull(message = "Livro e obrigatorio.")
            @JsonAlias({"id_livro", "idLivro", "bookId"})
            Integer livroId
    ) {
    }

    public record FavoriteResponse(
            Integer clienteId,
            BookResponse book,
            LocalDateTime createdAt
    ) {
    }

    public record ReservationRequest(
            @NotNull(message = "Cliente e obrigatorio.")
            @JsonAlias({"id_cliente", "idCliente", "clientId"})
            Integer clienteId,
            @NotNull(message = "Livro e obrigatorio.")
            @JsonAlias({"id_livro", "idLivro", "bookId"})
            Integer livroId
    ) {
    }

    public record ReservationResponse(
            Integer id,
            UserSummary client,
            BookResponse book,
            LocalDateTime reservedAt,
            String status
    ) {
    }

    public record DashboardMetricsResponse(
            long livrosNoAcervo,
            long clientesCadastrados,
            long emprestimosAtivos,
            long emprestimosAtrasados,
            BigDecimal multasPendentes,
            long livrosIndisponiveis
    ) {
    }

    public record ChartPointResponse(
            String label,
            long value
    ) {
    }

    public record DashboardResponse(
            long livrosNoAcervo,
            long clientesCadastrados,
            long funcionariosCadastrados,
            long emprestimosAtivos,
            long emprestimosAtrasados,
            long emprestimosDevolvidos,
            BigDecimal multasPendentes,
            long livrosIndisponiveis,
            List<LoanItemResponse> recentLoans,
            List<ChartPointResponse> loansByMonth,
            ReturnsStats returnsStats,
            List<String> alertas
    ) {
    }

    public record ReturnsStats(
            long onTime,
            long late
    ) {
    }
}
