import { useState, useContext } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { verifyCode, resendCode } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import useResendCodeTimer from '../hooks/useResendCodeTimer';

const VerifyCode = () => {
    const { state } = useLocation();
    const email = state?.email;

    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [resendLoading, setResendLoading] = useState(false);

                const { timeLeft, canResend, startTimer } = useResendCodeTimer('verifyCode', email);

    const handleVerify = async () => {
        try {
            const data = await verifyCode({ email, code });
            login(data);
            navigate('/');
        } catch {
            setError('El código no es válido');
        }
    };

    const handleResend = async () => {
        if (!canResend) return;

        setResendLoading(true);
        try {
            await resendCode({ email });
            startTimer();
        } catch {
            setError('Error al reenviar código');
        } finally {
            setResendLoading(false);
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
                    disabled={!canResend || resendLoading}
                    sx={{
                        background: 'none',
                        color: canResend ? '#ffcb05' : 'gray',
                        textDecoration: canResend ? 'underline' : 'none',
                        fontWeight: canResend ? 'bold' : 'normal',
                    }}
                >
                    {canResend 
                        ? (resendLoading ? 'Enviando...' : 'Reenviar código')
                        : `Espera ${timeLeft} segundos para reenviar el código`}
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