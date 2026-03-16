const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());

const USERS_FILE = path.join(__dirname, 'user.json');

app.post('/api/login', (req, res) => {
    const { email, password, role } = req.body;
    
    try {
        const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
        // On cherche l'utilisateur qui a le bon email, mdp ET le rôle sélectionné
        const user = users.find(u => 
            u.email === email && 
            u.password === password && 
            u.roles.includes(role)
        );

        if (user) {
            res.json(user);
        } else {
            res.status(401).json({ message: "Identifiants incorrects" });
        }
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur" });
    }
});

app.listen(8000, () => console.log("🚀 Backend prêt sur le port 8000"));