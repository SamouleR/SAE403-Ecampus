import React from 'react';

const StudentDashboard = () => {
    return (
        <div className="p-4">
            <h1>Mon Tableau de Bord Étudiant</h1> [cite: 15]
            <div className="dashboard-grid">
                <div className="card status-en-cours">
                    <h3>🚀 SAE en cours</h3>
                    <p>SAE 4.03 - Backend JS</p>
                    <button>Rendre mon travail</button> 
                </div>
                <div className="card status-rendu">
                    <h3>✅ SAE Rendues</h3>
                    <p>SAE 4.02 - Design UI</p>
                </div>
            </div>
            <div className="announcements">
                <h3>📢 Dernières Annonces</h3> 
                <p>M. Lecadet : La soutenance approche !</p>
            </div>
        </div>
    );
};
export default StudentDashboard;