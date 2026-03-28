import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './TeacherDashboard.css';

export default function TeacherDashboard({ user, onLogout, API_URL }) {
  // --- ÉTATS ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [filterSae, setFilterSae] = useState('TOUTES');

  // Données
  const [saes, setSaes] = useState([]);
  const [rendus, setRendus] = useState([]);
  const [annonces, setAnnonces] = useState([]);

  // État pour stocker les élèves du projet sélectionné (Modal)
  const [selectedProjectRendus, setSelectedProjectRendus] = useState(null);

  // Formulaires
  const [saeForm, setSaeForm] = useState({ titre: '', ressource: '', date: '', desc: '', promotion: '2024', semestre: 'S1' });
  const [imageFile, setImageFile] = useState(null);

  const token = localStorage.getItem('token');

  // --- RÉCUPÉRATION DES DONNÉES ---
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
      console.error("Erreur de chargement:", err);
    } finally {
      setLoading(false);
    }
  }, [API_URL, token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- ACTIONS ---
  
  // Fonction pour voir qui a rempli quoi pour une SAE précise
  const handleViewRendus = async (saeId) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/rendus/sae/${saeId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setSelectedProjectRendus(data);
    } catch (err) {
      console.error("Erreur lors de la récupération des rendus par SAE", err);
    }
  };

  const stats = useMemo(() => {
    const totalRendus = rendus.length;
    const notesValides = rendus.map(r => parseFloat(r.note)).filter(n => !isNaN(n));
    const moyenne = notesValides.length > 0 ? (notesValides.reduce((a, b) => a + b, 0) / notesValides.length).toFixed(2) : "N/A";
    return { totalRendus, moyenne, totalSaes: saes.length };
  }, [rendus, saes]);

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
      alert("Projet SAE publié avec succès !");
      setSaeForm({ titre: '', ressource: '', date: '', desc: '', promotion: '2024', semestre: 'S1' });
      setImageFile(null);
      fetchData();
      setActiveTab('dashboard');
    }
  };

  const handleUpdateNote = async (renduId, note) => {
    await fetch(`${API_URL}/api/admin/noter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ rendu_id: renduId, note: note })
    });
    fetchData();
  };

  const filteredRendus = filterSae === 'TOUTES' ? rendus : rendus.filter(r => r.sae_titre === filterSae);

  if (loading) return <div className="loader-prof">Chargement du centre de contrôle...</div>;

  return (
    <div className="teacher-blue-screen">
      
      {/* HEADER GÉLULE PREMIUM */}
      <header className="teacher-nav-pill">
        <div className="brand">ECAMPUS <span className="badge-admin">ADMIN</span></div>
        <nav className="nav-items">
          <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
          <button className={activeTab === 'projets' ? 'active' : ''} onClick={() => setActiveTab('projets')}>Tous les projets</button>
          <button className={activeTab === 'rendus' ? 'active' : ''} onClick={() => setActiveTab('rendus')}>Notes</button>
          <button className={activeTab === 'creation' ? 'active' : ''} onClick={() => setActiveTab('creation')}>Nouvelle SAE</button>
        </nav>
        <div className="prof-info">
          <span>{user.email}</span>
          <button className="logout-pill" onClick={onLogout}>Quitter</button>
        </div>
      </header>

      <main className="teacher-main-container">
        <AnimatePresence mode="wait">
          
          {/* VUE 1 : DASHBOARD & STATS */}
          {activeTab === 'dashboard' && (
            <motion.div key="db" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="content-grid">
              <div className="stats-row">
                <div className="stat-card"><h3>{stats.totalSaes}</h3><p>SAE Actives</p></div>
                <div className="stat-card"><h3>{stats.totalRendus}</h3><p>Travaux Reçus</p></div>
                <div className="stat-card"><h3>{stats.moyenne}/20</h3><p>Moyenne Générale</p></div>
              </div>

              <div className="glass-panel">
                <h2>Derniers Rendus</h2>
                <div className="mini-list">
                  {rendus.slice(0, 5).map(r => (
                    <div className="mini-item" key={r.id}>
                      <strong>{r.email}</strong> a rendu <em>{r.sae_titre}</em>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* VUE : TOUS LES PROJETS (Image 806539.png) */}
          {activeTab === 'projets' && (
            <motion.div key="projets-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel full">
              <h2 className="panel-title-white">Tous les projets SAE</h2>
              <div className="sae-list-wrapper">
                {saes.map(sae => (
                  <div key={sae.id} className="sae-item-row-glass" onClick={() => handleViewRendus(sae.id)}>
                    <div className="sae-row-info">
                      <span className="sae-row-title">{sae.titre}</span>
                      <span className="status-badge-green">VALIDE</span>
                    </div>
                    <div className="sae-row-actions">
                      <button className="btn-action-pill">Ouvrir PDF</button>
                      <button className="btn-action-pill white-bg">Voir Image</button>
                      <button className="btn-blue-pill" onClick={(e) => { e.stopPropagation(); handleViewRendus(sae.id); }}>Voir les élèves →</button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* VUE : GESTION DES NOTES */}
          {activeTab === 'rendus' && (
            <motion.div key="rd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel full">
              <div className="panel-header">
                <h2>Suivi des Devoirs</h2>
                <select className="glass-select" onChange={(e) => setFilterSae(e.target.value)}>
                  <option value="TOUTES">Toutes les SAE</option>
                  {saes.map(s => <option key={s.id} value={s.titre}>{s.titre}</option>)}
                </select>
              </div>

              <table className="teacher-table">
                <thead>
                  <tr>
                    <th>Étudiant</th>
                    <th>SAE / Ressource</th>
                    <th>Date de dépôt</th>
                    <th>Actions</th>
                    <th>Note /20</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRendus.map(r => (
                    <tr key={r.id}>
                      <td className="bold">{r.email}</td>
                      <td><span className="badge-yellow">{r.ressource}</span> {r.sae_titre}</td>
                      <td>{new Date(r.date_depot).toLocaleDateString()}</td>
                      <td>
                        <div className="action-links">
                          {r.fichier_rendu && <a href={`${API_URL}${r.fichier_rendu}`} target="_blank" rel="noreferrer" className="dl-btn">Fichier 📥</a>}
                        </div>
                      </td>
                      <td>
                        <input 
                          type="number" 
                          max="20" 
                          className="note-input-field" 
                          defaultValue={r.note} 
                          onBlur={(e) => handleUpdateNote(r.id, e.target.value)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}

          {/* VUE : FORMULAIRE DE CRÉATION */}
          {activeTab === 'creation' && (
            <motion.div key="cr" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel medium">
              <h2>Créer une SAE</h2>
              <form onSubmit={handleCreateSae} className="complex-form">
                <div className="form-grid">
                  <div className="input-group">
                    <label>Titre de la SAE</label>
                    <input type="text" onChange={e => setSaeForm({...saeForm, titre: e.target.value})} required />
                  </div>
                  <div className="input-group">
                    <label>Ressources PDF</label>
                    <input type="file" />
                  </div>
                </div>
                <div className="input-group">
                    <label>Ressource concernée</label>
                    <input type="text" onChange={e => setSaeForm({...saeForm, ressource: e.target.value})} required />
                </div>
                <div className="input-group">
                    <label>Description technique</label>
                    <textarea onChange={e => setSaeForm({...saeForm, desc: e.target.value})}></textarea>
                </div>
                <div className="form-grid">
                  <div className="input-group">
                    <label>Image source</label>
                    <input type="file" onChange={e => setImageFile(e.target.files[0])} />
                  </div>
                  <div className="input-group">
                    <label>Date de rendu</label>
                    <input type="date" onChange={e => setSaeForm({...saeForm, date: e.target.value})} required />
                  </div>
                </div>
                <button type="submit" className="btn-publish-white">Créer une SAE</button>
              </form>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* --- MODAL D'AFFICHAGE DES ÉLÈVES (VUE DÉTAILLÉE) --- */}
      <AnimatePresence>
        {selectedProjectRendus && (
          <div className="modal-overlay-blue" onClick={() => setSelectedProjectRendus(null)}>
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.8, opacity: 0 }}
              className="modal-content-glass" 
              onClick={e => e.stopPropagation()}
            >
              <h3>Suivi des élèves - {selectedProjectRendus.length} inscrits</h3>
              <div className="student-list-scroll">
                {selectedProjectRendus.map((r, index) => (
                  <div key={index} className="student-render-row">
                    <div className="student-info">
                      <span className="student-email">{r.email}</span>
                      <span className={`render-status ${r.date_depot ? 'done' : 'missing'}`}>
                        {r.date_depot ? `✅ Rendu le ${new Date(r.date_depot).toLocaleDateString()}` : "❌ Pas encore rendu"}
                      </span>
                    </div>
                    {r.fichier_rendu && (
                      <a href={`${API_URL}${r.fichier_rendu}`} target="_blank" rel="noreferrer" className="dl-link-small">
                        Voir le travail
                      </a>
                    )}
                  </div>
                ))}
              </div>
              <button className="btn-close-modal" onClick={() => setSelectedProjectRendus(null)}>Fermer</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}