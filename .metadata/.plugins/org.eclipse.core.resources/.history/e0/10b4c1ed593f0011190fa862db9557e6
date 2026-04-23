package model;

import dao.LivroDAO;

public class TesteDAO {
    public static void main(String[] args) {

        Livro l1 = new Livro("Girls Like Girls", "123456", 2024, 5);

        LivroDAO dao = new LivroDAO();

        System.out.println("Enviando livro para o banco de dados...");

        dao.salvar(l1);

        System.out.println("Teste finalizado.");
    }
}
