import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './TeacherDashboard.css';

/**
 * COMPOSANT : TeacherDashboard
 * Rôle : Interface de gestion pédagogique avancée.
 * Style : Bordeaux (#a31d24) / Crème (#fff9f0) / Neulis Cursive
 */
export default function TeacherDashboard({ user, onLogout, API_URL }) {

  // --- ÉTATS POUR L'ÉDITION ---
  const [isEditing, setIsEditing] = useState(false);
  const [currentSaeId, setCurrentSaeId] = useState(null);
  
  // --- ÉTATS DE NAVIGATION ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedSae, setSelectedSae] = useState(null); 
  const [isManageMenuOpen, setIsManageMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showNotifs, setShowNotifs] = useState(false);

  // --- ÉTATS DES DONNÉES ---
  const [saes, setSaes] = useState([]);
  const [rendus, setRendus] = useState([]);
  const [annonces, setAnnonces] = useState([]);
  const token = localStorage.getItem('token');

  // --- ÉTATS DE LA MESSAGERIE ---
  const [messages, setMessages] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [nouveauMsg, setNouveauMsg] = useState("");
  const [searchContact, setSearchContact] = useState("");

  // --- ÉTATS ANNONCES ---
  const [annonceForm, setAnnonceForm] = useState({ titre: '', contenu: '', cible: 'Tous' });
  const [editingAnnonce, setEditingAnnonce] = useState(null);
  const [showAnnonceForm, setShowAnnonceForm] = useState(false);

  // --- ÉTATS DU PROFIL ---
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileInfo, setProfileInfo] = useState({
    nom: "PROFESSEUR MMI",
    bio: "Responsable des enseignements en développement web et nouveaux médias.",
    bureau: "Aile B - Bureau 102",
    tel: "01 39 25 XX XX",
    dispo: "Mardi & Jeudi après-midi"
  });
  const [pwdForm, setPwdForm] = useState({ old: '', new: '', confirm: '' });

  // --- ÉTATS FORMULAIRE SAE ---
  const [saeForm, setSaeForm] = useState({ 
    titre: '', ressource: 'Développement Web', date: '', 
    desc: '', promotion: '2026', semestre: 'S1' 
  });
  const [imageFile, setImageFile] = useState(null);
  const [consigneFile, setConsigneFile] = useState(null);
  const [existingConsigne, setExistingConsigne] = useState(null);

  // --- ÉTATS POUR LA NOTATION AVEC CARROUSEL ---
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentRendus, setStudentRendus] = useState([]);
  const [showStudentModal, setShowStudentModal] = useState(false);

  // --- RÉCUPÉRATION DES DONNÉES ---
  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const headers = { 'Authorization': `Bearer ${token}` };
    try {
      const [resSaes, resRendus, resAnnonces, resMessages, resContacts] = await Promise.all([
        fetch(`${API_URL}/api/admin/all-saes`, { headers }),
        fetch(`${API_URL}/api/admin/rendus-details`, { headers }),
        fetch(`${API_URL}/api/annonces`, { headers }),
        fetch(`${API_URL}/api/messages`, { headers }),
        fetch(`${API_URL}/api/users`, { headers })
      ]);
      
      const dataSaes = await resSaes.json();
      const dataRendus = await resRendus.json();
      const dataAnnonces = await resAnnonces.json();
      const dataMessages = await resMessages.json();
      const dataContacts = await resContacts.json();

      setSaes(Array.isArray(dataSaes) ? dataSaes : []);
      setRendus(Array.isArray(dataRendus) ? dataRendus : []);
      setAnnonces(Array.isArray(dataAnnonces) ? dataAnnonces : []);
      setMessages(Array.isArray(dataMessages) ? dataMessages : []);
      setContacts(Array.isArray(dataContacts) ? dataContacts.filter(u => u.id !== user?.id) : []);
    } catch (err) {
      console.error("Erreur de chargement des données pédagogiques:", err);
    } finally {
      setLoading(false);
    }
  }, [API_URL, token, user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- GESTION DES MESSAGES ---
  const currentChatMessages = useMemo(() => {
    if (!selectedContact || !user) return [];
    return messages.filter(m => 
      (m.expediteur_id === user.id && m.destinataire_id === selectedContact.id) ||
      (m.expediteur_id === selectedContact.id && m.destinataire_id === user.id)
    ).sort((a, b) => new Date(a.date_envoi) - new Date(b.date_envoi));
  }, [messages, selectedContact, user]);

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
        fetchData();
      }
    } catch (err) {
      console.error("Messagerie Error:", err);
    }
  };

  // --- GESTION DES ANNONCES ---
  const handlePostAnnonce = async (e) => {
    e.preventDefault();
    const method = editingAnnonce ? 'PUT' : 'POST';
    const url = editingAnnonce ? `${API_URL}/api/annonces/${editingAnnonce.id}` : `${API_URL}/api/annonces`;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(annonceForm)
      });

      if (!res.ok) {
        const errorText = await res.text();
        alert(`Erreur API : ${res.status} ${errorText}`);
        return;
      }

      alert(editingAnnonce ? 'Annonce mise à jour.' : 'Annonce publiée.');
      setAnnonceForm({ titre: '', contenu: '', cible: 'Tous' });
      setEditingAnnonce(null);
      setShowAnnonceForm(false);
      await fetchData();
    } catch (err) {
      console.error('handlePostAnnonce', err);
      alert('Erreur réseau lors de l’envoi de l’annonce.');
    }
  };

  const deleteAnnonce = async (id) => {
    if (!window.confirm("Supprimer l'annonce ?")) return;
    try {
      const res = await fetch(`${API_URL}/api/annonces/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        alert(`Impossible de supprimer l'annonce`);
        return;
      }
      alert('Annonce supprimée.');
      fetchData();
    } catch (err) {
      console.error('deleteAnnonce', err);
      alert('Erreur réseau lors de la suppression.');
    }
  };

  // --- FONCTION POUR VOIR LES DÉTAILS D'UN ÉTUDIANT ---
  const viewStudentDetails = async (studentEmail) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/student-rendus/${encodeURIComponent(studentEmail)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      
      const data = await res.json();
      setStudentRendus(Array.isArray(data) ? data : []);
      setSelectedStudent(studentEmail);
      setShowStudentModal(true);
    } catch (err) {
      console.error("Erreur chargement détails étudiant:", err);
      alert("Erreur lors du chargement des travaux de l'étudiant");
      setStudentRendus([]);
      setSelectedStudent(studentEmail);
      setShowStudentModal(true);
    }
  };

  // --- FONCTION UNIQUE POUR LA CRÉATION ET LA MODIFICATION ---
  const handleSubmitSae = async (e) => {
    e.preventDefault();
    
    if (!saeForm.titre || !saeForm.desc || !saeForm.date) {
      alert("Veuillez remplir tous les champs obligatoires (titre, description, date)");
      return;
    }

    const formData = new FormData();
    Object.keys(saeForm).forEach(key => formData.append(key, saeForm[key]));
    if (imageFile) formData.append('image', imageFile);
    if (consigneFile) formData.append('consigne', consigneFile);

    const url = isEditing ? `${API_URL}/api/admin/saes/${currentSaeId}` : `${API_URL}/api/admin/saes`;
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, { 
        method: method, 
        headers: { 'Authorization': `Bearer ${token}` }, 
        body: formData 
      });
      
      if (res.ok) {
        alert(isEditing ? "SAE mise à jour avec succès !" : "Nouvelle SAE publiée !");
        setIsEditing(false);
        setCurrentSaeId(null);
        setSaeForm({ titre: '', ressource: 'Développement Web', date: '', desc: '', promotion: '2026', semestre: 'S1' });
        setImageFile(null);
        setConsigneFile(null);
        setExistingConsigne(null);
        fetchData();
        setActiveTab('catalogue');
      } else {
        const error = await res.json();
        alert(`Erreur: ${error.message || "Une erreur est survenue"}`);
      }
    } catch (err) { 
      console.error("Erreur envoi:", err);
      alert("Erreur de connexion au serveur");
    }
  };

  // --- FONCTION : SUPPRIMER UNE SAE ---
  const handleDeleteSae = async (saeId) => {
    if (!window.confirm("Voulez-vous vraiment supprimer définitivement cette SAE ?")) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/saes/${saeId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert("SAE supprimée.");
        fetchData();
      }
    } catch (err) { 
      console.error("Erreur suppression:", err);
      alert("Erreur lors de la suppression");
    }
  };

  // --- FONCTION : PRÉPARER LA MODIFICATION ---
  const startEditing = (sae) => {
    setIsEditing(true);
    setCurrentSaeId(sae.id);
    setSaeForm({
      titre: sae.titre,
      ressource: sae.ressource,
      date: sae.date_rendu ? sae.date_rendu.split('T')[0] : '',
      desc: sae.description,
      promotion: sae.promotion,
      semestre: sae.semestre
    });
    setExistingConsigne(sae.consigne_url || null);
    setActiveTab('projets');
  };

  // --- FONCTION : SUPPRIMER LA CONSIGNE ---
  const handleDeleteConsigne = async () => {
    if (!window.confirm("Voulez-vous supprimer ce document consigne ?")) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/saes/${currentSaeId}/consigne`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert("Consigne supprimée avec succès !");
        setExistingConsigne(null);
        setConsigneFile(null);
        fetchData();
      }
    } catch (err) {
      console.error("Erreur suppression consigne:", err);
      alert("Erreur lors de la suppression de la consigne");
    }
  };

  // --- FONCTION : TOGGLE VISIBILITÉ SAE ---
  const toggleSaeVisibility = async (saeId, currentStatus) => {
    const newStatus = currentStatus === 'VALIDE' ? 'BROUILLON' : 'VALIDE';
    try {
      const res = await fetch(`${API_URL}/api/admin/saes/${saeId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) { 
      console.error("Erreur toggle visibilité:", err);
    }
  };

  // --- LOGIQUE MÉTIER : NOTATION ---
  const handleUpdateNote = async (renduId, note) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/noter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ rendu_id: renduId, note: parseFloat(note) })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) { 
      console.error("Erreur notation:", err);
    }
  };

  // --- LOGIQUE MÉTIER : PROFIL & SÉCURITÉ ---
  const handleSecurityUpdate = (e) => {
    e.preventDefault();
    if (pwdForm.new !== pwdForm.confirm) {
      alert("Les mots de passe ne correspondent pas.");
      return;
    }
    if (pwdForm.new.length < 6) {
      alert("Le nouveau mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    alert("Vos paramètres de sécurité ont été mis à jour.");
    setPwdForm({ old: '', new: '', confirm: '' });
  };

  // --- STATISTIQUES MÉMOÏSÉES ---
  const globalStats = useMemo(() => {
    const notesValides = rendus.map(r => parseFloat(r.note)).filter(n => !isNaN(n));
    return {
      totalSaes: saes.length,
      totalRendus: rendus.length,
      moyenne: notesValides.length ? (notesValides.reduce((a, b) => a + b, 0) / notesValides.length).toFixed(1) : "N/A"
    };
  }, [rendus, saes]);

  const totalNotifsCount = useMemo(() => {
    const unreadMsgs = messages.filter(m => !m.lu && m.destinataire_id === user?.id).length;
    return annonces.length + unreadMsgs;
  }, [annonces, messages, user?.id]);

  // --- OBTENIR L'ICÔNE DU TYPE DE FICHIER ---
  const getFileIcon = (filename) => {
    if (!filename) return '📄';
    const ext = filename.split('.').pop().toLowerCase();
    switch(ext) {
      case 'pdf': return '📕';
      case 'doc': return '📘';
      case 'docx': return '📘';
      case 'txt': return '📝';
      case 'ppt': return '📙';
      case 'pptx': return '📙';
      default: return '📄';
    }
  };

  if (loading) return (
    <div className="mmi-loading-screen cursive-font">
      <div className="mmi-spinner"></div>
      Chargement de l'espace pédagogique...
    </div>
  );

  return (
    <div className="teacher-wrapper">
      
      {/* NAVBAR */}
      <nav className="mmi-navbar-pill">
        <div className="nav-left-part" onClick={() => {setSelectedSae(null); setActiveTab('dashboard')}}>
          <img src="/ecampus.svg" alt="Logo" className="mmi-logo-nav" />
          <span className="brand-title cursive-font bordeaux-text">Ecampus</span>
        </div>

        <div className="nav-center-part cursive-font">
          <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => {setSelectedSae(null); setActiveTab('dashboard')}}>dashboard</button>
          
          <div className="nav-dropdown-wrap" onMouseEnter={() => setIsManageMenuOpen(true)} onMouseLeave={() => setIsManageMenuOpen(false)}>
            <button className={activeTab === 'catalogue' || activeTab === 'projets' ? 'active' : ''}>gestion ▾</button>
            <AnimatePresence>
              {isManageMenuOpen && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="mmi-nav-dropdown-content">
                  <span onClick={() => {setSelectedSae(null); setActiveTab('catalogue')}}>visibilité catalogue</span>
                  <span onClick={() => {setSelectedSae(null); setActiveTab('projets')}}>création de sae</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button className={activeTab === 'annonces' ? 'active' : ''} onClick={() => {setSelectedSae(null); setActiveTab('annonces')}}>annonces</button>
          <button className={activeTab === 'messagerie' ? 'active' : ''} onClick={() => {setSelectedSae(null); setActiveTab('messagerie')}}>messagerie</button>
          <button className={activeTab === 'rendus' ? 'active' : ''} onClick={() => {setSelectedSae(null); setActiveTab('rendus')}}>notation</button>
          <button className={activeTab === 'profil' ? 'active' : ''} onClick={() => {setSelectedSae(null); setActiveTab('profil')}}>mon profil</button>
        </div>

        <div className="nav-right-part">
          <div className="notif-wrapper" onClick={() => setShowNotifs(!showNotifs)}>
            <span className="mmi-bell">🔔</span>
            {totalNotifsCount > 0 && <span className="mmi-badge-notif">{totalNotifsCount}</span>}
            <AnimatePresence>
              {showNotifs && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mmi-notif-dropdown">
                  <h4 className="cursive-font bordeaux-text">Dernières alertes</h4>
                  <div className="notif-scroll">
                    {annonces.slice(0, 3).map(a => (
                      <div key={a.id} className="notif-item">
                        <strong>{a.titre}</strong>
                        <p>{a.contenu.substring(0, 50)}...</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="profile-badge-pill">
            <div className="badge-text">
              <span className="user-role-label bordeaux-text">Enseignant</span>
              <button onClick={onLogout} className="mmi-logout-link cursive-font">Fermer la session</button>
            </div>
            <div className="badge-avatar">P</div>
          </div>
        </div>
      </nav>

      <main className="teacher-main-stage">
        <AnimatePresence mode="wait">
          
          {/* VUE DÉTAILLÉE SAE AVEC IMAGE ET CONSIGNE */}
          {selectedSae && (
            <motion.div key="sae-detail" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="sae-immersive-view">
              <button className="mmi-back-link cursive-font" onClick={() => setSelectedSae(null)}>← Retour au catalogue</button>
              <div className="sae-detail-hero">
                <div className="hero-split">
                  <div className="hero-visual-side">
                    {selectedSae.image && (
                      <img 
                        src={`${API_URL}${selectedSae.image}`} 
                        alt={selectedSae.titre}
                        className="sae-detail-image"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/fallback-image.jpg';
                        }}
                      />
                    )}
                  </div>
                  
                  <div className="hero-info-side">
                    <span className="res-tag-pill bordeaux-text cursive-font">{selectedSae.ressource}</span>
                    <h2 className="cursive-font title-display">{selectedSae.titre}</h2>
                    <p className="description-text">{selectedSae.description}</p>
                    <div className="meta-info-grid">
                      <div className="meta-box">
                        <strong>Promotion :</strong> {selectedSae.promotion}
                      </div>
                      <div className="meta-box">
                        <strong>Semestre :</strong> {selectedSae.semestre}
                      </div>
                      <div className="meta-box">
                        <strong>Rendu :</strong> {new Date(selectedSae.date_rendu).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="documents-section">
                      <h3 className="cursive-font bordeaux-text">📋 Consigne de la SAE</h3>
                      <div className="documents-list">
                        {selectedSae.consigne_url ? (
                          <a 
                            href={`${API_URL}${selectedSae.consigne_url}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="document-link"
                          >
                            <span className="doc-icon">{getFileIcon(selectedSae.consigne_url)}</span>
                            <span className="doc-name">
                              {selectedSae.consigne_url.split('/').pop() || 'Document consigne'}
                            </span>
                            <span className="doc-download">📥 Télécharger la consigne</span>
                          </a>
                        ) : (
                          <p className="no-document">Aucune consigne jointe à cette SAE</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* CONTENU PRINCIPAL */}
          {!selectedSae && (
            <>
              {/* ONGLET DASHBOARD */}
              {activeTab === 'dashboard' && (
                <motion.div key="stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="dashboard-grid-view">
                  <div className="dashboard-stats-row">
                    <div className="stat-card-mmi"><h3>{globalStats.totalSaes}</h3><p>SAE EN LIGNE</p></div>
                    <div className="stat-card-mmi"><h3>{globalStats.totalRendus}</h3><p>DEVOIRS REÇUS</p></div>
                    <div className="stat-card-mmi bordeaux-fill"><h3>{globalStats.moyenne}</h3><p>MOYENNE PROMO</p></div>
                  </div>
                  
                  <div className="mmi-glass-card history-section">
                    <h3 className="cursive-font bordeaux-text">Annonces récentes sur la plateforme</h3>
                    <div className="history-flow">
                      {annonces.slice(0, 3).map(a => (
                        <div key={a.id} className="history-item-pill">
                          <div className="h-top"><strong>{a.titre}</strong> <span>{new Date(a.date_creation).toLocaleDateString()}</span></div>
                          <p>{a.contenu}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ONGLET ANNONCES */}
              {activeTab === 'annonces' && (
                <motion.div key="annonces" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mmi-stage-centered">
                  <div className="mmi-glass-card mmi-form-card">
                    <div className="annonces-header">
                      <h2 className="cursive-font bordeaux-text">{editingAnnonce ? "Modifier l'annonce" : "Diffuser une annonce"}</h2>
                      {!showAnnonceForm && !editingAnnonce && (
                        <button className="mmi-btn-new-annonce" onClick={() => setShowAnnonceForm(true)}>+ Nouvelle annonce</button>
                      )}
                    </div>
                    
                    {(showAnnonceForm || editingAnnonce) && (
                      <form className="mmi-grid-form" onSubmit={handlePostAnnonce}>
                        <div className="mmi-input-group">
                          <label>Titre de l'annonce</label>
                          <input type="text" className="mmi-input-pill" value={annonceForm.titre} onChange={e => setAnnonceForm({...annonceForm, titre: e.target.value})} required />
                        </div>
                        <div className="mmi-input-group">
                          <label>Cible</label>
                          <select className="mmi-input-pill" value={annonceForm.cible} onChange={e => setAnnonceForm({...annonceForm, cible: e.target.value})}>
                            <option value="Tous">Tous les utilisateurs</option>
                            <option value="Étudiants">Étudiants</option>
                            <option value="Enseignants">Enseignants</option>
                          </select>
                        </div>
                        <div className="mmi-input-group full-span">
                          <label>Message</label>
                          <textarea rows="4" className="mmi-input-pill mmi-textarea" value={annonceForm.contenu} onChange={e => setAnnonceForm({...annonceForm, contenu: e.target.value})} required></textarea>
                        </div>
                        <div className="mmi-form-actions">
                          <button type="submit" className="mmi-btn-black-pill">{editingAnnonce ? 'METTRE À JOUR' : 'PUBLIER'}</button>
                          <button type="button" className="mmi-btn-cancel" onClick={() => {
                            setShowAnnonceForm(false);
                            setEditingAnnonce(null);
                            setAnnonceForm({ titre: '', contenu: '', cible: 'Tous' });
                          }}>ANNULER</button>
                        </div>
                      </form>
                    )}
                  </div>

                  <h2 className="cursive-font bordeaux-text mmi-stage-title" style={{marginTop:'50px'}}>Historique des annonces</h2>
                  <div className="mmi-glass-card">
                    <div className="mmi-history-list">
                      {annonces.map(a => (
                        <div key={a.id} className="mmi-history-item">
                          <div className="h-header">
                            <strong className="cursive-font">{a.titre} <em>({a.cible || 'Tous'})</em></strong>
                            <div className="h-btns">
                              <button type="button" className="mmi-history-btn" onClick={() => {
                                setEditingAnnonce(a);
                                setAnnonceForm({titre: a.titre, contenu: a.contenu, cible: a.cible || 'Tous'});
                                setShowAnnonceForm(true);
                              }}>✎</button>
                              <button type="button" className="mmi-history-btn" onClick={() => deleteAnnonce(a.id)}>🗑</button>
                            </div>
                          </div>
                          <p>{a.contenu}</p>
                          <small className="annonce-date">{new Date(a.date_creation).toLocaleDateString('fr-FR')}</small>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ONGLET MESSAGERIE STYLE WHATSAPP */}
              {activeTab === 'messagerie' && (
                <motion.div key="messagerie" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="stage">
                  <div className="mmi-whatsapp-layout">
                    <div className="sidebar-contacts">
                      <div className="search-wrap">
                        <input type="text" placeholder="Rechercher un contact..." onChange={e => setSearchContact(e.target.value)} />
                      </div>
                      <div className="contacts-list">
                        {contacts.filter(c => c.email.toLowerCase().includes(searchContact.toLowerCase())).map(c => (
                          <div key={c.id} className={`contact-pill ${selectedContact?.id === c.id ? 'active' : ''}`} onClick={() => setSelectedContact(c)}>
                            <div className="avatar-m">{c.email[0].toUpperCase()}</div>
                            <div className="txt">
                              <strong>{c.email.split('@')[0]}</strong>
                              <p>Enseignant</p>
                            </div>
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
                              <div key={m.id} className={`bubble-wrap ${m.expediteur_id === user?.id ? 'me' : 'them'}`}>
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
                      ) : (
                        <div className="chat-placeholder">Sélectionnez une discussion pour démarrer.</div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ONGLET CATALOGUE AVEC CARDS MODERNES */}
              {activeTab === 'catalogue' && (
                <motion.div key="catalog" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h2 className="cursive-font bordeaux-text page-heading">Gestion de la visibilité des SAE</h2>
                  <div className="mmi-catalogue-grid">
                    {saes.map(s => (
                      <div key={s.id} className={`mmi-card-project ${s.status === 'BROUILLON' ? 'is-masked' : ''}`}>
                        <div 
                          className="project-media" 
                          style={{backgroundImage: `url(${API_URL}${s.image})`}} 
                          onClick={() => setSelectedSae(s)}
                        >
                          {s.status === 'BROUILLON' && <div className="masked-badge">BROUILLON</div>}
                        </div>
                        <div className="project-details">
                          <div className="details-header">
                            <span className="res-mini-tag">{s.ressource}</span>
                            <button className={`mmi-toggle-vis ${s.status}`} onClick={() => toggleSaeVisibility(s.id, s.status)}>
                              {s.status === 'VALIDE' ? '👁️ Public' : '👁️‍🗨️ Masqué'}
                            </button>
                          </div>
                          <h4 className="cursive-font" onClick={() => setSelectedSae(s)}>{s.titre}</h4>
                          <div className="project-actions">
                            <button onClick={() => startEditing(s)} className="mmi-edit-btn">✏️ Modifier</button>
                            <button onClick={() => handleDeleteSae(s.id)} className="mmi-delete-btn">🗑️ Supprimer</button>
                          </div>
                          {s.consigne_url && (
                            <div className="document-badge">
                              <span>{getFileIcon(s.consigne_url)}</span>
                              <span>Consigne jointe</span>
                            </div>
                          )}
                          <p className="short-desc">{s.description?.substring(0, 80)}...</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ONGLET CRÉATION/MODIFICATION SAE */}
              {activeTab === 'projets' && (
                <motion.div key="form" className="form-stage-centered">
                  <div className="mmi-glass-card sae-creation-card">
                    <h2 className="cursive-font bordeaux-text">{isEditing ? "Modifier la SAE" : "Créer une Situation d'Apprentissage"}</h2>
                    <form className="mmi-form-complex" onSubmit={handleSubmitSae}>
                      <div className="mmi-form-row">
                        <div className="mmi-form-group">
                          <label className="bordeaux-text">Titre de la SAE *</label>
                          <input 
                            type="text" 
                            className="mmi-pill-input" 
                            value={saeForm.titre} 
                            onChange={e => setSaeForm({...saeForm, titre: e.target.value})} 
                            required 
                          />
                        </div>
                        <div className="mmi-form-group">
                          <label className="bordeaux-text">Matière / Domaine</label>
                          <select 
                            className="mmi-pill-input" 
                            value={saeForm.ressource} 
                            onChange={e => setSaeForm({...saeForm, ressource: e.target.value})}
                          >
                            <option>Développement Web</option>
                            <option>Design & UX/UI</option>
                            <option>Audiovisuel</option>
                            <option>Communication</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="mmi-form-row">
                        <div className="mmi-form-group">
                          <label className="bordeaux-text">Promotion</label>
                          <select 
                            className="mmi-pill-input" 
                            value={saeForm.promotion} 
                            onChange={e => setSaeForm({...saeForm, promotion: e.target.value})}
                          >
                            <option>2024</option>
                            <option>2025</option>
                            <option>2026</option>
                            <option>2027</option>
                          </select>
                        </div>
                        <div className="mmi-form-group">
                          <label className="bordeaux-text">Semestre</label>
                          <select 
                            className="mmi-pill-input" 
                            value={saeForm.semestre} 
                            onChange={e => setSaeForm({...saeForm, semestre: e.target.value})}
                          >
                            <option>S1</option>
                            <option>S2</option>
                            <option>S3</option>
                            <option>S4</option>
                          </select>
                        </div>
                      </div>

                      <div className="mmi-form-group full">
                        <label className="bordeaux-text">Description et consignes *</label>
                        <textarea 
                          className="mmi-pill-input mmi-area" 
                          rows="6" 
                          value={saeForm.desc} 
                          onChange={e => setSaeForm({...saeForm, desc: e.target.value})} 
                          required
                        ></textarea>
                      </div>
                      
                      <div className="mmi-form-row">
                        <div className="mmi-form-group">
                          <label>Date de rendu *</label>
                          <input 
                            type="date" 
                            className="mmi-pill-input" 
                            value={saeForm.date} 
                            onChange={e => setSaeForm({...saeForm, date: e.target.value})} 
                            required 
                          />
                        </div>
                        <div className="mmi-form-group">
                          <label>Image de couverture</label>
                          <input 
                            type="file" 
                            className="mmi-pill-input file" 
                            onChange={e => setImageFile(e.target.files[0])} 
                            accept="image/*"
                          />
                          <small className="input-help">JPG, PNG, GIF (max 5MB)</small>
                        </div>
                      </div>

                      <div className="mmi-form-group full document-upload-section">
                        <label className="bordeaux-text">📋 Document consigne (PDF, DOC, PPT, etc.)</label>
                        <div className="document-upload-area">
                          <input 
                            type="file" 
                            id="consigneUpload"
                            className="document-input-hidden" 
                            onChange={e => setConsigneFile(e.target.files[0])} 
                            accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.odt"
                          />
                          <label htmlFor="consigneUpload" className="document-upload-label">
                            <span className="upload-icon">📁</span>
                            <span>Cliquez pour joindre un document consigne</span>
                            <span className="upload-hint">PDF, DOC, DOCX, PPT, TXT (max 10MB)</span>
                          </label>
                        </div>
                        
                        {consigneFile && (
                          <div className="selected-document">
                            <span className="doc-icon">{getFileIcon(consigneFile.name)}</span>
                            <span className="doc-name">{consigneFile.name}</span>
                            <span className="doc-size">({(consigneFile.size / 1024).toFixed(1)} KB)</span>
                            <button type="button" className="remove-doc-btn" onClick={() => setConsigneFile(null)}>✖</button>
                          </div>
                        )}
                        
                        {isEditing && existingConsigne && !consigneFile && (
                          <div className="existing-document">
                            <div className="doc-info">
                              <span className="doc-icon">{getFileIcon(existingConsigne)}</span>
                              <span className="doc-name">Consigne actuelle: {existingConsigne.split('/').pop()}</span>
                            </div>
                            <button type="button" className="delete-doc-btn" onClick={handleDeleteConsigne}>🗑️ Supprimer la consigne</button>
                          </div>
                        )}
                      </div>

                      <div className="mmi-form-footer">
                        <button type="submit" className="mmi-btn-black-pill">
                          {isEditing ? "METTRE À JOUR LE PROJET" : "PUBLIER LE PROJET PÉDAGOGIQUE"}
                        </button>
                        {isEditing && (
                          <button type="button" onClick={() => {
                            setIsEditing(false);
                            setCurrentSaeId(null);
                            setSaeForm({ titre: '', ressource: 'Développement Web', date: '', desc: '', promotion: '2026', semestre: 'S1' });
                            setImageFile(null);
                            setConsigneFile(null);
                            setExistingConsigne(null);
                          }} className="mmi-btn-cancel">
                            ANNULER
                          </button>
                        )}
                      </div>
                    </form>
                  </div>
                </motion.div>
              )}

              {/* ONGLET NOTATION AVEC MODAL ET CARROUSEL */}
              {activeTab === 'rendus' && (
                <motion.div key="grading" className="grading-stage">
                  <h2 className="cursive-font bordeaux-text page-heading">Evaluation des travaux d'étudiants</h2>
                  <div className="mmi-glass-card table-box">
                    <table className="mmi-grading-table">
                      <thead>
                        <tr>
                          <th>ÉTUDIANT</th>
                          <th>PROJET</th>
                          <th>DÉPÔT</th>
                          <th>NOTE / 20</th>
                          <th>ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rendus.map(r => (
                          <tr key={r.id}>
                            <td className="bold-text">
                              <button className="student-link" onClick={() => viewStudentDetails(r.email)}>
                                {r.email}
                              </button>
                            </td>
                            <td>{r.sae_titre}</td>
                            <td className="date-cell">{new Date(r.date_depot).toLocaleDateString()}</td>
                            <td>
                              <input 
                                type="number" 
                                step="0.5"
                                min="0"
                                max="20"
                                defaultValue={r.note} 
                                onBlur={(e) => handleUpdateNote(r.id, e.target.value)} 
                                className="mmi-note-field" 
                              />
                            </td>
                            <td>
                              <button className="view-work-btn" onClick={() => viewStudentDetails(r.email)}>
                                📂 Voir tous les travaux
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* MODAL ÉTUDIANT AVEC CARROUSEL */}
                  {showStudentModal && (
                    <div className="student-modal-overlay" onClick={() => setShowStudentModal(false)}>
                      <div className="student-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                          <h3 className="cursive-font bordeaux-text">Travaux de {selectedStudent}</h3>
                          <button className="close-modal" onClick={() => setShowStudentModal(false)}>✖</button>
                        </div>
                        
                        <div className="student-stats">
                          <div className="stat-item">
                            <span className="stat-label">Total rendus:</span>
                            <span className="stat-value">{studentRendus.length}</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-label">Moyenne:</span>
                            <span className="stat-value">
                              {studentRendus.length > 0 
                                ? (studentRendus.reduce((acc, r) => acc + (parseFloat(r.note) || 0), 0) / studentRendus.length).toFixed(1)
                                : 'N/A'}
                            </span>
                          </div>
                        </div>

                        <div className="carousel-wrapper">
                          <ul className="carousel-list">
                            {studentRendus.map((rendu, index) => (
                              <li key={rendu.id} className="carousel-item">
                                <div className="work-card">
                                  <div className="work-header">
                                    <h4>{rendu.sae_titre}</h4>
                                    <span className="work-status">Rendu le {new Date(rendu.date_depot).toLocaleDateString()}</span>
                                  </div>
                                  
                                  <div className="work-content">
                                    <div className="work-preview">
                                      {rendu.fichier_url && (
                                        <a href={`${API_URL}${rendu.fichier_url}`} target="_blank" rel="noopener noreferrer" className="preview-link">
                                          📄 Voir le document déposé
                                        </a>
                                      )}
                                    </div>
                                    
                                    <div className="work-comment">
                                      <label>Commentaire de l'étudiant :</label>
                                      <p>{rendu.commentaire || "Aucun commentaire"}</p>
                                    </div>
                                    
                                    <div className="work-grading">
                                      <label>Note attribuée :</label>
                                      <input 
                                        type="number" 
                                        step="0.5"
                                        min="0"
                                        max="20"
                                        defaultValue={rendu.note} 
                                        onBlur={(e) => handleUpdateNote(rendu.id, e.target.value)} 
                                        className="mmi-note-field-modal" 
                                      />
                                    </div>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                          
                          <button className="carousel-nav prev" onClick={() => {
                            const list = document.querySelector('.carousel-list');
                            if (list) list.scrollBy({ left: -340, behavior: 'smooth' });
                          }}>‹</button>
                          <button className="carousel-nav next" onClick={() => {
                            const list = document.querySelector('.carousel-list');
                            if (list) list.scrollBy({ left: 340, behavior: 'smooth' });
                          }}>›</button>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ONGLET PROFIL */}
              {activeTab === 'profil' && (
                <motion.div key="profile" className="mmi-profile-immersive">
                  <div className="profile-layout-grid">
                    <aside className="profile-sidebar-card">
                      <div className="mmi-avatar-xl">P</div>
                      <div className="profile-meta-titles">
                        <h2 className="cursive-font bordeaux-text">{profileInfo.nom}</h2>
                        <p className="mmi-email-sub">{user?.email || "professeur@ecampus.fr"}</p>
                        <div className="profile-badge-row">
                          <span className="mmi-tag-pill">Pôle Enseignement</span>
                          <span className="mmi-tag-pill active">Actif</span>
                        </div>
                      </div>
                      <div className="profile-bio-box">
                        <h4 className="cursive-font bordeaux-text">Biographie</h4>
                        {isEditingProfile ? (
                          <textarea className="mmi-pill-input area" value={profileInfo.bio} onChange={e => setProfileInfo({...profileInfo, bio: e.target.value})} />
                        ) : (
                          <p>{profileInfo.bio}</p>
                        )}
                      </div>
                      <div className="profile-cta-stack">
                        {isEditingProfile ? (
                          <button onClick={() => setIsEditingProfile(false)} className="btn-mmi-profile save">SAUVEGARDER</button>
                        ) : (
                          <button onClick={() => setIsEditingProfile(true)} className="btn-mmi-profile edit">MODIFIER PROFIL</button>
                        )}
                        <button onClick={onLogout} className="btn-mmi-profile logout">DÉCONNEXION</button>
                      </div>
                    </aside>

                    <section className="profile-main-settings">
                      <div className="mmi-glass-card setting-block">
                        <h3 className="cursive-font bordeaux-text">Sécurité du compte</h3>
                        <form className="mmi-security-form" onSubmit={handleSecurityUpdate}>
                          <div className="mmi-form-group">
                            <label>Ancien mot de passe</label>
                            <input type="password" placeholder="••••••••" className="mmi-pill-input" value={pwdForm.old} onChange={e => setPwdForm({...pwdForm, old: e.target.value})} required />
                          </div>
                          <div className="mmi-form-row">
                            <div className="mmi-form-group">
                              <label>Nouveau mot de passe</label>
                              <input type="password" className="mmi-pill-input" value={pwdForm.new} onChange={e => setPwdForm({...pwdForm, new: e.target.value})} required />
                            </div>
                            <div className="mmi-form-group">
                              <label>Confirmer nouveau</label>
                              <input type="password" className="mmi-pill-input" value={pwdForm.confirm} onChange={e => setPwdForm({...pwdForm, confirm: e.target.value})} required />
                            </div>
                          </div>
                          <button type="submit" className="mmi-btn-black-pill full-width">METTRE À JOUR LE MOT DE PASSE</button>
                        </form>
                      </div>

                      <div className="mmi-glass-card setting-block">
                        <h3 className="cursive-font bordeaux-text">Informations de contact pro.</h3>
                        <div className="mmi-pro-details">
                          <div className="pro-item">
                            <label>Localisation</label>
                            <p>{profileInfo.bureau}</p>
                          </div>
                          <div className="pro-item">
                            <label>Téléphone</label>
                            <p>{profileInfo.tel}</p>
                          </div>
                          <div className="pro-item">
                            <label>Disponibilités</label>
                            <p>{profileInfo.dispo}</p>
                          </div>
                        </div>
                      </div>
                    </section>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>
      </main>

      <footer className="teacher-footer-mmi cursive-font bordeaux-text">
        © 2026 Ecampus MMI Vélizy — Université Paris-Saclay
      </footer>
    </div>
  );
}