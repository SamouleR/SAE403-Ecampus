import React from 'react';
import './StudentDashboard.css';

const StudentDashboard = () => {
    const saes = [
        { id: 1, titre: "SAE 4.01 - Développement Web", semestre: "S4", etat: "rendu", date: "25 Mars" },
        { id: 2, titre: "SAE 4.02 - Marketing Digital", semestre: "S4", etat: "valide", date: "10 Mars" },
        { id: 3, titre: "SAE 4.03 - Communication", semestre: "S4", etat: "retard", date: "01 Mars" },
    ];

    return (
        <div className="dashboard">
            <header className="dash-header">
                <h1>Mon Espace SAE</h1>
                <p>Bienvenue sur votre suivi de projets.</p>
            </header>
            <div className="sae-grid">
                {saes.map(s => (
                    <div key={s.id} className={`sae-card ${s.etat}`}>
                        <span className="badge">{s.semestre}</span>
                        <h3>{s.titre}</h3>
                        <p>Date limite : <strong>{s.date}</strong></p>
                        <div className="status">
                            {s.etat === 'rendu' && "✅ Rendu effectué"}
                            {s.etat === 'valide' && "⭐ Projet validé"}
                            {s.etat === 'retard' && "⚠️ Retard"}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StudentDashboard;