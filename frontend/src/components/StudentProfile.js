import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './StudentProfile.css';

export default function StudentProfile({ user, stats, API_URL }) {
  return (
    <motion.div className="student-profile-grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      
      {/* CARD 1 : RÉSUMÉ ACADÉMIQUE */}
      <div className="profile-card-glass info-main">
        <div className="student-avatar-large">
          {user.email[0].toUpperCase()}
          <div className="status-indicator-online"></div>
        </div>
        <h2 className="student-name">{user.email.split('@')[0]}</h2>
        <span className="student-badge-promo">BUT MMI - Promotion 2026</span>
        
        <div className="quick-stats-row">
          <div className="q-stat"><strong>{stats.moyenne}</strong><span>Moyenne</span></div>
          <div className="q-stat"><strong>{stats.rendusEffectues}</strong><span>Projets</span></div>
        </div>
      </div>

      {/* CARD 2 : COMPÉTENCES DÉVELOPPÉES (Spécifique Étudiant) */}
      <div className="profile-card-glass skills-card">
        <h3>Compétences Validées</h3>
        <div className="skills-tags">
          <span className="tag-skill gold">Dév Web</span>
          <span className="tag-skill blue">Design UI</span>
          <span className="tag-skill purple">Gestion Projet</span>
        </div>
        <p className="skill-footer">Basé sur vos {stats.rendusEffectues} SAE validées.</p>
      </div>

      {/* CARD 3 : SÉCURITÉ & PARAMÈTRES */}
      <div className="profile-card-glass security-section">
        <h3>Sécurité</h3>
        <button className="btn-change-pass">Modifier le mot de passe</button>
        <p className="last-login">Dernière connexion : Aujourd'hui à {new Date().toLocaleTimeString()}</p>
      </div>

    </motion.div>
  );
}