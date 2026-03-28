import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminDashboard from './components/AdminDashboard';
import StudentDashboard from './components/StudentDashboard';
import PublicLanding from './components/PublicLanding'; // ON VA LE CRÉER
import './App.css';

const API_URL = "https://api.samuelralaikoa.mmi-velizy.fr";

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [showLogin, setShowLogin] = useState(false); // Gère l'affichage du formulaire
  const [roleIndex, setRoleIndex] = useState(1);
  const [credentials, setCredentials] = useState({ email: '', pass: '' });

  const roles = [
    { label: "ÉTUDIANTE", id: "etudiant" },
    { label: "ADMINISTRATEUR", id: "admin" },
    { label: "ENSEIGNANTE", id: "professeur" }
  ];

  const handleLogin = (e) => {
    e.preventDefault();
    fetch(`${API_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: credentials.email, password: credentials.pass, role: roles[roleIndex].id })
    })
    .then(async res => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur");
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
    setShowLogin(false);
  };

  // 1. Si l'utilisateur est connecté, on affiche son dashboard
  if (user) {
    if (user.role === "admin") return <AdminDashboard user={user} onLogout={handleLogout} API_URL={API_URL} />;
    if (user.role === "etudiant") return <StudentDashboard user={user} onLogout={handleLogout} API_URL={API_URL} />;
    return <div className="login-blue-bg"><h2>Bienvenue Professeur</h2><button onClick={handleLogout}>Déconnexion</button></div>;
  }

  // 2. Si on clique sur "Connexion", on affiche le carrousel
  if (showLogin) {
    return (
      <div className="login-blue-bg">
        <button className="back-to-public" onClick={() => setShowLogin(false)}>← Retour à l'accueil</button>
        <div className="login-carousel-wrapper">
          <button type="button" className="nav-btn-white" onClick={() => setRoleIndex((roleIndex - 1 + 3) % 3)}>[ précédent ]</button>
          <AnimatePresence mode="wait">
            <motion.form key={roleIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} onSubmit={handleLogin} className="login-form-blue">
              <h2>{roles[roleIndex].label}</h2>
              <div className="input-group-blue"><label>Email :</label><input type="email" onChange={e => setCredentials({...credentials, email: e.target.value})} required /></div>
              <div className="input-group-blue"><label>Mot de passe :</label><input type="password" onChange={e => setCredentials({...credentials, pass: e.target.value})} required /></div>
              <button type="submit" className="btn-blue-outline">CONNEXION</button>
            </motion.form>
          </AnimatePresence>
          <button type="button" className="nav-btn-white" onClick={() => setRoleIndex((roleIndex + 1) % 3)}>[ suivant ]</button>
        </div>
      </div>
    );
  }

  // 3. Par défaut, on affiche la Vue Public
  return <PublicLanding onShowLogin={() => setShowLogin(true)} API_URL={API_URL} />;
}