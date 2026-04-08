import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Register from '../Register';
import { vi } from 'vitest';
import * as api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import userEvent from '@testing-library/user-event';

// Mock the API calls
vi.mock('../../services/api', () => ({
  registerUser: vi.fn(),
  getPokemons: vi.fn(() => Promise.resolve([
    { name: 'pikachu', image: 'url/pika.png' },
    { name: 'charmander', image: 'url/char.png' }
  ])),
}));

const mockLogin = vi.fn();

const renderRegister = () => {
  return render(
    <MemoryRouter>
      <AuthContext.Provider value={{ login: mockLogin }}>
        <Register />
      </AuthContext.Provider>
    </MemoryRouter>
  );
};

describe('Register Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders register form properly', async () => {
    renderRegister();
    expect(screen.getByRole('heading', { name: /registro/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^contraseña$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirmar contraseña/i)).toBeInTheDocument();
  });

  it('shows error if passwords do not match (TC-AUTH-03)', async () => {
    const user = userEvent.setup();
    renderRegister();
    
    await user.type(screen.getByLabelText(/correo electrónico/i), 'test@test.com');
    await user.type(screen.getByLabelText(/^contraseña$/i), 'Password123!');
    await user.type(screen.getByLabelText(/confirmar contraseña/i), 'Password321!');
    
    fireEvent.click(screen.getByRole('button', { name: /registrarse/i }));
    
    expect(await screen.findByText(/las contraseñas no coinciden/i)).toBeInTheDocument();
  });

  it('shows error if email is already registered (TC-AUTH-02)', async () => {
    // API throws error
    api.registerUser.mockRejectedValue(new Error('El correo electrónico ya está en uso'));
    
    const user = userEvent.setup();
    renderRegister();
    
    await user.type(screen.getByLabelText(/correo electrónico/i), 'test@pokemon.com');
    await user.type(screen.getByLabelText(/^contraseña$/i), 'Password123!');
    await user.type(screen.getByLabelText(/confirmar contraseña/i), 'Password123!');
    
    // We would also need to select a pokemon, but since custom autocomplete logic 
    // might be complex, let's bypass it by assuming it's required. Wait, if pokemon is required,
    // the submit stops before calling api. Let's select a pokemon.
    const pokemonInput = await screen.findByLabelText(/Tu Pokémon Favorito/i);
    await user.type(pokemonInput, 'pikachu');
    // Assume there is a dropdown item
    // In Material UI autocomplete, hitting ArrowDown then Enter selects the first
    await user.type(pokemonInput, '{ArrowDown}{Enter}');

    fireEvent.click(screen.getByRole('button', { name: /registrarse/i }));
    
    expect(await screen.findByText(/El correo electrónico ya está en uso/i)).toBeInTheDocument();
  });

  it('registers successfully and calls login (TC-AUTH-01)', async () => {
    api.registerUser.mockResolvedValue({ token: '12345', user: { email: 'new@test.com' } });
    
    const user = userEvent.setup();
    renderRegister();
    
    await user.type(screen.getByLabelText(/correo electrónico/i), 'new@test.com');
    await user.type(screen.getByLabelText(/^contraseña$/i), 'Password123!');
    await user.type(screen.getByLabelText(/confirmar contraseña/i), 'Password123!');
    
    const pokemonInput = await screen.findByLabelText(/Tu Pokémon Favorito/i);
    await user.type(pokemonInput, 'pikachu{ArrowDown}{Enter}');

    fireEvent.click(screen.getByRole('button', { name: /registrarse/i }));
    
    await waitFor(() => {
      expect(api.registerUser).toHaveBeenCalled();
      expect(mockLogin).toHaveBeenCalledWith({ token: '12345', user: { email: 'new@test.com' } });
    });
  });
});
