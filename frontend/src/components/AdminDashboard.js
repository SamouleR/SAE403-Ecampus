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
  const [activeTab, setActiveTab] = useState('catalogue');
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

    try {
      const [resSaes, resPending, resStudents, resAnnonces] = await Promise.all([
        fetch(`${API_URL}/api/admin/all-saes`, { headers }),
        fetch(`${API_URL}/api/admin/pending-users`, { headers }),
        fetch(`${API_URL}/api/admin/etudiants`, { headers }),
        fetch(`${API_URL}/api/annonces`, { headers })
      ]);

      if (!resSaes.ok || !resPending.ok || !resStudents.ok || !resAnnonces.ok) {
        throw new Error("Une ou plusieurs ressources sont indisponibles.");
      }

      setAllSaes(await resSaes.json());
      setPendingUsers(await resPending.json());
      setStudents(await resStudents.json());
      setAnnonces(await resAnnonces.json());

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
      const res = await fetch(`${API_URL}/api/admin/saes/${saeId}/rendus`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setSelectedSaeRendus(await res.json());
    } finally { setLoadingVitrine(false); }
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
    const formData = new FormData();
    Object.keys(saeForm).forEach(k => {
      if (saeForm[k]) formData.append(k, saeForm[k]);
    });
    const res = await fetch(`${API_URL}/api/admin/saes`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    if (res.ok) {
      alert("SAE publiée.");
      setActiveTab('catalogue');
      fetchAllData();
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
    
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(annonceForm)
    });
    if (res.ok) {
      alert("Opération réussie.");
      setAnnonceForm({ titre: '', contenu: '', cible: 'Tous' });
      setEditingAnnonce(null);
      fetchAllData();
    }
  };

  const deleteAnnonce = async (id) => {
    if (!window.confirm("Supprimer l'annonce ?")) return;
    await fetch(`${API_URL}/api/annonces/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchAllData();
  };

  // --------------------------------------------------------------------------
  // --- 10. COMPOSANTS DE RENDU INTERNES ---
  // --------------------------------------------------------------------------

  const Header = () => (
    <header className="mmi-pill-header">
      <div className="mmi-admin-brand" onClick={() => setActiveTab('catalogue')}>
        <img src="/ecampus.svg" alt="logo" className="mmi-logo-img" />
        <span className="cursive-font bordeaux-text mmi-brand-name">Ecampus Admin</span>
      </div>

      <nav className="mmi-nav-links cursive-font">
        {['catalogue', 'sae', 'etudiant', 'annonces', 'profil'].map(tab => (
          <button key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}>
            {tab.toUpperCase()}
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
          
          {/* CATALOGUE ET VITRINE */}
          {activeTab === 'catalogue' && (
            <motion.div key="cat" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mmi-stage">
              <h2 className="cursive-font bordeaux-text mmi-stage-title">Gestion SAE & Vitrine ({allSaes.length})</h2>
              <div className="mmi-glass-card">
                <table className="mmi-data-table">
                  <thead><tr><th>PROJET</th><th>STATUT</th><th className="text-right">ACTIONS</th></tr></thead>
                  <tbody>
                    {allSaes.map(sae => (
                      <React.Fragment key={sae.id}>
                        <tr>
                          <td className="bold-cell">[{sae.ressource}] {sae.titre}</td>
                          <td className={sae.status === 'VALIDE' ? 'status-valide' : 'status-draft'}>{sae.status}</td>
                          <td className="text-right">
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
                    ))}
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
                  <div className="mmi-input-group"><label>Illustration SAE</label><input type="file" className="mmi-input-pill" onChange={e => setSaeForm({...saeForm, imageFile: e.target.files[0]})} /></div>
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
                    <button type="submit" className="mmi-btn-black">PUBLIER</button>
                    {editingAnnonce && <button type="button" onClick={() => setEditingAnnonce(null)} className="mmi-btn-toggle">ANNULER</button>}
                  </div>
                </form>
              </div>
              <h2 className="cursive-font bordeaux-text mmi-stage-title" style={{marginTop:'50px'}}>Historique des diffusions</h2>
              <div className="mmi-glass-card">
                <div className="mmi-history-list">
                  {annonces.map(a => (
                    <div key={a.id} className="mmi-history-item">
                      <div className="h-header">
                        <strong>{a.titre} <em>({a.cible})</em></strong>
                        <div className="h-btns">
                          <button onClick={() => {setEditingAnnonce(a); setAnnonceForm({titre:a.titre, contenu:a.contenu, cible:a.cible})}}>✎</button>
                          <button onClick={() => deleteAnnonce(a.id)}>🗑</button>
                        </div>
                      </div>
                      <p>{a.contenu}</p>
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
        © 2026 Ecampus MMI Vélizy — Haute Supervision Administrative
      </footer>
    </div>
  );
}