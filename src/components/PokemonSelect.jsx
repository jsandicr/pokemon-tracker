import { useState } from 'react';
import {
  Box, Typography, TextField, MenuItem,
  Select, FormControl, InputLabel, ListSubheader
} from '@mui/material';

const PokemonSelect = ({ value, onChange, options, label, isMainDeck = false }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const selectedPokemon = options.find(p => p.id === value);
  const iconSize = isMainDeck ? 24 : 20;

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredOptions = searchTerm.length > 2
    ? options.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  return (
    <FormControl fullWidth size={!isMainDeck ? "small" : "medium"}>
      <InputLabel shrink>{label}</InputLabel>
      <Select
        value={value || ''}
        displayEmpty
        label={label}
        onChange={(e) => {
          onChange(e.target.value);
          setSearchTerm('');
        }}
        onClose={() => setSearchTerm('')}
        renderValue={() => {
          if (!selectedPokemon) {
            return (
              <Box display="flex" alignItems="center" sx={{ minHeight: iconSize }}>
                <Typography color="text.secondary">Select Pokemon</Typography>
              </Box>
            );
          }
          return (
            <Box display="flex" alignItems="center" gap={1} sx={{ minHeight: iconSize }}>
              <img src={selectedPokemon.image} alt={selectedPokemon.name} style={{ width: iconSize, height: iconSize, objectFit: 'contain' }} />
              {selectedPokemon.name}
            </Box>
          );
        }}
        MenuProps={{
          PaperProps: { sx: { maxHeight: 350 } },
          autoFocus: false,
          disableAutoFocusItem: true,
          MenuListProps: { autoFocusItem: false }
        }}
      >
        <ListSubheader
          sx={{ pt: 1, pb: 1, zIndex: 2, bgcolor: 'background.paper', position: 'sticky', top: 0 }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="Search pokemon"
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={(e) => e.stopPropagation()}
            onKeyDownCapture={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            autoFocus
          />
        </ListSubheader>

        {searchTerm.length <= 2 ? (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">
              Start typing a Pokemon name...
            </Typography>
          </MenuItem>
        ) : filteredOptions.length === 0 ? (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">
              No results found
            </Typography>
          </MenuItem>
        ) : (
          filteredOptions.map(p => (
            <MenuItem key={p.id} value={p.id}>
              <Box display="flex" alignItems="center" gap={1}>
                {p.image && <img src={p.image} alt={p.name} style={{ width: 20, height: 20, objectFit: 'contain' }} />}
                {p.name}
              </Box>
            </MenuItem>
          ))
        )}
      </Select>
    </FormControl>
  );
};

export default PokemonSelect;
