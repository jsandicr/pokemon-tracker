import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import CreateTournament from '../components/CreateTournament';
import { getTournamentById, updateTournament } from '../services/api';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function EditTournament() {
  const { id } = useParams();
  const navigate = useNavigate();
  useDocumentTitle('Editar Torneo');

  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const data = await getTournamentById(id);

        const dateStr = data.date ? new Date(data.date).toISOString().split('T')[0] : '';

        setInitialData({
          name: data.name,
          date: dateStr,
          location: data.location,
          deckUsed: data.deckUsed,
          matches: data.matches
        });
      } catch (error) {
        console.error("Error fetching tournament:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTournament();
  }, [id]);

  const handleSave = async (updatedData) => {
    try {
      await updateTournament(id, updatedData);
      navigate(-1); // Go back to where we were (details screen or home)
    } catch (error) {
      console.error('Error updating tournament:', error);
      throw error; // Let CreateTournament handle displaying the error snackbar
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <Typography>Cargando información del torneo...</Typography>
      </Box>
    );
  }

  if (!initialData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <Typography color="error">Torneo no encontrado.</Typography>
      </Box>
    );
  }

  return <CreateTournament initialTournament={initialData} onSave={handleSave} />;
}
