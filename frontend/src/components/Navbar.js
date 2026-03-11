import React from 'react';
import './Navbar.css';

const Navbar = () => {
    // On récupère les infos de l'utilisateur stockées lors de la connexion
    // Si pas de connexion, on met un nom par défaut pour le test
    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : { nom: "Samuel RALAIKOA" };

    return (
        <nav className="main-nav">
            <div className="nav-left">
                <span className="user-name">{user.nom || user.username}</span>
            </div>
            
            <div className="nav-right">
                <button className="nav-icon">⚙️</button>
                <button className="nav-icon">🔔</button>
                <div className="user-avatar">
                    <img src="https://ui-avatars.com/api/?name=Samuel+Ralaikoa&background=random" alt="Avatar" />
                </div>
                <span className="arrow-down">⌄</span>
            </div>
        </nav>
    );
};

export default Navbar;