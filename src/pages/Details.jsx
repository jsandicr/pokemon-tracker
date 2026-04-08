import { useState, useEffect } from 'react';

import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Divider, Button,
  AvatarGroup, Avatar, IconButton, Chip
} from '@mui/material';
import { ArrowBack, Edit } from '@mui/icons-material';
import { getTournamentById, deleteTournament, getPokemons } from '../services/api';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const Details = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [tournament, setTournament] = useState(null);
  useDocumentTitle(tournament ? tournament.name : 'Cargando...');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTournamentAndPokemons = async () => {
      try {
        const [data, pokemonList] = await Promise.all([
          getTournamentById(id),
          getPokemons()
        ]);

        const deckNames = data.deckUsed ? data.deckUsed.split('/') : [];
        const deck = deckNames.map(n => pokemonList.find(p => p.name === n.trim()) || { name: n.trim(), image: '' });

        const mappedMatches = (data.matches || []).map(m => {
          const oppNames = m.opponentDeck ? m.opponentDeck.split('/') : [];
          const oppDeck = oppNames.map(n => pokemonList.find(p => p.name === n.trim()) || { name: n.trim(), image: '' });

          return {
            id: m._id,
            opponentDeck: oppDeck,
            result: m.result === 'draw' ? 'TIE' : m.result.toUpperCase(),
            notes: m.notes
          };
        });

        setTournament({
          id: data._id,
          name: data.name,
          date: new Date(data.date).toLocaleDateString(),
          location: data.location,
          deck: deck,
          result: `${data.results?.wins || 0}W - ${data.results?.losses || 0}L - ${data.results?.draws || 0}T`,
          matches: mappedMatches
        });
      } catch (error) {
        console.error("Error fetching tournament:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTournamentAndPokemons();
  }, [id]);

  const handleDelete = async () => {
    try {
      await deleteTournament(tournament.id);
      navigate('/');
    } catch (error) {
      console.error('Error deleting tournament:', error);
    }
  };

  if (loading) {
    return <Typography textAlign="center" sx={{ mt: 5 }}>Cargando detalles...</Typography>;
  }

  if (!tournament) {
    return <Typography textAlign="center" color="error" sx={{ mt: 5 }}>Torneo no encontrado.</Typography>;
  }

  return (
    <Box sx={{ p: 3, pt: 4, maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h5" fontWeight="bold">
            Detalle de Torneo
          </Typography>
        </Box>
        <Box flexGrow={1} />
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button variant="outlined" startIcon={<Edit />} color="secondary" onClick={() => navigate(`/edit/${tournament.id}`)}>
            Modificar
          </Button>
          <Button variant="outlined" color="error" onClick={handleDelete} sx={{ ml: 2 }}>
            Eliminar
          </Button>
        </Box>
      </Box>


      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 8px 32px 0 rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ position: 'relative' }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {tournament.name}
          </Typography>

          <Box display="flex" gap={1} mb={2}>
            <Chip label={tournament.date} size="small" variant="outlined" />
            <Chip label={tournament.location} size="small" variant="outlined" />
            <Chip label={tournament.result} size="small" color="primary" sx={{ fontWeight: 'bold' }} />
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" fontWeight="bold" mb={2}>Mi Deck</Typography>
          <Box display="flex" gap={3}>
            {tournament.deck.map((p, idx) => (
              <Box key={idx} textAlign="center">
                <Avatar src={p.image} sx={{ width: 80, height: 80, mb: 1, bgcolor: 'background.default' }} />
                <Typography variant="body2" fontWeight="bold">{p.name}</Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      <Typography variant="h5" fontWeight="bold" mb={3}>Historial de Partidas</Typography>

      {tournament.matches.map((match, idx) => (
        <Card key={idx} variant="outlined" sx={{ mb: 2, borderRadius: 2 }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>Ronda {idx + 1}</Typography>
              <Typography variant="body2">{match.notes || 'Sin notas'}</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={3}>
              <Box display="flex" flexDirection="column" alignItems="center">
                <Typography variant="caption" color="text.secondary" mb={0.5}>Rival</Typography>
                <AvatarGroup max={2}>
                  {match.opponentDeck.map((p, pIdx) => (
                    <Avatar key={pIdx} src={p.image} sx={{ width: 32, height: 32, bgcolor: 'transparent' }} />
                  ))}
                </AvatarGroup>
              </Box>
              <Chip
                label={match.result}
                color={match.result === 'WIN' ? 'primary' : match.result === 'LOSS' ? 'error' : 'warning'}
                sx={{ fontWeight: 'bold' }}
              />
            </Box>
          </CardContent>
        </Card>
      ))}

    </Box>
  );
};

export default Details;
