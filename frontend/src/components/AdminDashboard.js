import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Détecte l'URL de l'API (Codespaces)
const API_URL = window.location.origin.replace('-3000', '-8000').replace(/\/$/, "");

export default function AdminDashboard({ user, onLogout }) {
  const [tab, setTab] = useState('moderation'); // 'moderation' ou 'create'
  const [pendingSaes, setPendingSaes] = useState([]);
  const [newUser, setNewUser] = useState({ nom: '', email: '', password: '', role: 'ROLE_STUDENT' });

  // Charger les données de modération
  useEffect(() => {
    if (tab === 'moderation') {
      fetch(`${API_URL}/api/admin/pending-saes`)
        .then(res => res.ok ? res.json() : [])
        .then(data => {
          // Sécurité anti-crash : on s'assure que data est bien un tableau
          setPendingSaes(Array.isArray(data) ? data : []);
        })
        .catch(err => {
          console.error("Erreur API:", err);
          setPendingSaes([]);
        });
    }
  }, [tab]);

  // Action : Valider ou Rejeter une SAE
  const handleModerate = (id, action) => {
    fetch(`${API_URL}/api/admin/moderate-sae`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action })
    }).then(() => {
      setPendingSaes(prev => prev.filter(s => s.id !== id));
    });
  };

  // Action : Créer un nouvel utilisateur
  const handleCreateUser = (e) => {
    e.preventDefault();
    fetch(`${API_URL}/api/admin/add-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    })
    .then(res => res.ok ? alert("✅ Utilisateur créé !") : alert("❌ Erreur"));
  };

  return (
    <div className="admin-root">
      {/* BARRE DE NAVIGATION HAUTE */}
      <nav className="admin-top-nav">
        <div className="admin-logo">MMI HUB <span className="tag">ADMIN</span></div>
        <div className="nav-buttons">
          <button className={tab === 'moderation' ? 'active' : ''} onClick={() => setTab('moderation')}>Modération</button>
          <button className={tab === 'create' ? 'active' : ''} onClick={() => setTab('create')}>Créer un compte</button>
          <button onClick={onLogout} className="btn-logout">Quitter</button>
        </div>
      </nav>

      <motion.main 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }}
        className="admin-main-content"
      >
        {tab === 'moderation' ? (
          <div className="moderation-view">
            {/* BLOC PUBLICATIONS SAE (Inspiration image_7826c6) */}
            <div className="bw-card">
              <h3 className="card-label">FILES DE PUBLICATIONS SAE ({pendingSaes.length})</h3>
              <div className="table-wrapper">
                <table className="bw-table">
                  <thead>
                    <tr>
                      <th>PROJET</th>
                      <th>ENSEIGNANT</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingSaes.length > 0 ? pendingSaes.map(sae => (
                      <tr key={sae.id}>
                        <td>{sae.titre}</td>
                        <td>{sae.enseignant || "Non assigné"}</td>
                        <td className="actions-cell">
                          <button className="btn-v" onClick={() => handleModerate(sae.id, 'VALIDATED')}>VALIDER</button>
                          <button className="btn-r" onClick={() => handleModerate(sae.id, 'REJECTED')}>REJETER</button>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan="3" className="empty-row">AUCUNE PUBLICATION EN ATTENTE.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* BLOC INSCRIPTIONS */}
            <div className="bw-card mt-20">
              <h3 className="card-label">FILES D'INSCRIPTIONS @ECAMPUS (0)</h3>
              <p className="empty-row">AUCUN COMPTE ÉTUDIANT EN ATTENTE.</p>
            </div>
          </div>
        ) : (
          /* VUE CRÉATION DE COMPTE */
          <div className="create-view">
            <div className="bw-card mini">
              <h3 className="card-label">INITIALISER UN COMPTE</h3>
              <form className="create-form" onSubmit={handleCreateUser}>
                <div className="input-group">
                  <label>Nom complet</label>
                  <input type="text" placeholder="ex: Samuel R." onChange={e => setNewUser({...newUser, nom: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>Email institutionnel</label>
                  <input type="email" placeholder="... @ecampus.fr" onChange={e => setNewUser({...newUser, email: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>Mot de passe provisoire</label>
                  <input type="password" onChange={e => setNewUser({...newUser, password: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>Rôle système</label>
                  <select onChange={e => setNewUser({...newUser, role: e.target.value})}>
                    <option value="ROLE_STUDENT">Étudiant</option>
                    <option value="ROLE_TEACHER">Enseignant</option>
                  </select>
                </div>
                <button type="submit" className="btn-submit-black">Valider la création</button>
              </form>
            </div>
          </div>
        )}
      </motion.main>
    </div>
  );
}