import React from 'react';
import { Box, Typography, Container, Paper, Button, IconButton } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Pricing = () => {
  const navigate = useNavigate();
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={() => {
          if (window.history.length > 1) {
            navigate(-1);
          } else {
            navigate('/');
          }
        }} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" fontWeight="bold">
          Precios
        </Typography>
      </Box>
      <Paper sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Pricing
        </Typography>
        <Typography variant="body1" paragraph color="text.secondary">
          Simple, transparent pricing for all our users.
        </Typography>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
          {/* Free Tier */}
          <Paper elevation={3} sx={{ p: 4, width: '300px', borderRadius: 3 }}>
            <Typography variant="h5" gutterBottom>
              Free
            </Typography>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              $0<Typography variant="span" fontSize="1rem" color="text.secondary">/month</Typography>
            </Typography>
            <Box sx={{ my: 3, textAlign: 'left' }}>
              <Typography variant="body2" sx={{ my: 1 }}>✓ Track recent tournaments</Typography>
              <Typography variant="body2" sx={{ my: 1 }}>✓ Basic stats</Typography>
              <Typography variant="body2" sx={{ my: 1 }}>✗ Limited access to opponent details</Typography>
            </Box>
            <Button variant="outlined" fullWidth disabled>Current Plan</Button>
          </Paper>

          {/* Premium Tier */}
          <Paper elevation={4} sx={{ p: 4, width: '300px', borderRadius: 3, border: '2px solid', borderColor: 'primary.main' }}>
            <Typography variant="h5" gutterBottom color="primary">
              Premium
            </Typography>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              $3<Typography variant="span" fontSize="1rem" color="text.secondary">/month</Typography>
            </Typography>
            <Box sx={{ my: 3, textAlign: 'left' }}>
              <Typography variant="body2" sx={{ my: 1 }}>✓ Unlimited tournament tracking</Typography>
              <Typography variant="body2" sx={{ my: 1 }}>✓ Advanced historical stats</Typography>
              <Typography variant="body2" sx={{ my: 1 }}>✓ Full opponent deep-dives</Typography>
            </Box>
            <Button variant="contained" color="primary" fullWidth>Unlock Premium</Button>
          </Paper>
        </Box>
      </Paper>
    </Container>
  );
};

export default Pricing;
