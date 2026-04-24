package model;

import dao.*;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        AutorDAO autorDao = new AutorDAO();
        CategoriaDAO catDao = new CategoriaDAO();
        LivroDAO livroDao = new LivroDAO();
        UsuarioDAO usuarioDao = new UsuarioDAO();
        EmprestimoDAO emprestimoDao = new EmprestimoDAO(); 

        System.out.println("TESTES DO SISTEMA BIBLIOTECA");

        // 1. Cadastrar Autor e Categoria 
        int idAutor = autorDao.salvar("Casey McQuiston");
        int idCategoria = catDao.salvar("Romance Contemporâneo");
        System.out.println("Autor e Categoria criados com sucesso!");

        // 2. CREATE LIVRO
        Livro l1 = new Livro("Vermelho, Branco e Sangue Azul", "ISBN-123", 2020, 5);
        livroDao.salvar(l1, idAutor, idCategoria); 
        System.out.println("Livro salvo com ID: " + l1.getIdLivro());

        // 3. CREATE USUÁRIO
        Cliente c = new Cliente("João", "joaovictor@email.com", "123", "119999");
        usuarioDao.salvar(c, "Cliente");
        System.out.println("Cliente cadastrado com ID: " + c.getIdUsuario());

        // 4. REGISTRAR EMPRÉSTIMO 
        System.out.println("\n REGISTRANDO EMPRÉSTIMO");
        emprestimoDao.salvar(c.getIdUsuario(), l1.getIdLivro());
 
        // 5. READ 
        System.out.println("\n LISTAGEM DE LIVROS NO BANCO");
        List<Livro> livros = livroDao.listarTodos();
        for (Livro livro : livros) {
            System.out.println("Livro: " + livro.getTitulo() + " | Quantidade: " + livro.getQuantidade());
        }

        System.out.println("\n TESTANDO BUSCA POR 'Romance'");
        livroDao.buscarPorQualquerCoisa("Romance").forEach(l -> {
            System.out.println("Resultado encontrado: " + l.getTitulo());
        });

        System.out.println("\nTESTES CONCLUÍDOS");
        
        // int idParaExcluir = l1.getIdLivro(); 
        // livroDao.excluir(idParaExcluir);
    }
}
