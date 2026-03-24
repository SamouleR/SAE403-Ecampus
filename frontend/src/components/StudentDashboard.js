import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './StudentDashboard.css';

export default function StudentDashboard({ user, onLogout, API_URL }) {
  const [activeTab, setActiveTab] = useState('catalogue');
  const [saes, setSaes] = useState([]);
  const [annonces, setAnnonces] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  
  // Gère la SAE cliquée pour la vue détaillée
  const [selectedSae, setSelectedSae] = useState(null); 
  
  const [filterMatiere, setFilterMatiere] = useState('TOUTES');
  const [passwords, setPasswords] = useState({ newPass: '', confirmPass: '' });
  const [submissions, setSubmissions] = useState({});

  const token = localStorage.getItem('token');

  const fetchAnnonces = useCallback(() => {
    fetch(`${API_URL}/api/annonces`, { headers: { 'Authorization': `Bearer ${token}` } })
    .then(res => res.json()).then(data => setAnnonces(Array.isArray(data) ? data : []));
  }, [API_URL, token]);

  const fetchSaes = useCallback(() => {
    fetch(`${API_URL}/api/saes/publiques`, { headers: { 'Authorization': `Bearer ${token}` } })
    .then(res => res.json()).then(data => setSaes(Array.isArray(data) ? data : []));
  }, [API_URL, token]);

  useEffect(() => {
    fetchAnnonces();
    fetchSaes();
  }, [fetchAnnonces, fetchSaes]);

  // Réinitialiser la vue détaillée si on change d'onglet
  const changeTab = (tab) => {
    setActiveTab(tab);
    setSelectedSae(null);
  };

  const matieres = ['TOUTES', ...new Set(saes.map(s => s.ressource).filter(Boolean))];

  const formatDate = (dateString, withTime = false) => {
    if (!dateString) return "Non définie";
    const options = { year: 'numeric', month: 'long', day: 'numeric', ...(withTime && { hour: '2-digit', minute: '2-digit' }) };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const getSaeStatus = (dateRendu) => {
    if (!dateRendu) return { label: "En cours", color: "yellow" };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const limitDate = new Date(dateRendu);
    if (limitDate < today) return { label: "En retard", color: "red" };
    return { label: "En cours", color: "yellow" };
  };

  const getTimeRemaining = (dateRendu, sub) => {
    if (sub) return `Travail remis le ${formatDate(sub.date, true)}`;
    const today = new Date();
    const limit = new Date(dateRendu);
    const diffTime = limit - today;
    if (diffTime < 0) return "Délai dépassé";
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `Il reste ${diffDays} jours et ${diffHours} h`;
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirmPass) return alert("Les mots de passe ne correspondent pas !");
    fetch(`${API_URL}/api/student/password`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ newPassword: passwords.newPass })
    }).then(res => res.json()).then(data => {
      alert(data.message); setPasswords({ newPass: '', confirmPass: '' });
    });
  };

  const handleFileUpload = (saeId, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('rendu', file);
    
    fetch(`${API_URL}/api/student/submit/${saeId}`, {
      method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData
    })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
      setSubmissions(prev => ({ ...prev, [saeId]: { fileName: file.name, date: new Date(), status: 'Remis pour évaluation' } }));
    });
  };

  const handleDeleteSubmission = (saeId) => {
    if(window.confirm("Êtes-vous sûr de vouloir supprimer votre travail ?")) {
      setSubmissions(prev => { const newSubs = {...prev}; delete newSubs[saeId]; return newSubs; });
    }
  };

  const filteredCatalogue = filterMatiere === 'TOUTES' ? saes : saes.filter(s => s.ressource === filterMatiere);
  const saesEnCours = saes.filter(s => getSaeStatus(s.date_rendu).color === 'yellow');

  return (
    <div className="student-blue-layout">
      
      <header className="pill-header">
        <nav className="header-nav-white">
          <div className="header-logo-text" style={{marginRight: '20px'}}>ECAMPUS</div>
          <button className={activeTab === 'catalogue' ? 'active' : ''} onClick={() => changeTab('catalogue')}>Catalogue</button>
          <button className={activeTab === 'sae' ? 'active' : ''} onClick={() => changeTab('sae')}>SAE (En cours)</button>
          <button className={activeTab === 'profil' ? 'active' : ''} onClick={() => changeTab('profil')}>Profil</button>
        </nav>

        <div className="header-actions">
          <div className="notification-wrapper">
            <span className="bell-icon" onClick={() => setShowNotifs(!showNotifs)}>🔔</span>
            {(annonces.length > 0 || saes.length > 0) && <span className="badge">{annonces.length + saes.length}</span>}
            <AnimatePresence>
              {showNotifs && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="notifs-panel">
                  <div className="notifs-scroll-area">
                    <h4 className="notif-section-title">Suivi des rendus</h4>
                    {saes.map(sae => {
                      const status = submissions[sae.id] ? {label: "Rendu", color: "green"} : getSaeStatus(sae.date_rendu);
                      return (
                        <div className="notif-item" key={`suivi-${sae.id}`} onClick={() => {changeTab('sae'); setSelectedSae(sae); setShowNotifs(false);}} style={{cursor:'pointer'}}>
                          <div className="notif-header">
                            <div className="status-indicator">
                              <span className={`status-square ${status.color}`}></span>
                              <strong>{status.label}: {sae.titre}</strong>
                            </div>
                          </div>
                          <div className="notif-footer"><span className="notif-time">Limite : {formatDate(sae.date_rendu)}</span></div>
                        </div>
                      )
                    })}
                    <h4 className="notif-section-title" style={{marginTop: '20px'}}>Annonces</h4>
                    {annonces.map(a => (
                      <div key={`annonce-${a.id}`} className="notif-item annonce-style">
                        <div className="notif-header"><strong>📢 {a.titre}</strong></div>
                        <p className="annonce-desc">{a.contenu}</p>
                        <div className="notif-footer"><span className="notif-time">{formatDate(a.date_creation)}</span></div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="user-profile-pill">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            <div className="user-info-text">
              <span className="role-bold">{user.email}</span>
              <button onClick={onLogout}>DÉCONNEXION</button>
            </div>
          </div>
        </div>
      </header>

      <main className="student-content-centered">
        <AnimatePresence mode="wait">
          
          {/* ONGLET 1 : CATALOGUE COMPLET AVEC FILTRES */}
          {activeTab === 'catalogue' && (
            <motion.div key="cat" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="tab-container">
              <div className="title-row">
                <div>
                  <h1 className="white-title-large">Catalogue des SAE</h1>
                  <p className="white-subtitle">Tous les projets publiés.</p>
                </div>
                <div className="filter-container">
                  <label>Filtrer par matière :</label>
                  <select value={filterMatiere} onChange={(e) => setFilterMatiere(e.target.value)} className="glass-select">
                    {matieres.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              <div className="sae-grid">
                {filteredCatalogue.length === 0 ? <p className="no-data-text">Aucune SAE pour cette matière.</p> : 
                  filteredCatalogue.map(sae => (
                    <div className="sae-glass-card clickable-card" key={sae.id} onClick={() => { changeTab('sae'); setSelectedSae(sae); }}>
                      {sae.image ? <div className="sae-image-container" style={{backgroundImage: `url(${API_URL}${sae.image})`}}></div> : <div className="sae-image-placeholder">Pas d'image</div>}
                      <div className="sae-card-content">
                        <span className="sae-ressource-badge">{sae.ressource}</span>
                        <h3 className="sae-title">{sae.titre}</h3>
                        <p className="sae-desc">{sae.description}</p>
                        <div className="sae-footer">
                          <div className="sae-date">📅 À rendre le : {formatDate(sae.date_rendu)}</div>
                          <span className="btn-download-pdf">Ouvrir pour Rendre →</span>
                        </div>
                      </div>
                    </div>
                  ))
                }
              </div>
            </motion.div>
          )}

          {/* ONGLET 2 : SAE (EN COURS) - GRILLE OU VUE DÉTAILLÉE */}
          {activeTab === 'sae' && (
            <motion.div key="sae" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="tab-container">
              
              {!selectedSae ? (
                /* --- VUE GRILLE --- */
                <>
                  <h1 className="white-title-large">Mes SAE en cours</h1>
                  <p className="white-subtitle">Cliquez sur une SAE pour déposer votre travail.</p>
                  <div className="sae-grid">
                    {saesEnCours.length === 0 ? <p className="no-data-text">Vous n'avez aucune SAE en cours.</p> : 
                      saesEnCours.map(sae => (
                        <div className="sae-glass-card clickable-card" key={sae.id} onClick={() => setSelectedSae(sae)}>
                          {sae.image ? <div className="sae-image-container" style={{backgroundImage: `url(${API_URL}${sae.image})`}}></div> : <div className="sae-image-placeholder">Pas d'image</div>}
                          <div className="sae-card-content">
                            <span className="sae-ressource-badge" style={{background: '#ffcc00', color: 'black'}}>En cours</span>
                            <h3 className="sae-title">{sae.titre}</h3>
                            <div className="sae-footer">
                              <div className="sae-date">⏳ {getTimeRemaining(sae.date_rendu, submissions[sae.id])}</div>
                              <span className="btn-blue-outline" style={{textAlign:'center', padding:'8px', display:'block', marginTop:'10px'}}>Déposer le fichier</span>
                            </div>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </>
              ) : (
                /* --- VUE DÉTAILLÉE DU RENDU --- */
                <>
                  <button className="btn-back" onClick={() => setSelectedSae(null)}>← Retour à la liste</button>
                  <div className="submission-glass-card">
                    <div className="sub-header">
                      <div>
                        <h2 className="sub-title">ÉTUDIANTE</h2>
                        <h3 className="sub-sae-name">Rendu {selectedSae.ressource} - {selectedSae.titre}</h3>
                      </div>
                      <div className="sub-dates-right">
                        <p>A rendre le : <strong>{formatDate(selectedSae.date_rendu, true)}</strong></p>
                      </div>
                    </div>
                    
                    <div className="sub-desc">
                      <p>{selectedSae.description}</p>
                      {selectedSae.pdf_link && <a href={`${API_URL}${selectedSae.pdf_link}`} target="_blank" rel="noreferrer" style={{color: '#00f2fe', textDecoration: 'underline'}}>Voir le sujet détaillé (PDF)</a>}
                    </div>

                    <div className="sub-actions">
                      <label className="btn-blue-outline sub-btn">
                        {submissions[selectedSae.id] ? "Modifier le travail" : "Déposer un travail"}
                        <input type="file" style={{display: 'none'}} onChange={(e) => handleFileUpload(selectedSae.id, e)} />
                      </label>
                      {submissions[selectedSae.id] && <button className="btn-red-outline sub-btn" onClick={() => handleDeleteSubmission(selectedSae.id)}>Supprimer travail remis</button>}
                    </div>

                    <div className="status-table">
                      <div className="status-row"><span className="st-label">Statut de remise</span><span className="st-value">{submissions[selectedSae.id] ? submissions[selectedSae.id].status : "Aucun travail remis"}</span></div>
                      <div className="status-row"><span className="st-label">Temps restant</span><span className="st-value">{getTimeRemaining(selectedSae.date_rendu, submissions[selectedSae.id])}</span></div>
                      <div className="status-row"><span className="st-label">Dernière modification</span><span className="st-value">{submissions[selectedSae.id] ? formatDate(submissions[selectedSae.id].date, true) : "-"}</span></div>
                      <div className="status-row"><span className="st-label">Remises de fichiers</span><span className="st-value" style={{fontWeight: 'bold'}}>{submissions[selectedSae.id] ? submissions[selectedSae.id].fileName : "-"}</span></div>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* ONGLET 3 : PROFIL */}
          {activeTab === 'profil' && (
            <motion.div key="prof" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="tab-container">
              <h1 className="white-title-large">Mon Profil</h1>
              <p className="white-subtitle">Modifiez vos informations personnelles.</p>
              
              <div className="sae-glass-card" style={{maxWidth: '500px', margin: '0 auto', padding: '40px'}}>
                <h3 style={{marginTop: 0, fontSize: '1.5rem'}}>Changer mon mot de passe</h3>
                <form onSubmit={handleUpdatePassword}>
                  <div className="input-group-blue" style={{marginBottom: '20px'}}>
                    <label>Nouveau mot de passe :</label>
                    <input type="password" value={passwords.newPass} onChange={e => setPasswords({...passwords, newPass: e.target.value})} required />
                  </div>
                  <div className="input-group-blue">
                    <label>Confirmer le mot de passe :</label>
                    <input type="password" value={passwords.confirmPass} onChange={e => setPasswords({...passwords, confirmPass: e.target.value})} required />
                  </div>
                  <button type="submit" className="btn-blue-outline" style={{width: '100%', marginTop: '30px'}}>METTRE À JOUR</button>
                </form>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}