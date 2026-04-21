package model;

import java.util.ArrayList;
import java.util.List;

public class Cliente extends Usuario {

    private int idCliente;
    private List<Emprestimo> historicoEmprestimos;

    public Cliente(String nome, String email, String senha, String telefone) {
        super(nome, email, senha, telefone); 
        this.historicoEmprestimos = new ArrayList<>(); 
    }

    public void solicitarEmprestimo(Livro livro) {
        System.out.println("Cliente " + nome + " solicitou o livro: " + livro.getTitulo());
    }

    public List<Emprestimo> getHistoricoEmprestimos() {
        return historicoEmprestimos;
    }

    public int getIdCliente() { return idCliente; }
    public void setIdCliente(int idCliente) { this.idCliente = idCliente; }
}
