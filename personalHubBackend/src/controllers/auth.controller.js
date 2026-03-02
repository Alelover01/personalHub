const bycrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

//registration user
const register = async (req,res) =>{
    try{
        const {name, email , password} = req.body;
        if(!name || !email || !password){
            return res.status(400).json({message : "Tutti i campi sono obbligatori"});
        }

        const [existing] = await pool.query(
            'SELECT id FROM users WHERE email = ?', [email]
        );
        if(existing.length > 0){
            return res.status(400).json({message : "Email già registrata"});
        }

        const hashedPassword = await bycrypt.hash(password, 10);

        const [result] = await pool.query(
            'INSERT INTO users(name,email, password) VALUES (?,?,?)', 
            [name, email,hashedPassword]
        );

        const token = jwt.sign(
            { id: result.insertId, name, email},
            process.env.JWT_SECRET,
            {expiresIn: '7d'}
        );

        res.status(201).json({
            message : "Registrazione avvenuta con successo",
            token,
            user: {id: result.insertId, name, email}
        });
    }catch(err){
        return res.status(500).json({message : "Errore Server", error: err.message});
    }
};

//login user
const login = async (req,res) =>{
    try{
        const {email , password} = req.body;
        if(!email || !password){
            return res.status(400).json({message : "Tutti i campi sono obbligatori"});
        }

        const [users] = await pool.query(
            'SELECT * FROM users WHERE email = ?', [email]
        );
        if(users.length === 0){
            return res.status(401).json({message : "Credenziali non valide"});
        }

        const user = users[0];
        const isValid = await bycrypt.compare(password, user.password);
        if(!isValid){
            return res.status(401).json({message : "Credenziali non valide"});
        }

        const token = jwt.sign(
            { id: user.id , name: user.name, email: user.email},
            process.env.JWT_SECRET,
            {expiresIn: '7d'}
        );

        res.json({
            message : "Login avvenuto con successo",
            token,
            user: {id: user.id , name: user.name, email: user.email, avatar: user.avatar}
        });
    }catch(err){
        return res.status(500).json({message : "Errore Server", error: err.message});
    }
};

const getMe = async (req, res) => {
    try{
        const [users] = await pool.query(
            'SELECT id, name , email, avatar, created_at FROM users WHERE id = ?',
            [req.user.id]
        );
        if (users.length === 0){
            return res.status(404).json({message : "Utente non trovato"});
        }
        res.json(users[0]);
    }catch (err){
        return res.status(500).json({message : "Errore Server", error: err.message});
    }
};

module.exports = {register, login, getMe}