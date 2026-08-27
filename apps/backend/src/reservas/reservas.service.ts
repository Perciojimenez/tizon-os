import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { supabaseAdmin } from '../config/supabase.config';
import { CodigoUnicoService } from './codigo-unico.service';
import { SmsService } from '../sms/sms.service';
import { SalaGateway } from '../websocket/websocket.gateway';
import { PushService } from '../push/push.service';

@Injectable()
export class ReservasService {
  constructor(
    private codigoService: CodigoUnicoService,
    private smsService: SmsService,
    @Inject(forwardRef(() => SalaGateway)) private salaGateway: SalaGateway,
    private pushService: PushService,
  ) {}

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

    // Emitir evento WebSocket para actualizar UI en tiempo real
    try {
      this.salaGateway.emitirReservaConfirmada(data.id, codigoUnico);
      console.log(`🔄 WebSocket: Reserva confirmada emitida (${codigoUnico})`);
    } catch (wsError) {
      console.error('⚠️ Error al emitir evento WebSocket:', wsError);
    }

    // Enviar SMS/WhatsApp de confirmación automáticamente
    try {
      const { data: cliente } = await supabaseAdmin
        .from('clientes')
        .select('nombre, telefono')
        .eq('id', clienteId)
        .single();

      if (cliente && cliente.telefono) {
        await this.smsService.enviarSmsConfirmacion(
          clienteId,
          cliente.telefono,
          cliente.nombre,
          codigoUnico,
          fecha,
          horaInicio,
          numComensales,
          'whatsapp', // Usar WhatsApp por defecto
        );
        console.log(`📱 WhatsApp de confirmación enviado a ${cliente.nombre} (${cliente.telefono})`);
      }

      // Notificación Push al staff sobre la nueva reserva
      try {
        await this.pushService.notificarNuevaReserva(
          codigoUnico,
          cliente?.nombre || 'Cliente',
          horaInicio?.slice(0, 5) || horaInicio,
        );
      } catch (pushError) {
        console.error('⚠️ Error al enviar notificación push:', pushError);
        // No bloquear la creación de la reserva si falla el push
      }
    } catch (smsError) {
      console.error('⚠️ Error al enviar WhatsApp de confirmación:', smsError);
      // No bloquear la creación de la reserva si falla el WhatsApp
    }

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

    // Emitir evento WebSocket para actualizar UI en tiempo real
    try {
      this.salaGateway.emitirReservaConfirmada(data.id, data.codigo_unico);
      console.log(`🔄 WebSocket: Reserva actualizada a estado "${nuevoEstado}" (${data.codigo_unico})`);
    } catch (wsError) {
      console.error('⚠️ Error al emitir evento WebSocket:', wsError);
    }

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
