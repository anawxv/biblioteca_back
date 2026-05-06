package com.biblioteca.api.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.CannotCreateTransactionException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(NotFoundException exception) {
        exception.printStackTrace();
        return buildResponse(HttpStatus.NOT_FOUND, exception.getMessage());
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<Map<String, Object>> handleBusiness(BusinessException exception) {
        exception.printStackTrace();
        return buildResponse(HttpStatus.BAD_REQUEST, exception.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException exception) {
        exception.printStackTrace();
        return buildResponse(HttpStatus.BAD_REQUEST, "Preencha todos os campos obrigatorios.");
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException exception) {
        exception.printStackTrace();
        return buildResponse(HttpStatus.BAD_REQUEST, exception.getMessage());
    }

    @ExceptionHandler(CannotCreateTransactionException.class)
    public ResponseEntity<Map<String, Object>> handleDatabaseConnection(CannotCreateTransactionException exception) {
        exception.printStackTrace();
        return buildResponse(
                HttpStatus.SERVICE_UNAVAILABLE,
                "Nao foi possivel conectar ao banco de dados. Verifique as credenciais do PostgreSQL."
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneric(Exception exception) {
        exception.printStackTrace();
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Erro interno ao processar a requisicao.");
    }

    private ResponseEntity<Map<String, Object>> buildResponse(HttpStatus status, String message) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("message", message);
        body.put("timestamp", LocalDateTime.now());
        body.put("status", status.value());
        return ResponseEntity.status(status).body(body);
    }
}
