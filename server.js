const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'events.json');

// Middleware
app.use(bodyParser.json());

// Serve file statici da /public
app.use(express.static(path.join(__dirname, 'public')));

// Serve pagine HTML da /views
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'view', 'index.html'));
});

// API: Leggi eventi
app.get('/events', (req, res) => {
  if (!fs.existsSync(DATA_FILE)) return res.json([]);
  const data = fs.readFileSync(DATA_FILE);
  res.json(JSON.parse(data));
});

// API: Aggiungi evento
app.post('/events', (req, res) => {
  const newEvent = req.body;
  let events = fs.existsSync(DATA_FILE) ? JSON.parse(fs.readFileSync(DATA_FILE)) : [];
  events.push(newEvent);
  fs.writeFileSync(DATA_FILE, JSON.stringify(events, null, 2));
  res.json({ success: true, event: newEvent });
});

// API: Elimina evento
app.delete('events/:id', (req, res) => {
  const eventId = parseInt(req.params.id);
  if (!fs.existsSync(DATA_FILE)) return res.json({ success: false });
  let events = JSON.parse(fs.readFileSync(DATA_FILE));
  events = events.filter(e => e.id !== eventId);
  fs.writeFileSync(DATA_FILE, JSON.stringify(events, null, 2));
  res.json({ success: true });
});

// Avvio server
app.listen(PORT, () => {
  console.log(`✅ Server avviato su http://localhost:${PORT}`);
});
