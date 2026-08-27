import { useState, useEffect } from 'react';
import { tizonAPI } from '../services/api';
import { useSalaStore } from '../store/salaStore';
import { useAuthStore } from '../store/authStore';
import { syncManager } from '../services/syncManager';
import { offlineStorage } from '../services/offlineStorage';

export const useMesas = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const { mesas, setMesas } = useSalaStore();
  const token = useAuthStore((s) => s.token); // reactivo: se recarga cuando el token cambia

  const cargarMesas = async () => {
    // Sin token no tiene sentido llamar (evita el 401 silencioso)
    if (!token) return;
    setLoading(true);

    // Sin conexión: mostramos lo último guardado en cache local.
    const conectado = await syncManager.estaConectado();
    if (!conectado) {
      const cache = await offlineStorage.leerMesas();
      setMesas(cache);
      setOffline(true);
      setError(null);
      setLoading(false);
      return;
    }

    try {
      const data = await tizonAPI.obtenerMesas();
      setMesas(data);
      await offlineStorage.guardarMesas(data); // refrescamos cache
      setOffline(false);
      setError(null);
    } catch (err) {
      // Falló la red pese a estar "conectado": caemos al cache si existe.
      const cache = await offlineStorage.leerMesas();
      if (cache.length > 0) {
        setMesas(cache);
        setOffline(true);
        setError(null);
      } else {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      }
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

  return { mesas, loading, error, offline, refetch: cargarMesas };
};
