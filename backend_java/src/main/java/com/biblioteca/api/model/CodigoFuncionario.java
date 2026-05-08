package com.biblioteca.api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "codigo_funcionario")
public class CodigoFuncionario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_codigo")
    private Integer idCodigo;

    @Column(name = "codigo", nullable = false, unique = true)
    private String codigo;

    @Column(name = "ativo", nullable = false)
    private Boolean ativo = true;

    @Column(name = "usado", nullable = false)
    private Boolean usado = false;

    @Column(name = "criado_em")
    private LocalDateTime criadoEm;

    @Column(name = "usado_em")
    private LocalDateTime usadoEm;

    public Integer getIdCodigo() {
        return idCodigo;
    }

    public String getCodigo() {
        return codigo;
    }

    public Boolean getAtivo() {
        return ativo;
    }

    public Boolean getUsado() {
        return usado;
    }

    public void setUsado(Boolean usado) {
        this.usado = usado;
    }

    public void setUsadoEm(LocalDateTime usadoEm) {
        this.usadoEm = usadoEm;
    }
}
