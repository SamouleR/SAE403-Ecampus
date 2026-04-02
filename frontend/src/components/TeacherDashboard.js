import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './TeacherDashboard.css';

/**
 * COMPOSANT : TeacherDashboard
 * Rôle : Interface de gestion pédagogique avancée.
 * Style : Bordeaux (#a31d24) / Crème (#fff9f0) / Neulis Cursive
 */
export default function TeacherDashboard({ user, onLogout, API_URL }) {
  // --- ÉTATS DE NAVIGATION ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedSae, setSelectedSae] = useState(null); 
  const [isManageMenuOpen, setIsManageMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // --- ÉTATS DES DONNÉES ---
  const [saes, setSaes] = useState([]);
  const [rendus, setRendus] = useState([]);
  const [annonces, setAnnonces] = useState([]);
  const token = localStorage.getItem('token');

  // --- ÉTATS DU PROFIL (SECTION REFAITE) ---
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

  // --- RÉCUPÉRATION DES DONNÉES (FETCH) ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    const headers = { 'Authorization': `Bearer ${token}` };
    try {
      const [resSaes, resRendus, resAnnonces] = await Promise.all([
        fetch(`${API_URL}/api/admin/all-saes`, { headers }),
        fetch(`${API_URL}/api/admin/rendus-details`, { headers }),
        fetch(`${API_URL}/api/annonces`, { headers })
      ]);
      
      const dataSaes = await resSaes.json();
      const dataRendus = await resRendus.json();
      const dataAnnonces = await resAnnonces.json();

      setSaes(Array.isArray(dataSaes) ? dataSaes : []);
      setRendus(Array.isArray(dataRendus) ? dataRendus : []);
      setAnnonces(Array.isArray(dataAnnonces) ? dataAnnonces : []);
    } catch (err) {
      console.error("Erreur de chargement des données pédagogiques:", err);
    } finally {
      setLoading(false);
    }
  }, [API_URL, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- LOGIQUE MÉTIER : GESTION SAE ---
  const handleCreateSae = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(saeForm).forEach(key => formData.append(key, saeForm[key]));
    if (imageFile) formData.append('image', imageFile);

    const res = await fetch(`${API_URL}/api/admin/saes`, { 
      method: 'POST', 
      headers: { 'Authorization': `Bearer ${token}` }, 
      body: formData 
    });
    if (res.ok) {
      alert("La nouvelle SAE est désormais en ligne !");
      setSaeForm({ titre: '', ressource: 'Développement Web', date: '', desc: '', promotion: '2026', semestre: 'S1' });
      setImageFile(null);
      fetchData();
      setActiveTab('catalogue');
    }
  };

  const toggleSaeVisibility = async (saeId, currentStatus) => {
    const newStatus = currentStatus === 'VALIDE' ? 'BROUILLON' : 'VALIDE';
    try {
      await fetch(`${API_URL}/api/admin/saes/${saeId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      fetchData();
    } catch (err) { console.error("Erreur toggle visibilité:", err); }
  };

  // --- LOGIQUE MÉTIER : NOTATION ---
  const handleUpdateNote = async (renduId, note) => {
    try {
      await fetch(`${API_URL}/api/admin/noter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ rendu_id: renduId, note: note })
      });
      fetchData(); 
    } catch (err) { console.error("Erreur notation:", err); }
  };

  // --- LOGIQUE MÉTIER : PROFIL & SÉCURITÉ ---
  const handleSecurityUpdate = (e) => {
    e.preventDefault();
    if (pwdForm.new !== pwdForm.confirm) return alert("Les mots de passe ne correspondent pas.");
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

  if (loading) return (
    <div className="mmi-loading-screen cursive-font">
      <div className="mmi-spinner"></div>
      Chargement de l'espace pédagogique...
    </div>
  );

  return (
    <div className="teacher-wrapper">
      
      {/* NAVBAR IDENTIQUE À LA VUE PUBLIQUE (GÉLULE ÉCLATÉE) */}
      <nav className="mmi-navbar-pill">
        <div className="nav-left-part" onClick={() => {setSelectedSae(null); setActiveTab('dashboard')}}>
          <img src="/ecampus.svg" alt="Logo" className="mmi-logo-nav" />
          <span className="brand-title cursive-font bordeaux-text">Ecampus</span>
        </div>

        <div className="nav-center-part cursive-font">
          <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => {setSelectedSae(null); setActiveTab('dashboard')}}>DASHBOARD</button>
          
          <div className="nav-dropdown-wrap" onMouseEnter={() => setIsManageMenuOpen(true)} onMouseLeave={() => setIsManageMenuOpen(false)}>
            <button className={activeTab === 'catalogue' || activeTab === 'projets' ? 'active' : ''}>GESTION ▾</button>
            <AnimatePresence>
              {isManageMenuOpen && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="mmi-nav-dropdown-content">
                  <span onClick={() => {setSelectedSae(null); setActiveTab('catalogue')}}>VISIBILITÉ CATALOGUE</span>
                  <span onClick={() => {setSelectedSae(null); setActiveTab('projets')}}>CRÉATION DE SAE</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button className={activeTab === 'rendus' ? 'active' : ''} onClick={() => {setSelectedSae(null); setActiveTab('rendus')}}>NOTATION</button>
          <button className={activeTab === 'profil' ? 'active' : ''} onClick={() => {setSelectedSae(null); setActiveTab('profil')}}>MON PROFIL</button>
        </div>

        <div className="nav-right-part">
          <div className="profile-badge-pill">
            <div className="badge-text">
              <span className="user-role-label bordeaux-text">Administrateur</span>
              <button onClick={onLogout} className="mmi-logout-link cursive-font">Fermer la session</button>
            </div>
            <div className="badge-avatar">A</div>
          </div>
        </div>
      </nav>

      <main className="teacher-main-stage">
        <AnimatePresence mode="wait">
          
          {/* VUE DÉTAILLÉE (IDENTIQUE ÉTUDIANT) */}
          {selectedSae ? (
            <motion.div key="sae-detail" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="sae-immersive-view">
              <button className="mmi-back-link cursive-font" onClick={() => setSelectedSae(null)}>← Retour au catalogue</button>
              <div className="sae-detail-hero">
                <div className="hero-split">
                  <div className="hero-visual-side" style={{backgroundImage: `url(${API_URL}${selectedSae.image})`}}></div>
                  <div className="hero-info-side">
                    <span className="res-tag-pill bordeaux-text cursive-font">{selectedSae.ressource}</span>
                    <h2 className="cursive-font title-display">{selectedSae.titre}</h2>
                    <p className="description-text">{selectedSae.description}</p>
                    <div className="meta-info-grid">
                        <div className="meta-box"><strong>Promotion :</strong> {selectedSae.promotion}</div>
                        <div className="meta-box"><strong>Rendu :</strong> {new Date(selectedSae.date_rendu).toLocaleDateString()}</div>
                    </div>
                    {selectedSae.pdf_link && (
                      <a href={`${API_URL}${selectedSae.pdf_link}`} target="_blank" rel="noreferrer" className="mmi-btn-black-pill">DÉCOUVRIR LE SUJET PDF</a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <>
              {/* ONGLET 1 : STATISTIQUES & DASHBOARD */}
              {activeTab === 'dashboard' && (
                <motion.div key="stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="dashboard-grid-view">
                  <div className="dashboard-stats-row">
                    <div className="stat-card-mmi"><h3>{globalStats.totalSaes}</h3><p>SAE EN LIGNE</p></div>
                    <div className="stat-card-mmi"><h3>{globalStats.totalRendus}</h3><p>DEVOIRS REÇUS</p></div>
                    <div className="stat-card-mmi bordeaux-fill"><h3>{globalStats.moyenne}</h3><p>MOYENNE PROMO</p></div>
                  </div>
                  
                  <div className="mmi-glass-card history-section" style={{marginTop: '40px'}}>
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

              {/* ONGLET 2 : CATALOGUE & VISIBILITÉ */}
              {activeTab === 'catalogue' && (
                <motion.div key="catalog" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h2 className="cursive-font bordeaux-text page-heading">Gestion de la visibilité des SAE</h2>
                  <div className="mmi-catalogue-grid">
                    {saes.map(s => (
                      <div key={s.id} className={`mmi-card-project ${s.status === 'BROUILLON' ? 'is-masked' : ''}`}>
                        <div className="project-media" style={{backgroundImage: `url(${API_URL}${s.image})`}} onClick={() => setSelectedSae(s)}>
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
                          <p className="short-desc">{s.description?.substring(0, 80)}...</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ONGLET 3 : CRÉATION SAE */}
              {activeTab === 'projets' && (
                <motion.div key="form" className="form-stage-centered">
                  <div className="mmi-glass-card sae-creation-card">
                    <h2 className="cursive-font bordeaux-text">Éditer une Situation d'Apprentissage</h2>
                    <form className="mmi-form-complex" onSubmit={handleCreateSae}>
                      <div className="mmi-form-row">
                        <div className="mmi-form-group">
                          <label className="bordeaux-text">Titre de la SAE</label>
                          <input type="text" className="mmi-pill-input" onChange={e => setSaeForm({...saeForm, titre: e.target.value})} required />
                        </div>
                        <div className="mmi-form-group">
                          <label className="bordeaux-text">Matière / Domaine</label>
                          <select className="mmi-pill-input" onChange={e => setSaeForm({...saeForm, ressource: e.target.value})}>
                            <option>Développement Web</option><option>Design & UX/UI</option><option>Audiovisuel</option><option>Communication</option>
                          </select>
                        </div>
                      </div>
                      <div className="mmi-form-group full">
                        <label className="bordeaux-text">Description et consignes</label>
                        <textarea className="mmi-pill-input mmi-area" rows="6" onChange={e => setSaeForm({...saeForm, desc: e.target.value})} required></textarea>
                      </div>
                      <div className="mmi-form-row">
                        <div className="mmi-form-group"><label>Date de rendu</label><input type="date" className="mmi-pill-input" onChange={e => setSaeForm({...saeForm, date: e.target.value})} required /></div>
                        <div className="mmi-form-group"><label>Fichier Illustration</label><input type="file" className="mmi-pill-input file" onChange={e => setImageFile(e.target.files[0])} /></div>
                      </div>
                      <div className="mmi-form-footer">
                        <button type="submit" className="mmi-btn-black-pill">PUBLIER LE PROJET PÉDAGOGIQUE</button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              )}

              {/* ONGLET 4 : NOTATION */}
              {activeTab === 'rendus' && (
                <motion.div key="grading" className="grading-stage">
                  <h2 className="cursive-font bordeaux-text page-heading">Evaluation des travaux d'étudiants</h2>
                  <div className="mmi-glass-card table-box">
                    <table className="mmi-grading-table">
                      <thead>
                        <tr><th>ÉTUDIANT</th><th>PROJET</th><th>DÉPÔT</th><th>NOTE / 20</th></tr>
                      </thead>
                      <tbody>
                        {rendus.map(r => (
                          <tr key={r.id}>
                            <td className="bold-text">{r.email}</td>
                            <td>{r.sae_titre}</td>
                            <td className="date-cell">{new Date(r.date_depot).toLocaleDateString()}</td>
                            <td><input type="number" defaultValue={r.note} onBlur={(e) => handleUpdateNote(r.id, e.target.value)} className="mmi-note-field" /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {/* ONGLET 5 : PROFIL TOTALEMENT REFAIT (IDENTIQUE IMAGE 7E19A9) */}
              {activeTab === 'profil' && (
                <motion.div key="profile" className="mmi-profile-immersive">
                  <div className="profile-layout-grid">
                    
                    {/* SIDEBAR : IDENTITÉ */}
                    <aside className="profile-sidebar-card">
                      <div className="mmi-avatar-xl">A</div>
                      <div className="profile-meta-titles">
                        <h2 className="cursive-font bordeaux-text">{profileInfo.nom}</h2>
                        <p className="mmi-email-sub">{user.email}</p>
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

                    {/* MAIN SETTINGS : SÉCURITÉ & INFOS */}
                    <section className="profile-main-settings">
                      <div className="mmi-glass-card setting-block">
                        <h3 className="cursive-font bordeaux-text">Sécurité du compte</h3>
                        <form className="mmi-security-form" onSubmit={handleSecurityUpdate}>
                          <div className="mmi-form-group">
                            <label>Ancien mot de passe</label>
                            <input type="password" placeholder="••••••••" className="mmi-pill-input" required />
                          </div>
                          <div className="mmi-form-row">
                            <div className="mmi-form-group">
                              <label>Nouveau mot de passe</label>
                              <input type="password" className="mmi-pill-input" onChange={e => setPwdForm({...pwdForm, new: e.target.value})} required />
                            </div>
                            <div className="mmi-form-group">
                              <label>Confirmer nouveau</label>
                              <input type="password" className="mmi-pill-input" onChange={e => setPwdForm({...pwdForm, confirm: e.target.value})} required />
                            </div>
                          </div>
                          <button type="submit" className="mmi-btn-black-pill full-width">METTRE À JOUR LE MOT DE PASSE</button>
                        </form>
                      </div>

                      <div className="mmi-glass-card setting-block" style={{marginTop:'35px'}}>
                        <h3 className="cursive-font bordeaux-text">Informations de contact pro.</h3>
                        <div className="mmi-pro-details">
                          <div className="pro-item"><label>Localisation</label><p>{profileInfo.bureau}</p></div>
                          <div className="pro-item"><label>Téléphone</label><p>{profileInfo.tel}</p></div>
                          <div className="pro-item"><label>Disponibilités</label><p>{profileInfo.dispo}</p></div>
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