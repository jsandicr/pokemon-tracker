import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../Login';
import { vi } from 'vitest';
import * as api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import userEvent from '@testing-library/user-event';

vi.mock('../../services/api', () => ({
  loginUser: vi.fn(),
}));

const mockLogin = vi.fn();

const renderLogin = () => {
  return render(
    <MemoryRouter>
      <AuthContext.Provider value={{ login: mockLogin }}>
        <Login />
      </AuthContext.Provider>
    </MemoryRouter>
  );
};

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form properly', () => {
    renderLogin();
    expect(screen.getByRole('heading', { name: /iniciar sesión/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('shows error msg with invalid credentials', async () => {
    api.loginUser.mockRejectedValue(new Error('Credenciales inválidas'));
    
    const user = userEvent.setup();
    renderLogin();
    
    await user.type(screen.getByLabelText(/correo electrónico/i), 'wrong@test.com');
    await user.type(screen.getByLabelText(/contraseña/i), 'badpass');
    
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));
    
    expect(await screen.findByText(/credenciales inválidas/i)).toBeInTheDocument();
  });

  it('calls login on success (TC-AUTH-04)', async () => {
    api.loginUser.mockResolvedValue({ token: 'loginToken', user: { email: 'correct@test.com' } });
    
    const user = userEvent.setup();
    renderLogin();
    
    await user.type(screen.getByLabelText(/correo electrónico/i), 'correct@test.com');
    await user.type(screen.getByLabelText(/contraseña/i), 'goodpass!');
    
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));
    
    await waitFor(() => {
      expect(api.loginUser).toHaveBeenCalledWith({ email: 'correct@test.com', password: 'goodpass!' });
      expect(mockLogin).toHaveBeenCalledWith({ token: 'loginToken', user: { email: 'correct@test.com' } });
    });
  });
});
