// server.js
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'events.json');

// Middleware per leggere JSON dal body
app.use(bodyParser.json());

// Serve tutti i file statici senza cache
app.use(express.static(__dirname, {
  etag: false,    // disabilita ETag
  maxAge: 0       // niente cache
}));

// Route principale: mostra il tuo HTML personalizzato
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html')); // o personalHub.html se vuoi
});

// Route per leggere gli eventi salvati
app.get('/api/events', (req, res) => {
  if (!fs.existsSync(DATA_FILE)) {
    return res.json([]);
  }
  const data = fs.readFileSync(DATA_FILE);
  res.json(JSON.parse(data));
});

// Route per salvare nuovi eventi
app.post('/api/events', (req, res) => {
  const newEvent = req.body;

  let events = [];
  if (fs.existsSync(DATA_FILE)) {
    events = JSON.parse(fs.readFileSync(DATA_FILE));
  }

  events.push(newEvent);
  fs.writeFileSync(DATA_FILE, JSON.stringify(events, null, 2));
  res.json({ success: true, event: newEvent });
});

// Route per eliminare un evento
app.delete('/api/events/:id', (req, res) => {
  const eventId = parseInt(req.params.id);
  if (!fs.existsSync(DATA_FILE)) {
    return res.json({ success: false, message: "Nessun evento trovato" });
  }

  let events = JSON.parse(fs.readFileSync(DATA_FILE));
  events = events.filter(e => e.id !== eventId);
  fs.writeFileSync(DATA_FILE, JSON.stringify(events, null, 2));

  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server in ascolto su http://localhost:${PORT}`);
});