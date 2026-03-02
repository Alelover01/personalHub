const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { testConnection } = require('./config/db');
const initDB = require('./config/initDB')

const app = express();

//Middleware
app.use(cors({
    //TODO: Aggiungere poi l'URL del frontend nell'env
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({extended : true}));

//This will be used by the frontend to wake up Render
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Backend sveglio'});
});

//TODO: Add all the routes needed
app.use('/api/auth', require('./routes/auth.routes')); //e poi tutte le altre come books, series, travel ecc..

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
    await testConnection();
    await initDB();
    console.log(`Server in ascolto sulla porta ${PORT}`);
});