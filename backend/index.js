const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 8000;
const SECRET_KEY = 'ECAMPUS_MMI_SECRET_2024'; // Ta clé de sécurité

// Middlewares
app.use(cors()); // Autorise ton futur Front-end à appeler le Back-end
app.use(express.json()); // Permet au serveur de lire le JSON que tu lui envoies

// --- DONNÉES DE TEST (Simule une base de données) ---
const users = [
    { id: 1, email: "admin@ecampus.fr", password: "admin", roles: ["ROLE_ADMIN"], nom: "Administrateur" },
    { id: 2, email: "lecadet@ecampus.fr", password: "prof", roles: ["ROLE_TEACHER"], nom: "M. Lecadet" },
    { id: 3, email: "samuel@ecampus.fr", password: "sam", roles: ["ROLE_STUDENT"], nom: "Samuel Ralaikoa" }
];

const saes = [
    { id: 1, titre: "SAE 4.01", description: "Développement Backend Node.js", semestre: "S4", prof: "M. Lecadet" },
    { id: 2, titre: "SAE 4.02", description: "Design et Développement Vue.js", semestre: "S4", prof: "Mme Benamor" }
];

// --- ROUTES ---

// 1. Route de LOGIN : Vérifie l'utilisateur et donne un Token JWT
app.post('/api/login_check', (req, res) => {
    const { username, password } = req.body;
    
    const user = users.find(u => u.email === username && u.password === password);

    if (user) {
        // On crée un badge (token) de sécurité
        const token = jwt.sign(
            { id: user.id, roles: user.roles }, 
            SECRET_KEY, 
            { expiresIn: '2h' }
        );

        return res.json({
            token: token,
            user: { nom: user.nom, roles: user.roles }
        });
    }

    res.status(401).json({ message: "Identifiants incorrects" });
});

// 2. Route pour récupérer les SAE
app.get('/api/saes', (req, res) => {
    res.json(saes);
});

// 3. Route pour l'Admin (liste des utilisateurs)
app.get('/api/users', (req, res) => {
    res.json(users);
});

// Lancement du serveur
app.listen(PORT, () => {
    console.log(`\n✅ SERVEUR BACKEND DÉMARRÉ`);
    console.log(`🌐 URL : http://localhost:${PORT}`);
    console.log(`🚀 Prêt pour la SAE !`);
});