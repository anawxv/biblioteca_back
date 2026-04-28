package com.biblioteca.api.model;

public enum TipoUsuario {
    CLIENTE,
    FUNCIONARIO;

    public static TipoUsuario fromInput(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Tipo de usuario e obrigatorio.");
        }

        return TipoUsuario.valueOf(value.trim().toUpperCase());
    }

    public String toApiValue() {
        return name().toLowerCase();
    }
}
