import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UserProfile from './UserProfile'; 
import WelcomeAnimation from './WelcomeAnimation'; 
import './TeacherDashboard.css';

export default function TeacherDashboard({ user, onLogout, API_URL }) {
  // --- ÉTATS DE L'INTERFACE ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true); 
  const [saes, setSaes] = useState([]);
  const [rendus, setRendus] = useState([]);
  
  // État du formulaire avec saisie manuelle libre
  const [saeForm, setSaeForm] = useState({ 
    titre: '', 
    ressource: '', 
    date: '', 
    desc: '', 
    promotion: '', 
    semestre: '' 
  });
  const [imageFile, setImageFile] = useState(null);

  const token = localStorage.getItem('token');

  // --- RÉCUPÉRATION DES DONNÉES ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    const headers = { 'Authorization': `Bearer ${token}` };
    try {
      const [resSaes, resRendus] = await Promise.all([
        fetch(`${API_URL}/api/admin/all-saes`, { headers }),
        fetch(`${API_URL}/api/admin/rendus-details`, { headers })
      ]);
      const dataSaes = await resSaes.json();
      const dataRendus = await resRendus.json();
      setSaes(Array.isArray(dataSaes) ? dataSaes : []);
      setRendus(Array.isArray(dataRendus) ? dataRendus : []);
    } catch (err) { 
      console.error("Erreur de chargement:", err); 
    } finally { 
      setLoading(false); 
    }
  }, [API_URL, token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- ACTIONS : NOTATION ---
  const handleUpdateNote = async (renduId, note) => {
    try {
      await fetch(`${API_URL}/api/admin/noter`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ rendu_id: renduId, note: note })
      });
      fetchData(); 
    } catch (err) {
      console.error("Erreur lors de la notation :", err);
    }
  };

  // --- ACTIONS : VISIBILITÉ (Toggle Masquer/Afficher) ---
  const toggleVisibility = async (saeId, currentStatus) => {
    const newStatus = currentStatus === 'VALIDE' ? 'BROUILLON' : 'VALIDE';
    try {
      const res = await fetch(`${API_URL}/api/admin/saes/${saeId}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) { fetchData(); }
    } catch (err) {
      console.error("Erreur de visibilité :", err);
    }
  };

  // --- CALCULS DES STATISTIQUES ---
  const globalStats = useMemo(() => {
    const notesValides = rendus.map(r => parseFloat(r.note)).filter(n => !isNaN(n));
    const moyenne = notesValides.length > 0 ? (notesValides.reduce((a, b) => a + b, 0) / notesValides.length).toFixed(2) : "N/A";
    return { totalSaes: saes.length, totalRendus: rendus.length, moyenne };
  }, [rendus, saes]);

  const saeStats = useMemo(() => {
    return saes.map(s => {
      const rendusPourCetteSae = rendus.filter(r => r.sae_id === s.id).length;
      const effectifTotal = 15; 
      const pourcentage = Math.round((rendusPourCetteSae / effectifTotal) * 100);
      return { ...s, complet: rendusPourCetteSae, total: effectifTotal, pourcentage: pourcentage };
    });
  }, [saes, rendus]);

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
      alert("Projet publié avec succès !");
      setSaeForm({ titre: '', ressource: '', date: '', desc: '', promotion: '', semestre: '' });
      setImageFile(null);
      fetchData();
      setActiveTab('dashboard');
    }
  };

  if (showWelcome) {
    return <WelcomeAnimation user={user} onFinished={() => setShowWelcome(false)} />;
  }

  if (loading) return <div className="loader-prof">Chargement...</div>;

  return (
    <div className="teacher-blue-screen">
      <header className="teacher-nav-pill">
        <div className="brand">ECAMPUS <span className="badge-admin">PROFS</span></div>
        <nav className="nav-items">
          <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>Stats</button>
          <button className={activeTab === 'catalogue' ? 'active' : ''} onClick={() => setActiveTab('catalogue')}>Catalogue</button>
          <button className={activeTab === 'projets' ? 'active' : ''} onClick={() => setActiveTab('projets')}>Gestion</button>
          <button className={activeTab === 'rendus' ? 'active' : ''} onClick={() => setActiveTab('rendus')}>Notation</button>
          <button className={activeTab === 'profil' ? 'active' : ''} onClick={() => setActiveTab('profil')}>Mon Profil</button>
        </nav>
        <button className="logout-pill" onClick={onLogout}>Quitter</button>
      </header>

      <main className="teacher-main-container">
        <AnimatePresence mode="wait">
          
          {/* VUE STATISTIQUES */}
          {activeTab === 'dashboard' && (
            <motion.div key="db" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="content-grid">
              <div className="stats-row">
                <div className="stat-card"><h3>{globalStats.totalSaes}</h3><p>SAE Publiées</p></div>
                <div className="stat-card"><h3>{globalStats.totalRendus}</h3><p>Devoirs Reçus</p></div>
                <div className="stat-card"><h3>{globalStats.moyenne}/20</h3><p>Moyenne Générale</p></div>
              </div>
              <h2 className="view-title-white" style={{marginTop:'40px'}}>Avancement par projet</h2>
              <div className="stats-grid-pro">
                {saeStats.map(stat => (
                  <div key={stat.id} className="progress-card-glass">
                    <div className="progress-info"><span>{stat.titre}</span><span>{stat.complet} / {stat.total}</span></div>
                    <div className="progress-track">
                        <motion.div className="progress-fill" initial={{ width: 0 }} animate={{ width: `${stat.pourcentage}%` }} style={{ backgroundColor: stat.pourcentage === 100 ? '#00ff88' : '#2563eb' }}/>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* VUE CATALOGUE */}
          {activeTab === 'catalogue' && (
            <motion.div key="cat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="tab-container">
              <h1 className="white-title-large">Catalogue & Visibilité</h1>
              <div className="sae-grid">
                {saes.map(sae => (
                  <div className={`sae-glass-card ${sae.status === 'BROUILLON' ? 'is-hidden' : ''}`} key={sae.id}>
                    {sae.image ? (
                      <div className="sae-image-container" style={{backgroundImage: `url(${API_URL}${sae.image})`}}>
                        {sae.status === 'BROUILLON' && <div className="hidden-overlay">MASQUÉ</div>}
                      </div>
                    ) : (
                      <div className="sae-image-placeholder">No Image</div>
                    )}
                    <div className="sae-card-content">
                      <div className="card-header-flex">
                        <span className="sae-ressource-badge">{sae.ressource}</span>
                        <button 
                          className={`btn-visibility ${sae.status === 'VALIDE' ? 'visible' : 'hidden'}`}
                          onClick={() => toggleVisibility(sae.id, sae.status)}
                        >
                          {sae.status === 'VALIDE' ? '👁️ Public' : '👁️‍🗨️ Masqué'}
                        </button>
                      </div>
                      <h3 className="sae-title">{sae.titre}</h3>
                      <p className="sae-desc">{sae.description}</p>
                      <div className="sae-meta-info" style={{fontSize: '0.8rem', marginTop: '10px', opacity: 0.8}}>
                        <span>Année: {sae.promotion}</span> | <span>Semestre: {sae.semestre}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* VUE CRÉATION (AVEC SAISIE LIBRE) */}
          {activeTab === 'projets' && (
            <motion.div key="pj" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel full">
              <h2 className="panel-title-white">Créer une nouvelle SAE</h2>
              <form onSubmit={handleCreateSae} className="complex-form complex-form-teacher">
                <div className="form-group">
                  <div className="input-group-blue">
                    <label>Titre de la SAE</label>
                    <input type="text" value={saeForm.titre} onChange={e => setSaeForm({...saeForm, titre: e.target.value})} placeholder="Nom du projet..." required />
                  </div>
                  <div className="input-group-blue">
                    <label>Matière / Ressource</label>
                    <input type="text" value={saeForm.ressource} onChange={e => setSaeForm({...saeForm, ressource: e.target.value})} placeholder="Ex: Développement Web..." required />
                  </div>
                </div>
                <div className="form-group">
                  <div className="input-group-blue">
                    <label>Année / Promotion</label>
                    <input type="text" value={saeForm.promotion} onChange={e => setSaeForm({...saeForm, promotion: e.target.value})} placeholder="Ex: 2026" required />
                  </div>
                  <div className="input-group-blue">
                    <label>Semestre</label>
                    <input type="text" value={saeForm.semestre} onChange={e => setSaeForm({...saeForm, semestre: e.target.value})} placeholder="Ex: S1" required />
                  </div>
                </div>
                <div className="input-group-blue"><label>Consignes / Description</label><textarea rows="4" value={saeForm.desc} onChange={e => setSaeForm({...saeForm, desc: e.target.value})}></textarea></div>
                <div className="form-group">
                  <div className="input-group-blue"><label>Date limite de rendu</label><input type="date" value={saeForm.date} onChange={e => setSaeForm({...saeForm, date: e.target.value})} required /></div>
                  <div className="input-group-blue"><label>Image d'illustration</label><input type="file" onChange={e => setImageFile(e.target.files[0])} /></div>
                </div>
                <button type="submit" className="btn-prof-outline submit-btn-teacher">Publier le projet</button>
              </form>
            </motion.div>
          )}

          {/* VUE NOTATION */}
          {activeTab === 'rendus' && (
            <motion.div key="rd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel full">
              <h2 className="panel-title-white">Notation des travaux</h2>
              <table className="teacher-table">
                <thead><tr><th>Étudiant</th><th>SAE</th><th>Dépôt</th><th>Note</th></tr></thead>
                <tbody>
                    {rendus.map(r => (
                        <tr key={r.id}>
                            <td>{r.email}</td>
                            <td>{r.sae_titre}</td>
                            <td>{new Date(r.date_depot).toLocaleDateString()}</td>
                            <td><input type="number" defaultValue={r.note} onBlur={(e) => handleUpdateNote(r.id, e.target.value)} className="note-input-field"/></td>
                        </tr>
                    ))}
                </tbody>
              </table>
            </motion.div>
          )}

          {/* VUE PROFIL */}
          {activeTab === 'profil' && <UserProfile user={user} API_URL={API_URL} onLogout={onLogout} />}

        </AnimatePresence>
      </main>
    </div>
  );
}