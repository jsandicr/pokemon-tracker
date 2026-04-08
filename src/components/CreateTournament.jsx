import { useState, useEffect } from 'react';
import { getPokemons } from '../services/api';
import {
  Box, Typography, TextField, Button, Card,
  CardContent, Divider, IconButton, Grid,
  useTheme, Paper, Snackbar, Alert
} from '@mui/material';
import { Save, Add, Delete } from '@mui/icons-material';

import PokemonSelect from './PokemonSelect';

export default function CreateTournament({ initialTournament = null, onSave }) {
  // State variables
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [deck, setDeck] = useState(['', '']); // stores Pokemon IDs
  const [matches, setMatches] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });
  const [pokemonList, setPokemonList] = useState([]);

  useEffect(() => {
    getPokemons().then(setPokemonList).catch(console.error);
  }, []);

  // Populate state when editing an existing tournament
  useEffect(() => {
    if (initialTournament && pokemonList.length > 0) {
      setName(initialTournament.name || '');
      setDate(initialTournament.date || '');
      setLocation(initialTournament.location || '');
      // deckUsed is stored as "Name1/Name2"; we need to convert back to IDs using list
      const deckNames = (initialTournament.deckUsed || '').split('/');
      const deckIds = deckNames.map(n => pokemonList.find(p => p.name === n)?.id || '');
      setDeck(deckIds);
      // matches from API use opponentDeck as "Name1/Name2" and result as "win"/"loss"/"draw"
      const formattedMatches = (initialTournament.matches || []).map(m => {
        const oppNames = (m.opponentDeck || '').split('/');
        const oppIds = oppNames.map(n => pokemonList.find(p => p.name === n)?.id || '');
        return {
          opp1: oppIds[0] || '',
          opp2: oppIds[1] || '',
          result: m.result === 'draw' ? 'TIE' : m.result.toUpperCase(),
          notes: m.notes || ''
        };
      });
      setMatches(formattedMatches);
    }
  }, [initialTournament, pokemonList]);

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  const addMatch = () => {
    if (matches.length > 0) {
      const last = matches[matches.length - 1];
      if (!last.opp1 || !last.opp2 || !last.result) {
        setSnackbar({ open: true, message: 'Completa la ronda actual antes de añadir otra.', severity: 'warning' });
        return;
      }
    }
    setMatches([...matches, { opp1: '', opp2: '', result: '', notes: '' }]);
  };

  const updateMatch = (index, field, value) => {
    const newMatches = [...matches];
    newMatches[index][field] = value;
    setMatches(newMatches);
  };

  const removeMatch = (index) => {
    const newMatches = [...matches];
    newMatches.splice(index, 1);
    setMatches(newMatches);
  };

  const handleSave = async () => {
    // Basic validation
    if (!name || !date || !location) {
      setSnackbar({ open: true, message: 'Completa los datos generales del torneo.', severity: 'error' });
      return;
    }
    if (!deck[0] || !deck[1]) {
      setSnackbar({ open: true, message: 'Selecciona los dos Pokémon de tu deck.', severity: 'error' });
      return;
    }
    if (matches.some(m => !m.opp1 || !m.opp2 || !m.result)) {
      setSnackbar({ open: true, message: 'Hay rondas con datos incompletos.', severity: 'error' });
      return;
    }

    const deck1Name = pokemonList.find(p => p.id === deck[0])?.name || '';
    const deck2Name = pokemonList.find(p => p.id === deck[1])?.name || '';
    const deckUsed = `${deck1Name}/${deck2Name}`;

    const formattedMatches = matches.map(m => {
      const opp1Name = pokemonList.find(p => p.id === m.opp1)?.name || '';
      const opp2Name = pokemonList.find(p => p.id === m.opp2)?.name || '';
      return {
        opponentDeck: `${opp1Name}/${opp2Name}`,
        result: m.result === 'TIE' ? 'draw' : m.result.toLowerCase(),
        notes: m.notes
      };
    });

    try {
      await onSave({ name, date, location, deckUsed, matches: formattedMatches });
      setSnackbar({ open: true, message: 'Torneo guardado exitosamente', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: error.message || 'Error al guardar el torneo', severity: 'error' });
    }
  };



  // Result button component
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

  const handleResultChange = (index, value) => {
    updateMatch(index, 'result', value);
  };

  return (
    <Box sx={{ p: 3, pt: 4, maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">
          {initialTournament ? 'Modificar Torneo' : 'Nuevo Torneo'}
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<Save />}
          onClick={handleSave}
          sx={{ borderRadius: 8, px: 3 }}
        >
          Guardar
        </Button>
      </Box>

      <Card sx={{ mb: 4, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">Información General</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField fullWidth label="Nombre del Torneo" value={name} onChange={e => setName(e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Fecha" type="date" InputLabelProps={{ shrink: true }} value={date} onChange={e => setDate(e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Lugar del Torneo" value={location} onChange={e => setLocation(e.target.value)} />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom fontWeight="bold">Mi Deck (2 Pokémon)</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <PokemonSelect
                label="Principal"
                value={deck[0]}
                onChange={(val) => setDeck([val, deck[1]])}
                options={pokemonList}
                isMainDeck={true}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <PokemonSelect
                label="Secundario"
                value={deck[1]}
                onChange={(val) => setDeck([deck[0], val])}
                options={pokemonList}
                isMainDeck={true}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight="bold">Enfrentamientos</Typography>
        <Button startIcon={<Add />} variant="outlined" onClick={addMatch} sx={{ borderRadius: 4 }}>
          Añadir Ronda
        </Button>
      </Box>

      {matches.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderStyle: 'dashed', borderRadius: 2 }}>
          <Typography color="text.secondary">Aún no hay enfrentamientos registrados. Añade una ronda para comenzar.</Typography>
        </Paper>
      ) : (
        matches.map((match, index) => (
          <Card key={index} variant="outlined" sx={{ mb: 2, borderRadius: 2 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="subtitle1" fontWeight="bold" color="text.secondary">Ronda {index + 1}</Typography>
                <IconButton color="error" size="small" onClick={() => removeMatch(index)}>
                  <Delete fontSize="small" />
                </IconButton>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <PokemonSelect
                    label="Pokémon 1"
                    value={match.opp1}
                    onChange={(val) => updateMatch(index, 'opp1', val)}
                    options={pokemonList}
                    isMainDeck={false}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <PokemonSelect
                    label="Pokémon 2"
                    value={match.opp2}
                    onChange={(val) => updateMatch(index, 'opp2', val)}
                    options={pokemonList}
                    isMainDeck={false}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box display="flex" gap={1} justifyContent="center" height="100%">
                    <ResultBtn label="WIN" current={match.result} onClick={() => handleResultChange(index, 'WIN')} />
                    <ResultBtn label="LOSS" current={match.result} onClick={() => handleResultChange(index, 'LOSS')} />
                    <ResultBtn label="TIE" current={match.result} onClick={() => handleResultChange(index, 'TIE')} />
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth size="small" placeholder="Notas (ej. Mala mano)" value={match.notes} onChange={e => updateMatch(index, 'notes', e.target.value)} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))
      )}

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}