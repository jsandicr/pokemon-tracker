import { useState, useEffect, useContext } from 'react';
import { Box, Typography, TextField, Button, Card, CardContent, Snackbar, Alert, InputAdornment, IconButton } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, getPokemons } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import PokemonSelect from '../components/PokemonSelect';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  useDocumentTitle('Registro');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [favoritePokemon, setFavoritePokemon] = useState('');
  const [pokemonList, setPokemonList] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getPokemons().then(setPokemonList).catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Las contraseñas no coinciden');
    }
    if (!favoritePokemon) {
      return setError('Debes elegir a tu Pokémon favorito');
    }

    try {
      const data = await registerUser({ email, password, confirmPassword, favoritePokemon });
      login(data);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', p: 2 }}>
      <Card sx={{ maxWidth: 400, width: '100%', borderRadius: 4, p: 2, boxShadow: '0 8px 32px 0 rgba(0,0,0,0.2)' }}>
        <CardContent>
          <Typography variant="h4" fontWeight="bold" textAlign="center" gutterBottom>
            Registro
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
            Crea tu cuenta para guardar tus torneos
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Correo Electrónico"
              type="email"
              variant="outlined"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Contraseña"
              type={showPassword ? "text" : "password"}
              variant="outlined"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              helperText="Mín. 8 caracteres, 1 mayúscula, 1 minúscula/letra y 1 número"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      <img
                        src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/201.png"
                        alt="Toggle Password"
                        style={{ width: 24, height: 24, filter: showPassword ? 'drop-shadow(0 0 2px rgba(0,0,0,0.5))' : 'grayscale(100%) opacity(0.4)' }}
                      />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <TextField
              fullWidth
              label="Confirmar Contraseña"
              type={showConfirmPassword ? "text" : "password"}
              variant="outlined"
              margin="normal"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      <img
                        src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/201.png"
                        alt="Toggle Password"
                        style={{ width: 24, height: 24, filter: showConfirmPassword ? 'drop-shadow(0 0 2px rgba(0,0,0,0.5))' : 'grayscale(100%) opacity(0.4)' }}
                      />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <Box sx={{ mt: 2, mb: 1 }}>
              <PokemonSelect
                label="Tu Pokémon Favorito"
                value={favoritePokemon}
                onChange={setFavoritePokemon}
                options={pokemonList}
                isMainDeck={true}
              />
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              color="secondary"
              sx={{ mt: 3, mb: 2, borderRadius: 8, py: 1.5 }}
            >
              Registrarse
            </Button>
          </form>

          <Typography textAlign="center" variant="body2" mt={2}>
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" style={{ color: '#ffcb05', textDecoration: 'none', fontWeight: 'bold' }}>
              Inicia sesión aquí
            </Link>
          </Typography>
        </CardContent>
      </Card>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }} variant="filled">
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Register;
