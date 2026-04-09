package conexao;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class Conexao {

  
    private static final String URL =  "jdbc:sqlserver://localhost\\SQLEXPRESS;databaseName=BibliotecaDB;trustServerCertificate=true";

    public static Connection getConnection() {
    	try {
            return DriverManager.getConnection(URL, "usuario_biblioteca", "Senha123");
        } catch (SQLException e) {
            System.out.println("Erro na conexão: " + e.getMessage());
            return null;
        }
    }

    public static void main(String[] args) {
        Connection conn = getConnection();
        if (conn != null) {
            System.out.println("Conectou com sucesso!");
        } else {
            System.out.println("Falha na conexão!");
        }
    }
}