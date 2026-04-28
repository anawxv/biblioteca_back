import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class ConexaoTeste {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://localhost:5432/biblioteca";
        String usuario = "postgres";
        String senha = "H!deki2005";

        try (Connection conexao = DriverManager.getConnection(url, usuario, senha)) {
            System.out.println("Conexão com PostgreSQL realizada com sucesso!");
        } catch (SQLException e) {
            System.out.println("Erro ao conectar no banco:");
            e.printStackTrace();
        }
    }
}