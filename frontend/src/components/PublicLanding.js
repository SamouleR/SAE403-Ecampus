import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import './Public.css';
import logo from './ecampus.svg';
import MentionsLegales from './MentionsLegales';
import Confidentialite from './Confidentialite';

import NosProjets from './NosProjets';
import NotreEquipe from './NotreEquipe';
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

  const [legalView, setLegalView] = useState(null); // 'mentions' ou 'privacy'
  const [currentView, setCurrentView] = useState('landing'); // 'landing', 'projets', 'equipe' ou 'parcoursup'

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
  { 
    q: "Quelles sont les matières principales ?", 
    a: "Développement web (JS, PHP, Frameworks), UX/UI Design, Audiovisuel (Montage, Prise de vue), Stratégie de communication et Anglais." 
  },
  { 
    q: "Quel matériel faut-il pour réussir ?", 
    a: "Un ordinateur portable est nécessaire. L'IUT dispose aussi de salles Mac, de studios photo et d'un parc de caméras en libre accès." 
  },
  { 
    q: "L'alternance est-elle possible dès la 1ère année ?", 
    a: "Non, l'alternance débute en 3ème année (BUT 3) pour vous permettre d'acquérir d'abord les bases techniques indispensables." 
  },
  { 
    q: "Quels sont les critères d'admission ?", 
    a: "Nous regardons les notes de français, d'anglais et de spécialités, mais surtout votre motivation et votre 'portfolio' (projets personnels)." 
  }
];

  // --- RENDU : COMPOSANTS INTERNES ---
  const Navbar = ({ onNavigate }) => (
    <nav className={`public-navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <div className="nav-left" onClick={() => {
          setSelectedSae(null);
          onNavigate('landing');
        }}>
          <img src={logo} alt="Logo" className="footer-logo" />
        </div>
        
        <div className="nav-center cursive-font">
          <button onClick={() => { setSelectedSae(null); onNavigate('landing'); }} className="nav-link-btn">accueil</button>
          
          <div className="nav-dropdown-wrapper" 
               onMouseEnter={() => setIsButMenuOpen(true)} 
               onMouseLeave={() => setIsButMenuOpen(false)}>
            <span className="nav-link">but mmi ▾</span>
            <AnimatePresence>
              {isButMenuOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: 10 }} 
                  className="nav-dropdown-content"
                >
                  <div className="dropdown-item-custom" onClick={() => { setSelectedSae(null); onNavigate('projets'); setIsButMenuOpen(false); }}>
                    <strong>Nos Projets</strong>
                    <p>Galerie des créations MMI</p>
                  </div>
                  
                  <div className="dropdown-item-custom" onClick={() => { setSelectedSae(null); onNavigate('equipe'); setIsButMenuOpen(false); }}>
                    <strong>Notre Équipe</strong>
                    <p>Enseignants & intervenants</p>
                  </div>

                  <a href="#faq" className="dropdown-link-simple" onClick={() => { setIsButMenuOpen(false); onNavigate('landing'); }}>FAQ</a>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <button onClick={() => { setSelectedSae(null); onNavigate('projets'); }} className="nav-link-btn">catalogue</button>
          
          <a href="#contact" className="nav-link">contact</a>
        </div>

        <div className="nav-right">
          <button onClick={onShowLogin} className="maquette-btn-black nav-connexion-btn cursive-font">connexion</button>
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

  const SectionButMmiInfo = () => (
    <section className="but-mmi-section bg-white">
      <div className="but-mmi-container">
        <h2 className="but-mmi-title cursive-font">BUT MMI – IUT de Vélizy</h2>
        <p className="but-mmi-intro">
          Bienvenue sur le site officiel du département « Métiers du Multimédia et de l’Internet » de l’IUT de Vélizy.
        </p>
        <blockquote className="but-mmi-quote">
          <span className="quote-mark">“</span>
          Le département forme en trois ans des professionnel·le·s de la conception et de la réalisation de projets multimédias.
          Il propose deux parcours : <strong>“Création numérique”</strong> et <strong>“Développement web et dispositifs interactifs.”</strong>
          À la fois créatif·ve·s et compétent·e·s techniquement, les diplômé·e·s de notre département sont polyvalent·e·s dans le domaine des médias, du web et des nouvelles technologies.
        </blockquote>
      </div>
    </section>
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
                <span className="pub-sae-tag cursive-font">{sae.ressource || 'Autre'}</span>
                <h3 className="cursive-font">{sae.titre || 'Titre du projet'}</h3>
                <p className="line-clamp">{sae.description || 'Description du projet en cours de rédaction...'}</p>
                <div className="pub-sae-footer">
                  <span>{sae.date_rendu ? `Rendu avant ${new Date(sae.date_rendu).toLocaleDateString('fr-FR')}` : 'Date non définie'}</span>
                  <button className="pub-sae-btn cursive-font" onClick={(e)=>{ e.stopPropagation(); setSelectedSae(sae); }}>Voir +</button>
                </div>
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
        <span className="section-label bordeaux-text cursive-font">LA FORMATION</span>
        <h2 className="section-title-large cursive-font bordeaux-text">Devenir créateur de demain.</h2>
        <p className="formation-intro">
          Le BUT MMI à Vélizy forme des experts du web et du contenu numérique. 
          Pendant 3 ans, vous apprenez à concevoir, développer et diffuser des expériences interactives.
        </p>
        <div className="parcours-highlights">
          {/* Les 2 parcours officiels du site */}
          <div className="highlight-pill cursive-font">
            <strong>DW</strong> DÉVELOPPEMENT WEB & DISPOSITIFS INTERACTIFS
          </div>
          <div className="highlight-pill cursive-font">
            <strong>CN</strong> CRÉATION NUMÉRIQUE & DESIGN
          </div>
        </div>
      </div>
      <div className="formation-right-stats">
        {[
          { n: "600h", l: "DE PROJETS (SAE)" },
          { n: "22", l: "SEMAINES DE STAGE" },
          { n: "100%", l: "PROXIMITÉ PRO" },
          { n: "15+", l: "LOGICIELS PROS" }
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
      <Navbar onNavigate={(view) => { setSelectedSae(null); setCurrentView(view); }} />

      <main>
        <AnimatePresence mode="wait">
          {/* VUE ACCUEIL */}
          {currentView === 'landing' && !selectedSae && (
            <motion.div key="main-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <SectionHero />
              <SectionButMmiInfo />
              {loading && <p className="text-center cursive-font">Chargement des projets...</p>}
              <SectionProjets />
              <SectionFormation />
              <SectionFAQ />
              <SectionContact />
            </motion.div>
          )}

          {/* VUE NOS PROJETS */}
          {currentView === 'projets' && (
            <NosProjets 
              saes={saes} 
              API_URL={API_URL} 
              onBack={() => setCurrentView('landing')} 
            />
          )}

          {/* VUE NOTRE ÉQUIPE */}
          {currentView === 'equipe' && (
            <NotreEquipe 
              onBack={() => setCurrentView('landing')} 
            />
          )}

          
          {/* VUE DÉTAIL SAE */}
          {selectedSae && (
            <motion.div key="detail" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="detail-view-container fade-creme">
              <div className="detail-card">
                <button className="btn-back-small cursive-font" onClick={() => setSelectedSae(null)}>
                  ← Retour aux projets
                </button>
                <div className="detail-image" style={{ backgroundImage: `url(${API_URL}${selectedSae.image})` }} />
                <div className="detail-content">
                  <span className="pub-sae-badge cursive-font">{selectedSae.promotion || '2024'}</span>
                  <h2 className="cursive-font">{selectedSae.titre || 'Titre de SAE'}</h2>
                  <p className="detail-tags cursive-font">{selectedSae.ressource || 'Categorie inconnue'}</p>
                  <p className="detail-description">{selectedSae.description || 'Aucune description fournie.'}</p>
                  <div className="detail-meta">
                    <span>Échéance : {selectedSae.date_rendu ? new Date(selectedSae.date_rendu).toLocaleDateString('fr-FR') : 'Non définie'}</span>
                    <button className="pub-sae-btn cursive-font" onClick={() => alert('Accéder au projet : ' + (selectedSae.titre || '...'))}>Accéder</button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
          {legalView === 'mentions' && (
            <MentionsLegales onBack={() => setLegalView(null)} />
          )}
          {legalView === 'privacy' && (
            <Confidentialite onBack={() => setLegalView(null)} />
          )}
        </AnimatePresence>


      <footer className="landing-footer bordeaux-text cursive-font">
        <div className="footer-content">
          <img src={logo} alt="Logo" className="footer-logo" />
          <p>© 2026 Ecampus MMI Vélizy - Tous droits réservés.</p>
          <div className="footer-links">
    <span onClick={() => setLegalView('mentions')}>Mentions légales</span> | 
    <span onClick={() => setLegalView('privacy')}>Confidentialité</span>
</div>
        </div>
      </footer>
    </div>
  );
}