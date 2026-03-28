import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './TeacherDashboard.css';

export default function TeacherDashboard({ user, onLogout, API_URL }) {
  // États de l'interface
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [filterSae, setFilterSae] = useState('TOUTES');

  // Données
  const [saes, setSaes] = useState([]);
  const [rendus, setRendus] = useState([]);
  const [annonces, setAnnonces] = useState([]);

  // Formulaires
  const [saeForm, setSaeForm] = useState({ titre: '', ressource: '', date: '', desc: '', promotion: '2024', semestre: 'S1' });
  const [annonceForm, setAnnonceForm] = useState({ titre: '', contenu: '' });
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

  // --- CALCULS STATISTIQUES ---
  const stats = useMemo(() => {
    const totalRendus = rendus.length;
    const notesValides = rendus.map(r => parseFloat(r.note)).filter(n => !isNaN(n));
    const moyenne = notesValides.length > 0 ? (notesValides.reduce((a, b) => a + b, 0) / notesValides.length).toFixed(2) : "N/A";
    return { totalRendus, moyenne, totalSaes: saes.length };
  }, [rendus, saes]);

  // --- ACTIONS ---
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
    fetchData(); // Silencieux pour l'expérience utilisateur
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
          <button className={activeTab === 'rendus' ? 'active' : ''} onClick={() => setActiveTab('rendus')}>Rendus</button>
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

          {/* VUE 2 : GESTION DES RENDUS (TABLEAU COMPLEXE) */}
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
                    <th>Fichiers / Liens</th>
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
                          {r.fichier_rendu && <a href={`${API_URL}${r.fichier_rendu}`} target="_blank" className="dl-btn">Fichier 📥</a>}
                          {r.lien_rendu && <a href={r.lien_rendu} target="_blank" className="dl-btn">Lien 🔗</a>}
                        </div>
                      </td>
                      <td>
                        <input 
                          type="number" 
                          max="20" 
                          min="0" 
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

          {/* VUE 3 : FORMULAIRE DE CRÉATION SAE */}
          {activeTab === 'creation' && (
            <motion.div key="cr" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel medium">
              <h2>Publier un nouveau projet</h2>
              <form onSubmit={handleCreateSae} className="complex-form">
                <div className="form-group">
                  <input type="text" placeholder="Titre de la SAE" onChange={e => setSaeForm({...saeForm, titre: e.target.value})} required />
                  <input type="text" placeholder="Code Ressource (ex: R3.01)" onChange={e => setSaeForm({...saeForm, ressource: e.target.value})} required />
                </div>
                <div className="form-group">
                  <select onChange={e => setSaeForm({...saeForm, promotion: e.target.value})}>
                    <option value="2024">Promotion 2024</option>
                    <option value="2025">Promotion 2025</option>
                    <option value="2026">Promotion 2026</option>
                  </select>
                  <select onChange={e => setSaeForm({...saeForm, semestre: e.target.value})}>
                    <option value="S1">Semestre 1</option>
                    <option value="S2">Semestre 2</option>
                    <option value="S3">Semestre 3</option>
                    <option value="S4">Semestre 4</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Date limite de rendu :</label>
                  <input type="date" onChange={e => setSaeForm({...saeForm, date: e.target.value})} required />
                </div>
                <textarea placeholder="Consignes détaillées pour les étudiants..." onChange={e => setSaeForm({...saeForm, desc: e.target.value})}></textarea>
                <div className="file-input-wrapper">
                   <label>Image de couverture :</label>
                   <input type="file" onChange={e => setImageFile(e.target.files[0])} />
                </div>
                <button type="submit" className="btn-gradient">LANCER LE PROJET</button>
              </form>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}