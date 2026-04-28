import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;

public class ExcluirLivroLogico {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://localhost:5432/biblioteca";
        String usuario = "postgres";
        String senha = "H!deki2005";

        int idLivro = 1;

        try {
            Connection conexao = DriverManager.getConnection(url, usuario, senha);

            String sql = "UPDATE livro SET ativo = false WHERE id_livro = ?";

            PreparedStatement stmt = conexao.prepareStatement(sql);
            stmt.setInt(1, idLivro);

            int linhasAfetadas = stmt.executeUpdate();

            if (linhasAfetadas > 0) {
                System.out.println("Livro excluido logicamente com sucesso!");
            } else {
                System.out.println("Nenhum livro encontrado com esse ID.");
            }

            stmt.close();
            conexao.close();

        } catch (Exception e) {
            System.out.println("Erro ao excluir livro logicamente:");
            e.printStackTrace();
        }
    }
}
