import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './AdminDashboard.css';

export default function AdminDashboard({ user, onLogout }) {
  // Gestion des onglets : 'catalogue' (validation), 'sae' (création), 'etudiant' (ajout)
  const [activeTab, setActiveTab] = useState('catalogue');

  return (
    <div className="admin-layout">
      {/* --- HEADER (Bandeau Rouge) --- */}
      <header className="admin-header">
        <div className="header-left">
          <div className="logo-placeholder">LOGO</div>
        </div>
        
        <nav className="header-nav">
          <button className={activeTab === 'catalogue' ? 'active' : ''} onClick={() => setActiveTab('catalogue')}>Catalogue</button>
          <button className={activeTab === 'sae' ? 'active' : ''} onClick={() => setActiveTab('sae')}>SAE</button>
          <button className={activeTab === 'etudiant' ? 'active' : ''} onClick={() => setActiveTab('etudiant')}>Étudiant</button>
        </nav>

        <div className="header-right">
          <div className="user-profile">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <div className="user-info">
              <span className="user-role">Administrateur</span>
              <button onClick={onLogout} className="logout-btn">FERMER LA SESSION</button>
            </div>
          </div>
        </div>
      </header>

      {/* --- CONTENU PRINCIPAL --- */}
      <main className="admin-content">
        <h1 className="page-title">Administrateur</h1>

        <AnimatePresence mode="wait">
          
          {/* VUE 1 : CATALOGUE (Validations - image_669528) */}
          {activeTab === 'catalogue' && (
            <motion.div key="catalogue" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="tab-container">
              
              <div className="validation-section">
                <div className="validation-card">
                  <div className="table-header">
                    <span>Projet</span>
                    <span>Enseignant</span>
                    <span>Action</span>
                  </div>
                  <div className="table-row">
                    <span className="text-red">SAE 302 UX/UI</span>
                    <span className="text-red">Mr Ben Amor</span>
                    <div className="action-btns">
                      <button className="btn-valider">VALIDER</button>
                      <button className="btn-refuser">REFUSE</button>
                    </div>
                  </div>
                </div>
                <span className="section-label">Publication SAE</span>
              </div>

              <div className="validation-section">
                <div className="validation-card">
                  <div className="table-header">
                    <span>Nom complet</span>
                    <span>Mot de passe</span>
                    <span>Module/SAE</span>
                  </div>
                  <div className="table-row">
                    <span className="text-red">Samuel RALAIKOA</span>
                    <span className="text-red link">changer le mdp</span>
                    <span className="text-red">TOUS</span>
                  </div>
                  <div className="table-row">
                    <span className="text-red">Jayson BELLEVAL</span>
                    <span className="text-red link">changer le mdp</span>
                    <span className="text-red">TOUS</span>
                  </div>
                </div>
                <span className="section-label">Inscription élèves</span>
              </div>

            </motion.div>
          )}

          {/* VUE 2 : SAE (Création - image_669229) */}
          {activeTab === 'sae' && (
            <motion.div key="sae" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="tab-container">
              <div className="ui-card create-sae-card">
                <h2>Créer une SAE</h2>
                <form className="sae-form-grid">
                  <div className="col-left">
                    <div className="form-group">
                      <label>Titre de la SAE</label>
                      <input type="text" />
                    </div>
                    <div className="form-group">
                      <label>Ressource concerné</label>
                      <input type="text" />
                    </div>
                    <div className="form-group">
                      <label>Image source</label>
                      <input type="text" />
                    </div>
                    <div className="form-group">
                      <label>Date de rendu :</label>
                      <div className="input-with-icon">
                        <span>📅</span>
                        <input type="text" defaultValue="15-Janvier-2025" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-right">
                    <div className="form-group">
                      <label>Ressources PDF</label>
                      <input type="text" />
                    </div>
                    <div className="form-group">
                      <label>Descriptions techniques</label>
                      <textarea rows="6"></textarea>
                    </div>
                    <button type="submit" className="btn-submit-red align-right">Proposer la validation à l'admin</button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {/* VUE 3 : ÉTUDIANT (Ajout - image_669509) */}
          {activeTab === 'etudiant' && (
            <motion.div key="etudiant" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="tab-container two-cards-layout">
              
              <div className="ui-card">
                <h2>Rajouter un étudiant</h2>
                <form className="student-form">
                  <div className="form-group">
                    <label><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> Identifiant de l'étudiant</label>
                    <input type="text" />
                  </div>
                  <div className="form-group">
                    <label><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path></svg> Mot de passe de l'étudiant</label>
                    <input type="password" />
                  </div>
                  <button type="submit" className="btn-submit-red centered">Inscrire pour approbation</button>
                </form>
              </div>

              <div className="ui-card">
                <h2>Rajouter un étudiant dans un module ou SAE</h2>
                <form className="student-form">
                  <div className="form-group">
                    <label><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> Identifiant de l'étudiant</label>
                    <input type="text" />
                  </div>
                  <div className="form-group">
                    <label><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg> Ressource concerné</label>
                    <input type="text" />
                  </div>
                  <button type="submit" className="btn-submit-red centered">Rajouter l'élève</button>
                </form>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}