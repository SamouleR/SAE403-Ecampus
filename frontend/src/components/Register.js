import React, { useState } from 'react';
import './Register.css';
import logo from './ecampus.svg'; 

export default function Register({ onShowLogin, API_URL }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'etudiant'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Les mots de passe ne correspondent pas.");
      return;
    }
    fetch(`${API_URL}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert("Inscription réussie !");
        onShowLogin();
      } else {
        alert(data.message || "Erreur lors de l'inscription.");
      }
    })
    .catch(err => console.error(err));
  };

  return (
    <div className="maquette-bg">
      {/* Header avec Retour et Logo */}
      <div className="maquette-header">
        <button className="maquette-back cursive-font" onClick={onShowLogin}>
          ← retour
        </button>
        <img src={logo} alt="Logo Ecampus" className="app-logo-top" />
      </div>

      <div className="maquette-container">
        <div className="register-hero">
          <h1 className="maquette-title cursive-font bordeaux-text">
            Rejoindre <img src={logo} alt="" className="register-inline-logo" />
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="maquette-form register-form-aligned">
          
          <div className="maquette-row">
            <label className="maquette-label bordeaux-text cursive-font">Adresse mail universitaire :</label>
            <input 
              type="email" 
              name="email"
              className="maquette-input"
              value={formData.email}
              onChange={handleChange}
              required 
            />
            <div className="register-btn-spacer desktop-only"></div>
          </div>

          <div className="maquette-row">
            <label className="maquette-label bordeaux-text cursive-font">Mot de passe :</label>
            <input 
              type="password" 
              name="password"
              className="maquette-input"
              value={formData.password}
              onChange={handleChange}
              required 
            />
            <div className="register-btn-spacer desktop-only"></div>
          </div>

          <div className="maquette-row">
            <label className="maquette-label bordeaux-text cursive-font">Confirmer le mot de passe :</label>
            <input 
              type="password" 
              name="confirmPassword"
              className="maquette-input"
              value={formData.confirmPassword}
              onChange={handleChange}
              required 
            />
            <button type="submit" className="maquette-btn-black btn-register-action cursive-font">S'INSCRIRE</button>
          </div>

          {/* Footer aligné sur le bouton du haut */}
          <div className="maquette-footer-aligned">
            <div className="footer-left-content">
                <span className="dark-text">Déjà un compte ?</span>
                <button type="button" className="maquette-link-btn cursive-font" onClick={onShowLogin}>
                    Se connecter
                </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}