package model;

public class Funcionario extends Usuario {

    private String cargo;
    public Funcionario(String nome, String email, String senha, String telefone, String cargo) {
        super(nome, email, senha, telefone);
        this.cargo = cargo;
    }

    public void registrarEmprestimo(Cliente cliente, Livro livro) {
        if (livro.isStatus()) { 
            System.out.println("Funcionário " + this.getNome() + " registrando empréstimo para " + cliente.getNome());
        }
    }

    public void registrarDevolucao(Emprestimo emprestimo) {
        emprestimo.finalizar();
        System.out.println("Devolução registrada pelo funcionário: " + this.getNome());
    }


    public String getCargo() { return cargo; }
    public void setCargo(String cargo) { this.cargo = cargo; }
    

}