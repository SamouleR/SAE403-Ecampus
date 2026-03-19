const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise'); // Remplacement de 'fs' par MySQL
const jwt = require('jsonwebtoken');      // Obligatoire pour la SAE
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Configuration de la connexion à o2switch (données dans le .env)
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

app.post('/api/login', async (req, res) => {
    const { email, password, role } = req.body;
    
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        // Requête SQL sécurisée
        const [rows] = await connection.execute(
            'SELECT * FROM users WHERE email = ? AND role = ?', 
            [email, role]
        );

        if (rows.length > 0) {
            const user = rows[0];
            
            // Vérification du mot de passe (à terme avec bcrypt)
            if (user.password === password) {
                // GÉNÉRATION DU JWT (Consigne 2.1)
                const token = jwt.sign(
                    { id: user.id, role: user.role, email: user.email },
                    process.env.JWT_SECRET,
                    { expiresIn: '2h' }
                );

                // On renvoie le token et les infos non-sensibles
                res.json({
                    token: token,
                    user: { id: user.id, email: user.email, role: user.role }
                });
            } else {
                res.status(401).json({ message: "Identifiants incorrects" });
            }
        } else {
            res.status(401).json({ message: "Utilisateur non trouvé" });
        }
        await connection.end();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`🚀 API en ligne sur le port ${PORT}`));