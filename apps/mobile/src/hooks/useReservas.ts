import { useState, useEffect } from 'react';
import { tizonAPI } from '../services/api';
import { useSalaStore, Reserva } from '../store/salaStore';

export const useReservas = (filtros?: any) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { reservas, setReservas } = useSalaStore();

  const cargarReservas = async () => {
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

  useEffect(() => {
    cargarReservas();
  }, []);

  return { reservas, loading, error, refetch: cargarReservas };
};
