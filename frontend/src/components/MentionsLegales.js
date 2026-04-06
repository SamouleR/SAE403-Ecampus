import React from 'react';
import { motion } from 'framer-motion';

/**
 * COMPOSANT : MentionsLegales
 * Présente les informations juridiques obligatoires (Loi LCEN).
 */
export default function MentionsLegales({ onBack }) {
    return (
        <motion.div 
            initial={{ x: '100vw' }} 
            animate={{ x: 0 }} 
            exit={{ x: '100vw' }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="legal-page-container bg-white"
        >
            <div className="legal-header">
                <button className="back-btn-legal cursive-font" onClick={onBack}>
                    ← RETOUR AU PORTAIL
                </button>
            </div>

            <div className="legal-content">
                <header className="text-center">
                    <h1 className="cursive-font bordeaux-text title-xl">Mentions Légales</h1>
                    <p className="legal-date">Dernière mise à jour : 3 avril 2026</p>
                </header>

                <hr className="legal-separator" />

                <section className="legal-section">
                    <h2 className="cursive-font">1. Édition du site</h2>
                    <p>
                        En vertu de l'article 6 de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique, 
                        il est précisé aux utilisateurs de l'application <strong>ECAMPUS</strong> l'identité des intervenants :
                    </p>
                    <ul className="legal-list">
                        <li><strong>Propriétaires & Développeurs :</strong> Samuel R. (Front-end) & Jayson B. (Back-end).</li>
                        <li><strong>Statut :</strong> Projet pédagogique réalisé dans le cadre de la SAE 403.</li>
                        <li><strong>Établissement :</strong> IUT de Vélizy-Villacoublay - Université de Versailles Saint-Quentin-en-Yvelines.</li>
                        <li><strong>Adresse :</strong> 10-12 Av. de l'Europe, 78140 Vélizy-Villacoublay.</li>
                    </ul>
                </section>

                <section className="legal-section">
                    <h2 className="cursive-font">2. Hébergement et Infrastructure</h2>
                    <p>Le déploiement de l'application repose sur une architecture distribuée :</p>
                    <ul className="legal-list">
                        <li><strong>Front-end (React) :</strong> Hébergé par Hostinger International Ltd.</li>
                        <li><strong>Back-end (Node.js/Express) :</strong> Hébergé via une infrastructure dédiée o2switch.</li>
                        <li><strong>Base de données :</strong> Serveur MySQL managé avec accès restreint par IP.</li>
                    </ul>
                </section>

                <section className="legal-section">
                    <h2 className="cursive-font">3. Propriété Intellectuelle</h2>
                    <p>
                        Samuel R. et Jayson B. sont propriétaires des droits de propriété intellectuelle ou détiennent les droits d’usage sur 
                        tous les éléments accessibles sur le site, notamment : les textes, les images (hors licences libres), 
                        le code source React/Node.js, les logos et l'iconographie.
                    </p>
                    <p className="warning-text">
                        Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, 
                        quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable.
                    </p>
                </section>

                <section className="legal-section">
                    <h2 className="cursive-font">4. Limitations de Responsabilité</h2>
                    <p>
                        Les auteurs ne pourront être tenus responsables des dommages directs et indirects causés au matériel de l’utilisateur, 
                        lors de l’accès au site, et résultant soit de l’utilisation d’un matériel ne répondant pas aux spécifications techniques, 
                        soit de l’apparition d’un bug ou d’une incompatibilité logicielle.
                    </p>
                </section>
            </div>
        </motion.div>
    );
}