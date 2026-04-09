import { useState } from 'react';
import {
  Box, Typography, TextField, OutlinedInput
} from '@mui/material';
import { createPortal } from 'react-dom';

const PokemonSelect = ({ value, onChange, options, label, isMainDeck = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const selectedPokemon = options.find(p => p.id === value);
  const iconSize = isMainDeck ? 24 : 20;

  // Use value directly as display if selectedPokemon not found (options may not be loaded yet)
  const displayValue = selectedPokemon ? selectedPokemon.name : (value || '');
  const displayImage = selectedPokemon?.image || null;

  const filteredOptions = searchTerm.length > 2
    ? options.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  const handleOpen = () => {
    setModalOpen(true);
    setSearchTerm(selectedPokemon?.name || '');
  };

  const handleClose = () => {
    setModalOpen(false);
    setSearchTerm('');
  };

  const handleSelect = (pokemonId) => {
    onChange(pokemonId);
    handleClose();
  };

  return (
    <>
      <Box sx={{ mb: isMainDeck ? 2.5 : 2 }}>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            mt: 0.5,
            transform: 'translateY(-50%)',
            fontSize: '0.875rem',
            px: 0.5,
            backgroundColor: 'background.paper',
            position: 'relative',
            zIndex: 1,
            cursor: 'pointer'
          }}
        >
          {label}
        </Typography>
        <OutlinedInput
          onClick={handleOpen}
          readOnly
          fullWidth
          size={!isMainDeck ? "small" : "medium"}
          value={displayValue}
          placeholder="Select Pokemon"
          startAdornment={
            displayImage ? (
              <Box component="span" sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                <img src={displayImage} alt={displayValue} style={{ width: iconSize, height: iconSize, objectFit: 'contain' }} />
              </Box>
            ) : null
          }
          sx={{
            cursor: 'pointer',
            '& input': {
              cursor: 'pointer !important'
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(0, 0, 0, 0.23)'
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'primary.main'
            }
          }}
        />
      </Box>

      {modalOpen && createPortal(
        <Box
          onClick={handleClose}
          sx={{
            position: 'fixed',
            inset: 0,
            bgcolor: 'rgba(0,0,0,0.5)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2
          }}
        >
          <Box
            onClick={(e) => e.stopPropagation()}
            sx={{
              bgcolor: 'background.paper',
              borderRadius: 2,
              padding: 3,
              width: '100%',
              maxWidth: 400,
              maxHeight: '80vh',
              overflow: 'auto'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">{label}</Typography>
              <Typography
                onClick={handleClose}
                sx={{ cursor: 'pointer', color: 'primary.main', fontWeight: 'bold' }}
              >
                Cerrar
              </Typography>
            </Box>
            <TextField
              fullWidth
              size="small"
              placeholder="Search pokemon"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ mb: 2 }}
              autoFocus
            />
            <Box sx={{ maxHeight: '50vh', overflow: 'auto' }}>
              {searchTerm.length <= 2 ? (
                <Typography color="text.secondary" textAlign="center" py={4}>
                  Start typing a Pokemon name...
                </Typography>
              ) : filteredOptions.length === 0 ? (
                <Typography color="text.secondary" textAlign="center" py={4}>
                  No results found
                </Typography>
              ) : (
                filteredOptions.map(p => (
                  <Box
                    key={p.id}
                    onClick={() => handleSelect(p.id)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      py: 1.5,
                      px: 1,
                      cursor: 'pointer',
                      borderRadius: 1,
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    {p.image && <img src={p.image} alt={p.name} style={{ width: 32, height: 32, objectFit: 'contain' }} />}
                    <Typography>{p.name}</Typography>
                  </Box>
                ))
              )}
            </Box>
          </Box>
        </Box>,
        document.body
      )}
    </>
  );
};

export default PokemonSelect;
