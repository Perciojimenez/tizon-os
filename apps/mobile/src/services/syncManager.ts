import NetInfo from '@react-native-community/netinfo';
import { offlineStorage, AccionOffline } from './offlineStorage';
import { tizonAPI } from './api';

/**
 * syncManager — Orquestador de sincronización offline/online.
 *
 *  - Detecta si hay conexión real a internet.
 *  - Al recuperar la conexión, ejecuta la cola de acciones pendientes
 *    (cambios hechos sin internet) contra el backend.
 *  - Refresca el cache local (mesas / reservas / clientes) para tener
 *    datos frescos disponibles la próxima vez que se pierda la conexión.
 *
 * Nota: los métodos de la API real son obtenerMesas / obtenerReservas /
 * buscarClientes / actualizarEstadoMesa / actualizarEstadoReserva.
 */
export const syncManager = {
  // ¿Hay conexión real a internet?
  async estaConectado(): Promise<boolean> {
    try {
      const state = await NetInfo.fetch();
      // isInternetReachable puede ser null mientras se determina; en ese
      // caso nos basamos en isConnected para no bloquear la app.
      const alcanzable =
        state.isInternetReachable === null ? true : state.isInternetReachable === true;
      return state.isConnected === true && alcanzable;
    } catch {
      return false;
    }
  },

  // Ejecutar la cola de acciones pendientes al reconectar.
  async sincronizarQueue(): Promise<{ exitosos: number; fallidos: number }> {
    const queue = await offlineStorage.leerQueue();
    if (queue.length === 0) return { exitosos: 0, fallidos: 0 };

    let exitosos = 0;
    let fallidos = 0;
    const pendientes: AccionOffline[] = [];

    for (const accion of queue) {
      try {
        switch (accion.tipo) {
          case 'cambiar_estado_mesa':
            await tizonAPI.actualizarEstadoMesa(
              accion.payload.mesaId,
              accion.payload.estado,
            );
            exitosos++;
            break;
          case 'cancelar_reserva':
            await tizonAPI.actualizarEstadoReserva(
              accion.payload.reservaId,
              'cancelada',
            );
            exitosos++;
            break;
          case 'sentar_reserva':
            await tizonAPI.actualizarEstadoReserva(
              accion.payload.reservaId,
              'sentada',
            );
            exitosos++;
            break;
          default:
            // Acción desconocida: la descartamos silenciosamente.
            break;
        }
      } catch (e) {
        // Si falla, la conservamos para reintentar en la próxima sync.
        fallidos++;
        pendientes.push(accion);
      }
    }

    // Solo dejamos en la cola las acciones que fallaron.
    if (pendientes.length > 0) {
      await offlineStorage.limpiarQueue();
      for (const p of pendientes) {
        await offlineStorage.agregarAccionQueue(p);
      }
    } else {
      await offlineStorage.limpiarQueue();
    }

    await offlineStorage.guardarUltimaSync();
    return { exitosos, fallidos };
  },

  // Refrescar todo el cache local con datos frescos del backend.
  async refrescarCache(): Promise<void> {
    try {
      const hoy = new Date().toISOString().split('T')[0];
      const [mesas, reservas, clientes] = await Promise.all([
        tizonAPI.obtenerMesas(),
        tizonAPI.obtenerReservas({ fecha: hoy }),
        tizonAPI.buscarClientes(undefined),
      ]);
      await Promise.all([
        offlineStorage.guardarMesas(mesas),
        offlineStorage.guardarReservas(reservas),
        offlineStorage.guardarClientes(clientes),
      ]);
      await offlineStorage.guardarUltimaSync();
    } catch (e) {
      console.warn('syncManager.refrescarCache error:', e);
    }
  },
};
