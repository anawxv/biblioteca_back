package dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import conexao.Conexao;

public class EmprestimoDAO {
    public void salvar(int idUsuario, int idLivro) {
        String sql = "INSERT INTO emprestimo (id_usuario, id_livro) VALUES (?, ?)";

        try (Connection conn = Conexao.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, idUsuario);
            stmt.setInt(2, idLivro);

            stmt.executeUpdate();
            System.out.println("Sucesso: Empréstimo gravado no SQL Server!");

        } catch (SQLException e) {
            System.err.println("Erro ao salvar empréstimo: " + e.getMessage());
        }
    }
}