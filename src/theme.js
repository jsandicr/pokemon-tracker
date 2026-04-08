import { createTheme } from '@mui/material/styles';

const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          primary: { main: '#3f51b5' },
          secondary: { main: '#f50057' },
          background: { default: '#f4f6f8', paper: '#ffffff' },
        }
      : {
          primary: { main: '#90caf9' },
          secondary: { main: '#f48fb1' },
          background: { default: '#0a1929', paper: '#001e3c' },
          text: { primary: '#fff', secondary: 'rgba(255, 255, 255, 0.7)' },
        }),
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: mode === 'dark' 
            ? '0 8px 32px 0 rgba(0,0,0,0.5)' 
            : '0 8px 32px 0 rgba(31,38,135,0.07)',
          backgroundImage: mode === 'dark' 
            ? 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))' 
            : 'none',
          backdropFilter: 'blur(4px)',
          transition: 'transform 0.2s, box-shadow 0.2s',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { 
          borderRadius: 8, 
          textTransform: 'none', 
          fontWeight: 600 
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        }
      }
    }
  },
});

export const theme = (mode) => createTheme(getDesignTokens(mode));
