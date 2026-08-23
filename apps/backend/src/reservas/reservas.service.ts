import { Injectable } from '@nestjs/common';
import { supabaseAdmin } from '../config/supabase.config';
import { CodigoUnicoService } from './codigo-unico.service';

@Injectable()
export class ReservasService {
  constructor(private codigoService: CodigoUnicoService) {}

  async crearReserva(clienteId: string, mesaId: string, fecha: string, horaInicio: string, numComensales: number, creadoPor: string, notasServicio?: string) {
    const codigoUnico = this.codigoService.generar();

    const { data, error } = await supabaseAdmin
      .from('reservas')
      .insert([{
        cliente_id: clienteId,
        mesa_id: mesaId,
        fecha,
        hora_inicio: horaInicio,
        num_comensales: numComensales,
        estado: 'confirmada',
        codigo_unico: codigoUnico,
        notas_servicio: notasServicio,
        creado_por: creadoPor,
      }])
      .select()
      .single();

    if (error) throw new Error(`Error al crear reserva: ${error.message}`);
    return data;
  }

  async obtenerReservas(filtros?: any) {
    let query = supabaseAdmin.from('reservas').select('*');
    
    if (filtros?.fecha) query = query.eq('fecha', filtros.fecha);
    if (filtros?.estado) query = query.eq('estado', filtros.estado);
    if (filtros?.clienteId) query = query.eq('cliente_id', filtros.clienteId);

    const { data, error } = await query.order('fecha', { ascending: false });
    if (error) throw new Error(`Error al obtener reservas: ${error.message}`);
    return data || [];
  }

  async obtenerReserva(id: string) {
    const { data, error } = await supabaseAdmin
      .from('reservas')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw new Error(`Error al obtener reserva: ${error.message}`);
    return data;
  }

  async actualizarEstado(id: string, nuevoEstado: string) {
    const { data, error } = await supabaseAdmin
      .from('reservas')
      .update({ estado: nuevoEstado })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(`Error al actualizar reserva: ${error.message}`);
    return data;
  }

  async cancelarReserva(id: string) {
    return this.actualizarEstado(id, 'cancelada');
  }

  async obtenerReservasPorFecha(fecha: string) {
    const { data, error } = await supabaseAdmin
      .from('reservas')
      .select('*')
      .eq('fecha', fecha)
      .order('hora_inicio', { ascending: true });
    
    if (error) throw new Error(`Error al obtener reservas por fecha: ${error.message}`);
    return data || [];
  }
}
