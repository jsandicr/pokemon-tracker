import { useState, useEffect, useContext } from 'react';
import { Box, Typography, Card, CardContent, Grid, LinearProgress, Avatar, Button, Switch, FormControlLabel } from '@mui/material';
import { TrendingUp, TrendingDown, TrendingFlat, AutoAwesome } from '@mui/icons-material';
import { getStatistics, getPokemons } from '../services/api';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

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

const TrendIcon = ({ trend }) => {
  if (trend === 'up') return <TrendingUp color="success" />;
  if (trend === 'down') return <TrendingDown color="error" />;
  return <TrendingFlat color="warning" />;
};

const ResultDots = ({ results }) => (
  <Box sx={{ display: 'flex', gap: 0.5 }}>
    {results.map((res, i) => (
      <Box
        key={i}
        sx={{
          width: 10, height: 10, borderRadius: '50%',
          bgcolor: res === 'win' ? 'success.main' : res === 'loss' ? 'error.main' : 'warning.main'
        }}
      />
    ))}
  </Box>
);

const DeckPerformanceRow = ({ deckName, winRate, totalMatches, pokemon1, pokemon2, trend, lastResults }) => (
  <Box sx={{ mb: 3 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, justifyContent: 'space-between' }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {pokemon1 && <Avatar src={pokemon1.image} sx={{ width: 32, height: 32, mr: pokemon2 ? -1 : 2, zIndex: 1 }} />}
        {pokemon2 && <Avatar src={pokemon2.image} sx={{ width: 32, height: 32, mr: 2 }} />}
        <Box>
          <Typography variant="subtitle2" fontWeight="bold">{deckName}</Typography>
        </Box>
      </Box>
      <Box textAlign="right" display="flex" flexDirection="column" alignItems="flex-end">
        <Box display="flex" alignItems="center" gap={0.5}>
          <Typography variant="body2" fontWeight="bold" color="primary">{winRate}% Win Rate</Typography>
          {trend && <TrendIcon trend={trend} />}
        </Box>
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
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [pokemonList, setPokemonList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paddleLoaded, setPaddleLoaded] = useState(false);
  const [isPremiumDemo, setIsPremiumDemo] = useState(user?.isPremium ?? false);

  // Inyectar script de Paddle y preparar entorno
  useEffect(() => {
    // Si el usuario ya es premium o no queremos inicializarlo.
    if (user?.isPremium) return;

    if (!document.getElementById('paddle-js')) {
      const script = document.createElement('script');
      script.id = 'paddle-js';
      script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
      script.onload = () => {
        if (window.Paddle) {
          window.Paddle.Environment.set(import.meta.env.VITE_PADDLE_ENV || 'sandbox');
          window.Paddle.Initialize({
            token: import.meta.env.VITE_PADDLE_CLIENT_TOKEN || 'test_token' // Reemplazaremos esto en .env
          });
          setPaddleLoaded(true);
        }
      };
      document.body.appendChild(script);
    } else if (window.Paddle) {
      setPaddleLoaded(true);
    }
  }, [user]);

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

  const handleCheckout = () => {
    if (paddleLoaded && window.Paddle) {
      window.Paddle.Checkout.open({
        items: [{
          priceId: import.meta.env.VITE_PADDLE_PRICE_MONTHLY_ID || 'pri_01xxxxx',
          quantity: 1
        }],
        customData: {
          userId: user?._id || user?.id
        }
      });
    } else {
      alert("Error: El sistema de pagos de Paddle aún se está cargando o tu bloqueador de anuncios lo impide.");
    }
  };

  if (loading) return <Box sx={{ mt: 5, textAlign: 'center' }}>Cargando estadísticas...</Box>;
  if (error) return <Box sx={{ mt: 5, textAlign: 'center', color: 'error.main' }}>{error}</Box>;
  if (!stats || stats.tournamentsCount === 0) {
    return (
      <Box sx={{ p: 3, pt: 4, maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <Typography variant="h5" color="text.secondary" sx={{ mt: 5 }}>
          Aún no tienes torneos registrados. Juega y registra algunos para ver tus estadísticas.
        </Typography>
      </Box>
    );
  }

  // En entorno dev, forzamos que el UI escuche EXACTAMENTE lo que dice el botón toggle
  const isPremiumActive = isPremiumDemo;

  return (
    <Box sx={{ p: 3, pt: 4, maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight="bold">Estadísticas</Typography>
        {import.meta.env.DEV && (
          <FormControlLabel
            control={<Switch checked={isPremiumDemo} onChange={(e) => setIsPremiumDemo(e.target.checked)} color="warning" />}
            label={<Typography variant="caption" fontWeight="bold">Dev Premium Toggle</Typography>}
          />
        )}
      </Box>

      {/* --- FREE: Core Stats --- */}
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>Vista General</Typography>
      <Grid container spacing={2} sx={{ mb: 6 }}>
        <Grid item xs={12} sm={4}><StatCard title="Win Rate Global" value={stats.winRate} color="primary" /></Grid>
        <Grid item xs={12} sm={4}><StatCard title="Partidas Totales" value={stats.totalMatches} color="secondary" /></Grid>
        <Grid item xs={12} sm={4}><StatCard title="Mejor Torneo" value={stats.bestResult} color="success" /></Grid>
      </Grid>

      {isPremiumActive ? (
        <>
          {/* --- PREMIUM: Deck Performance --- */}
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>Desempeño por Deck</Typography>
          {stats.decks && stats.decks.length > 0 ? (
            <Card sx={{ borderRadius: 4, mb: 6, position: 'relative' }}>
              <CardContent sx={{ p: 3 }}>
                {stats.decks.map((deckStat, index) => {
                  const deckNames = deckStat.deckUsed ? deckStat.deckUsed.split('/') : [];
                  const pokemon1 = pokemonList.find(p => p.name === deckNames[0]?.trim());
                  const pokemon2 = pokemonList.find(p => p.name === deckNames[1]?.trim());
                  return (
                    <DeckPerformanceRow
                      key={index} deckName={deckStat.deckUsed || 'Desconocido'}
                      pokemon1={pokemon1} pokemon2={pokemon2}
                      winRate={deckStat.winRate} totalMatches={deckStat.totalMatches}
                      trend={deckStat.trend} lastResults={deckStat.lastResults}
                    />
                  );
                })}
              </CardContent>
            </Card>
          ) : (
            <Typography color="text.secondary" mb={6}>No hay información disponible.</Typography>
          )}
          {/* --- PREMIUM: Performance Insights --- */}
          <Box sx={{ position: 'relative', mb: 6 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <AutoAwesome color="primary" /> Insights de Rendimiento
            </Typography>
            {stats.performanceInsights?.length > 0 ? (
              <Grid container spacing={2}>
                {stats.performanceInsights.map((insight, idx) => (
                  <Grid item xs={12} sm={6} key={idx}>
                    <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText', borderRadius: 3, height: '100%' }}>
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Typography variant="body2" fontWeight="medium">{insight}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Card sx={{ bgcolor: 'background.paper', borderRadius: 3, p: 2, textAlign: 'center' }}>
                <Typography color="text.secondary" variant="body2">Juega más partidas para generar insights matemáticos precisos sobre tu rendimiento.</Typography>
              </Card>
            )}
          </Box>

          {/* --- PREMIUM: Performance Over Time --- */}
          <Box sx={{ position: 'relative', mb: 6 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>Evolución del Win Rate (Últimos 10 Torneos)</Typography>
            {stats.performanceOverTime?.length > 0 ? (
              <Card sx={{ borderRadius: 4, p: 3, display: 'flex', alignItems: 'flex-end', gap: 2, height: 200, overflowX: 'auto', justifyContent: 'flex-start' }}>
                {stats.performanceOverTime.map((pt, idx) => (
                  <Box key={idx} sx={{ flex: 1, minWidth: 40, maxWidth: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                    <Typography variant="caption" sx={{ mb: 1, fontWeight: 'bold', color: pt.winRate >= 50 ? 'success.main' : 'error.main' }}>{pt.winRate}%</Typography>
                    <Box sx={{ width: '100%', minWidth: 30, bgcolor: 'primary.main', height: pt.winRate > 0 ? `${pt.winRate}%` : '4px', borderRadius: '4px 4px 0 0', opacity: 0.8, transition: 'height 0.3s' }} />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, fontSize: 10 }}>{pt.label.length > 10 ? pt.label.substring(0, 8) + '...' : pt.label}</Typography>
                  </Box>
                ))}
              </Card>
            ) : (
              <Card sx={{ borderRadius: 4, p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary" variant="body2">Aún no hay suficientes datos históricos para trazar la gráfica.</Typography>
              </Card>
            )}
          </Box>

          {/* --- PREMIUM: Matchup Analysis --- */}
          <Box sx={{ position: 'relative', mb: 6 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>Análisis de Matchups (Peor a Mejor)</Typography>
            <Card sx={{ borderRadius: 4 }}>
              <CardContent sx={{ p: 3 }}>
                {stats.matchups?.map((matchup, idx) => (
                  <Box key={idx} sx={{ mb: 2 }}>
                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                      <Typography variant="body2" fontWeight="medium">{matchup.opponentDeck}</Typography>
                      <Typography variant="body2" fontWeight="bold" color={matchup.winRate < 50 ? 'error.main' : 'success.main'}>{matchup.winRate}%</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate" value={matchup.winRate}
                      sx={{ height: 8, borderRadius: 4, bgcolor: 'background.default', '& .MuiLinearProgress-bar': { bgcolor: matchup.winRate < 50 ? 'error.main' : 'success.main' } }}
                    />
                  </Box>
                ))}
                {!stats.matchups?.length && <Typography color="text.secondary">No hay suficientes datos de matchups.</Typography>}
              </CardContent>
            </Card>
          </Box>

          {/* --- PREMIUM: Consistency Metrics --- */}
          <Box sx={{ position: 'relative', mb: 6 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>Métricas de Consistencia</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Card sx={{ bgcolor: 'background.paper', borderRadius: 3, textAlign: 'center', p: 2 }}>
                  <Typography variant="caption" color="text.secondary">Promedio Wins/Torneo</Typography>
                  <Typography variant="h5" fontWeight="bold" color="primary.main">{stats.consistency?.averageWinsPerTournament}</Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card sx={{ bgcolor: 'background.paper', borderRadius: 3, textAlign: 'center', p: 2 }}>
                  <Typography variant="caption" color="text.secondary">Peor Torneo</Typography>
                  <Typography variant="h5" fontWeight="bold" color="error.main">{stats.consistency?.worstResult}</Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card sx={{ bgcolor: 'background.paper', borderRadius: 3, textAlign: 'center', p: 2 }}>
                  <Typography variant="caption" color="text.secondary">Estado Actual</Typography>
                  <Typography variant="h6" fontWeight="bold" color={stats.consistency?.status === 'Consistente' ? 'success.main' : 'warning.main'}>
                    {stats.consistency?.status}
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </>
      ) : (
        /* --- PREMIUM UPGRADE BANNER (ONLY IF NOT PREMIUM) --- */
        <Card sx={(theme) => ({
          mt: 2,
          borderRadius: 4,
          p: { xs: 3, md: 5 },
          textAlign: 'center',

          // 🎯 Fondo adaptativo
          background:
            theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
              : 'linear-gradient(135deg, #f3f4f6 0%, #ffffff 100%)',

          // 🎯 Borde adaptativo
          border: `1px solid ${theme.palette.mode === 'dark'
              ? theme.palette.grey[800]
              : theme.palette.grey[200]
            }`,

          // 🎯 Sombra más elegante en dark
          boxShadow:
            theme.palette.mode === 'dark'
              ? '0 0 0 1px rgba(255,255,255,0.05)'
              : 'none'
        })}>
          <AutoAwesome sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" fontWeight="bold" color="text.primary" gutterBottom>
            Desbloquea tu potencial completo
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 500, mx: 'auto', mb: 1 }}>
            Únete a Premium y accede al instante a análisis de contrincantes (Matchups), gráficas de desempeño temporal y rastreo de rachas. Lleva el control exacto para saber cuál es tu mazo ganador.
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ maxWidth: 500, mx: 'auto', mb: 4, opacity: 0.8, fontStyle: 'italic' }}>
            Los fondos recaudados a través de las suscripciones Premium son destinados íntegramente a cubrir los costos de mantenimiento de servidores y a financiar el desarrollo continuo de la plataforma.
          </Typography>
          <Button variant="contained" size="large" onClick={handleCheckout} sx={{ borderRadius: 6, px: 5, py: 1.5, fontWeight: 'bold', fontSize: '1rem', mb: 3 }}>
            MEJORAR A PREMIUM MENSUAL
          </Button>

          <Box display="flex" justifyContent="center" gap={3} flexWrap="wrap" sx={{ mt: 2 }}>
            <Link to="/pricing" style={{ color: '#6b7280', textDecoration: 'underline', fontSize: '0.8rem' }}>Precios</Link>
            <Link to="/terms" style={{ color: '#6b7280', textDecoration: 'underline', fontSize: '0.8rem' }}>Términos de Servicio</Link>
            <Link to="/privacy" style={{ color: '#6b7280', textDecoration: 'underline', fontSize: '0.8rem' }}>Política de Privacidad</Link>
            <Link to="/refund" style={{ color: '#6b7280', textDecoration: 'underline', fontSize: '0.8rem' }}>Política de Reembolso</Link>
          </Box>
        </Card>
      )}

    </Box>
  );
};

export default Stats;
