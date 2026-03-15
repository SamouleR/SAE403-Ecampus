const API_URL = 'http://localhost:8000/api';

export const authService = {
    login: async (email, password) => {
        const response = await fetch(`${API_URL}/login_check`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }) // Symfony attend souvent "username" au lieu d'email selon la config
        });

        if (!response.ok) return null;

        const data = await response.json();
        // data contient normalement { "token": "xxxx", "user": { "nom": "...", "roles": [...] } }
        if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            return data.user;
        }
        return null;
    },

    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    logout: () => {
        localStorage.clear();
        window.location.href = '/login';
    }
};