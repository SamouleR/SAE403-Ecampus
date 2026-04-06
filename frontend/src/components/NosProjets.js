import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion'; // On a enlevé AnimatePresence
import './NosProjets.css'; // Import spécifique



export default function NosProjets({ saes, API_URL, onBack }) {
    const [niveau, setNiveau] = useState('Tous');
    const [domaine, setDomaine] = useState('Tous');

    const filteredSaes = useMemo(() => {
        return saes.filter(sae => {
            const mNiveau = niveau === 'Tous' || sae.promotion.includes(niveau);
            const mDomaine = domaine === 'Tous' || (sae.ressource && sae.ressource.includes(domaine));
            return mNiveau && mDomaine;
        });
    }, [saes, niveau, domaine]);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="galerie-full">
            <header className="galerie-header">
                <button onClick={onBack} className="back-link">← ARCHIVE / GALERIE</button>
                <h1 className="cursive-font title-huge">Nos <span className="bordeaux-text">Projets.</span></h1>
            </header>

            <div className="filter-system">
                <div className="filter-group">
                    <span className="label">NIVEAU</span>
                    {['Tous', 'MMI 1', 'MMI 2', 'MMI 3'].map(n => (
                        <button key={n} onClick={() => setNiveau(n)} className={`chip ${niveau === n ? 'active' : ''}`}>{n}</button>
                    ))}
                </div>
                <div className="filter-group">
                    <span className="label">DOMAINE</span>
                    {['Tous', 'Web', 'Design', 'Com', 'Vidéo'].map(d => (
                        <button key={d} onClick={() => setDomaine(d)} className={`chip ${domaine === d ? 'active' : ''}`}>{d}</button>
                    ))}
                </div>
            </div>

            <div className="projects-grid">
                {filteredSaes.map(sae => (
                    <div key={sae.id} className="project-card">
                        <div className="card-media" style={{backgroundImage: `url(${API_URL}${sae.image})`}}></div>
                        <div className="card-details">
                            <span className="sae-code">{sae.ressource}</span>
                            <h4>{sae.titre}</h4>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}