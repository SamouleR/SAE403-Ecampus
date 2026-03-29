import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './StudentDashboard.css';

export default function StudentDashboard({ user, onLogout, API_URL }) {
  const [activeTab, setActiveTab] = useState('catalogue');
  const [saes, setSaes] = useState([]);
  const [annonces, setAnnonces] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  
  // Gère la SAE cliquée pour la vue détaillée (Bouton Voir le projet)
  const [selectedSae, setSelectedSae] = useState(null); 
  
  const [filterMatiere, setFilterMatiere] = useState('TOUTES');
  const [passwords, setPasswords] = useState({ newPass: '', confirmPass: '' });
  
  // États pour le rendu
  const [submissions, setSubmissions] = useState({});
  const [renderLink, setRenderLink] = useState("");
  const [tempFile, setTempFile] = useState(null); 

  const token = localStorage.getItem('token');

  // --- RÉCUPÉRATION DES DONNÉES ---
  
  const fetchAnnonces = useCallback(() => {
    fetch(`${API_URL}/api/annonces`, { headers: { 'Authorization': `Bearer ${token}` } })
    .then(res => res.json())
    .then(data => setAnnonces(Array.isArray(data) ? data : []))
    .catch(err => console.error("Erreur annonces:", err));
  }, [API_URL, token]);

  const fetchSaes = useCallback(() => {
    fetch(`${API_URL}/api/saes/publiques`, { headers: { 'Authorization': `Bearer ${token}` } })
    .then(res => res.json())
    .then(data => setSaes(Array.isArray(data) ? data : []))
    .catch(err => console.error("Erreur SAE:", err));
  }, [API_URL, token]);

  const fetchMySubmissions = useCallback(() => {
    fetch(`${API_URL}/api/etudiant/mes-rendus`, { headers: { 'Authorization': `Bearer ${token}` } })
    .then(res => res.json())
    .then(data => {
      const subsMap = {};
      if (Array.isArray(data)) {
        data.forEach(sub => {
          subsMap[sub.sae_id] = { 
            fileName: sub.fichier_rendu, 
            link: sub.lien_rendu, 
            date: sub.date_depot, 
            status: 'Remis pour évaluation',
            note: sub.note 
          };
        });
      }
      setSubmissions(subsMap);
    }).catch(err => console.error("Erreur rendus:", err));
  }, [API_URL, token]);

  useEffect(() => {
    fetchAnnonces();
    fetchSaes();
    fetchMySubmissions();
  }, [fetchAnnonces, fetchSaes, fetchMySubmissions]);

  // --- LOGIQUE DE RENDU ---
  const handleFileUpload = (saeId, e) => {
    if (e && e.target && e.target.files) {
      setTempFile(e.target.files[0]);
      return; 
    }

    if (!tempFile && !renderLink) {
      alert("Veuillez choisir un fichier ou ajouter un lien !");
      return;
    }

    const formData = new FormData();
    formData.append('sae_id', saeId);
    if (tempFile) formData.append('devoir', tempFile); 
    formData.append('lien', renderLink);

    fetch(`${API_URL}/api/etudiant/rendre`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    })
    .then(res => res.json())
    .then(data => {
      alert(data.message || "Travail envoyé avec succès !");
      setRenderLink("");
      setTempFile(null); 
      fetchMySubmissions(); 
    })
    .catch(err => alert("Erreur lors de l'envoi"));
  };

  // --- UTILITAIRES ---
  const changeTab = (tab) => {
    setActiveTab(tab);
    setSelectedSae(null);
    setTempFile(null);
  };

  const matieres = ['TOUTES', ...new Set(saes.map(s => s.ressource).filter(Boolean))];

  const formatDate = (dateString, withTime = false) => {
    if (!dateString) return "Non définie";
    const options = { 
        year: 'numeric', month: 'long', day: 'numeric', 
        ...(withTime && { hour: '2-digit', minute: '2-digit' }) 
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const getSaeStatus = (dateRendu, isSubmitted) => {
    if (isSubmitted) return { label: "Terminé", color: "green", urgency: 0 };
    if (!dateRendu) return { label: "À venir", color: "gray", urgency: 0 };

    const today = new Date();
    const limitDate = new Date(dateRendu);
    const diffHours = (limitDate - today) / (1000 * 60 * 60);

    if (diffHours < 0) return { label: "En retard", color: "red", urgency: 3 };
    if (diffHours <= 48) return { label: "URGENT", color: "orange", urgency: 2 }; 
    return { label: "En cours", color: "blue", urgency: 1 };
  };

  const getTimeRemaining = (dateRendu, sub) => {
    if (sub) return `Travail remis le ${formatDate(sub.date, true)}`;
    const today = new Date();
    const limit = new Date(dateRendu);
    const diffTime = limit - today;
    if (diffTime < 0) return "Délai passé";
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `Il reste ${diffDays} j et ${diffHours} h`;
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirmPass) return alert("Les mots de passe ne correspondent pas !");
    fetch(`${API_URL}/api/student/password`, {
      method: 'PUT', 
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, 
      body: JSON.stringify({ newPassword: passwords.newPass })
    }).then(res => res.json()).then(data => {
      alert(data.message); setPasswords({ newPass: '', confirmPass: '' });
    });
  };

  const filteredCatalogue = filterMatiere === 'TOUTES' ? saes : saes.filter(s => s.ressource === filterMatiere);
 
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
            <AnimatePresence>
              {showNotifs && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="notifs-panel">
                  <div className="notifs-scroll-area">
                    <h4 className="notif-section-title">Dernières Annonces</h4>
                    {annonces.length > 0 ? annonces.map(annonce => (
                        <div className="notif-item" key={annonce.id}>
                            <strong>{annonce.titre}</strong>
                            <p>{annonce.contenu}</p>
                        </div>
                    )) : <p className="no-notif">Aucune annonce.</p>}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="user-profile-pill">
            <div className="user-info-text">
              <span className="role-bold">{user.email}</span>
              <button onClick={onLogout}>DÉCONNEXION</button>
            </div>
          </div>
        </div>
      </header>

      <main className="student-content-centered">
        <AnimatePresence mode="wait">
          
          {activeTab === 'catalogue' && (
            <motion.div key="cat" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="tab-container">
              <div className="title-row">
                <h1 className="white-title-large">Catalogue des SAE</h1>
                <select value={filterMatiere} onChange={(e) => setFilterMatiere(e.target.value)} className="glass-select">
                  {matieres.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div className="sae-grid">
                {filteredCatalogue.map(sae => (
                  <div className="sae-glass-card clickable-card" key={sae.id}>
                    {sae.image ? <div className="sae-image-container" style={{backgroundImage: `url(${API_URL}${sae.image})`}}></div> : <div className="sae-image-placeholder">No Image</div>}
                    <div className="sae-card-content">
                      <span className="sae-ressource-badge">{sae.ressource}</span>
                      <h3 className="sae-title">{sae.titre}</h3>
                      <p className="sae-desc">{sae.description}</p>
                      <button 
                        className="btn-voir-projet" 
                        style={{width:'100%', padding:'10px', marginTop:'15px', borderRadius:'12px', background:'#4facfe', color:'#fff', border:'none', cursor:'pointer'}}
                        onClick={() => { setSelectedSae(sae); setActiveTab('sae'); }}
                      >
                        Voir le projet
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'sae' && (
            <motion.div key="sae" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="tab-container">
              {!selectedSae ? (
                <>
                  <h1 className="white-title-large">Mes SAE en cours</h1>
                  <div className="sae-grid">
                    {saes.filter(s => !submissions[s.id]).map(sae => {
                      const status = getSaeStatus(sae.date_rendu, false);
                      return (
                        <div className={`sae-glass-card clickable-card ${status.label === 'URGENT' ? 'urgent-pulse' : ''}`} key={sae.id} onClick={() => setSelectedSae(sae)}>
                            <div className="sae-card-badge-container">
                                <span className={`status-badge ${status.color}`}>{status.label}</span>
                            </div>
                            {sae.image && <div className="sae-image-container" style={{backgroundImage: `url(${API_URL}${sae.image})`}}></div>}
                            <div className="sae-card-content">
                                <h3 className="sae-title">{sae.titre}</h3>
                                <div className="deadline-timer">
                                    {status.label === 'URGENT' ? (
                                        <span className="text-orange">⚠️ Dépôt imminent !</span>
                                    ) : (
                                        <span>⏳ {getTimeRemaining(sae.date_rendu, null)}</span>
                                    )}
                                </div>
                                <div className="mini-progress-bar">
                                    <div className="fill" style={{ width: '10%' }}></div>
                                </div>
                            </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              ) : (
                <>
                  <button className="btn-back" onClick={() => setSelectedSae(null)}>← Retour à la liste</button>
                  <div className="submission-glass-card">
                    <div className="sub-header">
                      <div>
                        <h2 className="sub-title">ESPACE DE RENDU</h2>
                        <h3 className="sub-sae-name">{selectedSae.ressource} - {selectedSae.titre}</h3>
                      </div>
                      <div className="sub-dates-right">
                        <p>Limite : <strong>{formatDate(selectedSae.date_rendu, true)}</strong></p>
                      </div>
                    </div>
                    
                    <div className="sub-desc">
                      <p>{selectedSae.description}</p>
                      {selectedSae.pdf_link && <a href={`${API_URL}${selectedSae.pdf_link}`} target="_blank" rel="noreferrer" style={{color: '#00f2fe', textDecoration: 'underline'}}>Sujet complet (PDF)</a>}
                    </div>

                    <div className="render-inputs-zone">
                       <div className="input-group-blue">
                          <label>Lien externe (GitHub, Portfolio...) :</label>
                          <input 
                            type="text" 
                            placeholder="https://..." 
                            value={renderLink}
                            onChange={(e) => setRenderLink(e.target.value)}
                            className="glass-input-text"
                          />
                       </div>

                       <div className="sub-actions" style={{marginTop: '20px'}}>
                        <label className="btn-blue-outline sub-btn" style={{cursor: 'pointer'}}>
                          {tempFile ? `Fichier prêt : ${tempFile.name}` : (submissions[selectedSae.id] ? "Remplacer le fichier" : "Choisir un fichier")}
                          <input type="file" style={{display: 'none'}} onChange={(e) => handleFileUpload(selectedSae.id, e)} />
                        </label>
                        
                        {(renderLink || tempFile) && (
                           <button className="btn-blue-outline sub-btn" style={{background: '#fff', color: '#4facfe'}} onClick={() => handleFileUpload(selectedSae.id)}>
                             Valider le rendu
                           </button>
                        )}
                      </div>
                    </div>

                    <div className="status-table">
                      <div className="status-row"><span className="st-label">Statut</span><span className="st-value">{submissions[selectedSae.id] ? "✅ Travail remis" : "❌ Non remis"}</span></div>
                      <div className="status-row"><span className="st-label">Note</span><span className="st-value" style={{fontWeight:'bold', color:'#ffcc00'}}>{submissions[selectedSae.id]?.note !== null && submissions[selectedSae.id]?.note !== undefined ? `${submissions[selectedSae.id].note}/20` : "-"}</span></div>
                      <div className="status-row"><span className="st-label">Fichier enregistré</span><span className="st-value">{submissions[selectedSae.id]?.fileName ? submissions[selectedSae.id].fileName.split('-').pop() : "-"}</span></div>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {activeTab === 'profil' && (
            <motion.div key="prof" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="tab-container">
              <h1 className="white-title-large">Mon Profil</h1>
              <div className="sae-glass-card" style={{maxWidth: '500px', margin: '0 auto', padding: '40px'}}>
                <h3 style={{marginTop: 0, fontSize: '1.5rem'}}>Modifier mon mot de passe</h3>
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