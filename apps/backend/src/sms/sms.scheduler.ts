import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SmsService } from './sms.service';
import { supabaseAdmin } from '../config/supabase.config';

/**
 * Cron jobs de WhatsApp/SMS:
 *  1. Recordatorios 2h antes de cada reserva (cada 5 min)
 *  2. Agradecimiento automático al completar una reserva (cada 10 min)
 */
@Injectable()
export class SmsScheduler {
  private readonly logger = new Logger(SmsScheduler.name);

  constructor(private readonly smsService: SmsService) {}

  // ──────────────────────────────────────────────────────────────────────────
  //  RECORDATORIOS — cada 5 minutos busca reservas a 2h vista
  // ──────────────────────────────────────────────────────────────────────────
  @Cron('0 */5 * * * *') // Cada 5 minutos
  async enviarRecordatorios() {
    try {
      const ahora = new Date();
      const hoy = ahora.toISOString().split('T')[0];

      // Ventana: reservas cuya hora de inicio esté entre 1h55m y 2h05m desde ahora
      const ventanaMin = new Date(ahora.getTime() + 115 * 60 * 1000); // +1h55m
      const ventanaMax = new Date(ahora.getTime() + 125 * 60 * 1000); // +2h05m
      const horaMin = ventanaMin.toTimeString().slice(0, 5); // HH:MM
      const horaMax = ventanaMax.toTimeString().slice(0, 5);

      // Buscar reservas confirmadas en esa ventana horaria que NO tengan recordatorio ya enviado
      const { data: reservas } = await supabaseAdmin
        .from('reservas')
        .select('id, codigo_unico, hora_inicio, num_comensales, cliente_id, recordatorio_enviado')
        .eq('fecha', hoy)
        .eq('estado', 'confirmada')
        .is('recordatorio_enviado', null)  // solo las que no tienen recordatorio aún
        .gte('hora_inicio', horaMin + ':00')
        .lte('hora_inicio', horaMax + ':59');

      if (!reservas || reservas.length === 0) return;

      for (const reserva of reservas) {
        try {
          // Obtener datos del cliente
          const { data: cliente } = await supabaseAdmin
            .from('clientes')
            .select('nombre, telefono')
            .eq('id', reserva.cliente_id)
            .single();

          if (!cliente?.telefono) continue;

          await this.smsService.enviarSmsRecordatorio(
            reserva.cliente_id,
            cliente.telefono,
            cliente.nombre,
            reserva.hora_inicio.slice(0, 5),
            reserva.codigo_unico,
          );

          // Marcar como enviado para no volver a enviar
          await supabaseAdmin
            .from('reservas')
            .update({ recordatorio_enviado: new Date().toISOString() })
            .eq('id', reserva.id);

          this.logger.log(`✅ Recordatorio enviado a ${cliente.nombre} (${reserva.codigo_unico})`);
        } catch (err) {
          this.logger.error(`Error recordatorio reserva ${reserva.id}:`, err);
        }
      }
    } catch (err) {
      this.logger.error('Error en cron de recordatorios:', err);
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  //  AGRADECIMIENTOS — cada 10 min busca reservas completadas sin agradecimiento
  // ──────────────────────────────────────────────────────────────────────────
  @Cron('0 */10 * * * *') // Cada 10 minutos
  async enviarAgradecimientos() {
    try {
      const hoy = new Date().toISOString().split('T')[0];

      // Reservas completadas HOY que no tienen agradecimiento enviado
      const { data: reservas } = await supabaseAdmin
        .from('reservas')
        .select('id, codigo_unico, cliente_id, agradecimiento_enviado')
        .eq('fecha', hoy)
        .eq('estado', 'completada')
        .is('agradecimiento_enviado', null);

      if (!reservas || reservas.length === 0) return;

      for (const reserva of reservas) {
        try {
          const { data: cliente } = await supabaseAdmin
            .from('clientes')
            .select('nombre, telefono')
            .eq('id', reserva.cliente_id)
            .single();

          if (!cliente?.telefono) continue;

          await this.smsService.enviarSmsAgradecimiento(
            reserva.cliente_id,
            cliente.telefono,
            cliente.nombre,
          );

          await supabaseAdmin
            .from('reservas')
            .update({ agradecimiento_enviado: new Date().toISOString() })
            .eq('id', reserva.id);

          this.logger.log(`💌 Agradecimiento enviado a ${cliente.nombre} (${reserva.codigo_unico})`);
        } catch (err) {
          this.logger.error(`Error agradecimiento reserva ${reserva.id}:`, err);
        }
      }
    } catch (err) {
      this.logger.error('Error en cron de agradecimientos:', err);
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  //  AVISO LISTA DE ESPERA — lo llama directamente el controller cuando el staff
  //  toca "Avisar" en la app (no necesita cron, es acción manual)
  // ──────────────────────────────────────────────────────────────────────────
}
