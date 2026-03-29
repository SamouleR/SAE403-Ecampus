import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './TeacherDashboard.css';

export default function TeacherDashboard({ user, onLogout, API_URL }) {
  // --- ÉTATS DE L'INTERFACE ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [saes, setSaes] = useState([]);
  const [rendus, setRendus] = useState([]);
  
  // État pour la fenêtre modale des élèves
  const [selectedProjectRendus, setSelectedProjectRendus] = useState(null);

  // Formulaire de création
  const [saeForm, setSaeForm] = useState({ 
    titre: '', 
    ressource: '', 
    date: '', 
    desc: '', 
    promotion: '2024', 
    semestre: 'S1' 
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

  // --- ACTIONS ---

  // Voir les élèves pour une SAE spécifique (Ilan, Jayson, Enzo, etc.)
  const handleViewRendus = async (saeId) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/rendus/sae/${saeId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setSelectedProjectRendus(data);
    } catch (err) {
      console.error("Erreur rendus par SAE:", err);
    }
  };

  // Calcul des statistiques pour le dashboard
  const stats = useMemo(() => {
    const notesValides = rendus.map(r => parseFloat(r.note)).filter(n => !isNaN(n));
    const moyenne = notesValides.length > 0 
      ? (notesValides.reduce((a, b) => a + b, 0) / notesValides.length).toFixed(2) 
      : "N/A";
    return { totalRendus: rendus.length, moyenne, totalSaes: saes.length };
  }, [rendus, saes]);

  // Création d'une nouvelle SAE
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
      setSaeForm({ titre: '', ressource: '', date: '', desc: '', promotion: '2024', semestre: 'S1' });
      setImageFile(null);
      fetchData();
      setActiveTab('projets');
    }
  };

  // Mise à jour de la note d'un étudiant
  const handleUpdateNote = async (renduId, note) => {
    await fetch(`${API_URL}/api/admin/noter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ rendu_id: renduId, note: note })
    });
    fetchData();
  };

  if (loading) return <div className="loader-prof">Chargement du centre de contrôle...</div>;

  return (
    <div className="teacher-blue-screen">
      
      {/* HEADER GÉLULE PREMIUM (Style image_ffadff) */}
      <header className="teacher-nav-pill">
        <div className="brand">ECAMPUS <span className="badge-admin">ADMIN</span></div>
        <nav className="nav-items">
          <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>Stats</button>
          <button className={activeTab === 'projets' ? 'active' : ''} onClick={() => setActiveTab('projets')}>Projets</button>
          <button className={activeTab === 'rendus' ? 'active' : ''} onClick={() => setActiveTab('rendus')}>Notation</button>
          <button className={activeTab === 'creation' ? 'active' : ''} onClick={() => setActiveTab('creation')}>Nouvelle SAE</button>
        </nav>
        <div className="prof-info">
          <span className="user-email-top">{user.email}</span>
          <button className="logout-pill" onClick={onLogout}>Quitter</button>
        </div>
      </header>

      <main className="teacher-main-container">
        <AnimatePresence mode="wait">
          
          {/* VUE 1 : STATISTIQUES */}
          {activeTab === 'dashboard' && (
            <motion.div key="db" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="content-grid">
              <div className="stats-row">
                <div className="stat-card"><h3>{stats.totalSaes}</h3><p>SAE Publiées</p></div>
                <div className="stat-card"><h3>{stats.totalRendus}</h3><p>Devoirs Reçus</p></div>
                <div className="stat-card"><h3>{stats.moyenne}/20</h3><p>Moyenne Générale</p></div>
              </div>
            </motion.div>
          )}

          {/* VUE 2 : LISTE DES PROJETS (Style image_31a2df) */}
          {activeTab === 'projets' && (
            <motion.div key="pj" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel full">
              <h2 className="panel-title-white">Tous les projets SAE</h2>
              <div className="sae-list-wrapper">
                {saes.map(sae => (
                  <div key={sae.id} className="sae-item-row-glass">
                    <div className="sae-row-info">
                      <span className="sae-row-title"><strong>{sae.titre}</strong> <small>({sae.ressource})</small></span>
                      <span className="status-badge-green">VALIDE</span>
                    </div>
                    <div className="sae-row-actions">
                      <button className="btn-action-pill" onClick={() => handleViewRendus(sae.id)}>Voir les élèves →</button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* VUE 3 : NOTATION DES RENDUS */}
          {activeTab === 'rendus' && (
            <motion.div key="rd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel full">
              <h2 className="panel-title-white">Notation des travaux</h2>
              <table className="teacher-table">
                <thead>
                  <tr>
                    <th>Étudiant</th>
                    <th>SAE</th>
                    <th>Date de dépôt</th>
                    <th>Note /20</th>
                  </tr>
                </thead>
                <tbody>
                  {rendus.map(r => (
                    <tr key={r.id}>
                      <td className="bold">{r.email}</td>
                      <td>{r.sae_titre}</td>
                      <td>{new Date(r.date_depot).toLocaleDateString()}</td>
                      <td>
                        <input 
                          type="number" 
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

          {/* VUE 4 : CRÉATION SAE (Style image_80ce7c) */}
          {activeTab === 'creation' && (
            <motion.div key="cr" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel medium">
              <h2 className="panel-title-white">Créer une SAE</h2>
              <form onSubmit={handleCreateSae} className="complex-form">
                <div className="form-group">
                  <div className="input-group-blue">
                    <label>Titre de la SAE</label>
                    <input type="text" onChange={e => setSaeForm({...saeForm, titre: e.target.value})} required />
                  </div>
                  <div className="input-group-blue">
                    <label>Code Ressource</label>
                    <input type="text" placeholder="ex: R3.01" onChange={e => setSaeForm({...saeForm, ressource: e.target.value})} required />
                  </div>
                </div>
                
                <div className="input-group-blue">
                  <label>Consignes techniques</label>
                  <textarea rows="5" onChange={e => setSaeForm({...saeForm, desc: e.target.value})}></textarea>
                </div>

                <div className="form-group">
                  <div className="input-group-blue">
                    <label>Date de rendu</label>
                    <input type="date" onChange={e => setSaeForm({...saeForm, date: e.target.value})} required />
                  </div>
                  <div className="input-group-blue">
                    <label>Image de couverture</label>
                    <input type="file" onChange={e => setImageFile(e.target.files[0])} />
                  </div>
                </div>
                
                <button type="submit" className="btn-blue-outline" style={{width: '100%', marginTop: '20px'}}>Lancer le projet</button>
              </form>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* MODAL : SUIVI DES ÉLÈVES (VUE DÉTAILLÉE) */}
      <AnimatePresence>
        {selectedProjectRendus && (
          <div className="modal-overlay-blue" onClick={() => setSelectedProjectRendus(null)}>
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              className="modal-content-glass" 
              onClick={e => e.stopPropagation()}
            >
              <h3>Suivi des élèves - {selectedProjectRendus.length} inscrits</h3>
              <div className="student-list-scroll">
                {selectedProjectRendus.map((r, index) => (
                  <div key={index} className="student-render-row">
                    <span className="student-email">{r.email}</span>
                    <span className={r.date_depot ? "status-done" : "status-missing"}>
                      {r.date_depot ? `✅ Rendu` : "❌ Attente"}
                    </span>
                  </div>
                ))}
              </div>
              <button className="btn-action-pill white-bg" onClick={() => setSelectedProjectRendus(null)}>Fermer</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}