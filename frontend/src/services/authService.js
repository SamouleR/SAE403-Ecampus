const API_URL = "https://api.samuelralaikoa.mmi-velizy.fr"; //

export const authService = {
  // Connexion interactive avec la BDD
  login: async (email, password, role) => {
    const response = await fetch(`${API_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Identifiants invalides");
    }
    
    return await response.json();
  },

  // Vérification de session persistante (JWT)
  checkMe: async (token) => {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error("Session expirée");
    return await response.json();
  },

  // Inscription d'un nouvel utilisateur
  register: async (userData) => {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return await response.json();
  }
};