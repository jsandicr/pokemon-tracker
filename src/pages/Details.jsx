import { useState, useEffect } from 'react';

import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Divider, Button,
  AvatarGroup, Avatar, IconButton, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, TextField, Snackbar, Alert, CircularProgress,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { yellow, red } from '@mui/material/colors';
import { ArrowBack, Edit, Add } from '@mui/icons-material';
import { getTournamentById, deleteTournament, getPokemons, updateTournament } from '../services/api';
import PokemonSelect from '../components/PokemonSelect';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { Trash2 } from 'lucide-react';
import ResponsiveIconButton from '../components/ResponsiveButton';

const Details = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { id } = useParams();
  const navigate = useNavigate();

  const [tournament, setTournament] = useState(null);
  useDocumentTitle(tournament ? tournament.name : 'Cargando...');
  const [loading, setLoading] = useState(true);

  const [pokemons, setPokemons] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [newMatch, setNewMatch] = useState({ opp1: '', opp2: '', result: '', notes: '' });
  const [savingMatch, setSavingMatch] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const fetchData = async () => {
    try {
      const [data, fetchedPokemons] = await Promise.all([
        getTournamentById(id),
        getPokemons()
      ]);
      setPokemons(fetchedPokemons);

      const deckNames = data.deckUsed ? data.deckUsed.split('/') : [];
      const deck = deckNames.map(n => fetchedPokemons.find(p => p.name === n.trim()) || { name: n.trim(), image: '' });

      const mappedMatches = (data.matches || []).map(m => {
        const oppNames = m.opponentDeck ? m.opponentDeck.split('/') : [];
        const oppDeck = oppNames.map(n => fetchedPokemons.find(p => p.name === n.trim()) || { name: n.trim(), image: '' });

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
        rawDate: data.date,
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

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleDelete = async () => {
    try {
      await deleteTournament(tournament.id);
      navigate('/');
    } catch (error) {
      console.error('Error deleting tournament:', error);
    }
  };

  const handleSaveMatch = async () => {
    if ((!newMatch.opp1 && !newMatch.opp2) || !newMatch.result) {
      setSnackbar({ open: true, message: 'Selecciona al menos un Pokémon y un resultado', severity: 'error' });
      return;
    }

    setSavingMatch(true);
    try {
      const currentMatchesForApi = tournament.matches.map(m => ({
        opponentDeck: m.opponentDeck.map(p => p.name).filter(Boolean).join('/'),
        result: m.result === 'TIE' ? 'draw' : m.result.toLowerCase(),
        notes: m.notes || ''
      }));

      const opp1Name = pokemons.find(p => p.id === newMatch.opp1)?.name || '';
      const opp2Name = pokemons.find(p => p.id === newMatch.opp2)?.name || '';
      const newMatchForApi = {
        opponentDeck: [opp1Name, opp2Name].filter(Boolean).join('/'),
        result: newMatch.result === 'TIE' ? 'draw' : newMatch.result.toLowerCase(),
        notes: newMatch.notes || ''
      };

      const deckNamesList = tournament.deck.map(p => p.name).filter(Boolean).join('/');

      const updatedData = {
        name: tournament.name,
        date: tournament.rawDate,
        location: tournament.location,
        deckUsed: deckNamesList,
        matches: [...currentMatchesForApi, newMatchForApi]
      };

      await updateTournament(tournament.id, updatedData);
      setSnackbar({ open: true, message: 'Ronda añadida exitosamente', severity: 'success' });
      setModalOpen(false);
      setNewMatch({ opp1: '', opp2: '', result: '', notes: '' });
      fetchData(); // reload
    } catch (error) {
      setSnackbar({ open: true, message: error.message || 'Error al guardar', severity: 'error' });
    } finally {
      setSavingMatch(false);
    }
  };

  const ResultBtn = ({ label, current, onClick }) => (
    <Button
      variant={current === label ? 'contained' : 'outlined'}
      onClick={onClick}
      size="small"
      color={label === 'WIN' ? 'primary' : label === 'LOSS' ? 'error' : 'warning'}
      sx={{ minWidth: { xs: 50, sm: 80 } }}
    >
      {label}
    </Button>
  );

  if (loading) {
    return <Typography textAlign="center" sx={{ mt: 5 }}>Cargando detalles...</Typography>;
  }

  if (!tournament) {
    return <Typography textAlign="center" color="error" sx={{ mt: 5 }}>Torneo no encontrado.</Typography>;
  }

  return (
    <Box sx={{ p: 2, pt: 4, maxWidth: '800px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1, flexWrap: 'nowrap', overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
          <IconButton onClick={() => {
            if (window.history.length > 1) {
              navigate(-1);
            } else {
              navigate('/');
            }
          }}
            sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h5" fontWeight="bold" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Detalle de Torneo
          </Typography>
        </Box>
        <Box flexGrow={1} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
          <ResponsiveIconButton
            icon={<Edit />}
            label="Modificar"
            onClick={() => navigate(`/edit/${tournament.id}`)}
            colorStyles={{
              color: yellow[800],
              borderColor: yellow[800],
              '&:hover': {
                borderColor: yellow[900],
                backgroundColor: yellow[50],
              }
            }}
          />
          <ResponsiveIconButton
            icon={<Trash2 />}
            label="Eliminar"
            onClick={handleDelete}
            colorStyles={{
              color: red[800],
              borderColor: red[800],
              '&:hover': {
                borderColor: red[900],
                backgroundColor: red[50],
              }
            }}
          />
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
          <Box display="flex" gap={2} flexWrap="wrap" justifyContent="flex-start">
            {tournament.deck.map((p, idx) => (
              <Box key={idx} textAlign="center" sx={{ minWidth: '80px' }}>
                <Avatar src={p.image} sx={{ width: 64, height: 64, mb: 1, bgcolor: 'background.default' }} />
                <Typography variant="body2" fontWeight="bold">{p.name}</Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">Historial de Partidas</Typography>
        <Button startIcon={<Add />} variant="outlined" onClick={() => setModalOpen(true)} sx={{ borderRadius: 4 }}>
          Agregar Ronda
        </Button>
      </Box>

      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', mb: 4 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Ronda</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Rival</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Resultado</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tournament.matches.map((match, idx) => {
              let bgColor = 'inherit';
              if (match.result === 'WIN') bgColor = 'rgba(76, 175, 80, 0.15)';
              if (match.result === 'LOSS') bgColor = 'rgba(244, 67, 54, 0.15)';
              if (match.result === 'TIE') bgColor = 'rgba(255, 152, 0, 0.15)';

              return (
                <TableRow key={idx} sx={{ backgroundColor: bgColor }}>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">
                      {idx + 1}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <AvatarGroup max={3} sx={{ justifyContent: 'center' }}>
                      {match.opponentDeck.map((p, pIdx) => (
                        <Avatar key={pIdx} src={p.image} sx={{ width: 32, height: 32, bgcolor: 'background.paper' }} />
                      ))}
                    </AvatarGroup>
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      label={isMobile ? match.result.substring(0, 1) : match.result}
                      color={match.result === 'WIN' ? 'success' : match.result === 'LOSS' ? 'error' : 'warning'}
                      sx={{ fontWeight: 'bold' }}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={modalOpen} onClose={() => !savingMatch && setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight="bold">Agregar Ronda</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <PokemonSelect
                label="Pokémon Rival 1"
                value={newMatch.opp1}
                onChange={(val) => setNewMatch(prev => ({ ...prev, opp1: val }))}
                options={pokemons}
                isMainDeck={false}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <PokemonSelect
                label="Pokémon Rival 2"
                value={newMatch.opp2}
                onChange={(val) => setNewMatch(prev => ({ ...prev, opp2: val }))}
                options={pokemons}
                isMainDeck={false}
              />
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" gap={1} justifyContent="center" mb={2}>
                <ResultBtn label="WIN" current={newMatch.result} onClick={() => setNewMatch(prev => ({ ...prev, result: 'WIN' }))} />
                <ResultBtn label="LOSS" current={newMatch.result} onClick={() => setNewMatch(prev => ({ ...prev, result: 'LOSS' }))} />
                <ResultBtn label="TIE" current={newMatch.result} onClick={() => setNewMatch(prev => ({ ...prev, result: 'TIE' }))} />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                placeholder="Notas (ej. Mala mano, misplay...)"
                value={newMatch.notes}
                onChange={e => setNewMatch(prev => ({ ...prev, notes: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setModalOpen(false)} disabled={savingMatch} color="inherit">Cancelar</Button>
          <Button
            onClick={handleSaveMatch}
            variant="contained"
            disabled={savingMatch}
            startIcon={savingMatch ? <CircularProgress size={20} color="inherit" /> : <Add />}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Details;
