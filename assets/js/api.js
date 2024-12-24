// API Configuration
const API_BASE_URL = 'https://rickandmortyapi.com/api';

// API Service
class RickAndMortyAPI {
    static async getCharacters(page = 1) {
        try {
            const response = await fetch(`${API_BASE_URL}/character?page=${page}`);
            if (!response.ok) throw new Error('API request failed');
            return await response.json();
        } catch (error) {
            console.error('Error fetching characters:', error);
            throw error;
        }
    }

    static async getCharacterById(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/character/${id}`);
            if (!response.ok) throw new Error('API request failed');
            return await response.json();
        } catch (error) {
            console.error('Error fetching character:', error);
            throw error;
        }
    }
}
