import { createContext, useState, useEffect } from 'react';
import { getPokemons } from '../services/api';

export const PokemonContext = createContext({ pokemons: [], loading: true });

export const PokemonProvider = ({ children }) => {
  const [pokemons, setPokemons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPokemons = async () => {
      try {
        const data = await getPokemons();
        setPokemons(data);
      } catch (error) {
        console.error('Error fetching pokemons:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPokemons();
  }, []);

  return (
    <PokemonContext.Provider value={{ pokemons, loading }}>
      {children}
    </PokemonContext.Provider>
  );
};