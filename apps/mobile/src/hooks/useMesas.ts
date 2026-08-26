import { useState, useEffect } from 'react';
import { tizonAPI } from '../services/api';
import { useSalaStore } from '../store/salaStore';
import { useAuthStore } from '../store/authStore';

export const useMesas = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { mesas, setMesas } = useSalaStore();
  const token = useAuthStore((s) => s.token); // reactivo: se recarga cuando el token cambia

  const cargarMesas = async () => {
    // Sin token no tiene sentido llamar (evita el 401 silencioso)
    if (!token) return;
    setLoading(true);
    try {
      const data = await tizonAPI.obtenerMesas();
      setMesas(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Se ejecuta al montar Y cada vez que el token cambia (login, restauración, refresh)
  useEffect(() => {
    if (token) {
      cargarMesas();
    }
  }, [token]);

  return { mesas, loading, error, refetch: cargarMesas };
};
