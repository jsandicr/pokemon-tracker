import { useState, useContext } from 'react';
import { Box, Typography, TextField, Button, Card, CardContent, Snackbar, Alert, InputAdornment, IconButton } from '@mui/material';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { resetPassword } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const ResetPassword = () => {
  const { state } = useLocation();
  const email = state?.email;

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  useDocumentTitle('Restablecer Contraseña');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await resetPassword({ email, code, newPassword, confirmPassword });
      login(data);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', p: 2 }}>
        <Card sx={{ maxWidth: 400, width: '100%', borderRadius: 4, p: 2 }}>
          <CardContent>
            <Typography variant="h6" textAlign="center" gutterBottom>
              Acceso no válido
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
              Por favor, inicia el proceso de recuperación desde el login
            </Typography>
            <Button fullWidth variant="contained" component={Link} to="/forgot-password">
              Ir a Recuperar Contraseña
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', p: 2 }}>
      <Card sx={{ maxWidth: 400, width: '100%', borderRadius: 4, p: 2, boxShadow: '0 8px 32px 0 rgba(0,0,0,0.2)' }}>
        <CardContent>
          <Typography variant="h4" fontWeight="bold" textAlign="center" gutterBottom>
            Nueva Contraseña
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
            Ingresa tu nueva contraseña y el código enviado a {email}
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Código de Verificación"
              type="text"
              variant="outlined"
              margin="normal"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              inputProps={{ maxLength: 6 }}
              placeholder="Ej: 123456"
            />

            <TextField
              fullWidth
              label="Nueva Contraseña"
              type={showNewPassword ? "text" : "password"}
              variant="outlined"
              margin="normal"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              helperText="Mín. 8 caracteres, 1 mayúscula, 1 minúscula/letra y 1 número"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end">
                      <img
                        src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/201.png"
                        alt="Toggle Password"
                        style={{ width: 24, height: 24, filter: showNewPassword ? 'drop-shadow(0 0 2px rgba(0,0,0,0.5))' : 'grayscale(100%) opacity(0.4)' }}
                      />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <TextField
              fullWidth
              label="Confirmar Nueva Contraseña"
              type={showConfirmPassword ? "text" : "password"}
              variant="outlined"
              margin="normal"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
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

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3, mb: 2, borderRadius: 8, py: 1.5 }}
              disabled={loading}
            >
              {loading ? 'Restableciendo...' : 'Cambiar Contraseña'}
            </Button>
          </form>

          <Typography textAlign="center" variant="body2" mt={2}>
            ¿Recordaste tu contraseña?{' '}
            <Link to="/login" style={{ color: '#ffcb05', textDecoration: 'none', fontWeight: 'bold' }}>
              Inicia sesión aquí
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

export default ResetPassword;