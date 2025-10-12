const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = 3001;
const DATA_FILE = path.join(__dirname, 'events.json');

// Middleware
app.use(cors()); // consente richieste dal frontend su altra porta
app.use(express.json());

// API: Leggi tutti gli eventi
app.get('/events', (req, res) => {
  if (!fs.existsSync(DATA_FILE)) return res.json([]);
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    const events = JSON.parse(data);
    res.json(events);
  } catch (err) {
    console.error("Errore lettura eventi:", err);
    res.status(500).json({ success: false, message: "Errore lettura file eventi" });
  }
});

// API: Sovrascrivi tutti gli eventi
app.post('/events', (req, res) => {
  const updatedEvents = req.body;
  if (!Array.isArray(updatedEvents)) {
    return res.status(400).json({ success: false, message: "Serve un array di eventi" });
  }
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(updatedEvents, null, 2));
    res.json({ success: true });
  } catch (err) {
    console.error("Errore salvataggio eventi:", err);
    res.status(500).json({ success: false, message: "Errore scrittura file eventi" });
  }
});

// API: Elimina evento per ID
app.delete('/events/:id', (req, res) => {
  const eventId = parseInt(req.params.id);
  if (!fs.existsSync(DATA_FILE)) return res.json({ success: false });
  try {
    let events = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    events = events.filter(e => e.id !== eventId);
    fs.writeFileSync(DATA_FILE, JSON.stringify(events, null, 2));
    res.json({ success: true });
  } catch (err) {
    console.error("Errore eliminazione evento:", err);
    res.status(500).json({ success: false, message: "Errore scrittura file eventi" });
  }
});

// Avvio del server
app.listen(PORT, () => {
  console.log(`✅ Backend avviato su http://localhost:${PORT}`);
});
