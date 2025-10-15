const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'events.json');
const POSTIT_FILE = path.join(__dirname, 'postits.json');

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
//Leggi tutti i post-it
app.get('/postits', (req, res) => {
  if (!fs.existsSync(POSTIT_FILE)) return res.json([]);
  try {
    const data = fs.readFileSync(POSTIT_FILE, 'utf8');
    res.json(JSON.parse(data));
  } catch (err) {
    console.error("Errore lettura post-it:", err);
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
//Sovrascrivi tutti i post-it
app.post('/postits', (req, res) => {
  try {
    fs.writeFileSync(POSTIT_FILE, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  } catch (err) {
    console.error("Errore salvataggio post-it:", err);
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
// Elimina i post-it
app.delete('/postits/:id', (req, res) => {
  const id = parseInt(req.params.id);
  if (!fs.existsSync(POSTIT_FILE)) return res.json({ success: false });
  try {
    let postits = JSON.parse(fs.readFileSync(POSTIT_FILE, 'utf8'));
    postits = postits.filter(p => p.id !== id);
    fs.writeFileSync(POSTIT_FILE, JSON.stringify(postits, null, 2));
    res.json({ success: true });
  } catch (err) {
    console.error("Errore eliminazione post-it:", err);
    res.status(500).json({ success: false });
  }
});

// ---- SERVE IL FRONTEND REACT ----
app.use(express.static(path.join(__dirname, '..', 'frontend', 'build')));

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'build', 'index.html'));
});

// ---- AVVIO SERVER ----
app.listen(PORT, () => {
  console.log(`✅ Server avviato su porta ${PORT}`);
});