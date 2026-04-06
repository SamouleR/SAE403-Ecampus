import React from 'react';
import { motion } from 'framer-motion';

/**
 * COMPOSANT : Confidentialite
 * Détaille la gestion des données personnelles et la sécurité (RGPD).
 */
export default function Confidentialite({ onBack }) {
    return (
        <motion.div 
            initial={{ x: '100vw' }} 
            animate={{ x: 0 }} 
            exit={{ x: '100vw' }}
            className="legal-page-container bg-white"
        >
            <div className="legal-header">
                <button className="back-btn-legal cursive-font" onClick={onBack}>
                    ← RETOUR AU PORTAIL
                </button>
            </div>

            <div className="legal-content">
                <header className="text-center">
                    <h1 className="cursive-font bordeaux-text title-xl">Politique de Confidentialité</h1>
                    <p className="legal-date">Conformité RGPD - Version 1.2</p>
                </header>

                <hr className="legal-separator" />

                <section className="legal-section">
                    <h2 className="cursive-font">1. Nature des Données Collectées</h2>
                    <p>Dans le cadre de l'utilisation d'ECAMPUS, nous collectons les informations suivantes :</p>
                    <ul className="legal-list">
                        <li><strong>Données d'identification :</strong> Nom, prénom, adresse e-mail.</li>
                        <li><strong>Données de connexion :</strong> Logs d'accès, adresse IP (via le serveur Express).</li>
                        <li><strong>Données académiques :</strong> Promotion, groupe, notes et rendus de SAE.</li>
                    </ul>
                </section>

                <section className="legal-section">
                    <h2 className="cursive-font">2. Utilisation et Finalité</h2>
                    <p>Le traitement des données est nécessaire pour :</p>
                    <ol>
                        <li>L'authentification sécurisée des étudiants et enseignants.</li>
                        <li>La gestion personnalisée des tableaux de bord (Dashboards).</li>
                        <li>La communication via le formulaire de contact intégré.</li>
                        <li>L'administration des ressources pédagogiques (SAEs).</li>
                    </ol>
                </section>

                <section className="legal-section">
                    <h2 className="cursive-font">3. Mesures de Sécurité Techniques</h2>
                    <p>Pour garantir la confidentialité des échanges entre le Front et le Back, nous appliquons :</p>
                    <ul className="legal-list">
                        <li><strong>Hachage :</strong> Les mots de passe ne sont jamais stockés en clair (Algorithme bcrypt avec sel).</li>
                        <li><strong>JWT (JSON Web Tokens) :</strong> Utilisation de jetons signés pour l'autorisation des requêtes API.</li>
                        <li><strong>CORS :</strong> Restriction des appels API aux domaines autorisés uniquement.</li>
                        <li><strong>HTTPS :</strong> Chiffrement TLS des données en transit.</li>
                    </ul>
                </section>

                <section className="legal-section">
                    <h2 className="cursive-font">4. Cookies et Stockage Local</h2>
                    <p>
                        L'application n'utilise pas de cookies publicitaires. Nous utilisons uniquement le <strong>LocalStorage</strong> 
                        du navigateur pour stocker de manière temporaire le jeton d'authentification, permettant de maintenir 
                        votre session active (Architecture Stateless).
                    </p>
                </section>

                <section className="legal-section">
                    <h2 className="cursive-font">5. Vos Droits</h2>
                    <p>
                        Conformément au RGPD, vous disposez d’un droit d’accès, de rectification et de suppression de vos données. 
                        Pour toute demande, veuillez utiliser le formulaire de contact présent sur le portail d'accueil.
                    </p>
                </section>
            </div>
        </motion.div>
    );
}