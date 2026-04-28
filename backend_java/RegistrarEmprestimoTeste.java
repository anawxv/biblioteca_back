import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;

public class RegistrarEmprestimoTeste {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://localhost:5432/biblioteca";
        String usuario = "postgres";
        String senha = "H!deki2005";

        int idCliente = 2;
        int idLivro = 2;
        int idFuncionario = 1;

        try {
            Connection conexao = DriverManager.getConnection(url, usuario, senha);
            conexao.setAutoCommit(false);

            String inserirEmprestimo = """
                INSERT INTO emprestimo 
                (id_cliente, id_livro, id_funcionario, data_prevista_devolucao, status)
                VALUES (?, ?, ?, CURRENT_DATE + INTERVAL '15 days', 'ATIVO')
            """;

            PreparedStatement stmtEmprestimo = conexao.prepareStatement(inserirEmprestimo);
            stmtEmprestimo.setInt(1, idCliente);
            stmtEmprestimo.setInt(2, idLivro);
            stmtEmprestimo.setInt(3, idFuncionario);
            stmtEmprestimo.executeUpdate();

            String atualizarLivro = """
                UPDATE livro
                SET quantidade_disponivel = quantidade_disponivel - 1
                WHERE id_livro = ?
                AND quantidade_disponivel > 0
            """;

            PreparedStatement stmtLivro = conexao.prepareStatement(atualizarLivro);
            stmtLivro.setInt(1, idLivro);
            stmtLivro.executeUpdate();

            conexao.commit();

            System.out.println("Emprestimo registrado com sucesso!");

            stmtEmprestimo.close();
            stmtLivro.close();
            conexao.close();

        } catch (Exception e) {
            System.out.println("Erro ao registrar emprestimo:");
            e.printStackTrace();
        }
    }
}
