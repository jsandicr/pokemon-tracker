import React from 'react';
import { Box, Typography, Container, Paper, IconButton } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Refund = () => {
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
          Política de Reembolso
        </Typography>
      </Box>
      <Paper sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom>
          Return and Refund Policy
        </Typography>
        <Typography variant="body1" paragraph>
          Last updated: {new Date().toLocaleDateString()}
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          1. General Policy
        </Typography>
        <Typography variant="body1" paragraph>
          We want you to be completely satisfied with your premium subscription. If you are not entirely satisfied with your purchase, we're here to help.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          2. Refunds
        </Typography>
        <Typography variant="body1" paragraph>
          Since our service is primarily digital, we evaluate refund requests on a case-by-case basis. Generally, if you are not satisfied within the first 14 days of your initial subscription, we will issue a full refund upon your request.
          After 14 days, refunds will be issued at our discretion based on technical issues or significant service disruptions.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          3. Subscription Cancellations
        </Typography>
        <Typography variant="body1" paragraph>
          You may cancel your ongoing subscription at any time. Doing so will prevent any future charges, and your premium access will remain active until the end of your current billing cycle.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          4. Requesting a Refund
        </Typography>
        <Typography variant="body1" paragraph>
          To request a refund, please contact our support team. Refunds will be processed to your original method of payment through our provider, Paddle.
        </Typography>
      </Paper>
    </Container>
  );
};

export default Refund;
