import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminDashboard from './components/AdminDashboard';
import './App.css';

// Détection URL Codespaces
// Dans App.js, tout en haut
const API_URL = window.location.origin.replace('-3000', '-8000').replace(/\/$/, ""); 
console.log("🔗 L'API est ici :", API_URL); // Regarde dans la console (F12) si l'URL est correcte

export default function App() {
  const [user, setUser] = useState(null);
  const [roleIndex, setRoleIndex] = useState(0);
  const [credentials, setCredentials] = useState({ email: '', pass: '' });

  const roles = [
    { label: "Etudiante", id: "ROLE_STUDENT" },
    { label: "Admin", id: "ROLE_ADMIN" },
    { label: "Enseignante", id: "ROLE_TEACHER" }
  ];

  const handleLogin = (e) => {
    e.preventDefault();
    fetch(`${API_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: credentials.email, 
        password: credentials.pass, 
        role: roles[roleIndex].id 
      })
    })
    .then(res => res.ok ? res.json() : Promise.reject())
    .then(data => setUser(data))
    .catch(() => alert("Accès refusé. Vérifie tes identifiants et le rôle sélectionné."));
  };

  if (!user) return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="role-title">{roles[roleIndex].label}</h2>
        <form onSubmit={handleLogin}>
          <div className="field">
            <label>identifiant</label>
            <input type="text" onChange={e => setCredentials({...credentials, email: e.target.value})} />
          </div>
          <div className="field">
            <label>mot de passe</label>
            <input type="password" onChange={e => setCredentials({...credentials, pass: e.target.value})} />
          </div>
          <div className="controls">
            <button type="button" onClick={() => setRoleIndex((roleIndex - 1 + 3) % 3)}>[ précédent ]</button>
            <button type="submit" className="connexion-btn">Connexion</button>
            <button type="button" onClick={() => setRoleIndex((roleIndex + 1) % 3)}>[ suivant ]</button>
          </div>
        </form>
      </div>
    </div>
  );

  // Redirection selon le rôle
  if (user.roles.includes("ROLE_ADMIN")) {
    return <AdminDashboard user={user} onLogout={() => setUser(null)} API_URL={API_URL} />;
  }

  return (
    <div className="app-content">
      <h1>Bienvenue {user.nom}</h1>
      <p>Interface Étudiant / Enseignant en cours de développement.</p>
      <button onClick={() => setUser(null)} className="connexion-btn">Déconnexion</button>
    </div>
  );
}