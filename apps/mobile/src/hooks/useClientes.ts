import { useState, useEffect } from 'react';
import { tizonAPI } from '../services/api';
import { useSalaStore } from '../store/salaStore';
import { useAuthStore } from '../store/authStore';
import { syncManager } from '../services/syncManager';
import { offlineStorage } from '../services/offlineStorage';

export const useClientes = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const { clientes, setClientes } = useSalaStore();
  const token = useAuthStore((s) => s.token);

  // Cargar todos los clientes al montar la pantalla y cuando el token esté listo
  useEffect(() => {
    if (token) {
      buscarTodos();
    }
  }, [token]);

  const buscarTodos = async () => {
    if (!token) return;
    setLoading(true);

    // Sin conexión: mostramos lo último guardado en cache local.
    const conectado = await syncManager.estaConectado();
    if (!conectado) {
      const cache = await offlineStorage.leerClientes();
      setClientes(cache);
      setOffline(true);
      setError(null);
      setLoading(false);
      return;
    }

    try {
      const data = await tizonAPI.buscarClientes(undefined);
      setClientes(data);
      await offlineStorage.guardarClientes(data); // refrescamos cache
      setOffline(false);
      setError(null);
    } catch (err) {
      const cache = await offlineStorage.leerClientes();
      if (cache.length > 0) {
        setClientes(cache);
        setOffline(true);
        setError(null);
      } else {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      }
    } finally {
      setLoading(false);
    }
  };

  const buscar = async (busqueda?: string) => {
    setLoading(true);
    try {
      const data = await tizonAPI.buscarClientes(busqueda);
      setClientes(data);
      setError(null);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const crear = async (nombre: string, telefono?: string, email?: string) => {
    setLoading(true);
    try {
      const cliente = await tizonAPI.crearCliente(nombre, telefono, email);
      setClientes([...clientes, cliente]);
      return cliente;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { clientes, loading, error, offline, buscar, crear };
};
