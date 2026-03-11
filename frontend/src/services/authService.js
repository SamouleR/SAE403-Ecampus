export const authService = {
    // Sauvegarde la session dans le navigateur
    setSession: (token, user) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
    },

    // Vérifie les identifiants dans le JSON
    login: async (email, password) => {
        const response = await fetch('/user.json');
        const users = await response.json();
        const user = users.find(u => u.email === email && u.password === password);
        return user; 
    },

    // Récupère l'utilisateur connecté
    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    // Déconnexion complète
    logout: () => {
        localStorage.clear();
        window.location.href = '/login';
    }
};