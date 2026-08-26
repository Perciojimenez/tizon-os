import { API_BASE_URL } from '../config/api';
import { useAuthStore } from '../store/authStore';

export class TizonAPI {
  private baseURL = API_BASE_URL;

  /**
   * Mantenido por compatibilidad. El token real se lee siempre
   * directamente del authStore (fuente única de verdad), de modo que
   * cualquier request use el JWT vigente del usuario autenticado.
   */
  setToken(_token: string) {
    // no-op: el token se obtiene del authStore en getHeaders()
  }

  private getHeaders() {
    // Fuente única de verdad: el token guardado tras el login en Supabase.
    const token = useAuthStore.getState().token;
    return {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    };
  }

  // === MESAS ===
  async obtenerMesas() {
    const res = await fetch(`${this.baseURL}/mesas`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Error al obtener mesas');
    return res.json();
  }

  async obtenerMesa(id: string) {
    const res = await fetch(`${this.baseURL}/mesas/${id}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Error al obtener mesa');
    return res.json();
  }

  async actualizarEstadoMesa(id: string, estado: string) {
    const res = await fetch(`${this.baseURL}/mesas/${id}/estado`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ estado }),
    });
    if (!res.ok) throw new Error('Error al actualizar mesa');
    return res.json();
  }

  // === RESERVAS ===
  async obtenerReservas(filtros?: any) {
    const query = new URLSearchParams(filtros).toString();
    const res = await fetch(`${this.baseURL}/reservas?${query}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Error al obtener reservas');
    return res.json();
  }

  async crearReserva(clienteId: string, mesaId: string, fecha: string, horaInicio: string, numComensales: number) {
    const res = await fetch(`${this.baseURL}/reservas`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        clienteId,
        mesaId,
        fecha,
        horaInicio,
        numComensales,
      }),
    });
    if (!res.ok) throw new Error('Error al crear reserva');
    return res.json();
  }

  async actualizarEstadoReserva(id: string, estado: string) {
    const res = await fetch(`${this.baseURL}/reservas/${id}/estado`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ estado }),
    });
    if (!res.ok) throw new Error('Error al actualizar reserva');
    return res.json();
  }

  // === CLIENTES ===
  async buscarClientes(busqueda?: string) {
    const query = busqueda ? `?busqueda=${encodeURIComponent(busqueda)}` : '';
    const res = await fetch(`${this.baseURL}/clientes${query}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Error al buscar clientes');
    return res.json();
  }

  async obtenerCliente(id: string) {
    const res = await fetch(`${this.baseURL}/clientes/${id}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Error al obtener cliente');
    return res.json();
  }

  async crearCliente(nombre: string, telefono?: string, email?: string, terminoCarnePreferido?: string) {
    const res = await fetch(`${this.baseURL}/clientes`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ nombre, telefono, email, terminoCarnePreferido }),
    });
    if (!res.ok) throw new Error('Error al crear cliente');
    return res.json();
  }

  async actualizarCliente(
    id: string,
    updates: Partial<{
      nombre: string;
      telefono: string;
      email: string;
      termino_carne_preferido: string;
      alergias: string[];
      etiquetas: string[];
    }>,
  ) {
    const res = await fetch(`${this.baseURL}/clientes/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Error al actualizar cliente');
    return res.json();
  }

  async toggleVIP(id: string) {
    const res = await fetch(`${this.baseURL}/clientes/${id}/vip`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Error al marcar VIP');
    return res.json();
  }

  async obtenerReservasCliente(clienteId: string) {
    const res = await fetch(`${this.baseURL}/reservas?clienteId=${clienteId}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) return [];
    return res.json();
  }

  // === LISTA DE ESPERA ===
  async obtenerListaEspera() {
    const res = await fetch(`${this.baseURL}/lista-espera`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Error al obtener lista de espera');
    return res.json();
  }

  async crearWalkIn(nombreGrupo: string, numPersonas: number, telefono?: string) {
    const res = await fetch(`${this.baseURL}/lista-espera`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ nombreGrupo, numPersonas, telefono }),
    });
    if (!res.ok) throw new Error('Error al crear walk-in');
    return res.json();
  }

  async actualizarEstadoEspera(id: string, estado: string) {
    const res = await fetch(`${this.baseURL}/lista-espera/${id}/estado`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ estado }),
    });
    if (!res.ok) throw new Error('Error al actualizar espera');
    return res.json();
  }
}

export const tizonAPI = new TizonAPI();
