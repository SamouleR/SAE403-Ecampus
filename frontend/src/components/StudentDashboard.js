import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './StudentDashboard.css';

/**
 * ==========================================================================
 * COMPOSANT : StudentDashboard (Version Ultimate - 650+ lignes)
 * ==========================================================================
 * Centre de contrôle étudiant pour Ecampus MMI Vélizy.
 * DA : Bordeaux (#a31d24) / Crème (#fff9f0).
 * Polices : Neulis Cursive & Neulis Alt.
 */
export default function StudentDashboard({ user, onLogout, API_URL }) {
  
  // --------------------------------------------------------------------------
  // --- 1. ÉTATS DE NAVIGATION ET UI ---
  // --------------------------------------------------------------------------
  const [activeTab, setActiveTab] = useState('catalogue');
  const [selectedSae, setSelectedSae] = useState(null);
  const [showNotifs, setShowNotifs] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState(null);
  const token = localStorage.getItem('token');

  // --------------------------------------------------------------------------
  // --- 2. ÉTATS DES DONNÉES (DB) ---
  // --------------------------------------------------------------------------
  const [saes, setSaes] = useState([]);
  const [annonces, setAnnonces] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [realisations, setRealisations] = useState([]);
  const [showGallery, setShowGallery] = useState(false);

  // --------------------------------------------------------------------------
  // --- 3. ÉTATS DE LA MESSAGERIE (STYLE WHATSAPP) ---
  // --------------------------------------------------------------------------
  const [messages, setMessages] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [nouveauMsg, setNouveauMsg] = useState("");
  const [searchContact, setSearchContact] = useState("");

  // --------------------------------------------------------------------------
  // --- 4. ÉTATS DES FORMULAIRES ET FILTRES ---
  // --------------------------------------------------------------------------
  const [renderLink, setRenderLink] = useState("");
  const [tempFile, setTempFile] = useState(null);
  const [passwords, setPasswords] = useState({ oldPass: '', newPass: '', confirmPass: '' });
  const [filterMatiere, setFilterMatiere] = useState('TOUTES');

  // --------------------------------------------------------------------------
  // --- 5. LOGIQUE DE RÉCUPÉRATION DES DONNÉES (FETCH) ---
  // --------------------------------------------------------------------------

  /**
   * Synchronisation globale des données de l'étudiant
   */
  const fetchAllStudentData = useCallback(async () => {
    setIsLoading(true);
    setGlobalError(null);
    const headers = { 
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json' 
    };

    try {
      console.log("[Ecampus] Synchronisation des flux en cours...");
      
      const [resSaes, resAnnonces, resRendus, resMessages, resContacts] = await Promise.all([
        fetch(`${API_URL}/api/saes/publiques`, { headers }),
        fetch(`${API_URL}/api/annonces`, { headers }),
        fetch(`${API_URL}/api/etudiant/mes-rendus`, { headers }),
        fetch(`${API_URL}/api/messages`, { headers }),
        fetch(`${API_URL}/api/users`, { headers })
      ]);

      if (!resSaes.ok || !resAnnonces.ok) {
        throw new Error("Erreur de connexion au serveur Ecampus.");
      }

      const dataSaes = await resSaes.json();
      const dataAnnonces = await resAnnonces.json();
      const dataMessages = await resMessages.json();
      const dataContacts = await resContacts.json();
      const dataRendus = await resRendus.json();

      setSaes(Array.isArray(dataSaes) ? dataSaes : []);
      setAnnonces(Array.isArray(dataAnnonces) ? dataAnnonces : []);
      setMessages(Array.isArray(dataMessages) ? dataMessages : []);
      setContacts(Array.isArray(dataContacts) ? dataContacts.filter(u => u.id !== user.id) : []);

      // Mapping des rendus pour accès rapide
      const subsMap = {};
      if (Array.isArray(dataRendus)) {
        dataRendus.forEach(sub => {
          subsMap[sub.sae_id] = {
            id: sub.id,
            fileName: sub.fichier_rendu,
            link: sub.lien_rendu,
            date: sub.date_depot,
            note: sub.note,
            feedback: sub.commentaire_prof
          };
        });
      }
      setSubmissions(subsMap);

    } catch (err) {
      console.error("Critical Sync Error:", err);
      setGlobalError("Impossible de charger vos données. Vérifiez votre connexion.");
    } finally {
      setIsLoading(false);
    }
  }, [API_URL, token, user.id]);

  useEffect(() => {
    fetchAllStudentData();
    const liveUpdate = setInterval(fetchAllStudentData, 60000); // Auto-refresh 60s
    return () => clearInterval(liveUpdate);
  }, [fetchAllStudentData]);

  // --------------------------------------------------------------------------
  // --- 6. LOGIQUE MÉTIER : CALCULS & FILTRES (CORRECTION DES UNDEFINED) ---
  // --------------------------------------------------------------------------

  // Statistiques de l'étudiant
  const studentStats = useMemo(() => {
    const rendusArray = Object.values(submissions);
    const notes = rendusArray.map(r => parseFloat(r.note)).filter(n => !isNaN(n));
    const moyenne = notes.length > 0 ? (notes.reduce((a, b) => a + b, 0) / notes.length).toFixed(2) : "N/A";
    
    return {
      moyenne,
      rendusCount: rendusArray.length,
      saeRestantes: saes.length - rendusArray.length
    };
  }, [submissions, saes]);

  // Gestion des notifications (CORRECTION : totalNotifsCount défini ici)
  const totalNotifsCount = useMemo(() => {
    const unreadMsgs = messages.filter(m => !m.lu && m.destinataire_id === user.id).length;
    return annonces.length + unreadMsgs;
  }, [annonces, messages, user.id]);

  // Liste des matières pour le filtre
  const matieresList = useMemo(() => {
    return ['TOUTES', ...new Set(saes.map(s => s.ressource).filter(Boolean))];
  }, [saes]);

  // Filtrage du catalogue (CORRECTION : filteredCatalogue défini ici)
  const filteredCatalogue = useMemo(() => {
    if (filterMatiere === 'TOUTES') return saes;
    return saes.filter(s => s.ressource === filterMatiere);
  }, [saes, filterMatiere]);

  // Messages du chat sélectionné
  const currentChatMessages = useMemo(() => {
    if (!selectedContact) return [];
    return messages.filter(m => 
      (m.expediteur_id === user.id && m.destinataire_id === selectedContact.id) ||
      (m.expediteur_id === selectedContact.id && m.destinataire_id === user.id)
    ).sort((a, b) => new Date(a.date_envoi) - new Date(b.date_envoi));
  }, [messages, selectedContact, user.id]);

  // --------------------------------------------------------------------------
  // --- 7. LOGIQUE MÉTIER : ACTIONS ---
  // --------------------------------------------------------------------------

  const handleFileUpload = async (saeId, e) => {
    if (e?.target?.files) {
      setTempFile(e.target.files[0]);
      return;
    }

    if (!tempFile && !renderLink) return alert("Veuillez joindre un fichier ou un lien GitHub/Portfolio.");

    const formData = new FormData();
    formData.append('sae_id', saeId);
    if (tempFile) formData.append('devoir', tempFile);
    if (renderLink) formData.append('lien', renderLink);

    try {
      const res = await fetch(`${API_URL}/api/etudiant/rendre`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        alert("Félicitations, votre travail a été déposé.");
        setRenderLink(""); setTempFile(null);
        fetchAllStudentData();
      }
    } catch (err) {
      alert("Erreur lors de l'envoi du rendu.");
    }
  };

  const envoyerMessage = async (e) => {
    e.preventDefault();
    if (!nouveauMsg.trim() || !selectedContact) return;

    try {
      const res = await fetch(`${API_URL}/api/messages/envoyer`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          destinataire_id: selectedContact.id, 
          contenu: nouveauMsg 
        })
      });
      if (res.ok) {
        setNouveauMsg("");
        fetchAllStudentData();
      }
    } catch (err) {
      console.error("Messagerie Error:", err);
    }
  };

  const openGallery = async (saeId) => {
    try {
      const res = await fetch(`${API_URL}/api/saes/${saeId}/realisations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setRealisations(await res.json());
      setShowGallery(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirmPass) return alert("Mots de passe non identiques.");
    
    try {
      const res = await fetch(`${API_URL}/api/student/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ newPassword: passwords.newPass })
      });
      if (res.ok) {
        alert("Sécurité mise à jour.");
        setPasswords({ oldPass: '', newPass: '', confirmPass: '' });
      }
    } catch (err) {
      alert("Erreur serveur.");
    }
  };

  // --------------------------------------------------------------------------
  // --- 8. UTILS DE RENDU ---
  // --------------------------------------------------------------------------

  const getSaeStatus = (dateRendu, isSubmitted) => {
    if (isSubmitted) return { label: "Terminé", color: "green", urgency: 0 };
    if (!dateRendu) return { label: "À venir", color: "gray", urgency: 0 };
    const diff = (new Date(dateRendu) - new Date()) / (1000 * 60 * 60);
    if (diff < 0) return { label: "En retard", color: "red", urgency: 3 };
    if (diff <= 48) return { label: "DÉPÔT URGENT", color: "orange", pulse: true };
    return { label: "En cours", color: "blue", urgency: 1 };
  };

  const formatDateLabel = (d) => {
    return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // --------------------------------------------------------------------------
  // --- 9. COMPOSANTS INTERNES ---
  // --------------------------------------------------------------------------

  const StudentHeader = () => (
    <header className="mmi-pill-header">
      <div className="nav-left" onClick={() => {setSelectedSae(null); setActiveTab('catalogue')}}>
        <img src="/ecampus.svg" alt="logo" className="mmi-logo-img" />
        <span className="brand-name cursive-font bordeaux-text">Ecampus</span>
      </div>

      <nav className="nav-center cursive-font">
        <button className={activeTab === 'catalogue' ? 'active' : ''} onClick={() => {setSelectedSae(null); setActiveTab('catalogue')}}>CATALOGUE</button>
        <button className={activeTab === 'sae' ? 'active' : ''} onClick={() => {setSelectedSae(null); setActiveTab('sae')}}>MES SAE</button>
        <button className={activeTab === 'messagerie' ? 'active' : ''} onClick={() => {setSelectedSae(null); setActiveTab('messagerie')}}>MESSAGERIE</button>
        <button className={activeTab === 'profil' ? 'active' : ''} onClick={() => {setSelectedSae(null); setActiveTab('profil')}}>MON PROFIL</button>
      </nav>

      <div className="nav-right">
        <div className="notif-bell" onClick={() => setShowNotifs(!showNotifs)}>
          🔔 {totalNotifsCount > 0 && <span className="mmi-badge">{totalNotifsCount}</span>}
          <AnimatePresence>
            {showNotifs && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mmi-notif-dropdown">
                <h4 className="cursive-font bordeaux-text">Flux d'annonces</h4>
                <div className="notif-scroll">
                  {annonces.length > 0 ? annonces.map(a => (
                    <div key={a.id} className="notif-item"><strong>{a.titre}</strong><p>{a.contenu}</p></div>
                  )) : <p className="empty-txt">Aucune annonce récente.</p>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="user-pill-small">
          <div className="info">
            <span className="name bordeaux-text">Étudiant</span>
            <button onClick={onLogout} className="logout cursive-font">Déconnexion</button>
          </div>
          <div className="avatar-circle">S</div>
        </div>
      </div>
    </header>
  );

  // --------------------------------------------------------------------------
  // --- 10. RENDU PRINCIPAL ---
  // --------------------------------------------------------------------------

  return (
    <div className="student-mmi-wrapper">
      <StudentHeader />

      <main className="student-main-stage">
        {isLoading && <div className="mmi-global-loader">Synchronisation pédagogique en cours...</div>}
        {globalError && <div className="mmi-error-banner">{globalError}</div>}

        <AnimatePresence mode="wait">

          {/* VUE 1 : CATALOGUE COMPLET AVEC IMAGES */}
          {activeTab === 'catalogue' && (
            <motion.div key="cat" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="stage">
              <div className="stage-header">
                <h1 className="cursive-font bordeaux-text stage-title">Catalogue des SAE</h1>
                <select className="mmi-select-pill" value={filterMatiere} onChange={(e) => setFilterMatiere(e.target.value)}>
                  {matieresList.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div className="mmi-grid">
                {filteredCatalogue.map(sae => (
                  <div key={sae.id} className="mmi-sae-card" onClick={() => { setSelectedSae(sae); setActiveTab('sae'); }}>
                    <div className="card-media" style={{backgroundImage: `url(${API_URL}${sae.image})`}}>
                      <span className="res-tag">{sae.ressource}</span>
                    </div>
                    <div className="card-body">
                      <h3 className="cursive-font">{sae.titre}</h3>
                      <p className="summary">{sae.description?.substring(0, 100)}...</p>
                      <button className="btn-bordeaux-pill">DÉCOUVRIR LE PROJET</button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* VUE 2 : MES SAE / RENDUS DÉTAILLÉS */}
          {activeTab === 'sae' && (
            <motion.div key="sae" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="stage">
              {!selectedSae ? (
                <>
                  <h2 className="cursive-font bordeaux-text stage-title">Mes SAE en cours</h2>
                  <div className="mmi-grid">
                    {saes.map(sae => {
                      const isRemis = !!submissions[sae.id];
                      const status = getSaeStatus(sae.date_rendu, isRemis);
                      return (
                        <div key={sae.id} className={`mmi-sae-card ${isRemis ? 'is-done' : 'is-pending'} ${status.pulse ? 'mmi-pulse' : ''}`} onClick={() => setSelectedSae(sae)}>
                          <div className="card-body">
                            <span className={`status-badge ${status.color}`}>{status.label}</span>
                            <h3 className="cursive-font">{sae.titre}</h3>
                            <p className="deadline">Limite : {formatDateLabel(sae.date_rendu)}</p>
                            <div className="mmi-progress-track">
                              <motion.div className="fill" initial={{ width: 0 }} animate={{ width: isRemis ? '100%' : '15%' }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="mmi-detail-box">
                  <button className="back-link cursive-font" onClick={() => setSelectedSae(null)}>← Retour à la liste</button>
                  <div className="mmi-glass-card detail-card">
                    <div className="detail-hero-img" style={{backgroundImage: `url(${API_URL}${selectedSae.image})`}}>
                       {submissions[selectedSae.id] && <div className="status-overlay">RENDU TERMINÉ</div>}
                    </div>
                    <div className="detail-header">
                       <h2 className="cursive-font bordeaux-text">{selectedSae.titre}</h2>
                       <button onClick={() => openGallery(selectedSae.id)} className="btn-vitrine-link">🌟 Vitrine de la promotion</button>
                    </div>
                    
                    <div className="detail-grid">
                      <div className="desc-side">
                        <p className="full-desc">{selectedSae.description}</p>
                        <div className="meta-box">
                          <strong>Échéance de remise :</strong> {formatDateLabel(selectedSae.date_rendu)}
                        </div>
                        {selectedSae.pdf_link && <a href={`${API_URL}${selectedSae.pdf_link}`} target="_blank" rel="noreferrer" className="mmi-btn-pdf">SUJET PDF</a>}
                      </div>
                      
                      <div className="render-side">
                        <h4 className="bordeaux-text">Espace de dépôt</h4>
                        <div className="mmi-input-group">
                          <label>Lien du projet (URL)</label>
                          <input type="text" className="mmi-pill-input" placeholder="GitHub, Figma, Portfolio..." value={renderLink} onChange={e => setRenderLink(e.target.value)} />
                        </div>
                        <label className="mmi-file-dropzone">
                          {tempFile ? `Fichier prêt : ${tempFile.name}` : "Cliquez pour joindre un fichier .zip"}
                          <input type="file" hidden onChange={e => handleFileUpload(selectedSae.id, e)} />
                        </label>
                        <button className="mmi-btn-black-pill full-width" onClick={() => handleFileUpload(selectedSae.id)}>
                          ENVOYER MON TRAVAIL
                        </button>
                        
                        {submissions[selectedSae.id] && (
                          <div className="submission-summary">
                            <p>✅ Enregistré le {new Date(submissions[selectedSae.id].date).toLocaleDateString()}</p>
                            {submissions[selectedSae.id].note && <div className="note-badge">NOTE : {submissions[selectedSae.id].note}/20</div>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* VUE 3 : MESSAGERIE WHATSAPP */}
          {activeTab === 'messagerie' && (
            <motion.div key="msg" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="stage">
              <div className="mmi-whatsapp-layout">
                <div className="sidebar-contacts">
                  <div className="search-wrap"><input type="text" placeholder="Rechercher un contact..." onChange={e => setSearchContact(e.target.value)} /></div>
                  <div className="contacts-list">
                    {contacts.filter(c => c.email.toLowerCase().includes(searchContact.toLowerCase())).map(c => (
                      <div key={c.id} className={`contact-pill ${selectedContact?.id === c.id ? 'active' : ''}`} onClick={() => setSelectedContact(c)}>
                        <div className="avatar-m">{c.email[0].toUpperCase()}</div>
                        <div className="txt"><strong>{c.email.split('@')[0]}</strong><p>En ligne</p></div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="chat-window">
                  {selectedContact ? (
                    <>
                      <div className="chat-header-bar cursive-font bordeaux-text">{selectedContact.email}</div>
                      <div className="chat-flow-container">
                        {currentChatMessages.map(m => (
                          <div key={m.id} className={`bubble-wrap ${m.expediteur_id === user.id ? 'me' : 'them'}`}>
                            <div className="bubble">
                              <p>{m.contenu}</p>
                              <span className="time">{new Date(m.date_envoi).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <form className="chat-input-bar" onSubmit={envoyerMessage}>
                        <input type="text" placeholder="Écrire un message..." value={nouveauMsg} onChange={e => setNouveauMsg(e.target.value)} />
                        <button type="submit">➤</button>
                      </form>
                    </>
                  ) : <div className="chat-placeholder">Sélectionnez une discussion pour démarrer.</div>}
                </div>
              </div>
            </motion.div>
          )}

          {/* VUE 4 : PROFIL PREMIUM AVEC STATS */}
          {activeTab === 'profil' && (
            <motion.div key="prof" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="stage">
              <div className="mmi-profile-container">
                <aside className="mmi-profile-sidebar">
                  <div className="avatar-xl-mmi">S</div>
                  <h2 className="cursive-font bordeaux-text">Mon Espace MMI</h2>
                  <p className="email-m">{user.email}</p>
                  <div className="stats-pills-wrap">
                    <div className="s-pill">Moyenne: <strong>{studentStats.moyenne}</strong></div>
                    <div className="s-pill">Rendus: <strong>{studentStats.rendusCount}</strong></div>
                  </div>
                  <button onClick={onLogout} className="btn-logout-mmi-premium">DÉCONNEXION</button>
                </aside>

                <section className="mmi-profile-content">
                  <div className="mmi-glass-card setting-section">
                    <h3 className="cursive-font bordeaux-text">Sécurité du compte</h3>
                    <form className="mmi-security-form" onSubmit={handleUpdatePassword}>
                      <div className="mmi-input-group">
                        <label>Code d'accès actuel</label>
                        <input type="password" placeholder="••••••••" className="mmi-pill-input" />
                      </div>
                      <div className="row-flex">
                        <div className="mmi-input-group flex-1">
                          <label>Nouveau mot de passe</label>
                          <input type="password" value={passwords.newPass} className="mmi-pill-input" onChange={e => setPasswords({...passwords, newPass: e.target.value})} />
                        </div>
                        <div className="mmi-input-group flex-1">
                          <label>Confirmer la clé</label>
                          <input type="password" value={passwords.confirmPass} className="mmi-pill-input" onChange={e => setPasswords({...passwords, confirmPass: e.target.value})} />
                        </div>
                      </div>
                      <button type="submit" className="mmi-btn-black-pill full-width">METTRE À JOUR MES ACCÈS</button>
                    </form>
                  </div>
                </section>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* MODALE VITRINE IMMERSIVE */}
      <AnimatePresence>
        {showGallery && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mmi-gallery-modal">
            <div className="gallery-inner">
              <div className="gallery-header">
                <h2 className="cursive-font bordeaux-text">🌟 Les "Pépites" de la Promotion</h2>
                <button onClick={() => setShowGallery(false)} className="btn-close-gallery">Fermer</button>
              </div>
              <div className="gallery-grid-mmi">
                {realisations.map(rel => (
                  <div key={rel.id} className="gallery-card-mmi">
                    <div className="user-meta">
                       <strong>{rel.email?.split('@')[0]}</strong>
                       <span>Le {new Date(rel.date_depot).toLocaleDateString()}</span>
                    </div>
                    <div className="action-links">
                      {rel.lien_rendu && <a href={rel.lien_rendu} target="_blank" rel="noreferrer" className="link-pill">Lien</a>}
                      {rel.fichier_rendu && <a href={`${API_URL}${rel.fichier_rendu}`} target="_blank" rel="noreferrer" className="link-pill file">Fichier</a>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}