import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const BIN_URL = process.env.JSONBIN_URL;
const API_KEY = process.env.JSONBIN_API_KEY;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

// Serve i file statici React
app.use(express.static(path.join(__dirname, '../frontend/build')));

// 🔹 Middleware log richieste e variabili d'ambiente
app.use((req, res, next) => {
  console.log("====================================");
  console.log("🌐 Nuova richiesta:", req.method, req.url);
  console.log("🔗 BIN_URL:", BIN_URL ? "presente" : "manca");
  console.log("🔑 API_KEY presente?", !!API_KEY);
  console.log("====================================");
  next();
});

// 🔹 Legge i post-it dal bin privato
app.get('/postits', async (req, res) => {
  if (!BIN_URL || !API_KEY) {
    console.error('❌ Mancano BIN_URL o API_KEY');
    return res.status(500).json({ error: 'Configurazione mancante' });
  }

  try {
    console.log("🔄 Fetch verso JSONBin...");
    const response = await fetch(`${BIN_URL}/latest`, {
      headers: { 'X-Master-Key': API_KEY },
    });

    console.log("📥 Response:", response.status, response.statusText);
    if (!response.ok) {
      const text = await response.text();
      console.error("❌ Errore JSONBin:", text);
      return res.status(response.status).json({ error: 'Errore nel fetch dei post-it' });
    }

    const json = await response.json();
    const notes = Array.isArray(json.record) ? json.record : [];
    console.log("📦 Numero post-it:", notes.length);
    res.json(notes);
  } catch (err) {
    console.error('❌ Errore fetch /postits:', err);
    res.status(500).json({ error: 'Errore nel caricamento dei post-it' });
  }
});

// 🔹 Salva i post-it nel bin privato
app.post('/postits', async (req, res) => {
  if (!BIN_URL || !API_KEY) {
    console.error('❌ Mancano BIN_URL o API_KEY');
    return res.status(500).json({ error: 'Configurazione mancante' });
  }

  const updatedNotes = req.body;
  try {
    console.log("💾 Salvataggio post-it in corso...");
    const response = await fetch(BIN_URL, {
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
      console.error("❌ Errore salvataggio JSONBin:", response.status, response.statusText, text);
      return res.status(response.status).json({ error: 'Errore nel salvataggio dei post-it' });
    }

    console.log("✅ Salvataggio completato");
    res.status(200).json({ message: 'Salvataggio completato' });
  } catch (err) {
    console.error('❌ Errore fetch /postits POST:', err);
    res.status(500).json({ error: 'Errore nel salvataggio dei post-it' });
  }
});

// 🔹 Gestione React router
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server avviato su http://localhost:${PORT}`);
  console.log(`🌍 URL pubblico Render: ${process.env.RENDER_EXTERNAL_URL || 'non definito'}`);
});
