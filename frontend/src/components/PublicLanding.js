import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Public.css'; 

/**
 * COMPOSANT : PublicLanding
 * Description : Point d'entrée public gérant le catalogue, la recherche globale,
 * les filtres par promotion/domaine et l'affichage détaillé des projets.
 */
export default function PublicLanding({ onShowLogin, API_URL }) {
  // --- ÉTATS GLOBAUX ---
  const [saes, setSaes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSae, setSelectedSae] = useState(null);
  
  // --- ÉTATS DES FILTRES & RECHERCHE ---
  const [searchTerm, setSearchTerm] = useState("");
  const [filterYear, setFilterYear] = useState("Toutes");
  const [filterDomain, setFilterDomain] = useState("Tous les domaines");

  // --- CHARGEMENT DES DONNÉES (API) ---
  const fetchPublicData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/public/saes`); // Utilise la route publique
      const data = await response.json();
      setSaes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erreur critique lors de la récupération des SAE:", err);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchPublicData();
  }, [fetchPublicData]);

  // --- LOGIQUE DE FILTRAGE COMPLEXE (Mémoïsée pour performance) ---
  const filteredSaes = useMemo(() => {
    return saes.filter(sae => {
      // 1. Recherche textuelle (Titre ou Ressource/Matière)
      const matchesSearch = 
        sae.titre.toLowerCase().includes(searchTerm.toLowerCase()) || 
        sae.ressource.toLowerCase().includes(searchTerm.toLowerCase());
      
      // 2. Filtre par Année (Promotion)
      const matchesYear = filterYear === "Toutes" || sae.promotion === filterYear;
      
      // 3. Filtre par Domaine technique (Match basé sur le nom de la ressource)
      const matchesDomain = filterDomain === "Tous les domaines" || 
        (sae.ressource && sae.ressource.toLowerCase().includes(filterDomain.toLowerCase().split(' ')[0]));
      
      return matchesSearch && matchesYear && matchesDomain;
    });
  }, [saes, searchTerm, filterYear, filterDomain]);

  // --- RENDU : ÉCRAN DE CHARGEMENT ---
  if (loading) {
    return (
      <div className="loader-container">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="spinner" />
        <p>Chargement du catalogue ECAMPUS...</p>
      </div>
    );
  }

  return (
    <div className="public-wrapper">
      {/* NAVBAR GÉLULE PREMIUM */}
      <nav className="public-header-pill">
        <div className="logo-section" onClick={() => setSelectedSae(null)} style={{cursor:'pointer'}}>
          ECAMPUS
        </div>
        
        {/* BARRE DE RECHERCHE DYNAMIQUE */}
        <div className="search-bar-container">
          <input 
            type="text" 
            placeholder="Rechercher une SAE, une matière..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input-glass"
          />
        </div>

        <button className="btn-connexion-pill" onClick={onShowLogin}>Connexion</button>
      </nav>

      <main className="public-main">
        <AnimatePresence mode="wait">
          {!selectedSae ? (
            /* =========================================
               VUE 1 : CATALOGUE & FILTRES
               ========================================= */
            <motion.div 
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* BARRE DE FILTRES AVANCÉS */}
              <section className="filters-row-glass">
                <div className="filter-group-years">
                  <span className="filter-label">Année :</span>
                  {["Toutes", "2026", "2025", "2024", "2023"].map(year => (
                    <button 
                      key={year}
                      className={`year-chip ${filterYear === year ? 'active' : ''}`}
                      onClick={() => setFilterYear(year)}
                    >
                      {year}
                    </button>
                  ))}
                </div>

                <div className="filter-group-domain">
                  <span className="filter-label">Domaine :</span>
                  <select 
                    value={filterDomain} 
                    onChange={(e) => setFilterDomain(e.target.value)}
                    className="domain-select-glass"
                  >
                    <option>Tous les domaines</option>
                    <option>Développement Web</option>
                    <option>Design & UX/UI</option>
                    <option>Communication Numérique</option>
                    <option>Création Audiovisuelle</option>
                  </select>
                </div>
              </section>

              {/* GRILLE DES PROJETS */}
              <div className="sae-grid">
                {filteredSaes.length > 0 ? (
                  filteredSaes.map((sae, index) => (
                    <motion.div
                      key={sae.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="sae-card-glass"
                    >
                      {/* BANNIÈRE IMAGE AVEC BADGE */}
                      <div className="sae-banner" style={{backgroundImage: `url(${API_URL}${sae.image})`}}>
                        <div className="badge-semestre">{sae.semestre || "S1"}</div>
                      </div>
                      
                      <div className="sae-content">
                        <span className="ressource-tag">{sae.promotion}</span>
                        <h3>{sae.titre}</h3>
                        <p className="line-clamp">{sae.description || "Description technique à venir pour ce projet MMI."}</p>
                        
                        <div className="card-actions">
                          <span className="matiere-text">Matière: <strong>{sae.ressource}</strong></span>
                          <button className="btn-explore" onClick={() => setSelectedSae(sae)}>
                            Voir le projet
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="no-results">Aucun projet ne correspond à votre recherche.</div>
                )}
              </div>
            </motion.div>
          ) : (
            /* =========================================
               VUE 2 : DÉTAIL DYNAMIQUE DU PROJET
               ========================================= */
            <motion.div 
              key="detail"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="detail-view-container"
            >
              <button className="btn-back-public" onClick={() => setSelectedSae(null)}>
                ← Retour au catalogue
              </button>

              <div className="detail-glass-card">
                <div className="detail-header-split">
                  {/* ZONE IMAGE */}
                  <div 
                    className="detail-img-box" 
                    style={{backgroundImage: `url(${API_URL}${selectedSae.image})`}}
                  >
                    <div className="img-overlay-gradient"></div>
                  </div>

                  {/* ZONE INFOS PRINCIPALES */}
                  <div className="detail-info-box">
                    <span className="ressource-tag-large">{selectedSae.ressource}</span>
                    <h2 className="detail-main-title">{selectedSae.titre}</h2>
                    <div className="detail-meta-grid">
                      <div className="meta-item"><strong>PROMOTION</strong><span>{selectedSae.promotion}</span></div>
                      <div className="meta-item"><strong>SEMESTRE</strong><span>{selectedSae.semestre}</span></div>
                      <div className="meta-item"><strong>DATE LIMITE</strong><span>{new Date(selectedSae.date_rendu).toLocaleDateString()}</span></div>
                    </div>
                  </div>
                </div>

                {/* CORPS DU DÉTAIL */}
                <div className="detail-body-content">
                  <div className="content-section">
                    <h4>Description technique et objectifs</h4>
                    <p>{selectedSae.description || "Le descriptif complet de cette SAE n'a pas encore été publié."}</p>
                  </div>

                  {/* LIENS VERS RESSOURCES */}
                  {selectedSae.pdf_link && (
                    <div className="detail-resource-action">
                      <a 
                        href={`${API_URL}${selectedSae.pdf_link}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="btn-pdf-download"
                      >
                        Télécharger le sujet complet (PDF) 📥
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}