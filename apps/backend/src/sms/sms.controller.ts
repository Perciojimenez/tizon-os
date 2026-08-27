import { Controller, Post, Body, UseGuards, Get, Param, Query } from '@nestjs/common';
import { SmsService } from './sms.service';
import { AuthGuard } from '../auth/auth.guard';
import { supabaseAdmin } from '../config/supabase.config';

@Controller('sms')
export class SmsController {
  constructor(private smsService: SmsService) {}

  /**
   * Webhook de Twilio para SMS entrantes (no requiere autenticación).
   */
  @Post('webhook')
  async recibirSmsEntrante(@Body() body: any) {
    // body contiene: From, To, Body
    return this.smsService.procesarRespuestaSms(body.From, body.Body);
  }

  @Get('log/:clienteId')
  @UseGuards(AuthGuard)
  async obtenerLog(@Param('clienteId') clienteId: string) {
    return this.smsService.obtenerSmsLog(clienteId);
  }

  /**
   * Obtener resumen de mensajes enviados (últimos 50)
   */
  @Get('resumen')
  @UseGuards(AuthGuard)
  async obtenerResumen() {
    const { data } = await supabaseAdmin
      .from('sms_log')
      .select('id, tipo, estado, telefono, created_at, respuesta_cliente')
      .order('created_at', { ascending: false })
      .limit(50);
    return data || [];
  }

  /**
   * Estadísticas de mensajes
   */
  @Get('stats')
  @UseGuards(AuthGuard)
  async obtenerStats() {
    const hoy = new Date().toISOString().split('T')[0];
    const { data: todos } = await supabaseAdmin.from('sms_log').select('tipo, estado, created_at');
    const { data: hoyData } = await supabaseAdmin.from('sms_log').select('id').gte('created_at', hoy + 'T00:00:00');
    const enviados = todos?.filter(m => m.estado === 'enviado').length || 0;
    const fallidos = todos?.filter(m => m.estado === 'fallido').length || 0;
    const total = todos?.length || 0;
    const porTipo: Record<string, number> = {};
    todos?.forEach(m => { porTipo[m.tipo] = (porTipo[m.tipo] || 0) + 1; });
    return { total, enviados, fallidos, hoy: hoyData?.length || 0, porTipo };
  }

  /**
   * Envío manual desde la app
   */
  @Post('enviar-manual')
  @UseGuards(AuthGuard)
  async enviarManual(@Body() body: { clienteId: string; tipo: 'recordatorio' | 'agradecimiento' | 'confirmacion'; reservaId?: string }) {
    const { data: cliente } = await supabaseAdmin
      .from('clientes').select('nombre, telefono').eq('id', body.clienteId).single();
    if (!cliente?.telefono) return { ok: false, error: 'Cliente sin teléfono' };

    if (body.tipo === 'recordatorio' && body.reservaId) {
      const { data: reserva } = await supabaseAdmin
        .from('reservas').select('codigo_unico, hora_inicio').eq('id', body.reservaId).single();
      if (!reserva) return { ok: false, error: 'Reserva no encontrada' };
      await this.smsService.enviarSmsRecordatorio(body.clienteId, cliente.telefono, cliente.nombre, reserva.hora_inicio.slice(0, 5), reserva.codigo_unico);
      return { ok: true };
    }
    if (body.tipo === 'agradecimiento') {
      await this.smsService.enviarSmsAgradecimiento(body.clienteId, cliente.telefono, cliente.nombre);
      return { ok: true };
    }
    return { ok: false, error: 'Tipo no soportado' };
  }

  /**
   * ENDPOINT DE PRUEBA - Envía un mensaje de prueba para verificar configuración
   */
  @Post('test/enviar')
  async enviarSmsTest(@Body() body: { telefono: string; nombre: string; tipo?: string; canal?: 'sms' | 'whatsapp' }) {
    const { telefono, nombre, tipo = 'confirmacion', canal } = body;

    if (tipo === 'confirmacion') {
      return this.smsService.enviarSmsConfirmacion(
        null,
        telefono,
        nombre,
        'TZN-TEST',
        '2026-08-24',
        '20:00',
        2,
        canal,
      );
    } else if (tipo === 'recordatorio') {
      return this.smsService.enviarSmsRecordatorio(
        null,
        telefono,
        nombre,
        '20:00',
        'TZN-TEST',
        canal,
      );
    } else if (tipo === 'lista_espera') {
      return this.smsService.enviarSmsListaEspera(nombre, telefono, canal);
    } else if (tipo === 'agradecimiento') {
      return this.smsService.enviarSmsAgradecimiento(null, telefono, nombre, canal);
    }

    return { error: 'Tipo de mensaje no reconocido' };
  }
}
