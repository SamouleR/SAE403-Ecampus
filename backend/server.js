const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();

// --- 1. CONFIGURATION DES MIDDLEWARES ---
// Autorise le frontend (port 3000) à communiquer avec ce serveur (port 8000)
// Remplace app.use(cors()) par ceci :
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); // Autorise tout le monde
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    
    // Répondre immédiatement aux requêtes de "pré-vérification" (Preflight)
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});

// --- 2. CONNEXION À LA BASE DE DONNÉES ---
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // Vide par défaut sur Codespaces
    database: 'Ecampus'
});

db.connect((err) => {
    if (err) {
        console.error("❌ Erreur de connexion MySQL :", err.message);
        console.log("👉 Rappel : Tape 'sudo service mysql start' dans le terminal.");
        return;
    }
    console.log("🔗 Connecté avec succès à la base de données MySQL (Ecampus)");
});

// --- 3. ROUTES DE L'APPLICATION ---

/**
 * ROUTE : Connexion (Login)
 * Vérifie l'email, le mot de passe et le rôle sélectionné
 */
app.post('/api/login', (req, res) => {
    const { email, password, role } = req.body;
    const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
    
    db.query(sql, [email, password], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        if (results.length > 0) {
            const user = results[0];
            // On transforme la colonne 'roles' (JSON en BDD) en tableau JavaScript
            const roles = typeof user.roles === 'string' ? JSON.parse(user.roles) : user.roles;

            if (roles.includes(role)) {
                // Succès : on renvoie les infos utiles (sans le mot de passe par sécurité)
                return res.json({
                    id: user.id,
                    nom: user.nom,
                    email: user.email,
                    roles: roles
                });
            } else {
                return res.status(401).json({ message: "Rôle non autorisé pour ce compte" });
            }
        }
        res.status(401).json({ message: "Identifiants incorrects" });
    });
});

/**
 * ROUTE ADMIN : Ajouter un utilisateur (Étudiant ou Enseignant)
 */
app.post('/api/admin/add-user', (req, res) => {
    const { nom, email, password, role } = req.body;
    const rolesArray = JSON.stringify([role]); // On stocke le rôle en format JSON
    
    const sql = "INSERT INTO users (nom, email, password, roles, status) VALUES (?, ?, ?, ?, 'ACTIVE')";
    
    db.query(sql, [nom, email, password, rolesArray], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Utilisateur créé avec succès !", id: result.insertId });
    });
});

/**
 * ROUTE ADMIN : Voir les SAE en attente de modération
 */
app.get('/api/admin/pending-saes', (req, res) => {
    const sql = `
        SELECT saes.id, saes.titre, users.nom as enseignant 
        FROM saes 
        LEFT JOIN users ON saes.enseignant_id = users.id 
        WHERE saes.status = 'PENDING'
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

/**
 * ROUTE ADMIN : Valider ou Rejeter une SAE
 */
app.post('/api/admin/moderate-sae', (req, res) => {
    const { id, action } = req.body; // action: 'VALIDATED' ou 'REJECTED'
    const sql = "UPDATE saes SET status = ? WHERE id = ?";
    
    db.query(sql, [action, id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Statut mis à jour avec succès" });
    });
});

// --- 4. LANCEMENT DU SERVEUR ---
const PORT = 8000;
app.listen(PORT, () => {
    console.log(`🚀 Backend prêt sur : https://...-8000.app.github.dev (Port ${PORT})`);
});