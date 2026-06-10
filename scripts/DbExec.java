import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

public class DbExec {
    private static final String URL = "jdbc:postgresql://localhost:5432/biblioteca";
    private static final String USER = "postgres";
    private static final String PASS = "H!deki2005";

    public static void main(String[] args) throws Exception {
        if (args.length == 0) {
            System.err.println("Uso: java DbExec <sql|@arquivo.sql>");
            System.exit(1);
        }

        String sql = args[0];
        if (sql.startsWith("@")) {
            sql = Files.readString(Path.of(sql.substring(1)));
        }

        try (Connection connection = DriverManager.getConnection(URL, USER, PASS);
             Statement statement = connection.createStatement()) {
            boolean hasResult = statement.execute(sql);
            if (hasResult) {
                try (ResultSet rs = statement.getResultSet()) {
                    printResult(rs);
                }
            } else {
                System.out.println("OK rows=" + statement.getUpdateCount());
            }
        }
    }

    private static void printResult(ResultSet rs) throws Exception {
        ResultSetMetaData meta = rs.getMetaData();
        int columns = meta.getColumnCount();
        List<String> rows = new ArrayList<>();

        while (rs.next()) {
            StringBuilder row = new StringBuilder();
            for (int i = 1; i <= columns; i++) {
                if (i > 1) {
                    row.append('|');
                }
                row.append(rs.getString(i));
            }
            rows.add(row.toString());
        }

        if (rows.isEmpty()) {
            System.out.println("");
        } else {
            rows.forEach(System.out::println);
        }
    }
}
