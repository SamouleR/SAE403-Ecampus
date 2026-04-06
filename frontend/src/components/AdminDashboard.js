import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './AdminDashboard.css';

/**
 * ==========================================================================
 * COMPOSANT : AdminDashboard (Version Master Final - 650+ lignes)
 * ==========================================================================
 * Rôle : Pilotage centralisé de la plateforme.
 * Design : Bordeaux (#a31d24) / Crème (#fff9f0) / Blanc.
 */
export default function AdminDashboard({ user, onLogout, API_URL }) {
  
  // --------------------------------------------------------------------------
  // --- 1. ÉTATS DE NAVIGATION ET UI ---
  // --------------------------------------------------------------------------
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAnnonces, setShowAnnonces] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState(null);
  const token = localStorage.getItem('token');

  // --------------------------------------------------------------------------
  // --- 2. ÉTATS DES DONNÉES (DATABASE) ---
  // --------------------------------------------------------------------------
  const [allSaes, setAllSaes] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [students, setStudents] = useState([]);
  const [annonces, setAnnonces] = useState([]);
  const [allRendus, setAllRendus] = useState([]);
  
  // États spécifiques à la Vitrine
  const [selectedSaeRendus, setSelectedSaeRendus] = useState([]);
  const [viewingRendusFor, setViewingRendusFor] = useState(null);
  const [loadingVitrine, setLoadingVitrine] = useState(false);

  // --------------------------------------------------------------------------
  // --- 3. ÉTATS DU PROFIL (STYLE PREMIUM IMAGE 887FAB) ---
  // --------------------------------------------------------------------------
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileInfo, setProfileInfo] = useState({
    nom: "ADMINISTRATEUR",
    bio: "Responsable technique de la plateforme Ecampus. Supervision des Situation d'Apprentissage et d'Évaluation (SAE) et modération des contenus publics.",
    localisation: "Direction - Bâtiment MMI - Bureau 001",
    poste: "Gestionnaire de la plateforme",
    promotion: "Corps Administratif",
    statut: "Actif"
  });
  
  const [pwdForm, setPwdForm] = useState({ old: '', new: '', confirm: '' });

  // --------------------------------------------------------------------------
  // --- 4. ÉTATS DES FORMULAIRES DE GESTION ---
  // --------------------------------------------------------------------------
  const [saeForm, setSaeForm] = useState({ 
    titre: '', ressource: '', date: '', desc: '', promotion: '2026', semestre: 'S1', imageFile: null, pdfFile: null 
  });
  const [studentForm, setStudentForm] = useState({ email: '', password: '' });
  const [enrollForm, setEnrollForm] = useState({ email: '', ressource: '' });
  
  // Gestion Annonces
  const [annonceForm, setAnnonceForm] = useState({ titre: '', contenu: '', cible: 'Tous' });
  const [editingAnnonce, setEditingAnnonce] = useState(null);

  // --------------------------------------------------------------------------
  // --- 5. LOGIQUE DE RÉCUPÉRATION DES DONNÉES (FETCH) ---
  // --------------------------------------------------------------------------

  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    setGlobalError(null);
    const headers = { 'Authorization': `Bearer ${token}` };

    const safeFetchJson = async (url, defaultValue = []) => {
      try {
        const response = await fetch(url, { headers });
        if (!response.ok) {
          console.warn(`API indisponible: ${url} (${response.status})`);
          return defaultValue;
        }
        return await response.json();
      } catch (error) {
        console.warn(`Échec requête ${url}:`, error);
        return defaultValue;
      }
    };

    try {
      const [saesData, pendingData, studentsData, annoncesData, rendusData] = await Promise.all([
        safeFetchJson(`${API_URL}/api/admin/all-saes`, []),
        safeFetchJson(`${API_URL}/api/admin/pending-users`, []),
        safeFetchJson(`${API_URL}/api/admin/etudiants`, []),
        safeFetchJson(`${API_URL}/api/annonces`, []),
        safeFetchJson(`${API_URL}/api/admin/rendus`, [])
      ]);

      setAllSaes(saesData);
      setPendingUsers(pendingData);
      setStudents(studentsData);
      setAnnonces(annoncesData);
      setAllRendus(rendusData);

      if (saesData.length === 0 && pendingData.length === 0 && studentsData.length === 0 && annoncesData.length === 0 && rendusData.length === 0) {
        setGlobalError("Problème de connexion avec l'API Ecampus.");
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setGlobalError("Problème de connexion avec l'API Ecampus.");
    } finally {
      setIsLoading(false);
    }
  }, [API_URL, token]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData, activeTab]);

  // --------------------------------------------------------------------------
  // --- 6. LOGIQUE MÉTIER : OPTIMISATION VIA USEMEMO ---
  // --------------------------------------------------------------------------
  
  // Utilisation de useMemo pour filtrer les annonces importantes
  const recentAnnonces = useMemo(() => {
    return annonces.slice(0, 3);
  }, [annonces]);

  const activeStudentsCount = useMemo(() => {
    return students.filter(s => s.status === 'ACTIF' || s.status === 'VALIDE').length;
  }, [students]);

  const saeOnlineCount = useMemo(() => {
    return allSaes.filter(s => s.status === 'VALIDE').length;
  }, [allSaes]);

  const devoirsRecusCount = useMemo(() => {
    return allRendus.length;
  }, [allRendus]);

  const moyennePromo = useMemo(() => {
    const notes = allRendus.map(r => parseFloat(r.note)).filter(n => !isNaN(n));
    if (notes.length === 0) return 'N/A';
    return (notes.reduce((acc, n) => acc + n, 0) / notes.length).toFixed(2);
  }, [allRendus]);

  // --------------------------------------------------------------------------
  // --- 7. LOGIQUE MÉTIER : PROFIL & SÉCURITÉ ---
  // --------------------------------------------------------------------------

  const handleSecurityUpdate = async (e) => {
    e.preventDefault();
    if (!pwdForm.new || pwdForm.new !== pwdForm.confirm) {
      alert("Erreur dans la saisie du nouveau mot de passe.");
      return;
    }
    alert("Paramètres de sécurité mis à jour.");
    setPwdForm({ old: '', new: '', confirm: '' });
  };

  const handleSaveProfile = () => {
    setIsEditingProfile(false);
    alert("Profil administratif mis à jour.");
  };

  // --------------------------------------------------------------------------
  // --- 8. LOGIQUE MÉTIER : SAE & VITRINE ---
  // --------------------------------------------------------------------------

  const fetchRendusForSae = async (saeId) => {
    if (viewingRendusFor === saeId) return setViewingRendusFor(null);
    setViewingRendusFor(saeId);
    setLoadingVitrine(true);
    try {
      let res = await fetch(`${API_URL}/api/admin/saes/${saeId}/rendus`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        console.warn(`Route /saes/${saeId}/rendus indisponible (${res.status}), tentative /admin/rendus`);
        res = await fetch(`${API_URL}/api/admin/rendus?saeId=${saeId}`, { headers: { 'Authorization': `Bearer ${token}` } });
      }

      if (!res.ok) {
        setSelectedSaeRendus([]);
        return;
      }

      setSelectedSaeRendus(await res.json());
    } catch (err) {
      console.warn('Erreur fetchRendusForSae', err);
      setSelectedSaeRendus([]);
    } finally {
      setLoadingVitrine(false);
    }
  };

  const handleTogglePublic = async (renduId, current) => {
    await fetch(`${API_URL}/api/admin/rendus/${renduId}/toggle-public`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ is_public: !current })
    });
    fetchRendusForSae(viewingRendusFor);
  };

  const toggleSaeVisibility = async (saeId, currentStatus) => {
    const newStatus = currentStatus === 'VALIDE' ? 'BROUILLON' : 'VALIDE';
    await fetch(`${API_URL}/api/admin/saes/${saeId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ status: newStatus })
    });
    fetchAllData();
  };

  const handleCreateSAE = async (e) => {
    e.preventDefault();
    const hasFiles = saeForm.imageFile || saeForm.pdfFile;
    const headers = { 'Authorization': `Bearer ${token}` };
    let body;

    if (hasFiles) {
      const formData = new FormData();
      formData.append('titre', saeForm.titre);
      formData.append('ressource', saeForm.ressource);
      formData.append('date', saeForm.date);
      formData.append('desc', saeForm.desc);
      formData.append('description', saeForm.desc);
      formData.append('promotion', saeForm.promotion);
      formData.append('semestre', saeForm.semestre);
      if (saeForm.imageFile) {
        formData.append('image', saeForm.imageFile);
        formData.append('imageFile', saeForm.imageFile);
      }
      if (saeForm.pdfFile) {
        formData.append('pdf', saeForm.pdfFile);
        formData.append('pdfFile', saeForm.pdfFile);
      }
      body = formData;
    } else {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify({
        titre: saeForm.titre,
        ressource: saeForm.ressource,
        date: saeForm.date,
        desc: saeForm.desc,
        description: saeForm.desc,
        promotion: saeForm.promotion,
        semestre: saeForm.semestre
      });
    }

    try {
      const res = await fetch(`${API_URL}/api/admin/saes`, {
        method: 'POST',
        headers,
        body
      });

      if (!res.ok) {
        const errorText = await res.text();
        alert(`Erreur création SAE : ${res.status} ${errorText}`);
        return;
      }

      alert('SAE publiée.');
      setActiveTab('catalogue');
      await fetchAllData();
    } catch (err) {
      console.error('handleCreateSAE', err);
      alert('Erreur réseau lors de la création de la SAE.');
    }
  };

  // --------------------------------------------------------------------------
  // --- 9. LOGIQUE MÉTIER : GESTION ÉTUDIANTS ---
  // --------------------------------------------------------------------------

  const handleValidateUser = async (id) => {
    await fetch(`${API_URL}/api/admin/users/${id}/validate`, { 
      method: 'PUT', headers: { 'Authorization': `Bearer ${token}` } 
    });
    fetchAllData();
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/api/admin/etudiants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(studentForm)
    });
    const data = await res.json();
    alert(data.message);
    setStudentForm({ email: '', password: '' });
    fetchAllData();
  };

  const handleEnrollStudent = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/api/admin/inscriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(enrollForm)
    });
    const data = await res.json();
    alert(data.message);
    setEnrollForm({ email: '', ressource: '' });
  };

  const handleChangePassword = async (id, email) => {
    const newPassword = window.prompt(`Nouveau mot de passe pour ${email} :`);
    if (!newPassword) return;
    await fetch(`${API_URL}/api/admin/users/${id}/password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ newPassword })
    });
    alert("Mot de passe modifié.");
  };

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
        if (editingAnnonce && res.status === 405) {
          const fallback = await fetch(url, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(annonceForm)
          });
          if (fallback.ok) {
            alert('Annonce mise à jour.');
            setAnnonceForm({ titre: '', contenu: '', cible: 'Tous' });
            setEditingAnnonce(null);
            await fetchAllData();
            return;
          }
          const fallbackText = await fallback.text();
          alert(`Erreur API mise à jour : ${fallback.status} ${fallbackText}`);
          return;
        }
        alert(`Erreur API : ${res.status} ${errorText}`);
        return;
      }

      alert(editingAnnonce ? 'Annonce mise à jour.' : 'Annonce ajoutée.');
      setAnnonceForm({ titre: '', contenu: '', cible: 'Tous' });
      setEditingAnnonce(null);
      await fetchAllData();
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
        const errorText = await res.text();
        alert(`Impossible de supprimer l'annonce : ${res.status} ${errorText}`);
        return;
      }
      alert('Annonce supprimée.');
      fetchAllData();
    } catch (err) {
      console.error('deleteAnnonce', err);
      alert('Erreur réseau lors de la suppression de l’annonce.');
    }
  };

  // --------------------------------------------------------------------------
  // --- 10. COMPOSANTS DE RENDU INTERNES ---
  // --------------------------------------------------------------------------

  const Header = () => (
    <header className="mmi-pill-header">
      <div className="mmi-admin-brand" onClick={() => setActiveTab('catalogue')}>
        <img src="/ecampus.svg" alt="logo" className="mmi-logo-img" />
      </div>

      <nav className="mmi-nav-links cursive-font">
        {['dashboard','catalogue', 'sae', 'etudiant', 'annonces', 'profil'].map(tab => (
          <button key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}>
            {tab}
          </button>
        ))}
      </nav>

      <div className="mmi-header-actions">
        <div className="notif-wrapper" onClick={() => setShowAnnonces(!showAnnonces)}>
          <span className="mmi-bell">🔔</span>
          {annonces.length > 0 && <span className="mmi-badge">{annonces.length}</span>}
          <AnimatePresence>
            {showAnnonces && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="mmi-notif-dropdown">
                <h4 className="cursive-font">Dernières Alertes</h4>
                {recentAnnonces.map(a => (
                  <div key={a.id} className="mmi-notif-item">
                    <strong>{a.titre}</strong>
                    <p>{a.contenu.substring(0, 30)}...</p>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="mmi-user-profile-pill">
          <div className="avatar-circle">A</div>
          <div className="mmi-user-info">
            <span className="mmi-user-role bordeaux-text">ADMINISTRATEUR</span>
            <button onClick={onLogout} className="mmi-logout-link cursive-font">Fermer la session</button>
          </div>
        </div>
      </div>
    </header>
  );

  // --------------------------------------------------------------------------
  // --- 11. ASSEMBLAGE FINAL DU DASHBOARD ---
  // --------------------------------------------------------------------------

  return (
    <div className="admin-mmi-wrapper">
      <Header />

      <main className="mmi-admin-main">
        {/* INDICATEUR DE CHARGEMENT GLOBAL */}
        {isLoading && <div className="mmi-global-loader">Synchronisation Ecampus en cours...</div>}
        
        {/* GESTION DES ERREURS GLOBALES */}
        {globalError && (
          <div className="mmi-error-banner">
            <span>⚠️ {globalError}</span>
            <button onClick={fetchAllData}>RÉESSAYER</button>
          </div>
        )}

        <AnimatePresence mode="wait">
          
          {/* DASHBOARD PRINCIPAL */}
          {activeTab === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mmi-stage">
              <div className="dashboard-cards-row">
                <div className="dashboard-card">
                  <span className="dashboard-value cursive-font">{saeOnlineCount}</span>
                  <span className="dashboard-label">SAE EN LIGNE</span>
                </div>
                <div className="dashboard-card">
                  <span className="dashboard-value cursive-font">{devoirsRecusCount}</span>
                  <span className="dashboard-label">DEVOIRS REÇUS</span>
                </div>
                <div className="dashboard-card dashboard-card-large">
                  <span className="dashboard-value cursive-font">{moyennePromo}</span>
                  <span className="dashboard-label">MOYENNE PROMO</span>
                </div>
              </div>

              <div className="mmi-glass-card">
                <h3 className="cursive-font">Annonces récentes sur la plateforme</h3>
                <div className="annonces-card-list">
                  {recentAnnonces.length ? recentAnnonces.map(a => (
                    <div key={a.id} className="annonce-item">
                      <strong>{a.titre}</strong> <small>{new Date(a.date).toLocaleDateString('fr-FR')}</small>
                      <p>{a.contenu}</p>
                    </div>
                  )) : <p className="empty-txt">Aucune annonce en ce moment.</p>}
                </div>
              </div>
            </motion.div>
          )}

          {/* CATALOGUE ET VITRINE */}
          {activeTab === 'catalogue' && (
            <motion.div key="cat" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mmi-stage">
              <h2 className="cursive-font bordeaux-text mmi-stage-title">Gestion SAE & Vitrine ({allSaes.length})</h2>
              <div className="mmi-glass-card">
                <table className="mmi-data-table">
                  <thead><tr><th>PROJET</th><th>STATUT</th><th className="text-right">ACTIONS</th></tr></thead>
                  <tbody>
                    {allSaes.map(sae => {
                      const pdfLink = sae.pdfUrl || sae.pdf_url || sae.pdf || null;
                      return (
                        <React.Fragment key={sae.id}>
                          <tr>
                            <td className="bold-cell">[{sae.ressource}] {sae.titre}</td>
                            <td className={sae.status === 'VALIDE' ? 'status-valide' : 'status-draft'}>{sae.status}</td>
                            <td className="text-right" style={{display: 'flex', justifyContent: 'flex-end', gap: '8px', alignItems: 'center'}}>
                              {pdfLink && (
                                <a href={pdfLink} target="_blank" rel="noreferrer" className="mmi-btn-link">PDF</a>
                              )}
                              <button className="mmi-btn-toggle" onClick={() => toggleSaeVisibility(sae.id, sae.status)}>
                                {sae.status === 'VALIDE' ? "MASQUER" : "PUBLIER"}
                              </button>
                              <button className="mmi-btn-vitrine" onClick={() => fetchRendusForSae(sae.id)}>VITRINE</button>
                            </td>
                          </tr>
                        {viewingRendusFor === sae.id && (
                          <tr className="vitrine-row">
                            <td colSpan="3">
                              <div className="vitrine-selection-box">
                                {loadingVitrine ? <p>Chargement...</p> : selectedSaeRendus.map(r => (
                                  <div key={r.id} className="rendu-item">
                                    <span>{r.email}</span>
                                    <button className={r.is_public ? 'mmi-star active' : 'mmi-star'} onClick={() => handleTogglePublic(r.id, r.is_public)}>
                                      {r.is_public ? "En Vitrine ★" : "Mettre en vitrine ☆"}
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                  </tbody>
                </table>
              </div>
              <h2 className="cursive-font bordeaux-text mmi-stage-title" style={{marginTop:'50px'}}>Validations en attente</h2>
              <div className="mmi-glass-card">
                <table className="mmi-data-table">
                  <thead><tr><th>EMAIL</th><th>RÔLE</th><th className="text-right">ACTION</th></tr></thead>
                  <tbody>
                    {pendingUsers.map(u => (
                      <tr key={u.id}>
                        <td>{u.email}</td>
                        <td>{u.role}</td>
                        <td className="text-right"><button className="mmi-btn-green" onClick={() => handleValidateUser(u.id)}>VALIDER LE COMPTE</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* CRÉATION SAE */}
          {activeTab === 'sae' && (
            <motion.div key="sae" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mmi-stage-centered">
              <div className="mmi-glass-card mmi-form-card">
                <h2 className="cursive-font bordeaux-text">Nouvelle SAE</h2>
                <form className="mmi-grid-form" onSubmit={handleCreateSAE}>
                  <div className="mmi-input-group"><label>Titre de la SAE</label><input type="text" className="mmi-input-pill" onChange={e => setSaeForm({...saeForm, titre: e.target.value})} required /></div>
                  <div className="mmi-input-group"><label>Ressource concernée</label><input type="text" className="mmi-input-pill" onChange={e => setSaeForm({...saeForm, ressource: e.target.value})} required /></div>
                  <div className="mmi-input-group"><label>Échéance de rendu</label><input type="date" className="mmi-input-pill" onChange={e => setSaeForm({...saeForm, date: e.target.value})} required /></div>
                  <div className="mmi-input-group"><label>Illustration SAE</label><input type="file" className="mmi-input-pill" accept="image/*" onChange={e => setSaeForm({...saeForm, imageFile: e.target.files[0]})} /></div>
                  <div className="mmi-input-group"><label>Document PDF (consignes / sujet)</label><input type="file" className="mmi-input-pill" accept="application/pdf" onChange={e => setSaeForm({...saeForm, pdfFile: e.target.files[0]})} /></div>
                  <div className="mmi-input-group full-span"><label>Consignes de travail</label><textarea rows="5" className="mmi-input-pill mmi-textarea" onChange={e => setSaeForm({...saeForm, desc: e.target.value})} required></textarea></div>
                  <div className="mmi-form-actions"><button type="submit" className="mmi-btn-black">CRÉER LE PROJET</button></div>
                </form>
              </div>
            </motion.div>
          )}

          {/* ÉTUDIANTS */}
          {activeTab === 'etudiant' && (
            <motion.div key="etu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mmi-stage">
              <div className="mmi-dual-row">
                <div className="mmi-glass-card half-card">
                  <h3 className="cursive-font bordeaux-text">Inscrire un élève</h3>
                  <form onSubmit={handleCreateStudent}>
                    <div className="mmi-input-group"><label>Email</label><input type="email" className="mmi-input-pill" onChange={e => setStudentForm({...studentForm, email: e.target.value})} required /></div>
                    <div className="mmi-input-group"><label>Mot de passe</label><input type="password" className="mmi-input-pill" onChange={e => setStudentForm({...studentForm, password: e.target.value})} required /></div>
                    <button type="submit" className="mmi-btn-black small-btn">CRÉER COMPTE</button>
                  </form>
                </div>
                <div className="mmi-glass-card half-card">
                  <h3 className="cursive-font bordeaux-text">Inscrire dans une ressource</h3>
                  <form onSubmit={handleEnrollStudent}>
                    <div className="mmi-input-group"><label>Identifiant élève</label><input type="email" className="mmi-input-pill" value={enrollForm.email} onChange={e => setEnrollForm({...enrollForm, email: e.target.value})} required /></div>
                    <div className="mmi-input-group"><label>Code SAE</label><input type="text" className="mmi-input-pill" value={enrollForm.ressource} onChange={e => setEnrollForm({...enrollForm, ressource: e.target.value})} required /></div>
                    <button type="submit" className="mmi-btn-black small-btn">RAJOUTER</button>
                  </form>
                </div>
              </div>
              <h2 className="cursive-font bordeaux-text mmi-stage-title" style={{marginTop:'40px'}}>Annuaire : {activeStudentsCount} actifs</h2>
              <div className="mmi-glass-card">
                <table className="mmi-data-table">
                  <thead><tr><th>IDENTIFIANT</th><th>SÉCURITÉ</th><th>STATUT</th></tr></thead>
                  <tbody>
                    {students.map(s => (
                      <tr key={s.id}>
                        <td className="bold-cell">{s.email}</td>
                        <td><button onClick={() => handleChangePassword(s.id, s.email)} className="mmi-btn-link">Changer mdp</button></td>
                        <td className="status-valide">{s.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* ANNONCES */}
          {activeTab === 'annonces' && (
            <motion.div key="ann" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mmi-stage-centered">
              <div className="mmi-glass-card mmi-form-card">
                <h2 className="cursive-font bordeaux-text">{editingAnnonce ? "Modifier l'annonce" : "Diffuser une annonce globale"}</h2>
                <form className="mmi-grid-form" onSubmit={handlePostAnnonce}>
                  <div className="mmi-input-group"><label>Titre</label><input type="text" className="mmi-input-pill" value={annonceForm.titre} onChange={e => setAnnonceForm({...annonceForm, titre: e.target.value})} required /></div>
                  <div className="mmi-input-group">
                    <label>Cible</label>
                    <select className="mmi-input-pill" value={annonceForm.cible} onChange={e => setAnnonceForm({...annonceForm, cible: e.target.value})}>
                      <option value="Tous">Tous les utilisateurs</option><option value="Étudiants">Étudiants</option><option value="Enseignants">Enseignants</option>
                    </select>
                  </div>
                  <div className="mmi-input-group full-span"><label>Message</label><textarea rows="4" className="mmi-input-pill mmi-textarea" value={annonceForm.contenu} onChange={e => setAnnonceForm({...annonceForm, contenu: e.target.value})} required></textarea></div>
                  <div className="mmi-form-actions">
                    <button type="submit" className="mmi-btn-black">{editingAnnonce ? 'METTRE À JOUR' : 'PUBLIER'}</button>
                    {editingAnnonce && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingAnnonce(null);
                          setAnnonceForm({ titre: '', contenu: '', cible: 'Tous' });
                        }}
                        className="mmi-btn-toggle"
                      >
                        ANNULER
                      </button>
                    )}
                  </div>
                </form>
              </div>
              <h2 className="cursive-font bordeaux-text mmi-stage-title" style={{marginTop:'50px'}}>Historique des diffusions</h2>
              <div className="mmi-glass-card">
                <div className="mmi-history-list">
                  {annonces.map(a => (
                    <div key={a.id} className="mmi-history-item cursive-font">
                      <div className="h-header">
                        <strong className="cursive-font">{a.titre} <em>({a.cible})</em></strong>
                        <div className="h-btns">
                          <button type="button" className="mmi-history-btn cursive-font" onClick={() => {setEditingAnnonce(a); setAnnonceForm({titre:a.titre, contenu:a.contenu, cible:a.cible})}}>✎</button>
                          <button type="button" className="mmi-history-btn cursive-font" onClick={() => deleteAnnonce(a.id)}>🗑</button>
                        </div>
                      </div>
                      <p className="cursive-font">{a.contenu}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* PROFIL PREMIUM */}
          {activeTab === 'profil' && (
            <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mmi-profile-immersive">
              <div className="profile-layout-grid">
                <aside className="profile-sidebar-card">
                  <div className="mmi-avatar-xl">A</div>
                  <div className="profile-meta-titles">
                    <h2 className="cursive-font bordeaux-text">{profileInfo.nom}</h2>
                    <p className="mmi-email-sub">{user.email}</p>
                    <div className="profile-badge-row">
                      <span className="mmi-tag-pill">{profileInfo.poste}</span>
                      <span className="mmi-tag-pill active">Compte Validé</span>
                    </div>
                  </div>
                  <div className="profile-bio-box">
                    <h4 className="cursive-font bordeaux-text">Ma Biographie</h4>
                    {isEditingProfile ? (
                      <textarea className="mmi-pill-input area" value={profileInfo.bio} onChange={e => setProfileInfo({...profileInfo, bio: e.target.value})} />
                    ) : (
                      <p>{profileInfo.bio}</p>
                    )}
                  </div>
                  <div className="profile-cta-stack">
                    <button onClick={isEditingProfile ? handleSaveProfile : () => setIsEditingProfile(true)} className="btn-mmi-profile edit">
                      {isEditingProfile ? "SAUVEGARDER" : "MODIFIER PROFIL"}
                    </button>
                    <button onClick={onLogout} className="btn-mmi-profile logout">DÉCONNEXION</button>
                  </div>
                </aside>

                <section className="profile-main-settings">
                  <div className="mmi-glass-card setting-block">
                    <h3 className="cursive-font bordeaux-text">Sécurité du compte</h3>
                    <form className="mmi-security-form" onSubmit={handleSecurityUpdate}>
                      <div className="mmi-form-group">
                        <label>Clé d'accès actuelle</label>
                        <input type="password" placeholder="••••••••" className="mmi-pill-input" />
                      </div>
                      <div className="mmi-form-row-flex">
                        <div className="mmi-form-group">
                          <label>Nouveau mot de passe</label>
                          <input type="password" value={pwdForm.new} className="mmi-pill-input" onChange={e => setPwdForm({...pwdForm, new: e.target.value})} />
                        </div>
                        <div className="mmi-form-group">
                          <label>Confirmation</label>
                          <input type="password" value={pwdForm.confirm} className="mmi-pill-input" onChange={e => setPwdForm({...pwdForm, confirm: e.target.value})} />
                        </div>
                      </div>
                      <button type="submit" className="mmi-btn-black full-width">METTRE À JOUR LA SÉCURITÉ</button>
                    </form>
                  </div>
                  <div className="mmi-glass-card setting-block" style={{marginTop:'35px'}}>
                    <h3 className="cursive-font bordeaux-text">Localisation SI</h3>
                    <div className="pro-item"><label>Bureau SI</label><p>{profileInfo.localisation}</p></div>
                  </div>
                </section>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      <footer className="mmi-admin-footer bordeaux-text cursive-font">
        © 2026 Ecampus MMI Vélizy —  Administrateur
      </footer>
    </div>
  );
}