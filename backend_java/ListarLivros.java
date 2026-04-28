import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;


public class ListarLivros {

    public static void main(String[] args) {
        String url = "jdbc:postgresql://localhost:5432/biblioteca";
        String usuario = "postgres";
        String senha = "H!deki2005";

        try {
            Connection conexao = DriverManager.getConnection(url, usuario, senha);

            String sql = "SELECT id_livro, titulo, autor, ativo FROM livro ORDER BY id_livro";

            Statement stmt = conexao.createStatement();
            ResultSet resultado = stmt.executeQuery(sql);

            System.out.println("Livros cadastrados no banco:");

            while (resultado.next()) {
                System.out.println(
                    resultado.getInt("id_livro") + " - " +
                    resultado.getString("titulo") + " - " +
                    resultado.getString("autor") + " - ativo: " +
                    resultado.getBoolean("ativo")
                );
            }

            resultado.close();
            stmt.close();
            conexao.close();

        } catch (Exception e) {
            System.out.println("Erro ao listar livros:");
            e.printStackTrace();
        }
    }
}