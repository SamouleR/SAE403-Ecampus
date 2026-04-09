import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminDashboard from './components/AdminDashboard';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import PublicLanding from './components/PublicLanding';
import Register from './components/Register';
import './App.css';
import logo from './ecampus.svg';
// ✅ URL Backend cPanel
const API_URL = "https://api.samuelralaikoa.mmi-velizy.fr";

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [view, setView] = useState('public');
  const [roleIndex, setRoleIndex] = useState(0);
  const [credentials, setCredentials] = useState({ email: '', pass: '' });
  const [isLoading, setIsLoading] = useState(true);

  const roles = [
    { label: "Étudiante", id: "etudiant" },
    { label: "Enseignant", id: "professeur" },
    { label: "Administrateur", id: "admin" }
  ];

  const handleLogout = useCallback(() => {
    localStorage.clear();
    setUser(null);
    setView('public');
  }, []);

  const checkSession = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
      } else {
        handleLogout();
      }
    } catch (err) {
      console.error("Session expirée", err.message);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  }, [handleLogout]);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

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
      if (!res.ok) throw new Error(data.message || "Erreur d'identifiants");
      return data;
    })
    .then(data => {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      setView('dashboard');
    })
    .catch((err) => alert(err.message));
  };

  if (isLoading) return <div className="maquette-bg"><div className="loader-text">Initialisation...</div></div>;

  // --- ROUTAGE DYNAMIQUE SELON LE RÔLE ---
  if (user) {
    if (user.role === "admin") return <AdminDashboard user={user} onLogout={handleLogout} API_URL={API_URL} />;
    if (user.role === "etudiant") return <StudentDashboard user={user} onLogout={handleLogout} API_URL={API_URL} />;
    if (user.role === "professeur" || user.role === "enseignant") return <TeacherDashboard user={user} onLogout={handleLogout} API_URL={API_URL} />;
  }

  return (
    <AnimatePresence mode="wait">
      {/* VUE : CATALOGUE PUBLIC */}
      {view === 'public' && (
        <motion.div key="public" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <PublicLanding onShowLogin={() => setView('login')} API_URL={API_URL} />
        </motion.div>
      )}

      {/* VUE : CONNEXION STYLE MAQUETTE */}
      {view === 'login' && (
        <motion.div 
          key="login" 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="maquette-bg"
        >
          {/* Header avec Retour à gauche et Logo à droite */}
          {/* Header avec Retour à gauche et Logo à droite */}
<div className="maquette-header">
  <button className="maquette-back cursive-font" onClick={() => setView('public')}>
    ← retour
  </button>
  
  {/* REMPLACE le chemin par la variable {logo} */}
  <img src={logo} alt="Logo Ecampus" className="app-logo-top" />
</div>

          {/* Navigation latérale GAUCHE */}
          <button 
            type="button" 
            className="maquette-side-nav left cursive-font" 
            onClick={() => setRoleIndex((roleIndex - 1 + 3) % 3)}
          >
            [ précédent ]
          </button>

          <div className="maquette-container">
            <h1 className="maquette-title cursive-font">{roles[roleIndex].label}</h1>

            <form onSubmit={handleLogin} className="maquette-form">
              <div className="maquette-row">
                {/* Icône utilisateur */}
<span className="maquette-icon">
  <svg width="22" height="22" viewBox="0 0 24 24" fill="#a31d24">
    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
  </svg>
</span>
                <label className="maquette-label">Nom d'utilisateur :</label>
                <input 
                  type="email" 
                  className="maquette-input"
                  onChange={e => setCredentials({...credentials, email: e.target.value})} 
                  required 
                />
                <div style={{ width: '120px' }}></div>
              </div>

              <div className="maquette-row">
                <span className="maquette-icon" style={{ color: '#a31d24', fontSize: '1.5rem' }}>🔑</span>
                <label className="maquette-label">Mot de passe :</label>
                <input 
                  type="password" 
                  className="maquette-input"
                  onChange={e => setCredentials({...credentials, pass: e.target.value})} 
                  required 
                />
                <div style={{ width: '120px' }}></div>
              </div>

              <div className="maquette-row" style={{ justifyContent: 'center' }}>
                <button type="submit" className="maquette-btn-black">Connexion</button>
              </div>

              <div className="maquette-footer">
                <span>Pas encore de compte ?</span>
                <button type="button" className="maquette-register-btn" onClick={() => setView('register')}>S'INSCRIRE</button>
              </div>
            </form>
          </div>

          {/* Navigation latérale DROITE */}
          <button 
            type="button" 
            className="maquette-side-nav right cursive-font" 
            onClick={() => setRoleIndex((roleIndex + 1) % 3)}
          >
            [ suivant ]
          </button>
        </motion.div>
      )}

      {/* VUE : INSCRIPTION */}
      {view === 'register' && (
        <motion.div key="register" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Register onShowLogin={() => setView('login')} API_URL={API_URL} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}