import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function PublicLanding({ onShowLogin, API_URL }) {
  const [saes, setSaes] = useState([]);
  const [filters, setFilters] = useState({ promo: 'Promotion', semestre: 'Semestre', matiere: 'Matière' });

  useEffect(() => {
    fetch(`${API_URL}/api/public/saes`)
      .then(res => res.json())
      .then(data => setSaes(Array.isArray(data) ? data : []))
      .catch(err => console.error("Erreur fetch public:", err));
  }, [API_URL]);

  const filteredSaes = saes.filter(sae => {
    return (filters.promo === 'Promotion' || sae.promotion === filters.promo) &&
           (filters.semestre === 'Semestre' || sae.semestre === filters.semestre) &&
           (filters.matiere === 'Matière' || sae.ressource === filters.matiere);
  });

  return (
    <div className="public-wrapper">
      <nav className="public-header-pill">
        <div className="logo-text">ECAMPUS</div>
        <div className="nav-filters">
          <div className="dropdown">
            <span className="dropdown-label">{filters.promo} ▾</span>
            <div className="dropdown-menu">
              <div onClick={() => setFilters({...filters, promo: 'Promotion'})}>Toutes</div>
              {['2021', '2022', '2023', '2024', '2025', '2026'].map(p => (
                <div key={p} onClick={() => setFilters({...filters, promo: p})}>{p}</div>
              ))}
            </div>
          </div>
          <div className="dropdown">
            <span className="dropdown-label">{filters.semestre} ▾</span>
            <div className="dropdown-menu">
              <div onClick={() => setFilters({...filters, semestre: 'Semestre'})}>Tous</div>
              {['S1', 'S2', 'S3', 'S4', 'S5', 'S6'].map(s => (
                <div key={s} onClick={() => setFilters({...filters, semestre: s})}>{s}</div>
              ))}
            </div>
          </div>
          <div className="dropdown">
            <span className="dropdown-label">{filters.matiere} ▾</span>
            <div className="dropdown-menu">
              <div onClick={() => setFilters({...filters, matiere: 'Matière'})}>Toutes</div>
              {['Développement web', 'Audiovisuel', 'Graphisme', 'Communication'].map(m => (
                <div key={m} onClick={() => setFilters({...filters, matiere: m})}>{m}</div>
              ))}
            </div>
          </div>
        </div>
        <button className="btn-connexion-pill" onClick={onShowLogin}>CONNEXION</button>
      </nav>

      <main className="public-main">
        <h1 className="vue-title">Vue public</h1>
        <div className="sae-grid">
          {filteredSaes.length > 0 ? filteredSaes.map(sae => (
            <motion.div layout className="sae-glass-card" key={sae.id}>
              <div className="sae-img" style={{backgroundImage: `url(${API_URL}${sae.image})`}}>
                {!sae.image && "Image"}
              </div>
              <div className="sae-info">
                <span className="ressource-tag">{sae.semestre || 'SAE'}</span>
                <h3>{sae.ressource} - {sae.titre}</h3>
                <p>{sae.description}</p>
                <div className="card-footer">
                  <span className="note">10/11</span>
                  <button className="btn-details-blue">Détails</button>
                </div>
              </div>
            </motion.div>
          )) : <p>Aucun projet ne correspond à ces filtres.</p>}
        </div>
      </main>
    </div>
  );
}