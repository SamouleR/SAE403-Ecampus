import React from 'react';
import { authService } from '../services/authService';
import './Navbar.css';

const Navbar = () => {
    const user = authService.getCurrentUser();

    // Si personne n'est connecté, on n'affiche pas la barre
    if (!user) return null;

    return (
        <nav className="main-nav">
            <div className="nav-left">
                <span className="brand">Ecampus</span>
                <span className="separator">|</span>
                <span className="user-name">{user.nom}</span>
            </div>
            
            <div className="nav-right">
                <button className="nav-icon" title="Paramètres">⚙️</button>
                <button className="nav-icon" title="Notifications">🔔</button>
                
                <div className="user-profile">
                    <img 
                        src={`https://ui-avatars.com/api/?name=${user.nom}&background=random`} 
                        alt="Avatar" 
                        className="avatar"
                    />
                    {/* Le nouveau bouton de déconnexion */}
                    <button onClick={() => authService.logout()} className="logout-btn">
                        Déconnexion
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;