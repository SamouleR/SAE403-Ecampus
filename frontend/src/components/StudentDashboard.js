import React, { useEffect, useState } from 'react';
import './StudentDashboard.css';

const StudentDashboard = () => {
    const [saes, setSaes] = useState([]);

    useEffect(() => {
        fetch('http://localhost:8000/api/saes')
            .then(res => res.json())
            .then(data => setSaes(data));
    }, []);

    return (
        <div className="dash-bw">
            <h1 className="title-tag">ÉTUDIANTE</h1>
            <div className="sae-grid">
                {saes.map(sae => (
                    <div key={sae.id} className="card-bw">
                        <div className="card-img">IMAGE</div>
                        <div className="card-body">
                            <p className="sem">{sae.semestre}</p>
                            <h3>{sae.titre}</h3>
                            <p className="desc">{sae.description}</p>
                            <div className="card-foot">
                                <span className="note">{sae.note}</span>
                                <button className="btn-details">Détails</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default StudentDashboard;