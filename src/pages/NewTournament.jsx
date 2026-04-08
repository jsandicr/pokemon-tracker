import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Snackbar, Alert } from '@mui/material';
import { createTournament, getTournamentById, updateTournament } from '../services/api';
import CreateTournament from '../components/CreateTournament';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const NewTournament = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const editId = queryParams.get('id');
  useDocumentTitle('Nuevo Torneo');

  const [initialTournament, setInitialTournament] = useState(null);
  const [loading, setLoading] = useState(!!editId);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });

  // Fetch tournament data when editing
  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const data = await getTournamentById(editId);
        // Convert API shape to the format expected by CreateTournament
        const deckNames = data.deckUsed ? data.deckUsed.split('/') : [];
        const deck = deckNames.map(name => name.trim()); // keep names, CreateTournament will map to IDs
        const formattedMatches = (data.matches || []).map(m => ({
          opp1: m.opponentDeck?.split('/')?.[0]?.trim() || '',
          opp2: m.opponentDeck?.split('/')?.[1]?.trim() || '',
          result: m.result === 'draw' ? 'TIE' : m.result.toUpperCase(),
          notes: m.notes || ''
        }));
        setInitialTournament({
          name: data.name || '',
          date: data.date ? data.date.split('T')[0] : '', // ISO date to yyyy-mm-dd
          location: data.location || '',
          deckUsed: deck.join('/'),
          matches: formattedMatches
        });
      } catch (error) {
        setSnackbar({ open: true, message: error.message || 'Error al cargar torneo', severity: 'error' });
      } finally {
        setLoading(false);
      }
    };
    if (editId) fetchTournament();
  }, [editId]);

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  const onSave = async (tournamentData) => {
    try {
      if (editId) {
        await updateTournament(editId, tournamentData);
        setSnackbar({ open: true, message: 'Torneo actualizado exitosamente', severity: 'success' });
      } else {
        await createTournament(tournamentData);
        setSnackbar({ open: true, message: 'Torneo creado exitosamente', severity: 'success' });
      }
      setTimeout(() => navigate('/'), 1200);
    } catch (error) {
      setSnackbar({ open: true, message: error.message || 'Error al guardar', severity: 'error' });
    }
  };

  if (loading) {
    return <Box sx={{ mt: 5, textAlign: 'center' }}>Cargando...</Box>;
  }

  return (
    <>
      <CreateTournament initialTournament={initialTournament} onSave={onSave} />
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default NewTournament;
