import React from 'react';
import { Box, Typography, Container, Paper, IconButton } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Terms = () => {
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
          Términos de Servicio
        </Typography>
      </Box>
      <Paper sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom>
          Terms of Service
        </Typography>
        <Typography variant="body1" paragraph>
          Last updated: {new Date().toLocaleDateString()}
        </Typography>
        
        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          1. Acceptance of Terms
        </Typography>
        <Typography variant="body1" paragraph>
          By accessing and using Pokemon Tracker, you accept and agree to be bound by the terms and provision of this agreement.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          2. Description of Service
        </Typography>
        <Typography variant="body1" paragraph>
          Pokemon Tracker provides users with access to a rich collection of resources, including various communications tools, search services, and personalized content such as tournament tracking and data analysis.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          3. Subscriptions and Payments
        </Typography>
        <Typography variant="body1" paragraph>
          Certain features of the Service are available on a premium basis. We use Paddle.com as our Merchant of Record for all premium subscriptions and payments. By purchasing a premium subscription, you also agree to Paddle's Terms of Service.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          4. User Conduct
        </Typography>
        <Typography variant="body1" paragraph>
          You agree to not use the Service to: upload, post, email, transmit or otherwise make available any content that is unlawful, harmful, threatening, abusive, harassing, defames, vulgar, obscene, libellous, invasive of another's privacy, or hateful.
        </Typography>
      </Paper>
    </Container>
  );
};

export default Terms;
