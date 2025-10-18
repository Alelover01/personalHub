// server.js
import express from 'express';
import path from 'path';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// === Carica variabili d’ambiente ===
dotenv.config();

// === Setup percorsi ===
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// === Variabili d’ambiente ===
const URL = process.env.JSONBIN_URL;       // es. https://api.jsonbin.io/v3/b/xxxx
const API = process.env.JSONBIN_API_KEY;   // la tua chiave segreta

app.use(cors());
app.use(express.json());

// === API POST-IT via JSONBin ===

// 🔹 Legge i post-it
app.get('/postits', async (req, res) => {
  try {
    const response = await fetch(`${URL}/latest`, {
      headers: { 'X-Master-Key': API }
    });

    if (!response.ok) {
      console.error(`Errore lettura JSONBin: ${response.status} ${response.statusText}`);
      return res.status(response.status).json({ success: false });
    }

    const json = await response.json();
    res.json(json.record || []);
  } catch (err) {
    console.error('Errore lettura da JSONBin:', err);
    res.status(500).json({ success: false, error: 'Errore server nel caricamento' });
  }
});

// 🔹 Salva i post-it
app.post('/postits', async (req, res) => {
  try {
    const response = await fetch(URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': API
      },
      body: JSON.stringify({ record: req.body })
    });

    if (!response.ok) {
      console.error(`Errore salvataggio JSONBin: ${response.status} ${response.statusText}`);
      return res.status(response.status).json({ success: false });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Errore salvataggio su JSONBin:', err);
    res.status(500).json({ success: false, error: 'Errore server nel salvataggio' });
  }
});

// === Serve il frontend React (build) ===
app.use(express.static(path.join(__dirname, '..', 'frontend', 'build')));

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'build', 'index.html'));
});

// === Avvio server ===
app.listen(PORT, () => {
  console.log(`✅ Server avviato sulla porta ${PORT}`);
  console.log(`🌐 JSONBin URL: ${URL}`);
  console.log(`🔑 Chiave API: ${API ? '✅ Caricata' : '❌ Mancante'}`);
});