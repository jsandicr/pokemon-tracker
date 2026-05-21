import { useState, useEffect, useContext } from 'react';
import {
  Box, Typography, Card, CardContent, Avatar,
  AvatarGroup, styled, useTheme, Chip,
  useMediaQuery
} from '@mui/material';
import { getTournaments } from '../services/api';
import { Add, Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import ResponsiveIconButton from '../components/ResponsiveButton';
import { blue } from '@mui/material/colors';
import { PokemonContext } from '../context/PokemonContext';

const PremiumCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  padding: theme.spacing(1),
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'visible',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 12px 24px -10px ${theme.palette.primary.main}`,
    borderColor: theme.palette.primary.main,
  },
}));

const Home = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { pokemons: contextPokemons, loading: pokemonsLoading } = useContext(PokemonContext);
  useDocumentTitle('Home');

  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pokemonsLoading) return;

    const fetchTournaments = async () => {
      try {
        const data = await getTournaments();
        const mappedData = data.map(t => {
          const names = t.deckUsed ? t.deckUsed.split('/') : [];
          const matchedPokemon = names.map(n => contextPokemons.find(p => p.name === n.trim()) || { name: n.trim(), image: '' });

          const mappedMatches = (t.matches || []).map(m => ({
            id: m._id,
            opponentDeck: m.opponentDeck,
            result: m.result === 'draw' ? 'TIE' : m.result.toUpperCase(),
            notes: m.notes
          }));

          return {
            id: t._id,
            name: t.name,
            date: t.date ? new Date(t.date.split('T')[0] + 'T12:00:00').toLocaleDateString() : '',
            rawDate: t.date,
            location: t.location,
            deck: matchedPokemon,
            matches: mappedMatches,
            wins: t.results?.wins || 0,
            losses: t.results?.losses || 0,
            draws: t.results?.draws || 0,
            result: `${t.results?.wins || 0}W - ${t.results?.losses || 0}L - ${t.results?.draws || 0}T`,
            deckList: t.deckList || '',
          };
        });
        setTournaments(mappedData);
      } catch (error) {
        console.error("Error fetching torneos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTournaments();
  }, [contextPokemons, pokemonsLoading]);

  const getResultColor = (wins, losses) => {
    if (wins > losses) return 'success';
    if (losses > wins) return 'secondary';
    return 'warning';
  };

  return (
    <Box sx={{ p: 3, pt: { xs: 2, md: 4 }, maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant={isMobile ? "h5" : "h4"} fontWeight={isMobile ? 700 : 'bold'}>
          Mis Torneos
        </Typography>
        <ResponsiveIconButton
          icon={<Add size={isMobile ? 14 : 18} />}
          label="Nuevo Torneo"
          onClick={() => navigate('/new')}
          colorStyles={{
            color: blue[800],
            borderColor: blue[800],
            '&:hover': {
              borderColor: blue[900],
              backgroundColor: blue[50],
            }
          }}
        />
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {loading ? (
          <Typography textAlign="center" color="text.secondary">Cargando torneos...</Typography>
        ) : tournaments.length === 0 ? (
          <Typography textAlign="center" color="text.secondary">Aún no hay torneos registrados.</Typography>
        ) : (
          tournaments.map((tournament) => (
            <PremiumCard key={tournament.id} onClick={() => navigate(`/details/${tournament.id}`, { state: { tournament } })}>
              <CardContent sx={{ pb: '16px !important', position: 'relative' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {tournament.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {tournament.date} • {tournament.location}
                    </Typography>
                  </Box>
                  <Chip
                    label={tournament.result}
                    color={getResultColor(tournament.wins, tournament.losses)}
                    variant="filled"
                    sx={{ fontWeight: 'bold' }}
                  />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mt: 3 }}>
                  <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { bgcolor: 'transparent' } }}>
                    {tournament.deck.map((pokemon, idx) => (
                      <Avatar
                        key={idx}
                        alt={pokemon.name}
                        src={pokemon.image}
                        sx={{ width: 40, height: 40 }}
                      />
                    ))}
                  </AvatarGroup>
                </Box>
              </CardContent>
            </PremiumCard>
          )))}
      </Box>
    </Box>
  );
};

export default Home;
