import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * offlineStorage — Sistema de cache local y cola de acciones pendientes.
 *
 * Permite que la app siga funcionando sin internet:
 *  - Guarda copias de mesas / reservas / clientes en el dispositivo.
 *  - Encola las acciones críticas hechas sin conexión para ejecutarlas
 *    automáticamente cuando vuelva el internet.
 *
 * Todos los textos y comentarios en español (Proyecto Tizón OS).
 */

const KEYS = {
  MESAS: 'tizon_mesas_cache',
  RESERVAS: 'tizon_reservas_cache',
  CLIENTES: 'tizon_clientes_cache',
  QUEUE: 'tizon_offline_queue',
  LAST_SYNC: 'tizon_last_sync',
};

// Tipos de acciones que se pueden encolar estando sin conexión.
export type TipoAccionOffline =
  | 'cambiar_estado_mesa'
  | 'cancelar_reserva'
  | 'sentar_reserva';

export interface AccionOffline {
  tipo: TipoAccionOffline;
  payload: any;
  timestamp: number;
}

export const offlineStorage = {
  // ─────────────────────────────────────────────
  // CACHE — guardar datos localmente
  // ─────────────────────────────────────────────
  async guardarMesas(mesas: any[]) {
    try {
      await AsyncStorage.setItem(KEYS.MESAS, JSON.stringify(mesas ?? []));
    } catch (e) {
      console.warn('offlineStorage.guardarMesas error:', e);
    }
  },
  async guardarReservas(reservas: any[]) {
    try {
      await AsyncStorage.setItem(KEYS.RESERVAS, JSON.stringify(reservas ?? []));
    } catch (e) {
      console.warn('offlineStorage.guardarReservas error:', e);
    }
  },
  async guardarClientes(clientes: any[]) {
    try {
      await AsyncStorage.setItem(KEYS.CLIENTES, JSON.stringify(clientes ?? []));
    } catch (e) {
      console.warn('offlineStorage.guardarClientes error:', e);
    }
  },

  // ─────────────────────────────────────────────
  // CACHE — leer datos guardados
  // ─────────────────────────────────────────────
  async leerMesas(): Promise<any[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.MESAS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  async leerReservas(): Promise<any[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.RESERVAS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  async leerClientes(): Promise<any[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.CLIENTES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  // ─────────────────────────────────────────────
  // COLA — acciones pendientes hechas sin conexión
  // ─────────────────────────────────────────────
  async agregarAccionQueue(accion: AccionOffline) {
    try {
      const queue = await this.leerQueue();
      queue.push(accion);
      await AsyncStorage.setItem(KEYS.QUEUE, JSON.stringify(queue));
    } catch (e) {
      console.warn('offlineStorage.agregarAccionQueue error:', e);
    }
  },
  async leerQueue(): Promise<AccionOffline[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.QUEUE);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  async contarQueue(): Promise<number> {
    const queue = await this.leerQueue();
    return queue.length;
  },
  async limpiarQueue() {
    try {
      await AsyncStorage.setItem(KEYS.QUEUE, JSON.stringify([]));
    } catch (e) {
      console.warn('offlineStorage.limpiarQueue error:', e);
    }
  },

  // ─────────────────────────────────────────────
  // ÚLTIMA SINCRONIZACIÓN
  // ─────────────────────────────────────────────
  async guardarUltimaSync() {
    try {
      await AsyncStorage.setItem(KEYS.LAST_SYNC, new Date().toISOString());
    } catch (e) {
      console.warn('offlineStorage.guardarUltimaSync error:', e);
    }
  },
  async leerUltimaSync(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(KEYS.LAST_SYNC);
    } catch {
      return null;
    }
  },
};
