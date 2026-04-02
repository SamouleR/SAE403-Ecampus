import React from 'react';
import { motion } from 'framer-motion';

const Formation = () => {
  const stats = [
    { label: "SEMESTRES", value: "6" },
    { label: "PARCOURS", value: "2" },
    { label: "ANNÉE EN ALTERNANCE", value: "1" },
    { label: "ÉTUDIANTS/PROMO", value: "~50" }
  ];

  const parcours = [
    { id: "DW", title: "DÉVELOPPEMENT WEB", desc: "Front-end, APIs, Frameworks, VR" },
    { id: "CN", title: "CRÉATION NUMÉRIQUE", desc: "Motion design, 3D, identité visuelle, Campagnes de communication" }
  ];

  return (
    <section id="formation" className="section-formation-clean">
      <div className="formation-flex-container">
        {/* Partie gauche : Texte explicatif */}
        <div className="formation-text-side">
          <h2 className="formation-main-title cursive-font bordeaux-text">
            Le BUT MMI <br /> <span className="text-thin">en 3 ans.</span>
          </h2>
          <p className="formation-paragraph">
            Le département forme en trois ans des professionnel·le·s de la conception et de la réalisation de projets multimédias. 
            Il propose deux parcours : “Création numérique” et “Développement web et dispositifs interactifs”. 
            À la fois créatif·ve·s et compétent·e·s techniquement, les diplômé·e·s de notre département sont polyvalent·e·s dans le domaine des médias.
          </p>

          <div className="parcours-cards-wrapper">
            {parcours.map((p) => (
              <div key={p.id} className="parcours-mini-card">
                <h3 className="bordeaux-text">{p.id}</h3>
                <strong>{p.title}</strong>
                <p>{p.desc}</p>
              </div>
            ))}
          </div>
          
          <button className="btn-bordeaux-pill" style={{marginTop: '40px'}}>
            DÉCOUVRIR LE BUT MMI →
          </button>
        </div>

        {/* Partie droite : Chiffres clés */}
        <div className="formation-stats-side">
          {stats.map((s, index) => (
            <motion.div 
              key={index} 
              className="stat-box-clean"
              whileHover={{ y: -5 }}
            >
              <h3 className="stat-value bordeaux-text">{s.value}</h3>
              <p className="stat-label">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Formation;