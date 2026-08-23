import { useState, useEffect } from 'react';
import { tizonAPI } from '../services/api';
import { useSalaStore, Mesa } from '../store/salaStore';

export const useMesas = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { mesas, setMesas } = useSalaStore();

  const cargarMesas = async () => {
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

  useEffect(() => {
    cargarMesas();
  }, []);

  return { mesas, loading, error, refetch: cargarMesas };
};
