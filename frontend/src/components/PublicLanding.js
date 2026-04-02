import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import './Public.css';

/**
 * COMPOSANT : PublicLanding (Version Étendue 400+ lignes)
 * Gère le portail institutionnel ECAMPUS avec catalogue interactif.
 */
export default function PublicLanding({ onShowLogin, API_URL }) {
  // --- ÉTATS DES DONNÉES ---
  const [saes, setSaes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSae, setSelectedSae] = useState(null);
  
  // --- ÉTATS DE NAVIGATION & UI ---
  const [isButMenuOpen, setIsButMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [formStatus, setFormStatus] = useState({ type: '', msg: '' });

  // --- ÉTATS FILTRES & RECHERCHE ---
  const [searchTerm, setSearchTerm] = useState("");
  const [filterYear, setFilterYear] = useState("Toutes");
  const [filterDomain, setFilterDomain] = useState("Tous les domaines");
  const [sortBy, setSortBy] = useState("recent");

  // --- RÉFÉRENCES POUR LE SCROLL ---
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef });
  const opacityHero = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // --- LOGIQUE DE RÉCUPÉRATION DES DONNÉES (FETCH + RETRY) ---
  const fetchPublicData = useCallback(async (retryCount = 0) => {
    setLoading(true);
    setError(null);
    try {
      console.log(`[Fetch] Tentative d'appel vers: ${API_URL}/api/saes/publiques`);
      const response = await fetch(`${API_URL}/api/saes/publiques`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        if (response.status === 404) throw new Error("Route API introuvable (404).");
        throw new Error(`Erreur serveur (${response.status})`);
      }

      const data = await response.json();
      setSaes(Array.isArray(data) ? data : []);
      console.log("[Fetch] Données reçues avec succès:", data.length, "projets.");
    } catch (err) {
      console.error("[Fetch Error]", err.message);
      if (retryCount < 2) {
        console.log(`[Fetch] Nouvelle tentative (${retryCount + 1})...`);
        setTimeout(() => fetchPublicData(retryCount + 1), 2000);
      } else {
        setError("Impossible de charger les projets. Veuillez vérifier la connexion au serveur.");
      }
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchPublicData();
    const handleScroll = () => setIsScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fetchPublicData]);

  // --- LOGIQUE DE FILTRAGE & TRI (COMPLEXE) ---
  const filteredAndSortedSaes = useMemo(() => {
    let result = saes.filter(sae => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = 
        (sae.titre || "").toLowerCase().includes(term) || 
        (sae.ressource || "").toLowerCase().includes(term) ||
        (sae.description || "").toLowerCase().includes(term);
      
      const matchesYear = filterYear === "Toutes" || sae.promotion === filterYear;
      
      const matchesDomain = filterDomain === "Tous les domaines" || 
        (sae.ressource && sae.ressource.toLowerCase().includes(filterDomain.toLowerCase().split(' ')[0]));
      
      return matchesSearch && matchesYear && matchesDomain;
    });

    if (sortBy === "recent") {
      result.sort((a, b) => b.id - a.id);
    } else if (sortBy === "alpha") {
      result.sort((a, b) => (a.titre || "").localeCompare(b.titre || ""));
    }

    return result;
  }, [saes, searchTerm, filterYear, filterDomain, sortBy]);

  // --- GESTION FORMULAIRE DE CONTACT ---
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setFormStatus({ type: 'info', msg: 'Envoi en cours...' });
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      // Simulation d'envoi API
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log("[Contact] Message reçu:", data);
      setFormStatus({ type: 'success', msg: 'Votre message a bien été envoyé !' });
      e.target.reset();
    } catch (err) {
      setFormStatus({ type: 'error', msg: "Échec de l'envoi." });
    }
  };

  // --- DATA STATIQUES (FAQ & TÉMOIGNAGES) ---
  const faqData = [
    { q: "Comment s'inscrire au BUT MMI ?", a: "L'inscription se fait via Parcoursup pour les bacheliers ou via candidature spontanée pour les réorientations." },
    { q: "Quels sont les débouchés ?", a: "Développeur Full-stack, UX Designer, Chargé de communication, Motion Designer, etc." },
    { q: "Peut-on faire de l'alternance ?", a: "Oui, la troisième année du BUT MMI à Vélizy est ouverte à l'apprentissage." }
  ];

  // --- RENDU : COMPOSANTS INTERNES ---
  const Navbar = () => (
    <nav className={`public-navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <div className="nav-left" onClick={() => setSelectedSae(null)}>
          <img src="/ecampus.svg" alt="Logo" className="nav-logo-img" />
          <span className="brand-name bordeaux-text cursive-font">Ecampus</span>
        </div>
        <div className="nav-center cursive-font">
          <a href="#hero" className="nav-link">ACCUEIL</a>
          <div className="nav-dropdown-wrapper" 
               onMouseEnter={() => setIsButMenuOpen(true)} 
               onMouseLeave={() => setIsButMenuOpen(false)}>
            <span className="nav-link">BUT MMI ▾</span>
            <AnimatePresence>
              {isButMenuOpen && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="nav-dropdown-content">
                  <a href="#formation">PROGRAMME</a>
                  <a href="#projets">PROJETS</a>
                  <a href="#faq">FAQ</a>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <a href="#projets" className="nav-link">CATALOGUE</a>
          <a href="#contact" className="nav-link">CONTACT</a>
        </div>
        <div className="nav-right">
          <button onClick={onShowLogin} className="maquette-btn-black nav-connexion-btn cursive-font">CONNEXION</button>
        </div>
      </div>
    </nav>
  );

  const SectionHero = () => (
    <motion.section id="hero" className="landing-hero fade-creme" style={{ opacity: opacityHero }} ref={heroRef}>
      <div className="hero-text-content">
        <motion.span initial={{ x: -50 }} animate={{ x: 0 }} className="hero-sub bordeaux-text cursive-font">
          IUT VÉLIZY — DÉPARTEMENT MMI
        </motion.span>
        <motion.h1 initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="hero-main-title cursive-font bordeaux-text">
          Envie de découvrir la <br /> formation MMI?
        </motion.h1>
        <p className="hero-desc">
          Plongez dans l'excellence pédagogique du multimédia. Découvrez les travaux de nos étudiants 
          et construisez votre avenir numérique au sein de l'IUT de Vélizy.
        </p>
        <div className="hero-actions">
          <a href="#projets" className="btn-bordeaux-filled cursive-font">EXPLORER LES PROJETS →</a>
          <button className="btn-outline-bordeaux cursive-font" onClick={() => document.getElementById('contact').scrollIntoView()}>NOUS CONTACTER</button>
        </div>
      </div>
      <div className="hero-visual-bg"></div>
    </motion.section>
  );

  const SectionProjets = () => (
    <section id="projets" className="landing-projets bg-white">
      <div className="section-header-compact">
        <div>
          <span className="section-label bordeaux-text cursive-font">GALLERIE</span>
          <h2 className="section-title-large cursive-font">Nos meilleurs <span className="bordeaux-light">projets.</span></h2>
        </div>
        <div className="search-controls">
          <input 
            type="text" 
            placeholder="Rechercher une SAE, un outil..." 
            className="maquette-input search-box"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select className="maquette-input sort-select cursive-font" onChange={(e) => setSortBy(e.target.value)}>
            <option value="recent">Plus récents</option>
            <option value="alpha">A - Z</option>
          </select>
        </div>
      </div>

      <div className="filters-row-maquette">
        <div className="filter-group">
          {["Toutes", "2026", "2025", "2024"].map(year => (
            <button key={year} className={`year-chip cursive-font ${filterYear === year ? 'active' : ''}`} onClick={() => setFilterYear(year)}>{year}</button>
          ))}
        </div>
        <select value={filterDomain} onChange={(e) => setFilterDomain(e.target.value)} className="maquette-input domain-select cursive-font">
          <option>Tous les domaines</option>
          <option>Développement Web</option>
          <option>Design & UX/UI</option>
          <option>Audiovisuel</option>
          <option>Communication</option>
        </select>
      </div>

      {error ? (
        <div className="error-box cursive-font">
          <p>{error}</p>
          <button onClick={() => fetchPublicData()} className="btn-retry">Réessayer</button>
        </div>
      ) : (
        <div className="projets-public-grid">
          {filteredAndSortedSaes.map((sae) => (
            <motion.div layout 
              key={sae.id} 
              className="pub-sae-card" 
              onClick={() => setSelectedSae(sae)}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <div className="pub-sae-img" style={{backgroundImage: `url(${API_URL}${sae.image})`}}>
                <div className="pub-sae-badge cursive-font">{sae.promotion}</div>
              </div>
              <div className="pub-sae-info">
                <span className="pub-sae-tag bordeaux-text cursive-font">{sae.ressource}</span>
                <h3 className="cursive-font">{sae.titre}</h3>
                <p className="line-clamp">{sae.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );

  const SectionFormation = () => (
    <section id="formation" className="landing-formation fade-creme">
      <div className="formation-grid">
        <div className="formation-left">
          <span className="section-label bordeaux-text cursive-font">PROGRAMME</span>
          <h2 className="section-title-large cursive-font bordeaux-text">Le BUT MMI en 3 ans.</h2>
          <p className="formation-intro">
            Le Bachelor Universitaire de Technologie (BUT) est un diplôme national qui forme des cadres intermédiaires. 
            Le parcours MMI est axé sur la polyvalence technique et créative.
          </p>
          <div className="parcours-highlights">
            <div className="highlight-pill cursive-font"><strong>DW</strong> DÉVELOPPEMENT WEB</div>
            <div className="highlight-pill cursive-font"><strong>CN</strong> CRÉATION NUMÉRIQUE</div>
          </div>
        </div>
        <div className="formation-right-stats">
          {[
            { n: "6", l: "SEMESTRES" },
            { n: "2", l: "PARCOURS" },
            { n: "1", l: "ALTERNANCE" },
            { n: "~50", l: "ÉTUDIANTS" }
          ].map((s, i) => (
            <motion.div key={i} className="stat-box" whileHover={{ scale: 1.05 }}>
              <h3 className="cursive-font">{s.n}</h3>
              <p>{s.l}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );

  const SectionFAQ = () => (
    <section id="faq" className="landing-faq bg-white">
      <div className="contact-container">
        <h2 className="section-title-large cursive-font bordeaux-text text-center">Foire aux Questions</h2>
        <div className="faq-list">
          {faqData.map((item, i) => (
            <div key={i} className={`faq-item ${activeFaq === i ? 'active' : ''}`} onClick={() => setActiveFaq(activeFaq === i ? null : i)}>
              <div className="faq-question cursive-font">{item.q} <span>{activeFaq === i ? '-' : '+'}</span></div>
              <AnimatePresence>
                {activeFaq === i && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="faq-answer">
                    <p>{item.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  const SectionContact = () => (
    <section id="contact" className="landing-contact fade-creme">
      <div className="contact-container">
        <div className="contact-header">
          <h2 className="section-title-large cursive-font bordeaux-text text-center">Contactez-nous</h2>
          <p className="text-center">Une question sur la formation ou un projet ? Laissez-nous un message.</p>
        </div>
        
        <form className="maquette-form landing-form" onSubmit={handleContactSubmit}>
          <div className="maquette-row">
            <label className="maquette-label bordeaux-text cursive-font">Nom complet :</label>
            <input type="text" name="name" className="maquette-input" required />
          </div>
          <div className="maquette-row">
            <label className="maquette-label bordeaux-text cursive-font">Email :</label>
            <input type="email" name="email" className="maquette-input" required />
          </div>
          <div className="maquette-row">
            <label className="maquette-label bordeaux-text cursive-font">Sujet :</label>
            <select name="subject" className="maquette-input cursive-font">
              <option>Admission</option>
              <option>Partenariat</option>
              <option>Autre</option>
            </select>
          </div>
          <div className="maquette-row">
            <label className="maquette-label bordeaux-text cursive-font">Message :</label>
            <textarea name="message" className="maquette-input maquette-textarea" required></textarea>
          </div>
          <button type="submit" className="maquette-btn-black center-btn cursive-font">ENVOYER LE MESSAGE</button>
          
          <AnimatePresence>
            {formStatus.msg && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`form-feedback ${formStatus.type}`}>
                {formStatus.msg}
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>
    </section>
  );

  // --- RENDU FINAL (CONDITIONNEL) ---
  return (
    <div className="public-page-wrapper">
      <Navbar />

      <main>
        <AnimatePresence mode="wait">
          {!selectedSae ? (
            <motion.div key="main-content">
              <SectionHero />
              <SectionProjets />
              <SectionFormation />
              <SectionFAQ />
              <SectionContact />
            </motion.div>
          ) : (
            <motion.div key="detail" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="detail-view-container fade-creme">
              <div className="detail-nav">
                <button className="maquette-back cursive-font" onClick={() => setSelectedSae(null)}>← Retour au catalogue</button>
              </div>
              <div className="pub-sae-card detail-card-hero">
                <div className="detail-grid">
                  <div className="detail-visual">
                    <img src={`${API_URL}${selectedSae.image}`} alt={selectedSae.titre} className="detail-img-full" />
                  </div>
                  <div className="detail-body">
                    <span className="bordeaux-text cursive-font">{selectedSae.promotion}</span>
                    <h2 className="cursive-font bordeaux-text title-large">{selectedSae.titre}</h2>
                    <div className="meta-badge-row">
                      <span className="badge-pill">{selectedSae.ressource}</span>
                      <span className="badge-pill">{selectedSae.semestre || "S1"}</span>
                    </div>
                    <div className="description-box">
                      <h4 className="cursive-font">À propos du projet</h4>
                      <p>{selectedSae.description || "Pas de description détaillée disponible."}</p>
                    </div>
                    {selectedSae.pdf_link && (
                      <a href={`${API_URL}${selectedSae.pdf_link}`} target="_blank" rel="noreferrer" className="btn-bordeaux-filled cursive-font">
                        TÉLÉCHARGER LE SUJET (PDF)
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="landing-footer bordeaux-text cursive-font">
        <div className="footer-content">
          <img src="/ecampus.svg" alt="Logo" className="footer-logo" />
          <p>© 2026 Ecampus MMI Vélizy - Tous droits réservés.</p>
          <div className="footer-links">
            <span>Mentions légales</span> | <span>Confidentialité</span>
          </div>
        </div>
      </footer>
    </div>
  );
}