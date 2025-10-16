// server.js
import express from 'express';
import path from 'path';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

// Per ottenere __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

const JSONBIN_URL = process.env.JSONBIN_URL;
const JSONBIN_API_KEY = process.env.JSONBIN_API_KEY;

app.use(cors());
app.use(express.json());

// === API POST-IT via JSONBin ===
app.get('/postits', async (req, res) => {
  try {
    const response = await fetch(JSONBIN_URL, {
      headers: { 'X-Master-Key': JSONBIN_API_KEY }
    });
    const json = await response.json();
    res.json(json.record || []);
  } catch (err) {
    console.error("Errore lettura da JSONBin:", err);
    res.status(500).json({ success: false });
  }
});

app.post('/postits', async (req, res) => {
  try {
    const response = await fetch(JSONBIN_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': JSONBIN_API_KEY
      },
      body: JSON.stringify(req.body)
    });
    if (!response.ok) throw new Error("Errore salvataggio");
    res.json({ success: true });
  } catch (err) {
    console.error("Errore salvataggio su JSONBin:", err);
    res.status(500).json({ success: false });
  }
});

// === SERVE IL FRONTEND REACT ===
app.use(express.static(path.join(__dirname, '..', 'frontend', 'build')));

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'build', 'index.html'));
});

// === AVVIO SERVER ===
app.listen(PORT, () => {
  console.log(`✅ Server avviato su porta ${PORT}`);
});
