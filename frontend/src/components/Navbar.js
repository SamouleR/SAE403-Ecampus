import React from 'react';
import { authService } from '../services/authService';
import './Navbar.css';

const Navbar = () => {
    const user = authService.getCurrentUser();
    if (!user) return null;

    return (
        <nav className="main-nav">
            <div className="nav-left"><strong>Ecampus</strong> | {user.nom}</div>
            <div className="nav-right">
                <button onClick={() => authService.logout()} className="logout-btn">déconnexion</button>
            </div>
        </nav>
    );
};
export default Navbar;