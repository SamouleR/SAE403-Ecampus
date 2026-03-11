import React from 'react';
import './StudentDashboard.css'; // On va créer ce CSS juste après

const StudentDashboard = () => {
    // Données fictives (Mocks) en attendant que ton binôme finisse le Back-end
    const mesSaes = [
        { id: 1, titre: "SAE 4.01 - Développement Web", semestre: "S4", etat: "Rendu attendu", date: "25 Mars" },
        { id: 2, titre: "SAE 4.02 - Marketing Digital", semestre: "S4", etat: "Validé", date: "10 Mars" },
        { id: 3, titre: "SAE 4.03 - Communication", semestre: "S4", etat: "En retard", date: "01 Mars" },
    ];

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Tableau de bord Étudiant</h1>
                <div className="filter-bar">
                    <button className="active">Toutes les SAE</button>
                    <button>Semestre 4</button>
                </div>
            </header>

            <div className="sae-grid">
                {mesSaes.map(sae => (
                    <div key={sae.id} className={`sae-card ${sae.etat.toLowerCase().replace(' ', '-')}`}>
                        <div className="card-badge">{sae.semestre}</div>
                        <h3>{sae.titre}</h3>
                        <p className="due-date">Échéance : <strong>{sae.date}</strong></p>
                        <div className="status-indicator">
                            <span className="dot"></span> {sae.etat}
                        </div>
                        <button className="btn-details">Accéder à la SAE</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StudentDashboard;