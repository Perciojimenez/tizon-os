import { useState, useEffect } from 'react';
import { tizonAPI } from '../services/api';
import { useSalaStore } from '../store/salaStore';

export const useClientes = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { clientes, setClientes } = useSalaStore();

  // Cargar todos los clientes al montar la pantalla
  useEffect(() => {
    buscarTodos();
  }, []);

  const buscarTodos = async () => {
    setLoading(true);
    try {
      const data = await tizonAPI.buscarClientes(undefined);
      setClientes(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
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

  return { clientes, loading, error, buscar, crear };
};
