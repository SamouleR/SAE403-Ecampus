# 🚀 ECAMPUS - Plateforme de Gestion de SAE

ECAMPUS est une application web full-stack conçue pour faciliter la gestion des Situations d'Apprentissage et d'Évaluation (SAE). Elle permet aux professeurs de publier des sujets, aux étudiants de rendre leurs travaux et de mettre en avant les meilleures réalisations via une "Vitrine".

## ✨ Fonctionnalités

### 👨‍🎓 Étudiants
- **Catalogue des SAE** : Visualisation de tous les projets disponibles avec filtres par ressource.
- **Espace de Rendu** : Dépôt de fichiers (PDF, Images) ou de liens externes (GitHub, Portfolio).
- **Suivi** : Consultation des notes et des feedbacks.
- **Vitrine** : Accès aux meilleures réalisations de la promotion validées par les professeurs.

### 👨‍🏫 Administrateurs / Professeurs
- **Gestion SAE** : Création, modification et validation des projets.
- **Modération** : Validation des nouveaux comptes étudiants.
- **Évaluation** : Système de notation des rendus.
- **Mise en Vitrine** : Sélection des travaux étudiants à afficher publiquement.
- **Annonces** : Diffusion de messages globaux sur la plateforme.

## 🛠️ Stack Technique

- **Frontend** : React.js, Framer Motion (animations), CSS3.
- **Backend** : Node.js, Express.
- **Base de données** : MySQL.
- **Gestion de fichiers** : Multer.
- **Sécurité** : JSON Web Token (JWT) & bcrypt.

## 📦 Installation

### Pré-requis
- Node.js (v14+)
- Serveur MySQL

### Backend
1. Naviguer dans le dossier server : `cd server` (ou la racine si combiné).
2. Installer les dépendances : `npm install`.
3. Configurer le fichier `.env` :
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=votre_mdp
   DB_NAME=ecampus_db
   JWT_SECRET=votre_cle_secrete