import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Public.css'; // Import du nouveau CSS

export default function PublicLanding({ onShowLogin, API_URL }) {
  const [saes, setSaes] = useState([]);
  const [filters, setFilters] = useState({ promo: 'Promotion', semestre: 'Semestre', matiere: 'Matière' });

  useEffect(() => {
    fetch(`${API_URL}/api/public/saes`)
      .then(res => res.json())
      .then(data => setSaes(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  }, [API_URL]);

  const filteredSaes = saes.filter(sae => {
    return (filters.promo === 'Promotion' || sae.promotion === filters.promo) &&
           (filters.semestre === 'Semestre' || sae.semestre === filters.semestre) &&
           (filters.matiere === 'Matière' || sae.ressource === filters.matiere);
  });

  return (
    <div className="public-wrapper">
      <nav className="public-header-pill">
        <div className="logo-section">ECAMPUS.MMI</div>
        
        <div className="nav-filters">
          {['Promotion', 'Semestre', 'Matière'].map((type) => (
            <div className="filter-group" key={type}>
              <div className="filter-trigger">
                {filters[type.toLowerCase().replace('è','e')] || type} ▾
              </div>
              <div className="filter-dropdown">
                <div className="filter-item" onClick={() => setFilters({...filters, [type.toLowerCase().replace('è','e')]: type})}>Tout</div>
                {(type === 'Promotion' ? ['2024', '2025', '2026'] : 
                  type === 'Semestre' ? ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'] : 
                  ['Web', 'Graphisme', 'Com', 'Audiovisuel']).map(opt => (
                  <div key={opt} className="filter-item" onClick={() => setFilters({...filters, [type.toLowerCase().replace('è','e')]: opt})}>{opt}</div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button className="btn-connexion-pill" onClick={onShowLogin}>Accès Profs</button>
      </nav>

      <main className="public-main">
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="hero-section"
        >
          <h1>Catalogue SAE</h1>
          <p className="public-intro">Explorez les projets innovants du département MMI de Vélizy.</p>
        </motion.section>

        <motion.div layout className="sae-grid">
          <AnimatePresence>
            {filteredSaes.map((sae, index) => (
              <motion.div
                key={sae.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="sae-card-glass"
              >
                <div className="sae-banner" style={{backgroundImage: `url(${API_URL}${sae.image})`}}>
                  <div className="badge-semestre">{sae.semestre}</div>
                </div>
                <div className="sae-content">
                  <span className="ressource-tag">{sae.promotion}</span>
                  <h3>{sae.titre}</h3>
                  <p>{sae.description || "Pas de description disponible pour ce projet."}</p>
                  <div className="card-actions">
                    <span className="note">Matière: {sae.ressource}</span>
                    <button className="btn-explore">Voir le projet</button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
}