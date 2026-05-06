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
            String role
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
            @JsonAlias({"id_categoria", "idCategoria", "categoriaId"})
            Integer categoryId,
            @JsonAlias({"imagem_capa", "imagemCapa"})
            String coverImage
    ) {
    }

    public record BookResponse(
            Integer id,
            String title,
            String author,
            String category,
            String isbn,
            Integer pages,
            String description,
            String status,
            Integer quantityTotal,
            Integer availableQuantity,
            Integer publishedYear,
            String publisher,
            String coverImage,
            Boolean active,
            LocalDateTime createdAt,
            Long loanCount
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

    public record LoanItemResponse(
            Integer id,
            UserSummary client,
            BookResponse book,
            Integer funcionarioId,
            LocalDate borrowedAt,
            LocalDate dueDate,
            LocalDate returnedAt,
            String status,
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
            String observacao,
            boolean fineApplied,
            BigDecimal fineAmount
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
            long emprestimosAtivos,
            long emprestimosAtrasados,
            BigDecimal multasPendentes,
            long livrosIndisponiveis,
            List<LoanItemResponse> recentLoans,
            List<ChartPointResponse> loansByMonth,
            ReturnsStats returnsStats
    ) {
    }

    public record ReturnsStats(
            long onTime,
            long late
    ) {
    }
}
