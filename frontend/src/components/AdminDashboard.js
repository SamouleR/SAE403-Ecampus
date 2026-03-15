import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [newUser, setNewUser] = useState({ nom: '', email: '', password: '', role: 'ROLE_STUDENT' });

    // Charger les utilisateurs existants au début
    useEffect(() => {
        fetch('/user.json')
            .then(res => res.json())
            .then(data => setUsers(data));
    }, []);

    const handleAddUser = (e) => {
        e.preventDefault();
        // On crée le nouvel utilisateur avec un ID aléatoire
        const userToCreate = {
            ...newUser,
            id: Math.floor(Math.random() * 1000),
            roles: [newUser.role] // Symfony attend souvent un tableau de rôles
        };

        setUsers([...users, userToCreate]); // On l'ajoute à la liste locale
        setShowForm(false); // On ferme le formulaire
        setNewUser({ nom: '', email: '', password: '', role: 'ROLE_STUDENT' }); // Reset
        alert(`${newUser.nom} a été ajouté avec succès !`);
    };

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1>Gestion des Utilisateurs</h1>
                <button className="add-btn" onClick={() => setShowForm(!showForm)}>
                    {showForm ? "Annuler" : "+ Ajouter un membre"}
                </button>
            </div>

            {showForm && (
                <form className="add-user-form" onSubmit={handleAddUser}>
                    <h3>Nouvel utilisateur</h3>
                    <div className="form-grid">
                        <input type="text" placeholder="Nom complet" value={newUser.nom} 
                            onChange={e => setNewUser({...newUser, nom: e.target.value})} required />
                        
                        <input type="email" placeholder="Email @ecampus.fr" value={newUser.email}
                            onChange={e => setNewUser({...newUser, email: e.target.value})} required />
                        
                        <input type="password" placeholder="Mot de passe" value={newUser.password}
                            onChange={e => setNewUser({...newUser, password: e.target.value})} required />
                        
                        <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                            <option value="ROLE_STUDENT">🎓 Étudiant</option>
                            <option value="ROLE_TEACHER">👨‍🏫 Enseignant</option>
                        </select>
                    </div>
                    <button type="submit" className="save-btn">Enregistrer dans la base</button>
                </form>
            )}

            <div className="user-list">
                <table>
                    <thead>
                        <tr>
                            <th>Nom</th>
                            <th>Email</th>
                            <th>Rôle</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id}>
                                <td>{u.nom}</td>
                                <td>{u.email}</td>
                                <td>
                                    <span className={`role-tag ${u.roles.includes('ROLE_TEACHER') ? 'prof' : 'student'}`}>
                                        {u.roles.includes('ROLE_TEACHER') ? 'Enseignant' : 'Étudiant'}
                                    </span>
                                </td>
                                <td>
                                    <button className="delete-btn" onClick={() => setUsers(users.filter(user => user.id !== u.id))}>
                                        🗑️
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminDashboard;