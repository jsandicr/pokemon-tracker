const API_URL = import.meta.env.VITE_API_URL + '/tournaments';
const POKEMON_API_URL = import.meta.env.VITE_API_URL + '/pokemon';
const AUTH_API_URL = import.meta.env.VITE_API_URL + '/auth';
const FEEDBACK_API_URL = import.meta.env.VITE_API_URL + '/feedback';

let cachedPokemons = null;

const handleSessionExpired = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  window.dispatchEvent(new CustomEvent('auth:logout'));
};

const request = async (url, options = {}) => {
  const response = await fetch(url, options);
  if (response.status === 401) {
    handleSessionExpired();
    throw new Error('Sesión expirada');
  }
  return response;
};

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

export const verifyCode = async (data) => {
  const response = await fetch(`${AUTH_API_URL}/verify`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.message || 'Error al verificar el código');
  }

  return json;
};

export const resendCode = async (data) => {
  const response = await fetch(`${AUTH_API_URL}/resend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.message || 'Error al reenviar el código');
  }

  return json;
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

export const requestResetPassword = async (email) => {
  const response = await fetch(`${AUTH_API_URL}/request-reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Error al solicitar recuperación');
  }
  return response.json();
};

export const resetPassword = async (data) => {
  const response = await fetch(`${AUTH_API_URL}/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Error al restablecer contraseña');
  }
  return response.json();
};

export const updateFavoritePokemon = async (pokemonId) => {
  const response = await request(`${AUTH_API_URL}/favorite`, {
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
  const data = await response.json();
  const sapo = {
    id: 'sapo',
    name: 'Rogue Deck (Sapo)',
    image: 'https://play.pokemonshowdown.com/sprites/gen5/substitute.png'
  };
  cachedPokemons = [sapo, ...data];
  return cachedPokemons;
};

export const getTournaments = async () => {
  const response = await request(API_URL, { headers: getAuthHeaders() });
  if (!response.ok) {
    throw new Error('Error al obtener torneos');
  }
  return response.json();
};

export const getStatistics = async () => {
  const response = await request(`${API_URL}/statistics`, { headers: getAuthHeaders() });
  if (!response.ok) {
    throw new Error('Error al obtener estadísticas');
  }
  return response.json();
};

export const getTournamentById = async (id) => {
  const response = await request(`${API_URL}/${id}`, { headers: getAuthHeaders() });
  if (!response.ok) {
    throw new Error('Error al obtener el torneo');
  }
  return response.json();
};

export const createTournament = async (tournamentData) => {
  const response = await request(API_URL, {
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
  const response = await request(`${API_URL}/${id}`, {
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
  const response = await request(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('Error al eliminar el torneo');
  }
  return response.json();
};

export const submitFeedback = async (email, message) => {
  const response = await fetch(FEEDBACK_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, message })
  });
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('Error al conectar con el servidor');
  }
  if (!response.ok) {
    throw new Error(data?.message || 'Error al enviar feedback');
  }
  return data;
};
