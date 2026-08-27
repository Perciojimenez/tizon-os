import { useState, useEffect, useRef } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { syncManager } from '../services/syncManager';
import { offlineStorage } from '../services/offlineStorage';

/**
 * useNetworkStatus — Monitorea la conectividad en tiempo real.
 *
 *  - Expone si hay conexión (isConnected).
 *  - Cuando se recupera la conexión tras estar offline, dispara la
 *    sincronización de la cola pendiente y refresca el cache.
 *  - Expone isSyncing (mientras sincroniza) y lastSync (hora legible),
 *    además de pendientes (acciones en cola sin enviar).
 */
export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [pendientes, setPendientes] = useState<number>(0);

  // Usamos una ref para conocer el estado anterior sin re-suscribir el listener.
  const estabaConectado = useRef<boolean>(true);

  useEffect(() => {
    let montado = true;

    // Cargar el número de acciones pendientes al iniciar.
    offlineStorage.contarQueue().then((n) => {
      if (montado) setPendientes(n);
    });

    const unsubscribe = NetInfo.addEventListener(async (state) => {
      const connected =
        state.isConnected === true &&
        (state.isInternetReachable === null ? true : state.isInternetReachable === true);

      const veniaOffline = !estabaConectado.current;
      estabaConectado.current = connected;
      if (montado) setIsConnected(connected);

      // Si acabamos de recuperar la conexión, sincronizar.
      if (connected && veniaOffline) {
        if (montado) setIsSyncing(true);
        try {
          await syncManager.sincronizarQueue();
          await syncManager.refrescarCache();
        } catch (e) {
          console.warn('useNetworkStatus sync error:', e);
        }
        const restantes = await offlineStorage.contarQueue();
        if (montado) {
          setPendientes(restantes);
          setIsSyncing(false);
          setLastSync(new Date().toLocaleTimeString('es-DO'));
        }
      } else if (montado) {
        // Mantener el contador de pendientes actualizado.
        const n = await offlineStorage.contarQueue();
        setPendientes(n);
      }
    });

    return () => {
      montado = false;
      unsubscribe();
    };
  }, []);

  return { isConnected, isSyncing, lastSync, pendientes };
}
