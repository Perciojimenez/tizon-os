// Configuración de la API del backend
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'https://tizon-os-production.up.railway.app';

export const apiClient = {
  baseURL: API_BASE_URL,
  
  async request(endpoint: string, options: any = {}) {
    const token = await this.getToken();
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  },

  async getToken() {
    // Obtener token del storage o sesión de Supabase
    return null; // TODO: integrar con auth store
  },
};
