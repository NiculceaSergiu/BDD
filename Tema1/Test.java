import java.io.FileNotFoundException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Statement;

public class Test {

	public static void main(String[] args) {

		System.out.println("Clasa de test JDBC");
		
		String url = "jdbc:postgresql://127.0.0.1:5432/vanzari";
		String utilizator = "postgres";
		String parola = "1q2w3e";
		
		try {
			Class.forName ("org.postgresql.Driver");
			// insertProdus(url, utilizator, parola, "afine03", 2.450);
			selecteazaProduse(url, utilizator, parola);
			
		} catch (Exception e) {
			System.out.println("eroare operatii driver postgres: " + e.getMessage());
		}
		
		

	}

	private static void insertProdus(String url, String utilizator, String parola, String denprodus, Double pret) throws SQLException {
		Connection oC = DriverManager.getConnection (url, utilizator, parola);		
		String qryIns = "INSERT INTO product(name, price) VALUES ('" + denprodus + "', " + pret + ");";
		System.out.println("ins: " + qryIns);		
		Statement oS = oC.createStatement ();
		int err = oS.executeUpdate(qryIns);
		oC.close();
	}

	private static void selecteazaProduse(String url, String utilizator, String parola) throws SQLException {
		Connection oC = DriverManager.getConnection (url, utilizator, parola);
		String qry = "select * from product where name like 'afine%'" ;
//		String qry = "select * from product" ;
		Statement oS = oC.createStatement ();
		ResultSet rs = oS.executeQuery(qry);
		//dispResultSetToFile(rs);
		dispResultSetToScreen(rs);
		rs.close();
		oC.close();
	}
	
	private static void dispResultSetToScreen (ResultSet rs) throws SQLException
	{
		int i;
		ResultSetMetaData rsmd = rs.getMetaData ();
		// preia numarul de coloane
		int numCols = rsmd.getColumnCount ();
		// afiseaza antetele coloanelor
		String antet = "";
		for (i=1; i<=numCols; i++) {
			if (i > 1) antet = antet + ",";
			antet = antet + rsmd.getColumnLabel(i);
		}
		System.out.println(antet);
		// afiseaza toate datele din tabel
		boolean more = rs.next ();
		while (more) {
			// trece de la un rand la altul afisand datele
			String randDate = "";
			for (i=1; i<=numCols; i++) {
				if (i > 1) randDate = randDate + ",";
				randDate = randDate + rs.getString(i);
			}
			System.out.println(randDate);
			// incarca urmatoarul rand
			more = rs.next ();
		}
	}
	
	private static void dispResultSetToFile (ResultSet rs) throws SQLException
	{

		try (PrintWriter out = new PrintWriter("myResults.csv")) {
		    		
			int i;
			ResultSetMetaData rsmd = rs.getMetaData ();
			// preia numarul de coloane
			int numCols = rsmd.getColumnCount ();
			// afiseaza antetele coloanelor
			String antet = "";
			for (i=1; i<=numCols; i++) {
				if (i > 1) antet = antet + ",";
				antet = antet + rsmd.getColumnLabel(i);
			}
			//System.out.println(antet);
			out.println(antet);
			// afiseaza toate datele din tabel
			boolean more = rs.next ();
			while (more) {
				// trece de la un rand la altul afisand datele
				String randDate = "";
				for (i=1; i<=numCols; i++) {
					if (i > 1) randDate = randDate + ",";
					randDate = randDate + rs.getString(i);
				}
				// System.out.println(randDate);
				out.println(randDate);
				// incarca urmatoarul rand
				more = rs.next ();
			}
			
		} catch (FileNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

}
