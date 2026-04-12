import { useState, useEffect, useCallback } from 'react';

const RESEND_COOLDOWN = 120; // 2 minutos en segundos

const getStorageKey = (type) => `resendCode_${type}`;

const useResendCodeTimer = (type, email) => {
  const storageKey = getStorageKey(type);
  
  const getInitialState = () => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) return { lastSent: null, email: null };
      
      const { lastSent, email: storedEmail } = JSON.parse(stored);
      
      // Verificar si el email actual coincide
      if (storedEmail !== email) {
        return { lastSent: null, email: null };
      }
      
      // Verificar si el tiempo ya pasó
      const elapsed = Math.floor((Date.now() - lastSent) / 1000);
      if (elapsed >= RESEND_COOLDOWN) {
        localStorage.removeItem(storageKey);
        return { lastSent: null, email: null };
      }
      
      return { lastSent, email: storedEmail };
    } catch {
      return { lastSent: null, email: null };
    }
  };

  // Siempre iniciar con cooldown al entrar a la página
  const [timeLeft, setTimeLeft] = useState(RESEND_COOLDOWN);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    // Si hay un registro previo en localStorage, usar ese tiempo
    const { lastSent } = getInitialState();
    if (lastSent) {
      const elapsed = Math.floor((Date.now() - lastSent) / 1000);
      const remaining = Math.max(0, RESEND_COOLDOWN - elapsed);
      setTimeLeft(remaining);
      setCanResend(remaining === 0);
    }
  }, [email]);

  useEffect(() => {
    if (canResend) return;
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }
    
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          localStorage.removeItem(storageKey);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [canResend, timeLeft, storageKey]);

  const startTimer = useCallback(() => {
    const now = Date.now();
    localStorage.setItem(storageKey, JSON.stringify({
      lastSent: now,
      email
    }));
    setTimeLeft(RESEND_COOLDOWN);
    setCanResend(false);
  }, [storageKey, email]);

  const resetTimer = useCallback(() => {
    localStorage.removeItem(storageKey);
    setTimeLeft(RESEND_COOLDOWN);
    setCanResend(false);
  }, [storageKey]);

  const formatTime = useCallback(() => {
    const min = Math.floor(timeLeft / 60);
    const sec = timeLeft % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  }, [timeLeft]);

  return {
    timeLeft,
    canResend,
    startTimer,
    resetTimer,
    formatTime
  };
};

export default useResendCodeTimer;
export { RESEND_COOLDOWN };