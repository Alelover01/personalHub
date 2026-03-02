const jwt = require('jsonwebtoken');

const authMiddleware = (req, res , next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({message: "Token Mancante"});
    }

    try{
        const decoded = jwt.verify(token, process.env.JTW_SECRET);
        req.user = decoded;
        next();
    }catch (err){
        return res.status(401).json({ message: "Token non valido"});
    }
};

module.exports = authMiddleware