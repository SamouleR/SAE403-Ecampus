import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import './WelcomeAnimation.css';

export default function WelcomeAnimation({ user, onFinished }) {
  
  // Personnalisation du texte selon le rôle en BDD
  const getRoleTitle = (role) => {
    if (role === 'admin') return 'Administrateur';
    if (role === 'professeur' || role === 'enseignant') return 'Enseignant';
    return 'Étudiant';
  };

  // Timer pour masquer l'animation automatiquement
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinished(); 
    }, 3500);
    return () => clearTimeout(timer);
  }, [onFinished]);

  return (
    <motion.div 
      className="welcome-overlay"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ delay: 3, duration: 0.5 }}
    >
      <motion.div 
        className="welcome-content"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="welcome-avatar-circle">
          {user.email[0].toUpperCase()}
        </div>
        
        <div className="welcome-text-block">
          <h1 className="welcome-title">
            Bonjour <span className="user-highlight">{user.email.split('@')[0]}</span>,
          </h1>
          <p className="welcome-subtitle">
            Bienvenue sur votre vue <strong className="role-text">{getRoleTitle(user.role)}</strong> !
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}