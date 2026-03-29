import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './UserProfile.css';

export default function UserProfile({ user, API_URL, onLogout }) {
  const [passwords, setPasswords] = useState({ oldPass: '', newPass: '', confirmPass: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: user.email.split('@')[0],
    promotion: user.role === 'etudiant' ? 'MMI 2 - 2024' : 'Corps Enseignant',
    bio: 'Passionné par le développement web et le design interactif.'
  });

  const token = localStorage.getItem('token');

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirmPass) {
      return alert("Les nouveaux mots de passe ne correspondent pas !");
    }
    try {
      const res = await fetch(`${API_URL}/api/user/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ oldPassword: passwords.oldPass, newPassword: passwords.newPass })
      });
      const data = await res.json();
      alert(data.message);
      if (res.ok) setPasswords({ oldPass: '', newPass: '', confirmPass: '' });
    } catch (err) {
      alert("Erreur lors de la mise à jour.");
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: { label: 'ADMIN', color: '#ff3b30' },
      professeur: { label: 'PROFS', color: '#ffcc00' },
      enseignant: { label: 'PROFS', color: '#ffcc00' },
      etudiant: { label: 'STUDENT', color: '#007aff' }
    };
    const badge = badges[role] || { label: 'USER', color: 'gray' };
    return <span className="profile-role-badge" style={{ backgroundColor: badge.color }}>{badge.label}</span>;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="profile-container-pro">
      <div className="profile-grid">
        <div className="profile-card-glass info-card">
          <div className="profile-header-main">
            <div className="avatar-circle-large">{user.email[0].toUpperCase()}</div>
            <div className="profile-title-block">
              {getRoleBadge(user.role)}
              <h2>{userInfo.name.toUpperCase()}</h2>
              <p className="profile-email-sub">{user.email}</p>
            </div>
          </div>
          <div className="profile-meta-data">
            <div className="meta-item"><span>PROMOTION</span><strong>{userInfo.promotion}</strong></div>
            <div className="meta-item"><span>STATUT</span><strong>Actif</strong></div>
          </div>
          <div className="profile-bio">
            <label>Bio</label>
            {isEditing ? (
              <textarea value={userInfo.bio} onChange={(e) => setUserInfo({...userInfo, bio: e.target.value})} rows="4" />
            ) : ( <p>{userInfo.bio}</p> )}
          </div>
          <div className="profile-actions-bottom">
            <button className="btn-prof-outline" onClick={() => setIsEditing(!isEditing)}>{isEditing ? 'SAUVEGARDER' : 'MODIFIER LE PROFIL'}</button>
            <button className="btn-prof-outline logout-btn" onClick={onLogout}>DÉCONNEXION</button>
          </div>
        </div>
        <div className="profile-card-glass security-card">
          <h3 className="section-title-white">Sécurité du compte</h3>
          <form onSubmit={handleUpdatePassword} className="complex-form-pro">
            <div className="input-group-pro"><label>Mot de passe actuel</label><input type="password" value={passwords.oldPass} onChange={e => setPasswords({...passwords, oldPass: e.target.value})} required /></div>
            <div className="form-row-2">
              <div className="input-group-pro"><label>Nouveau mot de passe</label><input type="password" value={passwords.newPass} onChange={e => setPasswords({...passwords, newPass: e.target.value})} required /></div>
              <div className="input-group-pro"><label>Confirmer</label><input type="password" value={passwords.confirmPass} onChange={e => setPasswords({...passwords, confirmPass: e.target.value})} required /></div>
            </div>
            <button type="submit" className="btn-prof-outline submit-btn-pro">METTRE À JOUR</button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}