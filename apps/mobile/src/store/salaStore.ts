import { create } from 'zustand';

export interface Mesa {
  id: string;
  numero: number;
  zona: 'salon_principal' | 'terraza' | 'privado';
  capacidad: number;
  estado: 'libre' | 'ocupada' | 'reservada' | 'por_salir';
}

export interface Reserva {
  id: string;
  cliente_id: string;
  mesa_id: string;
  fecha: string;
  hora_inicio: string;
  num_comensales: number;
  estado: 'pendiente' | 'confirmada' | 'sentada' | 'completada' | 'cancelada';
  codigo_unico: string;
}

export interface Cliente {
  id: string;
  nombre: string;
  telefono?: string;
  email?: string;
  termino_carne_preferido?: string;
  alergias?: string[];
  etiquetas?: string[];
  num_visitas?: number;
  gasto_total?: number;
}

interface SalaStore {
  mesas: Mesa[];
  reservas: Reserva[];
  clientes: Cliente[];
  listaEspera: any[];
  pacingEstado: { estado: string; personas: number; capacidad: number } | null;
  
  setMesas: (mesas: Mesa[]) => void;
  setReservas: (reservas: Reserva[]) => void;
  setClientes: (clientes: Cliente[]) => void;
  setListaEspera: (lista: any[]) => void;
  setPacingEstado: (estado: any) => void;
  
  actualizarMesa: (mesaId: string, estado: any) => void;
  actualizarReserva: (reservaId: string, estado: any) => void;
}

export const useSalaStore = create<SalaStore>((set) => ({
  mesas: [],
  reservas: [],
  clientes: [],
  listaEspera: [],
  pacingEstado: null,
  
  setMesas: (mesas) => set({ mesas }),
  setReservas: (reservas) => set({ reservas }),
  setClientes: (clientes) => set({ clientes }),
  setListaEspera: (listaEspera) => set({ listaEspera }),
  setPacingEstado: (pacingEstado) => set({ pacingEstado }),
  
  actualizarMesa: (mesaId, estado) =>
    set((s) => ({
      mesas: s.mesas.map((m) => (m.id === mesaId ? { ...m, ...estado } : m)),
    })),
  
  actualizarReserva: (reservaId, estado) =>
    set((s) => ({
      reservas: s.reservas.map((r) => (r.id === reservaId ? { ...r, ...estado } : r)),
    })),
}));
