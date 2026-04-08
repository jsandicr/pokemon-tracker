import { useState, useContext } from 'react';
import { Box, Typography, TextField, Button, Card, CardContent, Snackbar, Alert, InputAdornment, IconButton } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  useDocumentTitle('Iniciar Sesión');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await loginUser({ email, password });
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
            Iniciar Sesión
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" mb={4}>
            Bienvenido de vuelta, entrenador
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
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3, mb: 2, borderRadius: 8, py: 1.5 }}
            >
              Entrar
            </Button>
          </form>

          <Typography textAlign="center" variant="body2" mt={2}>
            ¿No tienes cuenta?{' '}
            <Link to="/register" style={{ color: '#ffcb05', textDecoration: 'none', fontWeight: 'bold' }}>
              Regístrate aquí
            </Link>
          </Typography>
        </CardContent>
      </Card>

      <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }} variant="filled">
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Login;
