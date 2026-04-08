const API_URL = 'http://192.168.100.28:5001/api/tournaments';
const POKEMON_API_URL = 'http://192.168.100.28:5001/api/pokemon';
const AUTH_API_URL = 'http://192.168.100.28:5001/api/auth';

let cachedPokemons = null;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

export const registerUser = async (data) => {
  const response = await fetch(`${AUTH_API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Error al registrar el usuario');
  }
  return response.json();
};

export const loginUser = async (data) => {
  const response = await fetch(`${AUTH_API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Error al iniciar sesión');
  }
  return response.json();
};

export const updateFavoritePokemon = async (pokemonId) => {
  const response = await fetch(`${AUTH_API_URL}/favorite`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ favoritePokemon: pokemonId })
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Error al actualizar pokemon favorito');
  }
  return response.json();
};

export const getPokemons = async () => {
  if (cachedPokemons) return cachedPokemons;
  const response = await fetch(POKEMON_API_URL);
  if (!response.ok) {
    throw new Error('Error al obtener pokémon');
  }
  cachedPokemons = await response.json();
  return cachedPokemons;
};

export const getTournaments = async () => {
  const response = await fetch(API_URL, { headers: getAuthHeaders() });
  if (!response.ok) {
    throw new Error('Error al obtener torneos');
  }
  return response.json();
};

export const getStatistics = async () => {
  const response = await fetch(`${API_URL}/statistics`, { headers: getAuthHeaders() });
  if (!response.ok) {
    throw new Error('Error al obtener estadísticas');
  }
  return response.json();
};

export const getTournamentById = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, { headers: getAuthHeaders() });
  if (!response.ok) {
    throw new Error('Error al obtener el torneo');
  }
  return response.json();
};

export const createTournament = async (tournamentData) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(tournamentData),
  });
  if (!response.ok) {
    throw new Error('Error al crear el torneo');
  }
  return response.json();
};

export const updateTournament = async (id, tournamentData) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(tournamentData),
  });
  if (!response.ok) {
    throw new Error('Error al actualizar el torneo');
  }
  return response.json();
};

export const deleteTournament = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('Error al eliminar el torneo');
  }
  return response.json();
};
