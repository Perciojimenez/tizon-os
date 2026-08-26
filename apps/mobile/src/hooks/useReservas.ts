import { useState, useEffect } from 'react';
import { tizonAPI } from '../services/api';
import { useSalaStore } from '../store/salaStore';
import { useAuthStore } from '../store/authStore';

export const useReservas = (filtros?: any) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { reservas, setReservas } = useSalaStore();
  const token = useAuthStore((s) => s.token);

  // Serializamos los filtros para usarlos como dependencia estable
  const filtrosKey = JSON.stringify(filtros || {});

  const cargarReservas = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await tizonAPI.obtenerReservas(filtros);
      setReservas(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Recarga al montar, cuando el token esté listo, o cuando cambien los filtros (ej: fecha)
  useEffect(() => {
    if (token) {
      cargarReservas();
    }
  }, [token, filtrosKey]);

  return { reservas, loading, error, refetch: cargarReservas };
};
