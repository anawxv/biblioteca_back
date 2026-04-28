package com.biblioteca.api.dto;

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
            String token,
            UserSummary user
    ) {
    }

    public record CreateUserRequest(
            @NotBlank(message = "Nome e obrigatorio.")
            @Size(max = 120, message = "Nome deve ter no maximo 120 caracteres.")
            String name,
            @NotBlank(message = "E-mail e obrigatorio.")
            @Email(message = "Informe um e-mail valido.")
            String email,
            @NotBlank(message = "Senha e obrigatoria.")
            String password,
            @Size(max = 20, message = "Telefone deve ter no maximo 20 caracteres.")
            String phone,
            @NotBlank(message = "Tipo de usuario e obrigatorio.")
            String role
    ) {
    }

    public record RegisterResponse(
            String message,
            UserSummary user
    ) {
    }

    public record BookRequest(
            @NotBlank(message = "Titulo e obrigatorio.")
            String title,
            @NotBlank(message = "Autor e obrigatorio.")
            String author,
            String isbn,
            String description,
            Integer publishedYear,
            Integer pages,
            String publisher,
            @NotNull(message = "Quantidade total e obrigatoria.")
            @Min(value = 0, message = "Quantidade total nao pode ser negativa.")
            Integer quantityTotal,
            @Min(value = 0, message = "Quantidade disponivel nao pode ser negativa.")
            Integer availableQuantity,
            @NotNull(message = "Categoria e obrigatoria.")
            Integer categoryId,
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
            Integer clienteId,
            @NotNull(message = "Livro e obrigatorio.")
            Integer livroId,
            Integer funcionarioId,
            @Min(value = 1, message = "Prazo minimo de 1 dia.")
            @Max(value = 60, message = "Prazo maximo de 60 dias.")
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

    public record DashboardMetricsResponse(
            long totalBooks,
            long totalClients,
            long activeLoans,
            long overdueLoans,
            BigDecimal pendingFines
    ) {
    }

    public record ChartPointResponse(
            String label,
            long value
    ) {
    }

    public record DashboardResponse(
            DashboardMetricsResponse metrics,
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
