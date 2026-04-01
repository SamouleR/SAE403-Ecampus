import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UserProfile from './UserProfile'; // Importation du nouveau composant
import './AdminDashboard.css';

export default function AdminDashboard({ user, onLogout, API_URL }) {
  const [activeTab, setActiveTab] = useState('catalogue');
  const token = localStorage.getItem('token');

  // MODIFIÉ : Gestion des vrais fichiers (null par défaut)
  const [saeForm, setSaeForm] = useState({ titre: '', ressource: '', date: '', desc: '', imageFile: null, pdfFile: null });
  const [studentForm, setStudentForm] = useState({ email: '', password: '' });
  const [enrollForm, setEnrollForm] = useState({ email: '', ressource: '' });
  
  // NOUVEAU : État pour le formulaire d'annonce
  
  const [annonceForm, setAnnonceForm] = useState({ titre: '', contenu: '' });
  const [allSaes, setAllSaes] = useState([]); // NOUVEAU : Toutes les SAEs
  const [pendingUsers, setPendingUsers] = useState([]);
  const [students, setStudents] = useState([]);

  const [annonces, setAnnonces] = useState([]);
  const [showAnnonces, setShowAnnonces] = useState(false);

  // NOUVEAU : États pour la gestion de la vitrine
  const [selectedSaeRendus, setSelectedSaeRendus] = useState([]);
  const [viewingRendusFor, setViewingRendusFor] = useState(null);

  const fetchAnnonces = useCallback(() => {
    fetch(`${API_URL}/api/annonces`, { headers: { 'Authorization': `Bearer ${token}` } })
    .then(res => res.json()).then(data => setAnnonces(Array.isArray(data) ? data : []))
    .catch(err => console.error("Erreur lors du chargement des annonces:", err));
  }, [API_URL, token]);

  const fetchCatalogueData = useCallback(() => {
    // Fetch Toutes les SAEs
    fetch(`${API_URL}/api/admin/all-saes`, { headers: { 'Authorization': `Bearer ${token}` } })
    .then(res => res.json()).then(data => setAllSaes(Array.isArray(data) ? data : []))
    .catch(err => console.error("Erreur lors du chargement des SAEs:", err));
    
    fetch(`${API_URL}/api/admin/pending-users`, { headers: { 'Authorization': `Bearer ${token}` } })
    .then(res => res.json()).then(data => setPendingUsers(Array.isArray(data) ? data : []))
    .catch(err => console.error("Erreur lors du chargement des utilisateurs en attente:", err));

    fetch(`${API_URL}/api/admin/etudiants`, { headers: { 'Authorization': `Bearer ${token}` } })
    .then(res => res.json()).then(data => setStudents(Array.isArray(data) ? data : []))
    .catch(err => console.error("Erreur lors du chargement des étudiants:", err));
  }, [API_URL, token]);

  useEffect(() => {
    fetchAnnonces();
    if (activeTab === 'catalogue' || activeTab === 'etudiant') {
      fetchCatalogueData();
    }
  }, [activeTab, fetchAnnonces, fetchCatalogueData]);


const handlePostAnnonce = async (e) => {
    e.preventDefault();
    
    try {
      const res = await fetch(`${API_URL}/api/annonces`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(annonceForm)
      });

      const contentType = res.headers.get("content-type");

      if (!res.ok) {
        if (contentType && contentType.includes("application/json")) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Le serveur a renvoyé une erreur JSON.");
        } else {
          throw new Error(`Erreur HTTP ${res.status}. Vérifie que la route API existe bien dans ton Backend.`);
        }
      }

      await res.json();
      alert("Annonce publiée avec succès !");
      setAnnonceForm({ titre: '', contenu: '' }); // Vide le formulaire
      fetchAnnonces(); // Rafraîchit la liste

    } catch (err) {
      console.error("Détail complet de l'erreur :", err);
      alert(`Erreur de publication : ${err.message}`); 
    }
  };

  
  // NOUVEAU : Charger les rendus pour gérer la vitrine
  const fetchRendusForSae = (saeId) => {
    if (viewingRendusFor === saeId) {
      setViewingRendusFor(null);
      return;
    }
    setViewingRendusFor(saeId);
    fetch(`${API_URL}/api/admin/saes/${saeId}/rendus`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setSelectedSaeRendus(Array.isArray(data) ? data : []))
    .catch(err => console.error("Erreur rendus:", err));
  };

  // NOUVEAU : Basculer l'état public/privé d'un rendu
  const handleTogglePublic = (renduId, currentState) => {
    fetch(`${API_URL}/api/admin/rendus/${renduId}/toggle-public`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ is_public: !currentState })
    })
    .then(res => res.json())
    .then(data => {
      alert(data.message || "Visibilité mise à jour !");
      fetchRendusForSae(viewingRendusFor); // Rafraîchir la liste
    });
  };

  const handleCreateSAE = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('titre', saeForm.titre);
    formData.append('ressource', saeForm.ressource);
    formData.append('date', saeForm.date);
    formData.append('desc', saeForm.desc);
    if (saeForm.imageFile) formData.append('image', saeForm.imageFile);
    if (saeForm.pdfFile) formData.append('pdf', saeForm.pdfFile);

    try {
      const res = await fetch(`${API_URL}/api/admin/saes`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erreur lors de la création de la SAE.");
      }

      const data = await res.json();
      alert(data.message || "SAE créée avec succès !");
      setSaeForm({ titre: '', ressource: '', date: '', desc: '', imageFile: null, pdfFile: null }); 
      fetchCatalogueData();
    } catch (err) {
      console.error("Erreur SAE:", err);
      alert(`Erreur : ${err.message}`);
    }
  };

  const toggleSaeVisibility = async (saeId, currentStatus) => {
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
        if (res.ok) fetchCatalogueData(); // Rafraîchit la liste
    } catch (err) {
        console.error("Erreur visibilité:", err);
    }
};
  const handleCreateStudent = (e) => {
    e.preventDefault();
    fetch(`${API_URL}/api/admin/etudiants`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(studentForm)
    })
    .then(res => {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            return res.json();
        } else {
            throw new Error("Le serveur n'a pas répondu en JSON (Erreur 500 ou 404)");
        }
    })
    .then(data => { 
        alert(data.message); 
        setStudentForm({ email: '', password: '' }); 
        fetchCatalogueData(); 
    })
    .catch(err => {
        console.error(err);
        alert("Erreur critique : " + err.message);
    });
  };

  const handleEnrollStudent = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/admin/inscriptions`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(enrollForm)
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setEnrollForm({ email: '', ressource: '' });
      } else {
        throw new Error(data.message || "Erreur lors de l'inscription.");
      }
    } catch (err) {
      console.error("Erreur inscription:", err);
      alert(`Erreur : ${err.message}`);
    }
  };

  const handleValidateUser = (id) => {
    fetch(`${API_URL}/api/admin/users/${id}/validate`, { 
        method: 'PUT', 
        headers: { 
            'Authorization': `Bearer ${token}` 
        } 
    })
    .then(res => res.json())
    .then(data => { 
        alert(data.message); 
        fetchCatalogueData(); 
    })
    .catch(err => alert("Erreur : " + err.message));
  };

  const handleChangePassword = async (id, email) => {
    const newPassword = window.prompt(`Entrez le NOUVEAU mot de passe pour l'étudiant : ${email}`);
    if (!newPassword) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${id}/password`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
      } else {
        throw new Error(data.message || "Erreur lors du changement de mot de passe.");
      }
    } catch (err) {
      console.error("Erreur mot de passe:", err);
      alert(`Erreur : ${err.message}`);
    }
  };

  return (
    <div className="admin-blue-layout">
      
      <header className="pill-header">
        <nav className="header-nav-white">
          <button className={activeTab === 'catalogue' ? 'active' : ''} onClick={() => setActiveTab('catalogue')}>Catalogue</button>
          <button className={activeTab === 'sae' ? 'active' : ''} onClick={() => setActiveTab('sae')}>SAE</button>
          <button className={activeTab === 'etudiant' ? 'active' : ''} onClick={() => setActiveTab('etudiant')}>Étudiant</button>
          <button className={activeTab === 'annonces' ? 'active' : ''} onClick={() => setActiveTab('annonces')}>📢 Annonces</button>
          <button className={activeTab === 'profil' ? 'active' : ''} onClick={() => setActiveTab('profil')}>Profil</button>
        </nav>
        <div className="header-actions">
          
          <div className="notification-wrapper">
            <span className="bell-icon" onClick={() => setShowAnnonces(!showAnnonces)}>🔔</span>
            {annonces.length > 0 && <span className="badge">{annonces.length}</span>}
            {showAnnonces && (
              <div className="annonces-dropdown">
                <h4>Annonces de la plateforme</h4>
                {annonces.length === 0 ? <p>Aucune annonce.</p> : annonces.map(a => (
                  <div key={a.id} className="annonce-item">
                    <strong>{a.titre}</strong>
                    <p>{a.contenu}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <span>⚙️</span>
          <div className="user-profile-pill">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            <div className="user-info-text">
              <span className="role-bold">Administrateur</span>
              <button onClick={onLogout}>FERMER LA SESSION</button>
            </div>
          </div>
        </div>
      </header>

      <main className="admin-content-centered">
        <AnimatePresence mode="wait">
          
          {/* CATALOGUE */}
          {activeTab === 'catalogue' && (
            <motion.div key="cat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="tab-container">
              <h2 className="black-title">Tous les projets SAE & Vitrine</h2>
              <div className="glass-card" style={{marginBottom: '40px'}}>
                <div className="table-header-white"><span>Projet</span><span>Statut</span><span>Action</span></div>
                {allSaes.map(sae => (
                  <div key={sae.id}>
                    <div className="table-row-white">
                      <span>{sae.titre}</span>
                      <span style={{color: sae.status === 'VALIDE' ? '#00e676' : 'orange'}}>{sae.status}</span>
                      <div className="action-btns">
    {/* Nouveau bouton de gestion de visibilité (Masquer/Publier) */}
    <button 
        className="link-badge" 
        style={{
            background: sae.status === 'VALIDE' ? '#ff4444' : '#00e676', 
            border: 'none', 
            color: 'white', 
            marginRight: '5px', 
            cursor: 'pointer'
        }} 
        onClick={() => toggleSaeVisibility(sae.id, sae.status)}>
        {sae.status === 'VALIDE' ? "Masquer" : "Publier"}
    </button>

    {/* Bouton Vitrine existant mais simplifié */}
    <button 
        className="link-badge" 
        style={{background: '#4facfe', border: 'none', color: 'white', cursor: 'pointer'}} 
        onClick={() => fetchRendusForSae(sae.id)}
    >
        {viewingRendusFor === sae.id ? "Fermer Vitrine" : "Vitrine"}
    </button>
</div>
                    </div>

                    {/* NOUVEAU : Liste des rendus pour la vitrine */}
                    <AnimatePresence>
                      {viewingRendusFor === sae.id && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }} 
                          animate={{ height: 'auto', opacity: 1 }} 
                          exit={{ height: 0, opacity: 0 }}
                          style={{ overflow: 'hidden', padding: '0 20px' }}
                        >
                          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '15px', marginBottom: '15px' }}>
                            <h4 style={{ fontSize: '0.9rem', marginBottom: '10px' }}>Sélectionner les travaux à afficher :</h4>
                            {selectedSaeRendus.length === 0 ? <p>Aucun rendu reçu.</p> : selectedSaeRendus.map(r => (
                              <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <span style={{fontSize: '0.85rem'}}>{r.email}</span>
                                <button 
                                  onClick={() => handleTogglePublic(r.id, r.is_public)}
                                  style={{
                                    background: r.is_public ? '#00e676' : 'transparent',
                                    border: '1px solid #00e676',
                                    color: r.is_public ? 'black' : '#00e676',
                                    borderRadius: '15px', padding: '2px 12px', cursor: 'pointer', fontSize: '0.7rem'
                                  }}
                                >
                                  {r.is_public ? "En Vitrine ★" : "Rendre Public"}
                                </button>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
                {allSaes.length === 0 && <p style={{marginTop:'15px'}}>Aucune SAE trouvée dans la BDD.</p>}
              </div>

              <h2 className="black-title">Inscriptions (En attente)</h2>
              <div className="glass-card" style={{marginBottom: '40px'}}>
                <div className="table-header-white"><span>Email</span><span>Rôle</span><span>Action</span></div>
                {pendingUsers.map(u => (
                  <div className="table-row-white" key={u.id}>
                    <span>{u.email}</span>
                    <span>{u.role}</span>
                    <div className="action-btns">
                      <button className="btn-validate-green" onClick={() => handleValidateUser(u.id)}>VALIDER LE COMPTE</button>
                    </div>
                  </div>
                ))}
                {pendingUsers.length === 0 && <p style={{marginTop:'15px'}}>Aucun compte en attente.</p>}
              </div>

              <h2 className="black-title">Gestion des Étudiants</h2>
              <div className="glass-card">
                <div className="table-header-white"><span>Identifiant</span><span>Mot de passe</span><span>Statut</span></div>
                {students.map(s => (
                  <div className="table-row-white" key={s.id}>
                    <span>{s.email}</span>
                    <span onClick={() => handleChangePassword(s.id, s.email)} style={{cursor:'pointer', textDecoration:'underline', color:'#00f2fe', fontWeight: 'bold'}}>changer le mdp</span>
                    <span>{s.status}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* CRÉATION SAE */}
          {activeTab === 'sae' && (
            <motion.div key="sae" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="tab-container">
              <div className="glass-card">
                <h2 className="black-title-inside">Créer une SAE</h2>
                <form className="sae-form-grid" onSubmit={handleCreateSAE}>
                  <div className="col-left">
                    <div className="input-group-blue"><label>Titre de la SAE</label><input type="text" value={saeForm.titre} onChange={e => setSaeForm({...saeForm, titre: e.target.value})} required /></div>
                    <div className="input-group-blue"><label>Ressource concerné</label><input type="text" value={saeForm.ressource} onChange={e => setSaeForm({...saeForm, ressource: e.target.value})} required/></div>
                    <div className="input-group-blue file-input">
                      <label>Image source</label>
                      <input type="file" accept="image/*" onChange={e => setSaeForm({...saeForm, imageFile: e.target.files[0]})} />
                    </div>
                    <div className="input-group-blue"><label>Date de rendu :</label><input type="date" value={saeForm.date} onChange={e => setSaeForm({...saeForm, date: e.target.value})} required /></div>
                  </div>
                  <div className="col-right">
                    <div className="input-group-blue file-input">
                      <label>Ressources PDF</label>
                      <input type="file" accept="application/pdf" onChange={e => setSaeForm({...saeForm, pdfFile: e.target.files[0]})} />
                    </div>
                    <div className="input-group-blue"><label>Descriptions techniques</label><textarea rows="6" value={saeForm.desc} onChange={e => setSaeForm({...saeForm, desc: e.target.value})} required></textarea></div>
                    <button type="submit" className="btn-blue-outline centered-btn">Créer une SAE</button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {/* ÉTUDIANTS (Gestion Administrative) */}
          {activeTab === 'etudiant' && (
            <motion.div key="etu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="tab-container cards-row">
              <div className="glass-card small-card">
                <h2 className="black-title-inside">Rajouter un étudiant</h2>
                <form onSubmit={handleCreateStudent}>
                  <div className="input-group-blue"><label>Identifiant de l'étudiant</label><input type="email" value={studentForm.email} onChange={e => setStudentForm({...studentForm, email: e.target.value})} required /></div>
                  <div className="input-group-blue" style={{marginTop:'15px'}}><label>Mot de passe</label><input type="password" value={studentForm.password} onChange={e => setStudentForm({...studentForm, password: e.target.value})} required /></div>
                  <button type="submit" className="btn-blue-outline centered-btn">INSCRIPTION</button>
                </form>
              </div>

              <div className="glass-card small-card">
                <h2 className="black-title-inside">Rajouter un étudiant dans un module ou SAE</h2>
                <form onSubmit={handleEnrollStudent}>
                  <div className="input-group-blue"><label>Identifiant de l'étudiant</label><input type="email" value={enrollForm.email} onChange={e => setEnrollForm({...enrollForm, email: e.target.value})} required /></div>
                  <div className="input-group-blue" style={{marginTop:'15px'}}><label>Ressource concerné</label><input type="text" value={enrollForm.ressource} onChange={e => setEnrollForm({...enrollForm, ressource: e.target.value})} required /></div>
                  <button type="submit" className="btn-blue-outline centered-btn">RAJOUTER</button>
                </form>
              </div>
            </motion.div>
          )}

          {/* NOUVEAU : ONGLET GESTION DES ANNONCES */}
          {activeTab === 'annonces' && (
            <motion.div key="ann" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="tab-container">
              <div className="glass-card">
                <h2 className="black-title-inside">Diffuser une annonce globale</h2>
                <form onSubmit={handlePostAnnonce} className="sae-form-grid">
                  <div className="input-group-blue">
                    <label>Titre de l'annonce</label>
                    <input 
                      type="text" 
                      value={annonceForm.titre} 
                      onChange={e => setAnnonceForm({...annonceForm, titre: e.target.value})} 
                      placeholder="Ex: Maintenance de la plateforme" 
                      required 
                    />
                  </div>
                  <div className="input-group-blue" style={{ marginTop: '15px' }}>
                    <label>Contenu du message</label>
                    <textarea 
                      rows="4" 
                      value={annonceForm.contenu} 
                      onChange={e => setAnnonceForm({...annonceForm, contenu: e.target.value})} 
                      placeholder="Tapez votre message ici..." 
                      required
                    ></textarea>
                  </div>
                  <button type="submit" className="btn-blue-outline centered-btn" style={{ marginTop: '20px' }}>
                    PUBLIER L'ANNONCE
                  </button>
                </form>
              </div>

              <h2 className="black-title" style={{ marginTop: '40px' }}>Historique des annonces</h2>
              <div className="glass-card">
                <div className="table-header-white"><span>Titre</span><span>Message</span><span>Date</span></div>
                {annonces.map(a => (
                  <div className="table-row-white" key={a.id}>
                    <strong>{a.titre}</strong>
                    <span>{a.contenu}</span>
                    <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                      {new Date(a.date_creation || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                ))}
                {annonces.length === 0 && <p style={{ marginTop: '15px' }}>Aucune annonce n'a été diffusée.</p>}
              </div>
            </motion.div>
          )}

          {/* PROFIL PERSONNEL */}
          {activeTab === 'profil' && (
            <UserProfile user={user} API_URL={API_URL} onLogout={onLogout} />
          )}

        </AnimatePresence>
      </main>
    </div>

    
  );
}