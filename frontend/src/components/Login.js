import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const user = await authService.login(email, password);
            if (user) {
                authService.setSession('fake-token-123', user);
                if (user.roles.includes('ROLE_ADMIN')) navigate('/admin');
                else if (user.roles.includes('ROLE_TEACHER')) navigate('/enseignant');
                else navigate('/etudiant');
                window.location.reload(); // Pour actualiser la Navbar
            } else {
                alert("Identifiants incorrects");
            }
        } catch (err) {
            console.error("Erreur login:", err);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f2f5' }}>
            <form onSubmit={handleLogin} style={{ background: 'white', padding: '40px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <h2 style={{ marginBottom: '20px', color: '#1a73e8' }}>Connexion Ecampus</h2>
                <div style={{ marginBottom: '15px' }}>
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required 
                           style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }} />
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required 
                           style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }} />
                </div>
                <button type="submit" style={{ width: '100%', padding: '12px', background: '#1a73e8', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Se connecter
                </button>
            </form>
        </div>
    );
};

export default Login;