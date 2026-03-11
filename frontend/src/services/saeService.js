const API_URL = 'http://localhost:8000/api';

export const saeService = {
    // Récupérer toutes les SAE
    getAll: async () => {
        const response = await fetch(`${API_URL}/saes`);
        return await response.json();
    },
    // Se connecter (pour récupérer le Token JWT)
    login: async (credentials) => {
        const response = await fetch(`${API_URL}/login_check`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });
        return await response.json();
    }
};