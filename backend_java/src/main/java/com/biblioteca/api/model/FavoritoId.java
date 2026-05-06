package com.biblioteca.api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class FavoritoId implements Serializable {

    @Column(name = "id_cliente")
    private Integer idCliente;

    @Column(name = "id_livro")
    private Integer idLivro;

    public FavoritoId() {
    }

    public FavoritoId(Integer idCliente, Integer idLivro) {
        this.idCliente = idCliente;
        this.idLivro = idLivro;
    }

    public Integer getIdCliente() {
        return idCliente;
    }

    public void setIdCliente(Integer idCliente) {
        this.idCliente = idCliente;
    }

    public Integer getIdLivro() {
        return idLivro;
    }

    public void setIdLivro(Integer idLivro) {
        this.idLivro = idLivro;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof FavoritoId that)) {
            return false;
        }
        return Objects.equals(idCliente, that.idCliente)
                && Objects.equals(idLivro, that.idLivro);
    }

    @Override
    public int hashCode() {
        return Objects.hash(idCliente, idLivro);
    }
}
