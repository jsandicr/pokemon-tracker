import { useState } from 'react';
import { Box, Typography, TextField, Button, Card, CardContent, Snackbar, Alert } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { requestResetPassword } from '../services/api';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const ForgotPassword = () => {
  const navigate = useNavigate();
  useDocumentTitle('Recuperar Contraseña');

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await requestResetPassword(email);
      navigate('/reset-password', { state: { email } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', p: 2 }}>
      <Card sx={{ maxWidth: 400, width: '100%', borderRadius: 4, p: 2, boxShadow: '0 8px 32px 0 rgba(0,0,0,0.2)' }}>
        <CardContent>
          <Typography variant="h4" fontWeight="bold" textAlign="center" gutterBottom>
            Recuperar Contraseña
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
            Ingresa tu correo electrónico para recibir un código de verificación
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

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3, mb: 2, borderRadius: 8, py: 1.5 }}
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Enviar Código'}
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

export default ForgotPassword;