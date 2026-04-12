import { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { verifyCode, resendCode } from '../services/api';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const VerifyCode = () => {
    const { state } = useLocation();
    const email = state?.email;

    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const [code, setCode] = useState('');
    const [timeLeft, setTimeLeft] = useState(120);
    const [canResend, setCanResend] = useState(false);
    const [error, setError] = useState('');

    // ⏳ contador
    useEffect(() => {
        if (timeLeft <= 0) {
            setCanResend(true);
            return;
        }

        const interval = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [timeLeft]);

    const formatTime = () => {
        const min = Math.floor(timeLeft / 60);
        const sec = timeLeft % 60;
        return `${min}:${sec.toString().padStart(2, '0')}`;
    };

    const handleVerify = async () => {
        try {
            const data = await verifyCode({ email, code });

            // ✅ login automático
            login(data);
            navigate('/');

        } catch (err) {
            setError('El código no es válido');
        }
    };

    const handleResend = async () => {
        if (!canResend) return;

        try {
            await resendCode({ email });
            setTimeLeft(120);
            setCanResend(false);
        } catch (err) {
            setError('Error al reenviar código');
        }
    };

    return (
        <Box textAlign="center" mt={10}>
            <Typography variant="h5">Verifica tu correo</Typography>

            <TextField
                label="Código"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                sx={{ mt: 2 }}
            />

            <Box mt={2}>
                <Button variant="contained" onClick={handleVerify}>
                    Verificar
                </Button>
            </Box>

            <Box mt={3}>
                <Button
                    onClick={handleResend}
                    disabled={!canResend}
                    sx={{
                        background: 'none',
                        color: canResend ? 'blue' : 'gray',
                        textDecoration: 'underline',
                    }}
                >
                    {canResend
                        ? 'Reenviar código'
                        : `Reenviar en ${formatTime()}`}
                </Button>
            </Box>

            {error && (
                <Typography color="error" mt={2}>
                    {error}
                </Typography>
            )}
        </Box>
    );
};

export default VerifyCode;