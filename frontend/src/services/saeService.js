const API_URL = 'http://localhost:8000/api';

export const saeService = {
    // Récupérer toutes les SAE (avec le Token de l'utilisateur connecté)
    getAll: async () => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/saes`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return await response.json();
    }
};