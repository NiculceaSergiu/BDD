require('dotenv').config();
const express = require('express');
const { initPools, databaseNames } = require('./config/db');
const numbersRouterFactory = require('./routes/numbers');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

async function main() {
  const pools = await initPools();

  app.get('/', (req, res) => {
    res.json({
      message: 'Server merge. Foloseste /numbers pentru a lista si POST /numbers pentru a insera.',
      databases: databaseNames,
    });
  });

  app.use('/numbers', numbersRouterFactory(pools));

  // Fallback pentru rute inexistente.
  app.use((req, res) => {
    res.status(404).json({ error: 'Ruta nu exista.' });
  });

  // Middleware simplu pentru a prinde erorile interne si a raspunde JSON.
  app.use((err, req, res, next) => {
    console.error('Eroare neasteptata:', err);
    res.status(500).json({ error: 'A aparut o eroare interna. Verifica serverul.' });
  });

  app.listen(PORT, () => {
    console.log(`Server pornit pe http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error('Nu am putut porni serverul. Verifica MySQL (host/user/parola/port) si ca serviciul ruleaza.', err.message);
  console.error('Detalii tehnice:', err.message);
  process.exit(1);
});
