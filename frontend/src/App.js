import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminDashboard from './components/AdminDashboard';

import './App.css';

const API_URL = "https://api.jayson.belleval.mmi-velizy.fr";

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [roleIndex, setRoleIndex] = useState(1);
  const [credentials, setCredentials] = useState({ email: '', pass: '' });

  // Mise à jour des labels selon ta maquette
  const roles = [
    { label: "Étudiante", id: "etudiant" },
    { label: "Administrateur", id: "admin" },
    { label: "Enseignante", id: "professeur" }
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
    .then(async res => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur de connexion");
      return data;
    })
    .then(data => {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
    })
    .catch((err) => alert(err.message));
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
  };

  // --- INTERFACE DE CONNEXION (Design Maquette) ---
  if (!user) return (
    <div className="login-page">
      <div className="carousel-container">
        
        {/* Bouton Précédent (Extérieur gauche) */}
        <button 
          type="button" 
          className="nav-btn" 
          onClick={() => setRoleIndex((roleIndex - 1 + 3) % 3)}
        >
          [ précédent ]
        </button>

        {/* Carte de connexion */}
        <motion.div 
          key={roleIndex} // Permet d'animer le changement de rôle
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 0.3 }}
          className="login-card-ui"
        >
          <h2 className="role-title-ui">{roles[roleIndex].label}</h2>
          
          <form onSubmit={handleLogin} className="login-form">
            
            <div className="input-group">
              <label>Nom d'utilisateur :</label>
              <div className="input-wrapper">
                {/* Icône Utilisateur SVG */}
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <input 
                  type="email" 
                  onChange={e => setCredentials({...credentials, email: e.target.value})} 
                  required 
                />
              </div>
            </div>

            <div className="input-group">
              <label>Mot de passe :</label>
              <div className="input-wrapper">
                {/* Icône Clé SVG */}
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
                </svg>
                <input 
                  type="password" 
                  onChange={e => setCredentials({...credentials, pass: e.target.value})} 
                  required 
                />
              </div>
            </div>

            <button type="submit" className="submit-btn-ui">Connexion</button>
          </form>
        </motion.div>

        {/* Bouton Suivant (Extérieur droit) */}
        <button 
          type="button" 
          className="nav-btn" 
          onClick={() => setRoleIndex((roleIndex + 1) % 3)}
        >
          [ suivant ]
        </button>

      </div>
    </div>
  );

  // --- REDIRECTIONS ---
  if (user.role === "admin") return <AdminDashboard user={user} onLogout={handleLogout} API_URL={API_URL} />;
  
  return (
    <div className="app-content">
      <h1>Bienvenue {user.nom || user.email}</h1>
      <button onClick={handleLogout}>Déconnexion</button>
    </div>
  );
}