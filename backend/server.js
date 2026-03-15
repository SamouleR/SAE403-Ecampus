const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// --- BASE DE DONNÉES SIMULÉE (In-Memory) ---
let db = {
    users: [
        { id: 1, nom: "M. Lecadet", email: "prof@mmi.fr", pass: "prof123", role: "TEACHER" },
        { id: 2, nom: "Samuel Ralaikoa", email: "sam@mmi.fr", pass: "sam123", role: "STUDENT" },
        { id: 3, nom: "Admin Système", email: "admin@mmi.fr", pass: "admin123", role: "ADMIN" }
    ],
    saes: [
        { id: 101, titre: "SAE 4.03 - Backend", sem: "S4", desc: "Développement d'une API", echeance: "2026-03-25", etat: "EN_COURS" }
    ],
    ressources: [], // Stockage des consignes et fichiers par SAE
    annonces: []    // Fil d'actualité chronologique
};

// --- ROUTES API ---

// Authentification
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const user = db.users.find(u => u.email === email && u.pass === password);
    
    if (user) {
        res.json({ id: user.id, nom: user.nom, role: user.role });
    } else {
        res.status(401).json({ message: "Identifiants incorrects" });
    }
});

// Récupérer les données globales
app.get('/api/content', (req, res) => {
    res.json({ saes: db.saes, ressources: db.ressources, annonces: db.annonces });
});

// Action Enseignant : Publier une nouvelle SAE ou Annonce
app.post('/api/publish', (req, res) => {
    const { type, payload } = req.body;
    if (type === 'SAE') db.saes.push({ id: Date.now(), ...payload });
    if (type === 'ANNONCE') db.annonces.unshift({ id: Date.now(), date: new Date().toLocaleString(), ...payload });
    res.json({ message: "Publication réussie !" });
});

app.listen(8000, () => console.log("🚀 API Ecampus connectée sur le port 8000"));