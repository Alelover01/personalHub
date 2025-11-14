import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import sql from './db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

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
      user: { id: result[0].id, username: result[0].username, email: result[0].email, profilePicture: result[0].profilePicture },
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
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});
/* ================= REACT ROUTER ================= */
app.listen(PORT, () => {
  console.log(`🚀 Server avviato su http://localhost:${PORT}`);
  console.log(`🌍 URL pubblico Render: ${process.env.RENDER_EXTERNAL_URL || 'non definito'}`);
});
