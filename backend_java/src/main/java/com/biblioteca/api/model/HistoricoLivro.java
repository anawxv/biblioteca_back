package com.biblioteca.api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "historico_livro")
public class HistoricoLivro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_historico")
    private Integer idHistorico;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_livro")
    private Livro livro;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_funcionario")
    private Funcionario funcionario;

    @Column(name = "acao", nullable = false, length = 30)
    private String acao;

    @Column(name = "dados_anteriores")
    private String dadosAnteriores;

    @Column(name = "dados_novos")
    private String dadosNovos;

    @Column(name = "criado_em", nullable = false)
    private LocalDateTime criadoEm;

    @PrePersist
    public void prePersist() {
        if (criadoEm == null) {
            criadoEm = LocalDateTime.now();
        }
    }

    public Integer getIdHistorico() {
        return idHistorico;
    }

    public Livro getLivro() {
        return livro;
    }

    public void setLivro(Livro livro) {
        this.livro = livro;
    }

    public String getAcao() {
        return acao;
    }

    public void setAcao(String acao) {
        this.acao = acao;
    }

    public String getDadosAnteriores() {
        return dadosAnteriores;
    }

    public void setDadosAnteriores(String dadosAnteriores) {
        this.dadosAnteriores = dadosAnteriores;
    }

    public String getDadosNovos() {
        return dadosNovos;
    }

    public void setDadosNovos(String dadosNovos) {
        this.dadosNovos = dadosNovos;
    }

    public LocalDateTime getCriadoEm() {
        return criadoEm;
    }
}
