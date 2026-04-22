import React from 'react';
import { Box, Typography, Container, Paper, IconButton } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Privacy = () => {
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
          Política de Privacidad
        </Typography>
      </Box>
      <Paper sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom>
          Privacy Policy
        </Typography>
        <Typography variant="body1" paragraph>
          Last updated: {new Date().toLocaleDateString()}
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          1. Information We Collect
        </Typography>
        <Typography variant="body1" paragraph>
          We collect information from you when you register on our site, create a tournament, or subscribe to our premium services. The types of personal information collected may include your name, email address, and usage data.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          2. How We Use Your Information
        </Typography>
        <Typography variant="body1" paragraph>
          Any of the information we collect from you may be used in the following ways:
          <ul>
            <li>To personalize your experience</li>
            <li>To improve our website functionality</li>
            <li>To process transactions (handled securely by Paddle)</li>
            <li>To send periodic emails regarding updates or service changes</li>
          </ul>
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          3. How We Protect Your Information
        </Typography>
        <Typography variant="body1" paragraph>
          We implement a variety of security measures to maintain the safety of your personal information. All payment processing is handled independently by Paddle, which ensures compliance with global security and privacy standards.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          4. Contacting Us
        </Typography>
        <Typography variant="body1" paragraph>
          If there are any questions regarding this privacy policy, you may contact us through the provided support channels.
        </Typography>
      </Paper>
    </Container>
  );
};

export default Privacy;
