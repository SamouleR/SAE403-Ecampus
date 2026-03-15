import React, { useState, useEffect } from 'react';
import './App.css';

export default function App() {
  const [user, setUser] = useState(null);
  const [data, setData] = useState({ saes: [], ressources: [], annonces: [] });
  const [loginForm, setLoginForm] = useState({ email: '', pass: '' });

  const loadData = () => {
    fetch('http://localhost:8000/api/content')
      .then(res => res.json())
      .then(json => setData(json));
  };

  useEffect(() => { if (user) loadData(); }, [user]);

  const handleLogin = (e) => {
    e.preventDefault();
    fetch('http://localhost:8000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: loginForm.email, password: loginForm.pass })
    })
    .then(res => res.ok ? res.json() : Promise.reject())
    .then(userData => setUser(userData))
    .catch(() => alert("Erreur de connexion : vérifiez vos identifiants."));
  };

  // --- ÉCRAN DE SÉLECTION & LOGIN ---
  if (!user) return (
    <div className="auth-wrapper">
      <form className="login-card" onSubmit={handleLogin}>
        <h1>Connexion Ecampus</h1>
        <p>Choisissez votre profil pour tester :</p>
        <div className="role-hints">
            <span onClick={() => setLoginForm({email:'sam@mmi.fr', pass:'sam123'})}>🎓 Étudiant</span>
            <span onClick={() => setLoginForm({email:'prof@mmi.fr', pass:'prof123'})}>👨‍🏫 Prof</span>
            <span onClick={() => setLoginForm({email:'admin@mmi.fr', pass:'admin123'})}>🛠️ Admin</span>
        </div>
        <input type="email" placeholder="Email" value={loginForm.email} onChange={e => setLoginForm({...loginForm, email: e.target.value})} required />
        <input type="password" placeholder="Mot de passe" value={loginForm.pass} onChange={e => setLoginForm({...loginForm, pass: e.target.value})} required />
        <button type="submit">Entrer sur la plateforme</button>
      </form>
    </div>
  );

  return (
    <div className="platform-container">
      <nav className="sidebar">
        <h2>MMI DASHBOARD</h2>
        <div className="user-info">
            <strong>{user.nom}</strong>
            <small>{user.role}</small>
        </div>
        <button onClick={() => setUser(null)} className="btn-logout">Quitter</button>
      </nav>

      <main className="main-view">
        {/* VUE ÉTUDIANT : Priorités et échéances [cite: 15] */}
        {user.role === 'ROLE_STUDENT' && (
          <section>
            <h2>Mes SAE en cours</h2>
            <div className="sae-grid">
              {data.saes.map(s => (
                <div key={s.id} className="sae-card ongoing">
                  <h3>{s.titre}</h3>
                  <p>{s.desc}</p>
                  <div className="footer">📅 Échéance : {s.echeance}</div>
                </div>
              ))}
            </div>
            <h3>📢 Dernières Annonces</h3>
            {data.annonces.map(a => <div className="ann-box"><strong>{a.date}</strong> : {a.msg}</div>)}
          </section>
        )}

        {/* VUE ENSEIGNANT : Gestion globale et formulaires [cite: 16, 19] */}
        {user.role === 'ROLE_TEACHER' && (
          <section>
            <h2>Espace Enseignant</h2>
            <div className="form-publish">
              <h3>Publier une Annonce / Rappel</h3>
              <textarea id="msg-input" placeholder="Écrivez votre message ici..."></textarea>
              <button onClick={() => {
                const msg = document.getElementById('msg-input').value;
                fetch('http://localhost:8000/api/publish', {
                  method:'POST', headers:{'Content-Type':'application/json'},
                  body: JSON.stringify({ type:'ANNONCE', payload: { msg } })
                }).then(() => { loadData(); document.getElementById('msg-input').value = ''; });
              }}>Diffuser l'annonce</button>
            </div>
            <h3>Avancement agrégé des groupes</h3>
            <div className="stats-box">SAE 4.03 : 18/28 livrets déposés (64%)</div>
          </section>
        )}

        {/* VUE ADMIN : Gestion structurelle */}
        {user.role === 'ROLE_ADMIN' && (
          <section>
            <h2>Console Administration</h2>
            <p>Gestion des utilisateurs et maintenance du serveur pédagogique.</p>
            <div className="admin-list">
                <div>👤 Samuel R. (Étudiant)</div>
                <div>👤 M. Lecadet (Enseignant)</div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}