import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminDashboard from './components/AdminDashboard';
import StudentDashboard from './components/StudentDashboard'; // NOUVEL IMPORT !
import './App.css';

const API_URL = "https://api.jayson.belleval.mmi-velizy.fr";

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

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
  };

  if (!user) return (
    <div className="login-blue-bg">
      <div className="login-carousel-wrapper">
        <button type="button" className="nav-btn-white" onClick={() => setRoleIndex((roleIndex - 1 + 3) % 3)}>[ précédent ]</button>
        <AnimatePresence mode="wait">
          <motion.form key={roleIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} onSubmit={handleLogin} className="login-form-blue">
            <h2>{roles[roleIndex].label}</h2>
            <div className="input-group-blue">
              <label>Nom d'utilisateur :</label>
              <input type="email" onChange={e => setCredentials({...credentials, email: e.target.value})} required />
            </div>
            <div className="input-group-blue">
              <label>Mot de passe :</label>
              <input type="password" onChange={e => setCredentials({...credentials, pass: e.target.value})} required />
            </div>
            <button type="submit" className="btn-blue-outline">CONNEXION</button>
          </motion.form>
        </AnimatePresence>
        <button type="button" className="nav-btn-white" onClick={() => setRoleIndex((roleIndex + 1) % 3)}>[ suivant ]</button>
      </div>
    </div>
  );

  // REDIRECTIONS SELON LE RÔLE
  if (user.role === "admin") return <AdminDashboard user={user} onLogout={handleLogout} API_URL={API_URL} />;
  if (user.role === "etudiant") return <StudentDashboard user={user} onLogout={handleLogout} API_URL={API_URL} />;
  
  // Par défaut (Professeurs par exemple)
  return (
    <div className="login-blue-bg" style={{flexDirection: 'column'}}>
      <h2>Bienvenue {user.nom || user.email}</h2>
      <button onClick={handleLogout} className="btn-blue-outline">Déconnexion</button>
    </div>
  );
}