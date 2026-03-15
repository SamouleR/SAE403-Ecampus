import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [roleActif, setRoleActif] = useState('STUDENT'); // 'STUDENT', 'TEACHER' ou 'ADMIN'
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Mapping pour faire le lien entre l'onglet et le rôle dans le JSON
    const roleMapping = {
        STUDENT: 'ROLE_STUDENT',
        TEACHER: 'ROLE_TEACHER',
        ADMIN: 'ROLE_ADMIN'
    };

    const labels = {
        STUDENT: 'Étudiant',
        TEACHER: 'Enseignant',
        ADMIN: 'Administrateur'
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(''); // Reset de l'erreur

        const user = await authService.login(email, password);
        
        if (user) {
            // VERIFICATION STRICTE DU ROLE
            const roleAttendu = roleMapping[roleActif];
            
            if (user.roles.includes(roleAttendu)) {
                // Tout est OK
                authService.setSession('token-secure', user);
                const destination = roleActif === 'ADMIN' ? '/admin' : 
                                   roleActif === 'TEACHER' ? '/enseignant' : '/etudiant';
                window.location.href = destination;
            } else {
                // Identifiants OK mais MAUVAIS RÔLE
                setError(`Ce compte n'a pas les droits pour l'espace ${labels[roleActif]}.`);
            }
        } else {
            // MAUVAIS IDENTIFIANTS
            setError("Identifiants incorrects.");
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <h2>Connexion Ecampus</h2>
                
                <div className="role-tabs">
                    {Object.keys(labels).map((role) => (
                        <button 
                            key={role}
                            type="button"
                            className={roleActif === role ? 'active' : ''} 
                            onClick={() => {
                                setRoleActif(role);
                                setError(''); // On efface l'erreur quand on change d'onglet
                            }}
                        >
                            {labels[role]}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleLogin}>
                    {error && <div className="error-box">{error}</div>}

                    <div className="input-group">
                        <label>Identifiant</label>
                        <input 
                            type="email" 
                            placeholder="votre@email.fr"
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="input-group">
                        <label>Mot de passe</label>
                        <input 
                            type="password" 
                            placeholder="••••••••"
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                        />
                    </div>
                    <button type="submit" className="login-btn">
                        Accéder à l'espace {labels[roleActif]}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;