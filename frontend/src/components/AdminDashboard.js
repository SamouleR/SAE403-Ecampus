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

  const fetchAnnonces = useCallback(() => {
    fetch(`${API_URL}/api/annonces`, { headers: { 'Authorization': `Bearer ${token}` } })
    .then(res => res.json()).then(data => setAnnonces(Array.isArray(data) ? data : []));
  }, [API_URL, token]);

  const fetchCatalogueData = useCallback(() => {
    // Fetch Toutes les SAEs
    fetch(`${API_URL}/api/admin/all-saes`, { headers: { 'Authorization': `Bearer ${token}` } })
    .then(res => res.json()).then(data => setAllSaes(Array.isArray(data) ? data : []));
    
    fetch(`${API_URL}/api/admin/pending-users`, { headers: { 'Authorization': `Bearer ${token}` } })
    .then(res => res.json()).then(data => setPendingUsers(Array.isArray(data) ? data : []));

    fetch(`${API_URL}/api/admin/etudiants`, { headers: { 'Authorization': `Bearer ${token}` } })
    .then(res => res.json()).then(data => setStudents(Array.isArray(data) ? data : []));
  }, [API_URL, token]);

  useEffect(() => {
    fetchAnnonces();
    if (activeTab === 'catalogue' || activeTab === 'etudiant') {
      fetchCatalogueData();
    }
  }, [activeTab, fetchAnnonces, fetchCatalogueData]);

  // --- FONCTION DE CRÉATION D'ANNONCE ---
// --- FONCTION DE CRÉATION D'ANNONCE (Version Debugging) ---
  const handleCreateAnnonce = async (e) => {
    e.preventDefault();
    
    try {
      // 💡 Astuce : On essaye d'abord vers /api/annonces (souvent la route par défaut)
      // Si ça ne marche pas, tu pourras remettre /api/admin/annonces
      const res = await fetch(`${API_URL}/api/annonces`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(annonceForm)
      });

      const contentType = res.headers.get("content-type");

      // Si le serveur renvoie une erreur (404, 403, 500...)
      if (!res.ok) {
        if (contentType && contentType.includes("application/json")) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Le serveur a renvoyé une erreur JSON.");
        } else {
          throw new Error(`Erreur HTTP ${res.status}. Vérifie que la route API existe bien dans ton Backend.`);
        }
      }

      // Si tout se passe bien
      const data = await res.json();
      alert("Annonce publiée avec succès !");
      setAnnonceForm({ titre: '', contenu: '' }); // Vide le formulaire
      fetchAnnonces(); // Rafraîchit la liste

    } catch (err) {
      console.error("Détail complet de l'erreur :", err);
      // L'alerte te donnera maintenant la cause exacte !
      alert(`Erreur de publication : ${err.message}`); 
    }
  };

  const handleCreateSAE = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('titre', saeForm.titre);
    formData.append('ressource', saeForm.ressource);
    formData.append('date', saeForm.date);
    formData.append('desc', saeForm.desc);
    if (saeForm.imageFile) formData.append('image', saeForm.imageFile);
    if (saeForm.pdfFile) formData.append('pdf', saeForm.pdfFile);

    fetch(`${API_URL}/api/admin/saes`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    })
    .then(res => res.json())
    .then(data => { 
      alert(data.message); 
      setSaeForm({ titre: '', ressource: '', date: '', desc: '', imageFile: null, pdfFile: null }); 
      fetchAnnonces(); 
    });
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

  const handleEnrollStudent = (e) => {
    e.preventDefault();
    fetch(`${API_URL}/api/admin/inscriptions`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(enrollForm)
    }).then(res => res.json()).then(data => { alert(data.message); setEnrollForm({ email: '', ressource: '' }); });
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

  const handleChangePassword = (id, email) => {
    const newPassword = window.prompt(`Entrez le NOUVEAU mot de passe pour l'étudiant : ${email}`);
    if (!newPassword) return;
    fetch(`${API_URL}/api/admin/users/${id}/password`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ newPassword })
    })
    .then(res => res.json()).then(data => alert(data.message));
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
              <h2 className="black-title">Tous les projets SAE</h2>
              <div className="glass-card" style={{marginBottom: '40px'}}>
                <div className="table-header-white"><span>Projet</span><span>Statut</span><span>Ressources</span></div>
                {allSaes.map(sae => (
                  <div className="table-row-white" key={sae.id}>
                    <span>{sae.titre}</span>
                    <span style={{color: sae.status === 'VALIDE' ? '#00e676' : 'orange'}}>{sae.status}</span>
                    <div className="file-links">
                      {sae.pdf_link && <a href={`${API_URL}${sae.pdf_link}`} target="_blank" rel="noreferrer" className="link-badge">Ouvrir PDF</a>}
                      {sae.image && <a href={`${API_URL}${sae.image}`} target="_blank" rel="noreferrer" className="link-badge">Voir Image</a>}
                    </div>
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
                <form onSubmit={handleCreateAnnonce} className="sae-form-grid">
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

          {/* PROFIL PERSONNEL (Composant Complexifié) */}
          {activeTab === 'profil' && (
            <UserProfile user={user} API_URL={API_URL} onLogout={onLogout} />
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}