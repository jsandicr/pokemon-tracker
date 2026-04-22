import { useState, useMemo, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';

// Pages
import Home from './pages/Home';
import NewTournament from './pages/NewTournament';
import Stats from './pages/Stats';
import Details from './pages/Details';
import EditTournament from './pages/EditTournament';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import About from './pages/About';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Refund from './pages/Refund';
import Pricing from './pages/Pricing';

// AuthContext
import { AuthProvider, AuthContext } from './context/AuthContext';
import VerifyCode from './pages/VerifyCode';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return children;
};

function App() {
  const [mode, setMode] = useState('light');

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
      mode
    }),
    [mode],
  );

  const activeTheme = useMemo(() => theme(mode), [mode]);

  return (
    <ThemeProvider theme={activeTheme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Public Routes (Login/Register do not use standard Layout or maybe they do?)
                Let's not use Layout for login so it looks cleaner */}
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/verify-code" element={<PublicRoute><VerifyCode /></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
            <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />

            {/* Public Legal & Info Pages (Accessible to Paddle without login) */}
            <Route path="/terms" element={<Layout toggleTheme={colorMode.toggleColorMode} currentMode={mode}><Terms /></Layout>} />
            <Route path="/privacy" element={<Layout toggleTheme={colorMode.toggleColorMode} currentMode={mode}><Privacy /></Layout>} />
            <Route path="/refund" element={<Layout toggleTheme={colorMode.toggleColorMode} currentMode={mode}><Refund /></Layout>} />
            <Route path="/pricing" element={<Layout toggleTheme={colorMode.toggleColorMode} currentMode={mode}><Pricing /></Layout>} />

            {/* Protected Routes enclosed in Layout */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout toggleTheme={colorMode.toggleColorMode} currentMode={mode}>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/new" element={<NewTournament />} />
                      <Route path="/stats" element={<Stats />} />
                      <Route path="/details/:id" element={<Details />} />
                      <Route path="/edit/:id" element={<EditTournament />} />
                      <Route path="/about" element={<About />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
