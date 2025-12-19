Comanda de refacere a bazei de date dintr-un backup anterior (restore database): 
"c:\Program Files\PostgreSQL\12\bin\pg_restore" --if-exists -c -U postgres -d vanzari d:\GitRepos\vdb\vanzari.tar

Pentru rulare programe java cu utilizare driver se transmite calea spre driver folosind classpath (-cp):

java -cp .\postgresql-42.2.5.jar; Test

Obs:
- driverul se descarca de pe Internet (postgresql-42.x.x.jar)
- in Eclipse se importa si seteaza in BuildPath la sectiunea libraries
- URL-ul de conectare ODBC se poate utiliza doar cu jdk <= 1.7, iar pentru jdk >= 1.8 se utilizeaza doar url JDBC
	urlODBC_17 ="jdbc:odbc:PGSQLVDB01";
	urlJDBC_18 ="jdbc:postgresql://127.0.0.1:5432/vanzari";

- procedura stocata adaugare produs

CREATE OR REPLACE FUNCTION add_product(
	denumire character varying,
	valoare double precision)
    RETURNS void
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE 
AS $BODY$

    BEGIN
      INSERT INTO product( name, price) VALUES (denumire, valoare);
    END;
    
$BODY$;

- apel procedura stocata 
	CallableStatement proc = connection.prepareCall("{ call add_product(?, ?) }");
	proc.setString(1, denumire);
	proc.setDouble(2, valoare);
	proc.execute();
	proc.close();