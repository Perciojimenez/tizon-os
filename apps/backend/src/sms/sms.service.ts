import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { supabaseAdmin } from '../config/supabase.config';
import * as twilio from 'twilio';
import { SalaGateway } from '../websocket/websocket.gateway';

export type CanalMensaje = 'sms' | 'whatsapp';

@Injectable()
export class SmsService {
  private twilioSid = process.env.TWILIO_ACCOUNT_SID;
  private twilioToken = process.env.TWILIO_AUTH_TOKEN;
  // Número para SMS tradicional (ej: +14247244485)
  private twilioPhone = process.env.TWILIO_PHONE_NUMBER;
  // Número de WhatsApp de Twilio (ej: +14155238886 del sandbox, o tu número aprobado)
  private twilioWhatsApp = process.env.TWILIO_WHATSAPP_NUMBER;
  // Canal por defecto: 'whatsapp' o 'sms' (configurable por entorno)
  private canalDefault: CanalMensaje =
    (process.env.CANAL_DEFAULT as CanalMensaje) || 'whatsapp';
  private twilioClient: twilio.Twilio;

  constructor(
    @Inject(forwardRef(() => SalaGateway)) private salaGateway: SalaGateway,
  ) {
    if (this.twilioSid && this.twilioToken) {
      this.twilioClient = twilio.default(this.twilioSid, this.twilioToken);
    } else {
      console.warn('⚠️ Twilio no configurado. Los mensajes se registrarán pero no se enviarán.');
    }
  }

  /**
   * Normaliza un número al formato que Twilio requiere según el canal.
   * - SMS:      +14247244485
   * - WhatsApp: whatsapp:+14247244485
   */
  private formatearDireccion(telefono: string, canal: CanalMensaje): string {
    // Quitar cualquier prefijo previo para evitar duplicados
    const limpio = telefono.replace(/^whatsapp:/i, '').trim();
    return canal === 'whatsapp' ? `whatsapp:${limpio}` : limpio;
  }

  /**
   * Envía un mensaje por Twilio usando el canal indicado (SMS o WhatsApp).
   * Si WhatsApp falla y hay número SMS configurado, hace fallback automático a SMS.
   * Devuelve { sid, canal } del canal que finalmente entregó el mensaje.
   */
  private async enviarMensaje(
    telefono: string,
    mensaje: string,
    canal: CanalMensaje = this.canalDefault,
  ): Promise<{ sid: string; canal: CanalMensaje }> {
    if (!this.twilioClient) {
      throw new Error('Twilio no está configurado correctamente');
    }

    const from =
      canal === 'whatsapp'
        ? this.twilioWhatsApp && `whatsapp:${this.twilioWhatsApp}`
        : this.twilioPhone;

    if (!from) {
      throw new Error(`No hay número configurado para el canal '${canal}'`);
    }

    try {
      const result = await this.twilioClient.messages.create({
        body: mensaje,
        from,
        to: this.formatearDireccion(telefono, canal),
      });
      return { sid: result.sid, canal };
    } catch (error) {
      console.error(`Error al enviar por ${canal}:`, error);

      // Fallback automático: si falla WhatsApp, intentar SMS
      if (canal === 'whatsapp' && this.twilioPhone) {
        console.warn('↩️ Fallback a SMS...');
        const result = await this.twilioClient.messages.create({
          body: mensaje,
          from: this.twilioPhone,
          to: this.formatearDireccion(telefono, 'sms'),
        });
        return { sid: result.sid, canal: 'sms' };
      }
      throw error;
    }
  }

  /**
   * Alias retrocompatible. Envía por el canal por defecto.
   */
  private async enviarSms(telefono: string, mensaje: string): Promise<string> {
    const { sid } = await this.enviarMensaje(telefono, mensaje, this.canalDefault);
    return sid;
  }

  async registrarSms(clienteId: string | null, telefono: string, tipo: string, mensaje: string, estado: string, respuesta?: string) {
    const { data, error } = await supabaseAdmin
      .from('sms_log')
      .insert([{
        cliente_id: clienteId,
        telefono,
        tipo,
        mensaje,
        estado,
        respuesta_cliente: respuesta,
      }])
      .select()
      .single();

    if (error) throw new Error(`Error al registrar SMS: ${error.message}`);
    return data;
  }

  async enviarSmsConfirmacion(clienteId: string, telefono: string, nombreCliente: string, codigoUnico: string, fecha: string, hora: string, numComensales: number, canal?: CanalMensaje) {
    const mensaje = `¡Hola ${nombreCliente}! Tu reserva en Tizón Meats para ${fecha} a las ${hora} (${numComensales} personas) está confirmada. Código: ${codigoUnico}. Te esperamos.`;
    
    try {
      const { canal: canalUsado } = await this.enviarMensaje(telefono, mensaje, canal ?? this.canalDefault);
      return this.registrarSms(clienteId, telefono, 'confirmacion', mensaje, 'enviado', `canal:${canalUsado}`);
    } catch (error) {
      return this.registrarSms(clienteId, telefono, 'confirmacion', mensaje, 'fallido');
    }
  }

  async enviarSmsRecordatorio(clienteId: string, telefono: string, nombreCliente: string, hora: string, codigoUnico: string, canal?: CanalMensaje) {
    const mensaje = `Hola ${nombreCliente}, te esperamos hoy a las ${hora} en Tizón Meats. Código: ${codigoUnico}. Responde 1 para confirmar, 2 para cancelar.`;
    
    try {
      const { canal: canalUsado } = await this.enviarMensaje(telefono, mensaje, canal ?? this.canalDefault);
      return this.registrarSms(clienteId, telefono, 'recordatorio', mensaje, 'enviado', `canal:${canalUsado}`);
    } catch (error) {
      return this.registrarSms(clienteId, telefono, 'recordatorio', mensaje, 'fallido');
    }
  }

  async enviarSmsListaEspera(nombreGrupo: string, telefono: string, canal?: CanalMensaje) {
    const mensaje = `¡Hola ${nombreGrupo}! Tu mesa en Tizón Meats está casi lista. Por favor acércate a la hostess. ¡Gracias!`;
    
    try {
      const { canal: canalUsado } = await this.enviarMensaje(telefono, mensaje, canal ?? this.canalDefault);
      return this.registrarSms(null, telefono, 'lista_espera', mensaje, 'enviado', `canal:${canalUsado}`);
    } catch (error) {
      return this.registrarSms(null, telefono, 'lista_espera', mensaje, 'fallido');
    }
  }

  async enviarSmsAgradecimiento(clienteId: string, telefono: string, nombreCliente: string, canal?: CanalMensaje) {
    const mensaje = `Gracias por visitarnos hoy en Tizón Meats, ${nombreCliente}. ¿Cómo estuvo tu corte? Califícanos en tizon.me/review`;
    
    try {
      const { canal: canalUsado } = await this.enviarMensaje(telefono, mensaje, canal ?? this.canalDefault);
      return this.registrarSms(clienteId, telefono, 'agradecimiento', mensaje, 'enviado', `canal:${canalUsado}`);
    } catch (error) {
      return this.registrarSms(clienteId, telefono, 'agradecimiento', mensaje, 'fallido');
    }
  }

  async obtenerSmsLog(clienteId: string) {
    const { data, error } = await supabaseAdmin
      .from('sms_log')
      .select('*')
      .eq('cliente_id', clienteId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Error: ${error.message}`);
    return data || [];
  }

  async procesarRespuestaSms(telefono: string, respuesta: string) {
    const texto = respuesta.trim().toLowerCase();

    // Detectar canal y normalizar el número (WhatsApp llega como 'whatsapp:+1...')
    const esWhatsApp = /^whatsapp:/i.test(telefono);
    const telefonoLimpio = telefono.replace(/^whatsapp:/i, '').trim();
    const canalEntrante: CanalMensaje = esWhatsApp ? 'whatsapp' : 'sms';
    console.log(`📥 Respuesta entrante por ${canalEntrante} desde ${telefonoLimpio}: "${respuesta}"`);
    
    // Buscar la última reserva activa del cliente con este teléfono
    const { data: cliente } = await supabaseAdmin
      .from('clientes')
      .select('id, nombre')
      .eq('telefono', telefonoLimpio)
      .single();

    if (!cliente) {
      console.log(`Cliente no encontrado para teléfono: ${telefono}`);
      return { procesado: false, mensaje: 'Cliente no encontrado' };
    }

    const { data: reserva } = await supabaseAdmin
      .from('reservas')
      .select('*')
      .eq('cliente_id', cliente.id)
      .in('estado', ['confirmada', 'pendiente'])
      .order('fecha', { ascending: true })
      .limit(1)
      .single();

    if (!reserva) {
      console.log(`No hay reservas activas para ${cliente.nombre}`);
      return { procesado: false, mensaje: 'No hay reservas activas' };
    }

    // Procesar respuesta
    if (texto === '1' || texto.includes('confirmar') || texto.includes('sí') || texto.includes('si')) {
      // Confirmar reserva
      await supabaseAdmin
        .from('reservas')
        .update({ estado: 'confirmada' })
        .eq('id', reserva.id);

      await this.registrarSms(cliente.id, telefonoLimpio, 'recordatorio', respuesta, 'recibido', `1 - confirmada (${canalEntrante})`);
      
      // Emitir evento WebSocket para actualizar UI en tiempo real
      try {
        this.salaGateway.emitirReservaConfirmada(reserva.id, reserva.codigo_unico);
        console.log(`🔄 WebSocket: Cliente confirmó reserva ${reserva.codigo_unico} vía ${canalEntrante}`);
      } catch (wsError) {
        console.error('⚠️ Error al emitir evento WebSocket:', wsError);
      }

      return { procesado: true, accion: 'confirmada', reservaId: reserva.id };
    } 
    else if (texto === '2' || texto.includes('cancelar') || texto.includes('no')) {
      // Cancelar reserva
      await supabaseAdmin
        .from('reservas')
        .update({ estado: 'cancelada' })
        .eq('id', reserva.id);

      await this.registrarSms(cliente.id, telefonoLimpio, 'recordatorio', respuesta, 'recibido', `2 - cancelada (${canalEntrante})`);

      // Emitir evento WebSocket para actualizar UI en tiempo real
      try {
        this.salaGateway.emitirReservaConfirmada(reserva.id, reserva.codigo_unico);
        console.log(`🔄 WebSocket: Cliente canceló reserva ${reserva.codigo_unico} vía ${canalEntrante}`);
      } catch (wsError) {
        console.error('⚠️ Error al emitir evento WebSocket:', wsError);
      }

      return { procesado: true, accion: 'cancelada', reservaId: reserva.id };
    }

    // Respuesta no reconocida
    await this.registrarSms(cliente.id, telefonoLimpio, 'recordatorio', respuesta, 'recibido', `no reconocida (${canalEntrante})`);
    return { procesado: false, mensaje: 'Respuesta no reconocida' };
  }
}
