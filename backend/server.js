import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const BIN_URL = process.env.REACT_APP_JSONBIN_URL;
const API_KEY = process.env.REACT_APP_JSONBIN_API_KEY;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
// Serve i file statici React 
app.use(express.static(path.join(__dirname, '../frontend/build')));

// 🔹 Legge i post-it dal bin privato
app.get('/postits', async (req, res) => {
  console.log("🔗 BIN_URL:", BIN_URL);
  console.log("🔑 API_KEY presente?", !!API_KEY);
  try {
    const response = await fetch(`${BIN_URL}/latest`, {
      headers: { 'X-Master-Key': API_KEY },
    });
    console.log("response.ok:", response.ok, "status:", response.status);
    const json = await response.json();
    console.log("json:", json);
    res.json(Array.isArray(json.record) ? json.record : []);
  } catch (err) {
    console.error('❌ Errore fetch /postits:', err);
    res.status(500).json({ error: 'Errore nel caricamento dei post-it' });
  }
});



// 🔹 Salva i post-it nel bin privato
app.post('/postits', async (req, res) => {
  try {
    const updatedNotes = req.body;

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
      throw new Error(`Errore ${response.status}: ${response.statusText}`);
    }

    res.status(200).json({ message: '✅ Salvataggio completato' });
  } catch (err) {
    console.error('❌ Errore nel salvataggio:', err);
    res.status(500).json({ error: 'Errore nel salvataggio dei post-it' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});
app.listen(PORT, () => {
  console.log(`🚀 Server avviato su http://localhost:${PORT}`);
});