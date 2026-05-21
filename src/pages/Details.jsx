import React, { useState, useEffect, useContext } from 'react';

import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Divider, Button,
  AvatarGroup, Avatar, IconButton, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, TextField, Snackbar, Alert, CircularProgress,
  useMediaQuery,
  useTheme,
  Collapse
} from '@mui/material';
import { yellow, red, blue } from '@mui/material/colors';
import { ArrowBack, Edit, Add } from '@mui/icons-material';
import { getTournamentById, deleteTournament, updateTournament } from '../services/api';
import PokemonSelect from '../components/PokemonSelect';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { Save, Trash2 } from 'lucide-react';
import ResponsiveIconButton from '../components/ResponsiveButton';
import { PokemonContext } from '../context/PokemonContext';

const Details = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { pokemons: contextPokemons, loading: contextPokemonsLoading } = useContext(PokemonContext);

  const [tournament, setTournament] = useState(null);
  useDocumentTitle(tournament ? tournament.name : 'Cargando...');
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [newMatch, setNewMatch] = useState({ opp1: '', opp2: '', result: '', notes: '' });
  const [savingMatch, setSavingMatch] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [expandedMatchIndex, setExpandedMatchIndex] = useState(null);
  const [editMatch, setEditMatch] = useState({ opp1: '', opp2: '', result: '', notes: '' });
  const [showDeckList, setShowDeckList] = useState(false);

  const normalizeResult = (result) => {
    if (!result) return '';
    const upper = result.toUpperCase();
    return upper === 'TIE' ? 'draw' : upper.toLowerCase();
  };

  const processTournament = (data, contextPokemonsList) => {
    const isFromHome = !data._id && data.id;

    let deckNames = [];
    let mappedMatches = [];

    if (isFromHome) {
      deckNames = data.deck ? data.deck.map(p => p.name).filter(Boolean) : [];

      mappedMatches = (data.matches || []).map(m => {
        const oppNames = typeof m.opponentDeck === 'string'
          ? m.opponentDeck.split('/').filter(Boolean)
          : [];
        const oppDeck = oppNames.map(n => contextPokemonsList.find(p => p.name === n.trim()) || { name: n.trim(), image: '' });

        return {
          id: m.id,
          opponentDeck: oppDeck,
          result: m.result,
          notes: m.notes
        };
      });
    } else {
      deckNames = data.deckUsed ? data.deckUsed.split('/') : [];
      mappedMatches = (data.matches || []).map(m => {
        const oppNames = m.opponentDeck ? m.opponentDeck.split('/') : [];
        const oppDeck = oppNames.map(n => contextPokemonsList.find(p => p.name === n.trim()) || { name: n.trim(), image: '' });
        return {
          id: m._id,
          opponentDeck: oppDeck,
          result: m.result === 'draw' ? 'TIE' : m.result.toUpperCase(),
          notes: m.notes
        };
      });
    }

    let displayDate = '';
    let storeDate = '';

    if (data.date || data.rawDate) {
      const dateValue = data.rawDate || data.date;
      try {
        const datePart = dateValue.split('T')[0];
        const dateObj = new Date(datePart + 'T12:00:00');
        if (!isNaN(dateObj.getTime())) {
          displayDate = dateObj.toLocaleDateString();
          storeDate = dateObj.toISOString();
        } else {
          displayDate = dateValue;
          storeDate = dateValue;
        }
      } catch {
        displayDate = dateValue;
        storeDate = dateValue;
      }
    } else {
      displayDate = new Date().toLocaleDateString();
      storeDate = new Date().toISOString();
    }

    const deck = deckNames.map(n => contextPokemonsList.find(p => p.name === n.trim()) || { name: n.trim(), image: '' });

    setTournament({
      id: data._id || data.id,
      name: data.name,
      date: displayDate,
      rawDate: storeDate,
      location: data.location,
      deck: deck,
      deckList: data.deckList || '',
      wins: data.wins || data.results?.wins || 0,
      losses: data.losses || data.results?.losses || 0,
      draws: data.draws || data.results?.draws || 0,
      result: data.result || `${data.wins || data.results?.wins || 0}W - ${data.losses || data.results?.losses || 0}L - ${data.draws || data.results?.draws || 0}T`,
      matches: mappedMatches
    });
  };

  const fetchData = async () => {
    try {
      const data = await getTournamentById(id);
      processTournament(data, contextPokemons);
    } catch (error) {
      console.error("Error fetching tournament:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const passedTournament = location.state?.tournament;

    if (passedTournament) {
      const pokemonsToUse = contextPokemons.length > 0 ? contextPokemons : [];
      processTournament(passedTournament, pokemonsToUse);
      setLoading(false);
    } else if (!contextPokemonsLoading && contextPokemons.length > 0) {
      fetchData();
    }
  }, [id, contextPokemonsLoading, contextPokemons.length]);

  useEffect(() => {
    if (!location.state?.tournament && !contextPokemonsLoading && contextPokemons.length > 0 && loading) {
      fetchData();
    }
  }, [contextPokemonsLoading]);

  const getResultColor = (wins, losses) => {
    if (wins > losses) return 'success';
    if (losses > wins) return 'secondary';
    return 'warning';
  };

  const handleDelete = async () => {
    try {
      await deleteTournament(tournament.id);
      navigate('/');
    } catch (error) {
      console.error('Error deleting tournament:', error);
    }
  };

  const handleDeleteMatch = async (indexToRemove) => {
    try {
      const currentMatchesForApi = tournament.matches.map((m, idx) => {
        if (idx === indexToRemove) return null;
        return {
          opponentDeck: m.opponentDeck.map(p => p.name).filter(Boolean).join('/'),
          result: normalizeResult(m.result),
          notes: m.notes || ''
        };
      }).filter(Boolean);

      const deckNamesList = tournament.deck.map(p => p.name).filter(Boolean).join('/');

      const updatedData = {
        name: tournament.name,
        date: tournament.rawDate,
        location: tournament.location,
        deckUsed: deckNamesList,
        deckList: tournament.deckList || '',
        matches: currentMatchesForApi
      };

      await updateTournament(tournament.id, updatedData);
      setSnackbar({ open: true, message: 'Ronda eliminada exitosamente', severity: 'success' });
      setExpandedMatchIndex(null);
      fetchData(); // reload
    } catch (error) {
      setSnackbar({ open: true, message: error.message || 'Error al eliminar la ronda', severity: 'error' });
    }
  };

  const handleUpdateMatch = async (indexToUpdate) => {
    if ((!editMatch.opp1 && !editMatch.opp2) || !editMatch.result) {
      setSnackbar({ open: true, message: 'Selecciona al menos un Pokémon y un resultado', severity: 'error' });
      return;
    }

    const originalMatch = tournament.matches[indexToUpdate];
    const newOpp1Name = contextPokemons.find(p => p.id === editMatch.opp1)?.name || '';
    const newOpp2Name = contextPokemons.find(p => p.id === editMatch.opp2)?.name || '';
    const newResult = normalizeResult(editMatch.result);
    const newNotes = editMatch.notes || '';

    const origOpp1Name = originalMatch.opponentDeck[0]?.name || '';
    const origOpp2Name = originalMatch.opponentDeck[1]?.name || '';
    const origResult = normalizeResult(originalMatch.result);
    const origNotes = originalMatch.notes || '';

    if (newOpp1Name === origOpp1Name &&
        newOpp2Name === origOpp2Name &&
        newResult === origResult &&
        newNotes === origNotes) {
      setExpandedMatchIndex(null);
      return;
    }

    setSavingMatch(true);
    try {
      const currentMatchesForApi = tournament.matches.map((m, idx) => {
        if (idx === indexToUpdate) {
          return {
            opponentDeck: [newOpp1Name, newOpp2Name].filter(Boolean).join('/'),
            result: newResult,
            notes: newNotes
          };
        }
        return {
          opponentDeck: m.opponentDeck.map(p => p.name).filter(Boolean).join('/'),
          result: normalizeResult(m.result),
          notes: m.notes || ''
        };
      });

      const deckNamesList = tournament.deck.map(p => p.name).filter(Boolean).join('/');

      const updatedData = {
        name: tournament.name,
        date: tournament.rawDate,
        location: tournament.location,
        deckUsed: deckNamesList,
        deckList: tournament.deckList || '',
        matches: currentMatchesForApi
      };

      await updateTournament(tournament.id, updatedData);
      setSnackbar({ open: true, message: 'Ronda actualizada exitosamente', severity: 'success' });
      setExpandedMatchIndex(null);
      fetchData(); // reload
    } catch (error) {
      setSnackbar({ open: true, message: error.message || 'Error al actualizar', severity: 'error' });
    } finally {
      setSavingMatch(false);
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
        result: normalizeResult(m.result),
        notes: m.notes || ''
      }));

      const opp1Name = contextPokemons.find(p => p.id === newMatch.opp1)?.name || '';
      const opp2Name = contextPokemons.find(p => p.id === newMatch.opp2)?.name || '';
      const newMatchForApi = {
        opponentDeck: [opp1Name, opp2Name].filter(Boolean).join('/'),
        result: normalizeResult(newMatch.result),
        notes: newMatch.notes || ''
      };

      const deckNamesList = tournament.deck.map(p => p.name).filter(Boolean).join('/');

      const updatedData = {
        name: tournament.name,
        date: tournament.rawDate,
        location: tournament.location,
        deckUsed: deckNamesList,
        deckList: tournament.deckList || '',
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
      color={label === 'WIN' ? 'success' : label === 'LOSS' ? 'error' : 'warning'}
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
    <Box sx={{ p: 2, pt: { sm: 2, lg: 4 }, maxWidth: '800px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1, flexWrap: 'nowrap', overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
          <IconButton onClick={() => navigate('/')} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
        </Box>
        <Box flexGrow={1} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
          <ResponsiveIconButton
            icon={<Edit />}
            label="Modificar"
            onClick={() => navigate(`/edit/${tournament.id}`, { state: { tournament: { ...tournament, originalData: tournament } } })}
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
          <Typography variant="h4" fontWeight={isMobile ? 600 : "bold"} gutterBottom>
            {tournament.name}
          </Typography>

          <Box display="flex" gap={1} mb={2}>
            <Chip label={tournament.date} size="small" variant="outlined" />
            <Chip label={tournament.location} size="small" variant="outlined" />
            <Chip label={tournament.result} size="small" color={getResultColor(tournament.wins, tournament.losses)} sx={{ fontWeight: 'bold' }} />
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box display="flex" gap={2} flexWrap="wrap" justifyContent="flex-start">
            {tournament.deck.map((p, idx) => (
              <Box key={idx} textAlign="center" sx={{ minWidth: '80px' }}>
                <Avatar src={p.image} sx={{ mx: 'auto', width: 50, height: 50, mb: 1, bgcolor: 'background.default' }} />
                <Typography variant="body2" fontWeight="bold" fontSize={13} sx={{ whiteSpace: 'pre-line' }}>
                  {p.name.replace(' ', '\n')}
                </Typography>
              </Box>
            ))}
          </Box>

          {tournament.deckList && (
            <Box sx={{ mt: 3 }}>
              <Button
                size="small"
                variant="text"
                onClick={() => setShowDeckList(!showDeckList)}
                sx={{ textTransform: 'none', fontWeight: 'bold', mb: 1 }}
              >
                {showDeckList ? 'Ocultar lista' : 'Ver lista'}
              </Button>
              <Collapse in={showDeckList}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    maxHeight: 250,
                    overflow: 'auto',
                    borderRadius: 2,
                    bgcolor: 'grey.50',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    lineHeight: 1.6
                  }}
                >
                  {tournament.deckList}
                </Paper>
              </Collapse>
            </Box>
          )}
        </CardContent>
      </Card>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" fontWeight={700}>Historial</Typography>
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

              const resultColors = {
                WIN: 'rgba(76, 175, 80, 0.15)',
                LOSS: 'rgba(244, 67, 54, 0.15)',
                TIE: 'rgba(255, 152, 0, 0.15)'
              };

              const isExpanded = expandedMatchIndex === idx;

              const bgColor = isExpanded
                ? '#fff'
                : resultColors[match.result] || 'inherit';


              const handleRowClick = () => {
                if (isExpanded) {
                  setExpandedMatchIndex(null);
                } else {
                  setExpandedMatchIndex(idx);
                  const opp1 = match.opponentDeck[0];
                  const opp2 = match.opponentDeck[1];
                  setEditMatch({
                    opp1: (opp1 && opp1.id) || (opp1 && contextPokemons.find(p => p.name === opp1?.name)?.id) || '',
                    opp2: (opp2 && opp2.id) || (opp2 && contextPokemons.find(p => p.name === opp2?.name)?.id) || '',
                    result: match.result || '',
                    notes: match.notes || ''
                  });
                }
              };

              return (
                <React.Fragment key={idx}>
                  <TableRow
                    onClick={handleRowClick}
                    sx={{ backgroundColor: bgColor, cursor: 'pointer', transition: 'background-color 0.2s, filter 0.2s', '&:hover': { filter: 'brightness(0.95)' } }}
                  >
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
                  <TableRow sx={{ backgroundColor: bgColor }}>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0, border: 0 }} colSpan={3}>
                      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1, p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <PokemonSelect
                                label="Pokémon Rival 1"
                                value={editMatch.opp1}
                                onChange={(val) => setEditMatch(prev => ({ ...prev, opp1: val }))}
                                options={contextPokemons}
                                isMainDeck={false}
                              />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <PokemonSelect
                                label="Pokémon Rival 2"
                                value={editMatch.opp2}
                                onChange={(val) => setEditMatch(prev => ({ ...prev, opp2: val }))}
                                options={contextPokemons}
                                isMainDeck={false}
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <Box display="flex" gap={1} mb={2}>
                                <ResultBtn label="WIN" current={editMatch.result} onClick={() => setEditMatch(prev => ({ ...prev, result: 'WIN' }))} />
                                <ResultBtn label="LOSS" current={editMatch.result} onClick={() => setEditMatch(prev => ({ ...prev, result: 'LOSS' }))} />
                                <ResultBtn label="TIE" current={editMatch.result} onClick={() => setEditMatch(prev => ({ ...prev, result: 'TIE' }))} />
                              </Box>

                              <TextField
                                style={{ margin: '5px 0' }}
                                fullWidth
                                size="small"
                                placeholder="Notas (ej. Mala mano, misplay...)"
                                value={editMatch.notes}
                                onChange={e => setEditMatch(prev => ({ ...prev, notes: e.target.value }))}
                              />
                            </Grid>
                          </Grid>
                          <Box display="flex" gap={1.5} mt={1}>
                            <ResponsiveIconButton
                              icon={<Save size={18} />}
                              label="Guardar"
                              onClick={(e) => { e.stopPropagation(); handleUpdateMatch(idx); }}
                              colorStyles={{
                                color: blue[800],
                                borderColor: blue[800],
                                '&:hover': {
                                  borderColor: blue[900],
                                  backgroundColor: blue[50],
                                }
                              }}
                            />
                            <ResponsiveIconButton
                              icon={<Trash2 size={18} />}
                              label="Eliminar"
                              onClick={(e) => { e.stopPropagation(); handleDeleteMatch(idx); }}
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
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
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
                options={contextPokemons}
                isMainDeck={false}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <PokemonSelect
                label="Pokémon Rival 2"
                value={newMatch.opp2}
                onChange={(val) => setNewMatch(prev => ({ ...prev, opp2: val }))}
                options={contextPokemons}
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
          <ResponsiveIconButton
            icon={<Save />}
            label="Guardar"
            onClick={handleSaveMatch}
            disabled={savingMatch}
            colorStyles={{
              color: blue[800],
              borderColor: blue[800],
              '&:hover': {
                borderColor: blue[900],
                backgroundColor: blue[50],
              }
            }}
          />
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
