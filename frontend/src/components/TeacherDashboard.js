import React, { useState, useEffect } from 'react';

const TeacherDashboard = () => {
    const [saes, setSaes] = useState([]);
    const [form, setForm] = useState({ id_sae: '', titre: '', type: 'CONSIGNE', contenu: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        fetch('http://localhost:8000/api/ressources', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form)
        }).then(() => alert("Contenu ajouté !"));
    };

    return (
        <div className="p-4">
            <h1>Espace Enseignant - Gestion Globale</h1> [cite: 16]
            <form onSubmit={handleSubmit} className="form-card">
                <h3>Ajouter une Ressource / Annonce</h3>
                <input type="text" placeholder="Titre" onChange={e => setForm({...form, titre: e.target.value})} />
                <select onChange={e => setForm({...form, type: e.target.value})}>
                    <option value="CONSIGNE">📜 Consigne</option>
                    <option value="RESSOURCE">📚 Ressource</option>
                    <option value="ANNONCE">📢 Annonce</option>
                </select>
                <textarea placeholder="Contenu..." onChange={e => setForm({...form, contenu: e.target.value})}></textarea>
                <button type="submit">Publier la ressource</button>
            </form>
        </div>
    );
};
export default TeacherDashboard;