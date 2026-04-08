import { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Grid, LinearProgress, Avatar } from '@mui/material';
import { getStatistics, getPokemons } from '../services/api';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const StatCard = ({ title, value, color }) => (
  <Card sx={{ bgcolor: `${color}.dark`, color: 'white', borderRadius: 4, height: '100%' }}>
    <CardContent sx={{ textAlign: 'center' }}>
      <Typography variant="subtitle1" sx={{ opacity: 0.8 }} gutterBottom>
        {title}
      </Typography>
      <Typography variant="h3" fontWeight="bold">
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const DeckPerformanceRow = ({ deckName, winRate, totalMatches, pokemon1, pokemon2 }) => (
  <Box sx={{ mb: 3 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, justifyContent: 'space-between' }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {pokemon1 && <Avatar src={pokemon1.image} sx={{ width: 32, height: 32, mr: -1, zIndex: 1 }} />}
        {pokemon2 && <Avatar src={pokemon2.image} sx={{ width: 32, height: 32, mr: 2 }} />}
        <Typography variant="subtitle2" fontWeight="bold">
          {deckName}
        </Typography>
      </Box>
      <Box textAlign="right">
        <Typography variant="body2" fontWeight="bold" color="primary">{winRate}% Win Rate</Typography>
        <Typography variant="caption" color="text.secondary">{totalMatches} Partidas</Typography>
      </Box>
    </Box>
    <LinearProgress
      variant="determinate"
      value={winRate}
      sx={{
        height: 10,
        borderRadius: 5,
        bgcolor: 'background.paper',
        '& .MuiLinearProgress-bar': {
          bgcolor: winRate >= 50 ? 'success.main' : 'error.main',
          borderRadius: 5
        }
      }}
    />
  </Box>
);

const Stats = () => {
  useDocumentTitle('Estadísticas');
  const [stats, setStats] = useState(null);
  const [pokemonList, setPokemonList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsData, pokemonsData] = await Promise.all([
          getStatistics(),
          getPokemons()
        ]);
        setStats(statsData);
        setPokemonList(pokemonsData);
      } catch (err) {
        setError(err.message || 'Error al cargar las estadísticas');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <Box sx={{ mt: 5, textAlign: 'center' }}>Cargando estadísticas...</Box>;
  }

  if (error) {
    return <Box sx={{ mt: 5, textAlign: 'center', color: 'error.main' }}>{error}</Box>;
  }

  if (!stats || stats.totalMatches === 0) {
    return (
      <Box sx={{ p: 3, pt: 4, maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <Typography variant="h5" color="text.secondary" sx={{ mt: 5 }}>
          Aún no tienes torneos registrados. Juega y registra algunos para ver tus estadísticas.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, pt: 4, maxWidth: '800px', margin: '0 auto' }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 4 }}>
        Estadísticas Generales
      </Typography>

      <Grid container spacing={2} sx={{ mb: 6 }}>
        <Grid item xs={12} sm={4}>
          <StatCard title="Win Rate" value={stats.winRate} color="primary" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard title="Partidas Totales" value={stats.totalMatches} color="secondary" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard title="Mejor Torneo" value={stats.bestResult} color="success" />
        </Grid>
      </Grid>

      <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
        Desempeño por Deck
      </Typography>

      {stats.decks && stats.decks.length > 0 ? (
        <Card sx={{ borderRadius: 4 }}>
          <CardContent sx={{ p: 3 }}>
            {stats.decks.map((deckStat, index) => {
              const deckNames = deckStat.deckUsed ? deckStat.deckUsed.split('/') : [];
              const p1Name = deckNames[0]?.trim();
              const p2Name = deckNames[1]?.trim();

              const pokemon1 = pokemonList.find(p => p.name === p1Name);
              const pokemon2 = pokemonList.find(p => p.name === p2Name);

              return (
                <DeckPerformanceRow
                  key={index}
                  deckName={deckStat.deckUsed || 'Desconocido'}
                  pokemon1={pokemon1}
                  pokemon2={pokemon2}
                  winRate={deckStat.winRate}
                  totalMatches={deckStat.totalMatches}
                />
              );
            })}
          </CardContent>
        </Card>
      ) : (
        <Typography color="text.secondary">No hay información de decks disponible.</Typography>
      )}

    </Box>
  );
};

export default Stats;
