import React from 'react';
import { motion } from 'framer-motion';
import './NotreEquipe.css';

// Importations des images
import FP from './image/FP.jpg';
import BA from './image/BA.jpg';
import CF from './image/CF.jpg';
import JM from './image/JM.jpg';
import MP from './image/MP.jpg';
import OL from './image/OL.jpg';
import SF from './image/SF.jpg';
import TL from './image/TL.jpg';
import VW from './image/VW.jpg';
import XH from './image/XH.jpg';

const EQUIPE = [
    { nom: "Ben Amor,", poste: "Maître de conférences habilité (MCF HDR), responsable informatique", email: "soufian.ben-amor@uvsq.fr", img: BA },
    { nom: "Olivier Le Cadet,", poste: "PRAG Mathématiques, responsable développement web. Directeur des études", email: "lecadet@iut-velizy.uvsq.fr", img: OL },
    { nom: "Jean-Marie Clech,", poste: "Professionnel, Graphic Design, infographie", email: "jean-marie.clech@uvsq.fr", img: JM },
    { nom: "Sylvie Fabre,", poste: "Enseignante communication, responsable stages. Cheffe de département MMI", email: "sylvie.fabre@uvsq.fr", img: SF },
    { nom: "Cédric Fournerie,", poste: "Enseignant Réseaux et télécoms, responsable licence METWEB", email: "cedric.fournerie@uvsq.fr", img: CF },
    { nom: "Xavier Hautbois,", poste: "Maître de conférences (MCF), responsable musique et interactivité", email: "xavier.hautbois@orange.fr", img: XH },
    { nom: "Thérèse Lepage,", poste: "Professeure agrégée d'anglais (PRAG), responsable anglais", email: "therese.cronier@uvsq.fr", img: TL },
    { nom: "Michel Pinosa,", poste: "Professionnel, Arts plastiques, Graphic Design & Web Design", email: "mmi@michelpinosa.com", img: MP },
    { nom: "Fred Pirat,", poste: "Professionnel et responsable des enseignements en audiovisuel", email: "frederic.pirat@uvsq.fr", img: FP },
    { nom: "Vincent Wable,", poste: "Responsable audiovisuel et enseignant en audiovisuel", email: "pas de mail disponible", img: VW }
];

export default function NotreEquipe({ onBack }) {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="equipe-page-wrapper"
        >
            <div className="equipe-container">
                <header className="equipe-header">
                    <button onClick={onBack} className="back-btn-minimal cursive-font">← RETOUR</button>
                    <h1 className="title-main-equipe">Equipe des personnels rattachés au cursus <span className="text-red">BUT MMI</span></h1>
                    <p className="equipe-intro-text">
                        Une équipe de personnes aux compétences et profils variés vous accompagne tout au long de vos études. 
                        Ces personnels garantissent un enseignement adapté et de qualité.
                    </p>
                </header>

                <div className="equipe-grid-layout">
                    {EQUIPE.map((membre, i) => (
                        <div key={i} className="membre-card-v2">
                            <div className="membre-photo-frame-v2">
                                <img src={membre.img} alt={membre.nom} className="membre-img-v2" />
                                <div className="hover-overlay">
                                    <a href={`mailto:${membre.email}`} className="mail-btn">Contacter</a>
                                </div>
                            </div>
                            <div className="membre-content-v2">
                                <h3 className="membre-name-v2 text-red">{membre.nom}</h3>
                                <p className="membre-job-v2">{membre.poste}</p>
                                <p className="membre-email-v2">{membre.email}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}