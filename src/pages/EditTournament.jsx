import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import CreateTournament from '../components/CreateTournament';
import { getTournamentById, updateTournament } from '../services/api';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function EditTournament() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  useDocumentTitle('Editar Torneo');

  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);

const processData = (data) => {
    let dateStr = '';
    
    if (data.date || data.rawDate) {
      const dateValue = data.rawDate || data.date;
      try {
        const dateObj = new Date(dateValue);
        if (!isNaN(dateObj.getTime())) {
          dateStr = dateObj.toISOString().split('T')[0];
        } else {
          dateStr = '';
        }
      } catch {
        dateStr = '';
      }
    }
    
    const deckUsed = Array.isArray(data.deck)
      ? data.deck.map(p => p.name).filter(Boolean).join('/')
      : data.deckUsed || '';
    
    return {
      name: data.name,
      date: dateStr,
      location: data.location,
      deckUsed: deckUsed,
      deckList: data.deckList || '',
      matches: data.matches
    };
  };

  useEffect(() => {
    const passedTournament = location.state?.tournament;
    
    if (passedTournament) {
      setInitialData(processData(passedTournament));
      setLoading(false);
    } else {
      const fetchTournament = async () => {
        try {
          const data = await getTournamentById(id);
          setInitialData(processData(data));
        } catch (error) {
          console.error("Error fetching tournament:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchTournament();
    }
  }, [id]);

  const handleSave = async (updatedData, isUnchanged = false) => {
    try {
      if (!isUnchanged) {
        await updateTournament(id, updatedData);
      }
      
      const updatedTournament = {
        ...initialData,
        ...updatedData,
        id: id,
        _id: id,
        date: updatedData.date || initialData.date,
        deckUsed: updatedData.deckUsed,
        deckList: updatedData.deckList || '',
        matches: updatedData.matches,
        results: {
          wins: updatedData.matches?.filter(m => m.result === 'win').length || 0,
          losses: updatedData.matches?.filter(m => m.result === 'loss').length || 0,
          draws: updatedData.matches?.filter(m => m.result === 'draw').length || 0
        }
      };
      
      navigate(`/details/${id}`, { state: { tournament: updatedTournament } });
    } catch (error) {
      console.error('Error updating tournament:', error);
      throw error;
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
