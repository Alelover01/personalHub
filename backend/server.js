import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import sql from './db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import multer from 'multer';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const POSTIT_BIN_URL = process.env.JSONBIN_URL;         // bin post-it
const EVENT_BIN_URL = process.env.JSONBIN_URL_EVENTS;  // bin eventi
const API_KEY = process.env.JSONBIN_API_KEY;           
const JWT_SECRET = process.env.JWT_SECRET;
const upload = multer({ dest: 'uploads/' });

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
/* ================= AUTH ROUTES ================= */
//Rotta di registrazione
app.post('/auth/register',upload.single('profilePicture'), async(req,res)=>{
  const {username, email, password } = req.body;
  const saltRounds = 10;
  if (!username || !email || !password){
    return res.status(400).json({message: 'Tutti i campi sono obbligatori.'});
  }
  try{
    //Hash della password
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const result = await sql `
            INSERT INTO profiles (username, email, password)
            VALUES (${username}, ${email}, ${hashedPassword})
            RETURNING id, username, email;
        `;
        const token = jwt.sign({id: result[0].id, username: result[0].username}, JWT_SECRET, {expiresIn: '1d'});

        res.status(201).json({
          message: 'Registrazione completata con successo!',
          user: { id: result[0].id, username: result[0].username, email: result[0].email },
          token
        });
  } catch (err){
    console.error('Errore di registrazione:', err);
    //Gestione errore di violazione dei constraint UNICI
    if(err.code === '23505'){
      let field = 'campo';
      if (err.detail.includes('email')) field = 'Email';
      else if (err.detail.includes('username')) field = 'Username';
      return res.status(409).json({message: `${field} già in uso.`});
    }
    res.status(500).json({message: 'Errore interno del server durante la registrazione.' });
  }
});
//Rotta di Login
app.post('/auth/login', async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ message: 'Username e Password sono obbligatori.' });
    }

    try {
        const users = await sql`
            SELECT id, username, password 
            FROM profiles 
            WHERE username = ${username} OR email = ${username};
        `;

        const user = users[0];

        if (!user) {
            return res.status(401).json({ message: 'Credenziali non valide.' });
        }
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Credenziali non valide.' });
        }

        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1d' });

        res.json({ 
            message: 'Login completato con successo!',
            user: { id: user.id, username: user.username },
            token
        });

    } catch (err) {
        console.error("Errore di Login:", err);
        res.status(500).json({ message: 'Errore interno del server durante il login.' });
    }
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

/** */
app.get('/users', async (req, res) => {
  try {
    const users = await sql`SELECT * FROM profiles;`;  // esempio tabella
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore DB' });
  }
});
// ✅ Rotta di test del database
app.get("/api/test-db", async (req, res) => {
  try {
    const result = await sql`SELECT NOW() AS current_time;`;
    res.json({
      success: true,
      message: "✅ Connessione al database riuscita!",
      time: result[0].current_time,
    });
  } catch (err) {
    console.error("❌ Errore di connessione al database:", err);
    console.log("🔍 DATABASE_URL:", process.env.DATABASE_URL);
    res.status(500).json({
      success: false,
      message: "Errore nella connessione al database",
      error: err.message,
    });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});
/* ================= REACT ROUTER ================= */
app.listen(PORT, () => {
  console.log(`🚀 Server avviato su http://localhost:${PORT}`);
  console.log(`🌍 URL pubblico Render: ${process.env.RENDER_EXTERNAL_URL || 'non definito'}`);
});
