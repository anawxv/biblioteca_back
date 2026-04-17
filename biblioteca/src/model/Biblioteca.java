package model;

import java.util.ArrayList;
import java.util.List;

public class Biblioteca {
    private String nome;
    private String endereco;
    private String telefone;
    private List<Livro> acervo;
    private List<Emprestimo> emprestimos;

    public Biblioteca(String nome, String endereco, String telefone) {
        this.nome = nome;
        this.endereco = endereco;
        this.telefone = telefone;
        this.acervo = new ArrayList<>();
        this.emprestimos = new ArrayList<>();
    }

    public String getnome() {
        return nome;
    }

    public void setnome(String nome) {
        this.nome = nome;
    }

    public String getEndereco() {
        return endereco;
    }

    public void setEndereco(String endereco) {
        this.endereco = endereco;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }
   
    public Livro buscarLivro(String titulo) {
        for (Livro livro : acervo) {
            if (livro.getTitulo().equalsIgnoreCase(titulo)) {
                return livro;
            }
        }
        return null;
    }

  
    public List<Livro> listarLivrosDisponivel() {
        List<Livro> disponiveis = new ArrayList<>();
        for (Livro livro : acervo) {
            if (livro.isStatus()) {
                disponiveis.add(livro);
            }
        }
        return disponiveis;
    }


    public List<Emprestimo> listarEmprestimosAtivos() {
        List<Emprestimo> ativos = new ArrayList<>();
        for (Emprestimo e : emprestimos) {
            if (e.getDataDevolucao() == null) {
                ativos.add(e);
            }
        }
        return ativos;
    }

   
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public List<Livro> getAcervo() { return acervo; }
    public void setAcervo(List<Livro> acervo) { this.acervo = acervo; }
}