# Pokemon Tracker

Gestor de torneos de Pokemon TCG para registrar partidas, rastrear estadísticas y managear tu colección de cartas.

## Stack

- **Frontend**: React 19 + Vite + Material UI
- **Routing**: React Router v7
- **Testing**: Vitest + Testing Library
- **Backend API**: Node.js (esperado en `http://192.168.100.28:5001`)

## Scripts

```bash
npm install          # Instalar dependencias
npm run dev          # Iniciar dev server (http://localhost:5173)
npm run build        # Build de producción
npm run lint         # Linter ESLint
npm run preview      # Preview del build
npm test             # Ejecutar tests
```

## Features

- **Autenticación**: Registro e inicio de sesión con JWT
- **Torneos**: Crear, editar, eliminar y ver torneos
- **Deck Builder**: Seleccionar Pokémon para tu deck
- **Estadísticas**: Tracking de victorias/derrotas/empates
- **Pokemon Companion**: Pokemon favorito asociado al usuario

## Endpoints API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/register` | Registro de usuario |
| POST | `/api/auth/login` | Inicio de sesión |
| PUT | `/api/auth/favorite` | Actualizar Pokemon favorito |
| GET | `/api/pokemon` | Listar Pokémon disponibles |
| GET | `/api/tournaments` | Listar torneos del usuario |
| GET | `/api/tournaments/statistics` | Estadísticas del usuario |
| GET | `/api/tournaments/:id` | Detalle de torneo |
| POST | `/api/tournaments` | Crear torneo |
| PUT | `/api/tournaments/:id` | Actualizar torneo |
| DELETE | `/api/tournaments/:id` | Eliminar torneo |

## Estructura del proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── CreateTournament.jsx
│   ├── Layout.jsx
│   ├── PokemonCompanion.jsx
│   └── PokemonSelect.jsx
├── context/             # React Context
│   └── AuthContext.jsx
├── hooks/               # Custom hooks
│   └── useDocumentTitle.js
├── pages/               # Vistas de la app
│   ├── Home.jsx
│   ├── Details.jsx
│   ├── EditTournament.jsx
│   ├── Login.jsx
│   ├── NewTournament.jsx
│   ├── Register.jsx
│   └── Stats.jsx
├── services/            # Llamadas a la API
│   └── api.js
├── App.jsx
├── main.jsx
└── theme.js             # Configuración MUI
```

## Configuración

El API URL está configurado en `src/services/api.js`:

```javascript
const API_URL = 'http://192.168.100.28:5001/api/tournaments';
const POKEMON_API_URL = 'http://192.168.100.28:5001/api/pokemon';
const AUTH_API_URL = 'http://192.168.100.28:5001/api/auth';
```

Para desarrollo local, verificar que el backend esté corriendo y accesible.
