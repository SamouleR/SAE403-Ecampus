import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './Auth.css'; // On réutilise le CSS partagé

export default function Register({ onShowLogin, API_URL }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student' // Par défaut
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return alert("Les mots de passe ne correspondent pas !");
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        alert("Inscription réussie ! Attendez la validation d'un administrateur.");
        onShowLogin();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Erreur lors de l'inscription.");
    }
  };

  return (
    <div className="auth-container">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }}
        className="glass-auth-card"
      >
        <h2 className="auth-title">REJOINDRE <span className="blue-text">ECAMPUS</span></h2>
        <p className="auth-subtitle">Créez votre compte pour suivre vos SAE</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group-glass">
            <label>Adresse Email Universitaire</label>
            <input 
              type="email" 
              placeholder="ex: etudiant@mmi-clermont.fr"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required 
            />
          </div>

          <div className="input-group-glass">
            <label>Mot de passe</label>
            <input 
              type="password" 
              placeholder="••••••••"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required 
            />
          </div>

          <div className="input-group-glass">
            <label>Confirmer le mot de passe</label>
            <input 
              type="password" 
              placeholder="••••••••"
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              required 
            />
          </div>

          <button type="submit" className="btn-auth-submit">S'INSCRIRE</button>
        </form>

        <div className="auth-footer">
          <span>Déjà un compte ?</span>
          <button onClick={onShowLogin} className="btn-link">Se connecter</button>
        </div>
      </motion.div>
    </div>
  );
}