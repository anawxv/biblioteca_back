package dao;

import java.sql.*;
import conexao.Conexao;
import model.Emprestimo;
import java.util.ArrayList;
import java.util.List;

public class EmprestimoDAO {

    public void salvar(int idUsuario, int idLivro) {
        String sqlEmprestimo = "INSERT INTO emprestimo (id_usuario, id_livro, data_prevista_devolucao) VALUES (?, ?, DATEADD(day, 10, GETDATE()))";
        String sqlEstoque = "UPDATE livro SET quantidade = quantidade - 1 WHERE id_livro = ? AND quantidade > 0";

        try (Connection conn = Conexao.getConnection()) {
            conn.setAutoCommit(false);
            try (PreparedStatement stmtEmp = conn.prepareStatement(sqlEmprestimo);
                 PreparedStatement stmtEst = conn.prepareStatement(sqlEstoque)) {
                
                stmtEmp.setInt(1, idUsuario);
                stmtEmp.setInt(2, idLivro);
                stmtEmp.executeUpdate();

                stmtEst.setInt(1, idLivro);
                int linhas = stmtEst.executeUpdate();

                if (linhas == 0) throw new SQLException("Estoque insuficiente");

                conn.commit();
            } catch (SQLException e) {
                conn.rollback();
                throw e;
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public void finalizarDevolucao(int idEmprestimo, int idLivro, Emprestimo emp) {
        String sqlDevolucao = "UPDATE emprestimo SET data_devolucao = GETDATE(), valor_multa = ? WHERE id_emprestimo = ?";
        String sqlEstoque = "UPDATE livro SET quantidade = quantidade + 1 WHERE id_livro = ?";

        try (Connection conn = Conexao.getConnection()) {
            conn.setAutoCommit(false);
            try (PreparedStatement stmtDev = conn.prepareStatement(sqlDevolucao);
                 PreparedStatement stmtEst = conn.prepareStatement(sqlEstoque)) {
                
                emp.finalizar();
                stmtDev.setDouble(1, emp.getValorMulta());
                stmtDev.setInt(2, idEmprestimo);
                stmtDev.executeUpdate();

                stmtEst.setInt(1, idLivro);
                stmtEst.executeUpdate();

                conn.commit();
            } catch (SQLException e) {
                conn.rollback();
                throw e;
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public List<Emprestimo> listarTodos() {
        List<Emprestimo> lista = new ArrayList<>();
        String sql = "SELECT * FROM emprestimo";
        try (Connection conn = Conexao.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                Emprestimo e = new Emprestimo();
                e.setIdEmprestimo(rs.getInt("id_emprestimo"));
                e.setDataPrevista(rs.getDate("data_prevista_devolucao"));
                e.setDataDevolucao(rs.getDate("data_devolucao"));
                e.setValorMulta(rs.getDouble("valor_multa"));
                lista.add(e);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return lista;
    }

    public void excluir(int idEmprestimo) {
        String sql = "DELETE FROM emprestimo WHERE id_emprestimo = ?";
        try (Connection conn = Conexao.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, idEmprestimo);
            stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public void atualizarPrazo(int idEmprestimo, int novosDias) {
        String sql = "UPDATE emprestimo SET data_prevista_devolucao = DATEADD(day, ?, data_prevista_devolucao) WHERE id_emprestimo = ?";
        try (Connection conn = Conexao.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, novosDias);
            stmt.setInt(2, idEmprestimo);
            stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}