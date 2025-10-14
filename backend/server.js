const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'events.json');

app.use(cors());
app.use(express.json());

// ---- API ----

// Leggi tutti gli eventi
app.get('/events', (req, res) => {
  if (!fs.existsSync(DATA_FILE)) return res.json([]);
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    res.json(JSON.parse(data));
  } catch (err) {
    console.error("Errore lettura eventi:", err);
    res.status(500).json({ success: false });
  }
});

// Sovrascrivi tutti gli eventi
app.post('/events', (req, res) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  } catch (err) {
    console.error("Errore salvataggio eventi:", err);
    res.status(500).json({ success: false });
  }
});

// Elimina evento per ID
app.delete('/events/:id', (req, res) => {
  const id = parseInt(req.params.id);
  if (!fs.existsSync(DATA_FILE)) return res.json({ success: false });
  try {
    let events = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    events = events.filter(e => e.id !== id);
    fs.writeFileSync(DATA_FILE, JSON.stringify(events, null, 2));
    res.json({ success: true });
  } catch (err) {
    console.error("Errore eliminazione evento:", err);
    res.status(500).json({ success: false });
  }
});

// ---- SERVE IL FRONTEND REACT ----
app.use(express.static(path.join(__dirname, '..', 'frontend', 'build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'build', 'index.html'));
});

// ---- AVVIO SERVER ----
app.listen(PORT, () => {
  console.log(`✅ Server avviato su porta ${PORT}`);
});