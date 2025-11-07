import pg from 'pg';
import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { release } from 'os';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const POSTIT_BIN_URL = process.env.JSONBIN_URL;         // bin post-it
const EVENT_BIN_URL = process.env.JSONBIN_URL_EVENTS;  // bin eventi
const API_KEY = process.env.JSONBIN_API_KEY;           // stessa chiave per entrambi

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

// Serve i file statici React
app.use(express.static(path.join(__dirname, '../frontend/build')));

// 🔹 Middleware log richieste e variabili
app.use((req, res, next) => {
  console.log("====================================");
  console.log("🌐 Nuova richiesta:", req.method, req.url);
  console.log("====================================");
  next();
});

/* ================= POST-IT ROUTES ================= */

// Legge i post-it
app.get('/postits', async (req, res) => {
  if (!POSTIT_BIN_URL || !API_KEY) {
    return res.status(500).json({ error: 'Configurazione post-it mancante' });
  }

  try {
    const response = await fetch(`${POSTIT_BIN_URL}/latest`, {
      headers: { 'X-Master-Key': API_KEY },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("❌ Errore JSONBin post-it:", text);
      return res.status(response.status).json({ error: 'Errore fetch post-it' });
    }

    const json = await response.json();
    const notes = Array.isArray(json.record) ? json.record : [];
    res.json(notes);
  } catch (err) {
    console.error('❌ Errore fetch /postits:', err);
    res.status(500).json({ error: 'Errore nel caricamento dei post-it' });
  }
});

// Salva i post-it
app.post('/postits', async (req, res) => {
  const updatedNotes = req.body;
  try {
    const response = await fetch(POSTIT_BIN_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': API_KEY,
        'X-Bin-Versioning': 'false',
      },
      body: JSON.stringify(updatedNotes),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("❌ Errore salvataggio post-it:", text);
      return res.status(response.status).json({ error: 'Errore salvataggio post-it' });
    }

    res.status(200).json({ message: 'Salvataggio post-it completato' });
  } catch (err) {
    console.error('❌ Errore fetch /postits POST:', err);
    res.status(500).json({ error: 'Errore nel salvataggio dei post-it' });
  }
});

/* ================= EVENTS ROUTES ================= */

// Legge gli eventi
app.get('/events', async (req, res) => {
  if (!EVENT_BIN_URL || !API_KEY) {
    return res.status(500).json({ error: 'Configurazione eventi mancante' });
  }

  try {
    const response = await fetch(`${EVENT_BIN_URL}/latest`, {
      headers: { 'X-Master-Key': API_KEY },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("❌ Errore JSONBin eventi:", text);
      return res.status(response.status).json({ error: 'Errore fetch eventi' });
    }

    const json = await response.json();
    const events = Array.isArray(json.record) ? json.record : [];
    res.json(events);
  } catch (err) {
    console.error('❌ Errore fetch /events:', err);
    res.status(500).json({ error: 'Errore nel caricamento degli eventi' });
  }
});

// Salva gli eventi
app.post('/events', async (req, res) => {
  const updatedEvents = req.body;
  try {
    const response = await fetch(EVENT_BIN_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': API_KEY,
        'X-Bin-Versioning': 'false',
      },
      body: JSON.stringify(updatedEvents),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("❌ Errore salvataggio eventi:", text);
      return res.status(response.status).json({ error: 'Errore salvataggio eventi' });
    }

    res.status(200).json({ message: 'Salvataggio eventi completato' });
  } catch (err) {
    console.error('❌ Errore fetch /events POST:', err);
    res.status(500).json({ error: 'Errore nel salvataggio degli eventi' });
  }
});

/* ================= REACT ROUTER ================= */

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server avviato su http://localhost:${PORT}`);
  console.log(`🌍 URL pubblico Render: ${process.env.RENDER_EXTERNAL_URL || 'non definito'}`);
});


/* =================== DATABASE CONNECTION ========== */
const pool = pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:{
    rejectUnauthorized: false
  }
});
//Test of the connection
pool.connect((err,client, release)=>{
  if(err){
    return console.error('Errore nella connessione al database', err.stack);
  }
  client.query('SELECT NOW()', (err, result)=>{
    release();
    if (err){
      console.error('Errore nell\'esecuzione della query di test', err.stack);
    }
    console.log('Connessione a PostgreSQL riuscita:', result.rows[0].now);
  });
});