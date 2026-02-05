import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import sql from './db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import nodemailer from 'nodemailer';
import sgTransport from 'nodemailer-sendgrid-transport';
import crypto from 'crypto';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET;
const upload = multer({ dest: 'uploads/' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

//Configurazione dei cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

//Nodemail transporter
const transporter = nodemailer.createTransport(sgTransport({
  auth:{
    api_key: process.env.SENDGRID_API_KEY
  }
}));

function generateResetToken(){
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 60 * 60 *1000);
  return {token, expires};
}

// Middleware di autenticazione
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token mancante' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token non valido' });
    }
    req.user = user;
    next();
  });
}

// Serve i file statici React
app.use(express.static(path.join(__dirname, '../frontend/build')));

/* ================= AUTH ROUTES ================= */

//Rotta di registrazione
app.post('/auth/register', upload.single('profilePicture'), async (req, res) => {
  const { username, email, password } = req.body;
  const saltRounds = 10;
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Tutti i campi sono obbligatori.' });
  }
  try {
    //Se caricato il file lo invio a Cloudinary
    let profilePictureUrl = null;
    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: 'profile_picture',
        public_id: username,
        resource_type: 'image'
      });
      profilePictureUrl = uploadResult.secure_url;
    }
    //Hash della password
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const result = await sql`
      INSERT INTO profiles (username, email, password, profile_picture)
      VALUES (${username}, ${email}, ${hashedPassword}, ${profilePictureUrl})
      RETURNING id, username, email, profile_picture;
    `;
    const token = jwt.sign({ id: result[0].id, username: result[0].username }, JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({
      message: 'Registrazione completata con successo!',
      user: { id: result[0].id, username: result[0].username, email: result[0].email, profilePicture: result[0].profile_picture },
      token
    });
  } catch (err) {
    console.error('Errore di registrazione:', err);

    if (err.code === '23505') {
      let field = 'campo';
      if (err.detail.includes('email')) field = 'Email';
      else if (err.detail.includes('username')) field = 'Username';
      return res.status(409).json({ message: `${field} già in uso.` });
    }

    return res.status(500).json({
      message: 'Errore interno del server durante la registrazione.',
      error: err.message
    });
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
      SELECT id, username, email, password, profile_picture
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
      user: { 
        id: user.id,
        username: user.username,
        email: user.email,
        profilePicture: user.profile_picture
      },
      token
    });

  } catch (err) {
    console.error("Errore di Login:", err);
    res.status(500).json({ message: 'Errore interno del server durante il login.' });
  }
});

//Rotta Forgot Password
app.post('/auth/forgot-password', async (req, res)=>{
  try{
    const {email} = req.body;
    if (!email) return res.status(400).json({message: 'Email richiesta.'});
    //Cerca utente per email
    const result = await sql`SELECT id, email FROM profiles WHERE email = ${email}`;
    const user = result[0];
    if (!user){
      return res.json({message: 'Se l\' email esiste, riceverai un link di reset.'});
    }
    const {token, expires} = generateResetToken();
    await sql `UPDATE profiles SET reset_token = ${token}, reset_expires = ${expires} WHERE id = ${user.id}`;
    //Link verso il forntend
    const frontendURL = process.env.FRONTEND_URL || 'https://localhost:3000';
    const resetLink = `${frontendURL}/reset-password?token=${token}`;
    //Invia email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Reset Password - Personal Hub',
      html: `<p>Hai richiesto il reset della password.</p>
      <p> Clicca questo link per continuare:</p>
      <p><a href="${resetLink}">${resetLink}</a></p>
      <p> Il link scade tra 1 ora. </p>`      
    });
    return res.json({message: 'Se l\'email esiste, riceverai un link di reset.'});
  }catch (err){
    console.error('Errore forgot-password: ', err);
    return res.status(500).json({message: 'Errore nel rest della password.'});
  }
});

app.post('/auth/reset-password', async(req, res)=>{
  try{
    const { token, newPassword } = req.body;
    if (!token || !newPassword){
      return res.status(400).json({message: 'Token e nuova password richiesti.'});
    }
    //Trova utente con token valido
    const rows = await sql`SELECT id, reset_expires FROM profiles WHERE reset_token = ${token}`;
    const user = rows[0];
    if (!user) return res.status(400).json({message: 'Token non valido.'});
    if (new Date(user.reset_expires) < new Date()){
      return res.status(400).json({message: 'Token scaduto.'});
    }
    //Hash nuova password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    //Aggiorna password e invia token
    await sql`UPDATE profiles SET password = ${hashedPassword},reset_token = NULL, reset_expires = NULL WHERE id = ${user.id}`;
    return res.json({message: 'Password aggiornata con successo.'});
  }catch(err){
    console.error('Errore reset-password:',err);
    return res.status(500).json({message: 'Errore aggiornamento password.'});
  }
});

/* ================= EVENTS ROUTES ================= */

// GET - Recupera tutti gli eventi dell'utente loggato
app.get('/events', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const events = await sql`
      SELECT id, title, description, date, start_hour, end_hour, color, created_at
      FROM events
      WHERE user_id = ${userId}
      ORDER BY date ASC, start_hour ASC
    `;
    
    res.json(events);
  } catch (err) {
    console.error('Errore GET /events:', err);
    res.status(500).json({ message: 'Errore nel recupero degli eventi', error: err.message });
  }
});

// POST - Salva/Aggiorna tutti gli eventi (sovrascrive tutto)
app.post('/events', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const events = req.body;

    if (!Array.isArray(events)) {
      return res.status(400).json({ message: 'Il body deve essere un array di eventi' });
    }

    // Usa una transazione per garantire atomicità
    await sql.begin(async sql => {
      await sql`
        DELETE FROM events 
        WHERE user_id = ${userId}
      `;
      if (events.length > 0) {
        for (const event of events) {
          await sql`
            INSERT INTO events (user_id, title, description, date, start_hour, end_hour, color)
            VALUES (
              ${userId},
              ${event.title},
              ${event.description || ''},
              ${new Date(event.date).toISOString()},
              ${event.startHour},
              ${event.endHour},
              ${event.color || '#3f51b5'}
            )
          `;
        }
      }
    });

    res.json({ message: 'Eventi salvati con successo', count: events.length });
  } catch (err) {
    console.error('Errore POST /events:', err);
    res.status(500).json({ message: 'Errore nel salvataggio degli eventi', error: err.message });
  }
});

// PUT - Aggiorna un singolo evento (opzionale)
app.put('/events/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const eventId = req.params.id;
    const { title, description, date, startHour, endHour, color } = req.body;

    if (!title || !date || startHour === undefined || endHour === undefined) {
      return res.status(400).json({ message: 'Campi obbligatori mancanti' });
    }

    const result = await sql`
      UPDATE events 
      SET 
        title = ${title},
        description = ${description || ''},
        date = ${new Date(date).toISOString()},
        start_hour = ${startHour},
        end_hour = ${endHour},
        color = ${color || '#3f51b5'}
      WHERE id = ${eventId} AND user_id = ${userId}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ message: 'Evento non trovato o non autorizzato' });
    }

    res.json({ message: 'Evento aggiornato con successo', event: result[0] });
  } catch (err) {
    console.error('Errore PUT /events:', err);
    res.status(500).json({ message: 'Errore nell\'aggiornamento dell\'evento', error: err.message });
  }
});

// DELETE - Elimina un singolo evento (opzionale)
app.delete('/events/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const eventId = req.params.id;

    const result = await sql`
      DELETE FROM events 
      WHERE id = ${eventId} AND user_id = ${userId}
      RETURNING id
    `;

    if (result.length === 0) {
      return res.status(404).json({ message: 'Evento non trovato o non autorizzato' });
    }

    res.json({ message: 'Evento eliminato con successo' });
  } catch (err) {
    console.error('Errore DELETE /events:', err);
    res.status(500).json({ message: 'Errore nell\'eliminazione dell\'evento', error: err.message });
  }
});

/* ================= REACT ROUTER ================= */
// Questa route DEVE essere l'ultima!
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server avviato su http://localhost:${PORT}`);
  console.log(`🌍 URL pubblico Render: ${process.env.RENDER_EXTERNAL_URL || 'non definito'}`);
});