import { useContext, useState, useEffect } from 'react';
import {
  Box, useTheme, useMediaQuery,
  Drawer, Typography, Divider, Button, IconButton,
  List, ListItem, ListItemButton, ListItemIcon, ListItemText
} from '@mui/material';
import {
  Home as HomeIcon, AddCircle as AddIcon, BarChart as StatsIcon,
  Menu as MenuIcon, LightMode, DarkMode
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import PokemonCompanion from './PokemonCompanion';

const DRAWER_WIDTH = 260;

const Layout = ({ children, toggleTheme, currentMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // Rely exclusively on native browser window scroll
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 10);
  }, [location.pathname]);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const handleNavigate = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const menuContent = (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box display='flex' justifyContent='space-between' alignItems='center'>
        <Typography variant="h5" sx={{
          fontWeight: 'bold',
          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          DuelTracker
        </Typography>
        {isDesktop &&
          <IconButton onClick={toggleTheme}>
            {currentMode === 'dark' ? <LightMode /> : <DarkMode />}
          </IconButton>
        }
      </Box>

      <Divider sx={{ mb: 2 }} />

      <List sx={{ px: 0 }}>
        <ListItem disablePadding>
          <ListItemButton
            selected={location.pathname === '/'}
            onClick={() => handleNavigate('/')}
            sx={{ borderRadius: 2, mb: 1 }}
          >
            <ListItemIcon>
              <HomeIcon color={location.pathname === '/' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText
              primary="Inicio"
              primaryTypographyProps={{
                color: location.pathname === '/' ? 'primary.main' : 'inherit',
                fontWeight: location.pathname === '/' ? 'bold' : 'normal'
              }}
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            selected={location.pathname === '/new'}
            onClick={() => handleNavigate('/new')}
            sx={{ borderRadius: 2, mb: 1 }}
          >
            <ListItemIcon>
              <AddIcon color={location.pathname === '/new' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText
              primary="Nuevo Torneo"
              primaryTypographyProps={{
                color: location.pathname === '/new' ? 'primary.main' : 'inherit',
                fontWeight: location.pathname === '/new' ? 'bold' : 'normal'
              }}
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            selected={location.pathname === '/stats'}
            onClick={() => handleNavigate('/stats')}
            sx={{ borderRadius: 2, mb: 1 }}
          >
            <ListItemIcon>
              <StatsIcon color={location.pathname === '/stats' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText
              primary="Estadísticas"
              primaryTypographyProps={{
                color: location.pathname === '/stats' ? 'primary.main' : 'inherit',
                fontWeight: location.pathname === '/stats' ? 'bold' : 'normal'
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>

      <Box sx={{ flexGrow: 1 }} />

      {user?.favoritePokemon && (
        <PokemonCompanion pokemonId={user.favoritePokemon} />
      )}

      <Button
        variant="outlined"
        color="error"
        onClick={() => {
          logout();
          navigate('/login');
        }}
        fullWidth
        sx={{
          justifyContent: 'center',
          p: 1.5,
          borderRadius: 2
        }}
      >
        Cerrar Sesión
      </Button>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>

      {/* Sidebar for Desktop */}
      {isDesktop && (
        <Box component="nav" sx={{ width: DRAWER_WIDTH, flexShrink: 0 }}>
          <Drawer
            variant="permanent"
            sx={{
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
            }}
            open
          >
            {menuContent}
          </Drawer>
        </Box>
      )}

      {/* Main Content Area */}
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex', flexDirection: 'column',
          width: '100%',
          overflowX: 'hidden'
        }}>

        {/* Mobile Header / Top Bar */}
        {!isDesktop && (
          <Box sx={{
            display: 'flex', alignItems: 'center', p: 2,
            justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider',
            bgcolor: 'background.paper', position: 'sticky', top: 0, zIndex: 1100
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton color="inherit" onClick={handleDrawerToggle} edge="start" sx={{ mr: 2 }}>
                <MenuIcon />
              </IconButton>

              <Typography variant="h6" fontWeight="bold" onClick={() => handleNavigate('/')}>DuelTracker</Typography>

            </Box>
            <IconButton onClick={toggleTheme}>
              {currentMode === 'dark' ? <LightMode /> : <DarkMode />}
            </IconButton>
          </Box>
        )}

        {/* Mobile Drawer */}
        {!isDesktop && (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
            }}
          >
            {menuContent}
          </Drawer>
        )}

        {children}
      </Box>

    </Box>
  );
};

export default Layout;
