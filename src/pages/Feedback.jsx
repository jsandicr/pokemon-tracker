import { useState } from 'react';
import { Box, Typography, Card, CardContent, TextField, Button, Snackbar, Alert } from '@mui/material';
import { Send } from '@mui/icons-material';
import { submitFeedback } from '../services/api';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const Feedback = () => {
  useDocumentTitle('Feedback');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await submitFeedback('', message);
      setSnackbar({ open: true, message: result.message, severity: 'success' });
      setMessage('');
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      <Box sx={{ p: 3, pt: { xs: 2, md: 4 }, maxWidth: 600, margin: '0 auto', width: '100%' }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
          Tu opinión nos importa
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Queremos mejorar Duel Tracker. Tus ideas, sugerencias y reportes de errores nos ayudan a construir una mejor experiencia para todos los entrenadores.
        </Typography>

        <Card sx={{ borderRadius: 4 }}>
          <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
            <TextField
              fullWidth
              multiline
              rows={5}
              label="Mensaje"
              placeholder="Cuéntanos qué mejorarías, qué error encontraste o qué funcionalidad te gustaría ver..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              sx={{ mb: 3 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading || !message}
                startIcon={<Send />}
              >
                {loading ? 'Enviando...' : 'Enviar feedback'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Feedback;
