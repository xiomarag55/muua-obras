/**
 * Servicio de API para conectar con el backend Spring Boot
 * Utiliza los mismos esquemas que se definen en la base de datos PostgreSQL
 */

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Servicio de Artistas
 */
export const artistService = {
    // Obtener todos los artistas
    getAll: async (params = {}) => {
        try {
            const response = await apiClient.get('/artists', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching artists:', error);
            throw error;
        }
    },

    // Obtener artista por ID
    getById: async (id) => {
        try {
            const response = await apiClient.get(`/artists/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching artist ${id}:`, error);
            throw error;
        }
    },

    // Buscar artistas
    search: async (query) => {
        try {
            const response = await apiClient.get('/artists/search', {
                params: { q: query }
            });
            return response.data;
        } catch (error) {
            console.error('Error searching artists:', error);
            throw error;
        }
    },

    // Filtrar artistas por región
    filterByRegion: async (region) => {
        try {
            const response = await apiClient.get('/artists/region', {
                params: { region }
            });
            return response.data;
        } catch (error) {
            console.error('Error filtering artists by region:', error);
            throw error;
        }
    },

    // Filtrar artistas por técnica
    filterByTechnique: async (technique) => {
        try {
            const response = await apiClient.get('/artists/technique', {
                params: { technique }
            });
            return response.data;
        } catch (error) {
            console.error('Error filtering artists by technique:', error);
            throw error;
        }
    }
};

/**
 * Servicio de Obras de Arte
 */
export const artworkService = {
    // Obtener todas las obras
    getAll: async (params = {}) => {
        try {
            const response = await apiClient.get('/artworks', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching artworks:', error);
            throw error;
        }
    },

    // Obtener obra por ID
    getById: async (id) => {
        try {
            const response = await apiClient.get(`/artworks/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching artwork ${id}:`, error);
            throw error;
        }
    },

    // Obtener obras por artista
    getByArtist: async (artistId) => {
        try {
            const response = await apiClient.get(`/artworks/artist/${artistId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching artworks for artist ${artistId}:`, error);
            throw error;
        }
    },

    // Buscar obras
    search: async (query) => {
        try {
            const response = await apiClient.get('/artworks/search', {
                params: { q: query }
            });
            return response.data;
        } catch (error) {
            console.error('Error searching artworks:', error);
            throw error;
        }
    },

    // Filtrar obras por técnica
    filterByTechnique: async (technique) => {
        try {
            const response = await apiClient.get('/artworks/technique', {
                params: { technique }
            });
            return response.data;
        } catch (error) {
            console.error('Error filtering artworks by technique:', error);
            throw error;
        }
    },

    // Filtrar obras por año
    filterByYear: async (year) => {
        try {
            const response = await apiClient.get('/artworks/year', {
                params: { year }
            });
            return response.data;
        } catch (error) {
            console.error('Error filtering artworks by year:', error);
            throw error;
        }
    },

    // Filtrar obras por rango de años
    filterByYearRange: async (startYear, endYear) => {
        try {
            const response = await apiClient.get('/artworks/year-range', {
                params: { startYear, endYear }
            });
            return response.data;
        } catch (error) {
            console.error('Error filtering artworks by year range:', error);
            throw error;
        }
    },

    // Crear obra (requiere token)
    create: async (artworkData, token) => {
        const response = await apiClient.post('/artworks', artworkData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    // Eliminar obra (requiere token)
    delete: async (id, token) => {
        await apiClient.delete(`/artworks/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }
};

/**
 * Servicio de Filtros
 */
export const filterService = {
    // Obtener opciones de filtro disponibles
    getFilterOptions: async () => {
        try {
            const response = await apiClient.get('/filters');
            return response.data;
        } catch (error) {
            console.error('Error fetching filter options:', error);
            throw error;
        }
    },

    // Obtener técnicas disponibles
    getTechniques: async () => {
        try {
            const response = await apiClient.get('/filters/techniques');
            return response.data;
        } catch (error) {
            console.error('Error fetching techniques:', error);
            throw error;
        }
    },

    // Obtener regiones disponibles
    getRegions: async () => {
        try {
            const response = await apiClient.get('/filters/regions');
            return response.data;
        } catch (error) {
            console.error('Error fetching regions:', error);
            throw error;
        }
    },

    // Obtener años disponibles
    getYears: async () => {
        try {
            const response = await apiClient.get('/filters/years');
            return response.data;
        } catch (error) {
            console.error('Error fetching years:', error);
            throw error;
        }
    }
};

/**
 * Servicio de Autenticación
 */
export const authService = {
    register: async (username, password) => {
        const response = await apiClient.post('/auth/register', { username, password });
        return response.data;
    },
    login: async (username, password) => {
        const response = await apiClient.post('/auth/login', { username, password });
        return response.data;
    },
};

/**
 * Servicio de Art Institute of Chicago (API externa)
 */
export const articService = {
    getArtworks: async (page = 1, limit = 12) => {
        try {
            const response = await apiClient.get('/artworks/artic', { params: { page, limit } });
            return response.data;
        } catch (error) {
            console.error('Error fetching artic artworks:', error);
            throw error;
        }
    }
};

export default {
    artistService,
    artworkService,
    filterService,
    articService,
    authService
};
