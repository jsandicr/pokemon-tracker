import { Box, Typography, Button, Paper, Container, IconButton } from '@mui/material';
import { ArrowBack, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { Instagram as InstagramIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const About = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ py: 4, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
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
            Acerca de
          </Typography>
        </Box>
      </Box>

      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
          textAlign: 'center',
          bgcolor: 'background.paper'
        }}
      >

        <Typography variant="body1" color="text.secondary" paragraph sx={{ fontStyle: 'italic' }}>
          No afiliado ni respaldado por The Pokémon Company. Todas las marcas comerciales pertenecen a sus respectivos propietarios.
        </Typography>

        <Box
          sx={{
            p: 3,
            bgcolor: 'background.default',
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2
          }}
        >
          <Typography variant="body1" fontWeight="medium">
            Hecha con cariño por
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<InstagramIcon />}
            href="https://instagram.com/BrickersTCG"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              textTransform: 'none',
              fontWeight: 'bold',
              borderRadius: 2,
              px: 4,
              background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
              color: 'white',
              boxShadow: 3,
              '&:hover': {
                background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                boxShadow: 6,
              }
            }}
          >
            BrickersTCG
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default About;
