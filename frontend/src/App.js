import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminDashboard from './components/AdminDashboard';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import PublicLanding from './components/PublicLanding';
import Register from './components/Register';
import './App.css';

// ✅ CORRIGÉ : Pointe vers ton vrai backend au lieu de localhost
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
    { label: "ÉTUDIANTE", id: "etudiant" },
    { label: "ADMINISTRATEUR", id: "admin" },
    { label: "ENSEIGNANTE", id: "professeur" }
  ];

  // ✅ CORRIGÉ : checkSession récupère bien l'objet user depuis data (pas data.user)
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
        // /api/auth/me renvoie directement l'objet user (pas { user: ... })
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
      } else {
        handleLogout();
      }
    } catch (err) {
      console.error("Session expirée ou serveur injoignable", err.message);
      // Ne pas déconnecter si c'est juste un problème réseau temporaire
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

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

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setView('public');
  };

  if (isLoading) return <div className="loader-prof">Initialisation de SaeTrack...</div>;

  // --- ROUTAGE DYNAMIQUE SELON LE RÔLE ---
  if (user) {
    if (user.role === "admin") return <AdminDashboard user={user} onLogout={handleLogout} API_URL={API_URL} />;
    if (user.role === "etudiant") return <StudentDashboard user={user} onLogout={handleLogout} API_URL={API_URL} />;
    if (user.role === "professeur" || user.role === "enseignant") return <TeacherDashboard user={user} onLogout={handleLogout} API_URL={API_URL} />;

    return (
      <div className="login-blue-bg">
        <div className="login-form-blue">
          <h2>Rôle non reconnu : {user.role}</h2>
          <button className="btn-blue-outline" onClick={handleLogout}>Retour</button>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {/* VUE : CATALOGUE PUBLIC */}
      {view === 'public' && (
        <motion.div key="public" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <PublicLanding onShowLogin={() => setView('login')} API_URL={API_URL} />
        </motion.div>
      )}

      {/* VUE : FORMULAIRE DE CONNEXION */}
      {view === 'login' && (
        <motion.div
          key="login"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          className="login-blue-bg"
        >
          <button className="back-to-public" onClick={() => setView('public')}>[ Retour ]</button>

          <div className="login-carousel-wrapper">
            <button type="button" className="nav-btn-white" onClick={() => setRoleIndex((roleIndex - 1 + 3) % 3)}> [ précédent ] </button>

            <form onSubmit={handleLogin} className="login-form-blue">
              <h2 className="role-title-display">{roles[roleIndex].label}</h2>
              <div className="input-group-blue">
                <label>Email :</label>
                <input type="email" onChange={e => setCredentials({...credentials, email: e.target.value})} required placeholder="votre@email.fr" />
              </div>
              <div className="input-group-blue">
                <label>Mot de passe :</label>
                <input type="password" onChange={e => setCredentials({...credentials, pass: e.target.value})} required placeholder="••••••••" />
              </div>
              <button type="submit" className="btn-blue-outline">SE CONNECTER</button>

              <div className="auth-footer" style={{marginTop:'20px', color:'white', fontSize:'0.8rem'}}>
                Pas encore de compte ?
                <button type="button" onClick={() => setView('register')} style={{background:'none', border:'none', color:'#000000', cursor:'pointer', marginLeft:'5px', fontWeight:'bold'}}> [ S'inscrire ]</button>
              </div>
            </form>

            <button type="button" className="nav-btn-white" onClick={() => setRoleIndex((roleIndex + 1) % 3)}> [ suivant ] </button>
          </div>
        </motion.div>
      )}

      {/* VUE : INSCRIPTION */}
      {view === 'register' && (
        <motion.div
          key="register"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
        >
          <Register onShowLogin={() => setView('login')} API_URL={API_URL} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}