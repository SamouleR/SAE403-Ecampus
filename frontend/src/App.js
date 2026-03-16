import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

// Détecte automatiquement l'URL de ton backend sur Codespaces
const API_URL = window.location.origin.replace('-3000', '-8000');

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
    .catch(() => alert("Accès refusé. Rappel : admin@ecampus.fr / admin"));
  };

  // --- CONFIG ANIMATION INDIVIDUELLE ---
  const containerVariants = {
    animate: { transition: { staggerChildren: 0.1 } } // Délai entre chaque enfant
  };

  const itemVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: 20, transition: { duration: 0.2 } }
  };

  if (!user) return (
    <div className="login-container">
      <div className="logo-placeholder">MMI</div>
      
      <div className="login-card">
        <div className="role-title-wrapper">
          <AnimatePresence mode="wait">
            <motion.h2 
              key={roleIndex}
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: 10 }}
              className="role-title"
            >
              {roles[roleIndex].label}
            </motion.h2>
          </AnimatePresence>
        </div>
        
        <AnimatePresence mode="wait">
          <motion.form 
            key={roleIndex}
            variants={containerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onSubmit={handleLogin}
          >
            {/* CHAQUE motion.div CI-DESSOUS S'ANIME L'UN APRÈS L'AUTRE */}
            <motion.div className="field" variants={itemVariants}>
              <label>identifiant</label>
              <input type="text" value={credentials.email} onChange={e => setCredentials({...credentials, email: e.target.value})} placeholder="admin@ecampus.fr" />
            </motion.div>

            <motion.div className="field" variants={itemVariants}>
              <label>mot de passe</label>
              <input type="password" value={credentials.pass} onChange={e => setCredentials({...credentials, pass: e.target.value})} />
            </motion.div>

            <motion.div className="controls" variants={itemVariants}>
              <button type="button" className="nav-btn" onClick={() => setRoleIndex((roleIndex - 1 + 3) % 3)}>[ précédent ]</button>
              <button type="submit" className="connexion-btn">Connexion</button>
              <button type="button" className="nav-btn" onClick={() => setRoleIndex((roleIndex + 1) % 3)}>[ suivant ]</button>
            </motion.div>
          </motion.form>
        </AnimatePresence>
      </div>
    </div>
  );

  return (
    <div className="app-content">
      <motion.h1 initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
        Bienvenue {user.nom}
      </motion.h1>
      <button onClick={() => setUser(null)} className="connexion-btn" style={{marginTop:'20px'}}>Déconnexion</button>
    </div>
  );
}