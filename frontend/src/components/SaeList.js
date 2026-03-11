import React, { useEffect, useState } from 'react';
import { saeService } from '../services/saeService';

const SaeList = () => {
    const [saes, setSaes] = useState([]);

    useEffect(() => {
        saeService.getAll().then(data => setSaes(data['hydra:member'] || data));
    }, []);

    return (
        <div style={{ padding: '20px' }}>
            <h1>Tableau de bord des SAE</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                {saes.map(sae => (
                    <div key={sae.id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
                        <h3>{sae.title}</h3>
                        <p>{sae.description}</p>
                        <button>Voir les détails</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SaeList;