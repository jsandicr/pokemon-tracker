import { useState, useEffect, useContext } from 'react';
import { Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { keyframes } from '@mui/system';
import { getPokemons, updateFavoritePokemon } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import PokemonSelect from './PokemonSelect';

const floatAnimation = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const PokemonCompanion = ({ pokemonId }) => {
  const { login, user } = useContext(AuthContext);

  const [pokemon, setPokemon] = useState(null);
  const [pokemonList, setPokemonList] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedNewPokemon, setSelectedNewPokemon] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getPokemons()
      .then(list => {
        setPokemonList(list);
        if (pokemonId) {
          const found = list.find(p => p.id === pokemonId);
          if (found) setPokemon(found);
        }
      })
      .catch(console.error);
  }, [pokemonId]);

  const handleOpenModal = () => {
    setSelectedNewPokemon(pokemonId);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleSave = async () => {
    if (!selectedNewPokemon || selectedNewPokemon === pokemonId) {
      return handleCloseModal();
    }
    try {
      setIsSaving(true);
      const updatedUser = await updateFavoritePokemon(selectedNewPokemon);
      // login(userData) safely updates user state and localStorage
      login(updatedUser);
      setOpenModal(false);
    } catch (err) {
      console.error(err);
      alert('Error updating pokemon. Intentelo de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!pokemon) return null;

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
          mt: 'auto',
          cursor: 'pointer',
          borderRadius: 2,
          transition: 'all 0.2s ease',
        }}
        onClick={handleOpenModal}
      >
        <Box
          sx={{
            position: 'relative',
            width: 100,
            height: 100,
            mb: 1,
            animation: `${floatAnimation} 3s ease-in-out infinite`,
            transition: 'filter 0.2s',
            // Dimmed the hover brightness to 1.05 and added a golden drop-shadow
            '&:hover': {
              filter: 'brightness(1.05) drop-shadow(0px 0px 8px rgba(255, 203, 5, 0.4))'
            }
          }}
        >
          <img
            src={pokemon.image}
            alt={pokemon.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              // Base shadow
              filter: 'drop-shadow(0px 8px 12px rgba(0,0,0,0.3))'
            }}
          />
        </Box>
        <Typography variant="caption" color="text.secondary" fontWeight="bold">
          {pokemon.name}
        </Typography>
      </Box>

      <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="xs">
        <DialogTitle fontWeight="bold">Cambiar Compañero</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ mt: 1 }}>
            <PokemonSelect
              label="Elige un nuevo Pokémon"
              value={selectedNewPokemon}
              onChange={setSelectedNewPokemon}
              options={pokemonList}
              isMainDeck={true}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={handleCloseModal} color="inherit">Cancelar</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            color="primary"
            disabled={isSaving}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PokemonCompanion;
