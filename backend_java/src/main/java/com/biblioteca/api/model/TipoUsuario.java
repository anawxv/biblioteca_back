package com.biblioteca.api.model;

public enum TipoUsuario {
    CLIENTE,
    FUNCIONARIO;

    public static TipoUsuario fromInput(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Preencha todos os campos obrigatorios.");
        }

        try {
            return TipoUsuario.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException("Tipo de usuario invalido.");
        }
    }

    public String toApiValue() {
        return name().toLowerCase();
    }
}
