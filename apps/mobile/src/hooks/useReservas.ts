import { useState, useEffect } from 'react';
import { tizonAPI } from '../services/api';
import { useSalaStore } from '../store/salaStore';
import { useAuthStore } from '../store/authStore';
import { syncManager } from '../services/syncManager';
import { offlineStorage } from '../services/offlineStorage';

export const useReservas = (filtros?: any) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const { reservas, setReservas } = useSalaStore();
  const token = useAuthStore((s) => s.token);

  // Serializamos los filtros para usarlos como dependencia estable
  const filtrosKey = JSON.stringify(filtros || {});

  const cargarReservas = async () => {
    if (!token) return;
    setLoading(true);

    // Sin conexión: mostramos lo último guardado en cache local.
    const conectado = await syncManager.estaConectado();
    if (!conectado) {
      const cache = await offlineStorage.leerReservas();
      setReservas(cache);
      setOffline(true);
      setError(null);
      setLoading(false);
      return;
    }

    try {
      const data = await tizonAPI.obtenerReservas(filtros);
      setReservas(data);
      await offlineStorage.guardarReservas(data); // refrescamos cache
      setOffline(false);
      setError(null);
    } catch (err) {
      const cache = await offlineStorage.leerReservas();
      if (cache.length > 0) {
        setReservas(cache);
        setOffline(true);
        setError(null);
      } else {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      }
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

  return { reservas, loading, error, offline, refetch: cargarReservas };
};
