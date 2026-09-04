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
   * Convierte un teléfono a formato E.164 (+1XXXXXXXXXX).
   *
   * Twilio SIEMPRE requiere E.164. Si el número llega como "809-521-7466",
   * "8295217466" o "(829) 521 7466", Twilio lo RECHAZA y el mensaje nunca
   * se entrega. Esta función lo normaliza:
   *   - Si ya viene con '+', se respeta (solo se limpian espacios/guiones).
   *   - 10 dígitos (RD 809/829/849, EE.UU./Canadá) => se antepone +1.
   *   - 11 dígitos que empiezan con 1 => se antepone +.
   *   - Cualquier otro caso con dígitos => se antepone + tal cual.
   */
  private normalizarE164(telefono: string): string {
    if (!telefono) return telefono;
    const limpio = telefono.replace(/^whatsapp:/i, '').trim();

    // Ya está en E.164: solo quitar espacios/guiones internos.
    if (limpio.startsWith('+')) {
      return '+' + limpio.slice(1).replace(/\D/g, '');
    }

    // Solo dígitos.
    const digitos = limpio.replace(/\D/g, '');
    if (digitos.length === 10) {
      // Número local de RD/EE.UU./Canadá (NANP): anteponer +1.
      return `+1${digitos}`;
    }
    if (digitos.length === 11 && digitos.startsWith('1')) {
      return `+${digitos}`;
    }
    // Fallback: anteponer + a los dígitos existentes.
    return `+${digitos}`;
  }

  /**
   * Normaliza un número al formato que Twilio requiere según el canal.
   * - SMS:      +14247244485
   * - WhatsApp: whatsapp:+14247244485
   */
  private formatearDireccion(telefono: string, canal: CanalMensaje): string {
    const e164 = this.normalizarE164(telefono);
    return canal === 'whatsapp' ? `whatsapp:${e164}` : e164;
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

    const to = this.formatearDireccion(telefono, canal);

    try {
      const result = await this.twilioClient.messages.create({
        body: mensaje,
        from,
        to,
      });
      // status suele ser 'queued'/'sent'. OJO: en el Sandbox de WhatsApp el
      // mensaje se acepta (queued) aunque el destinatario NO haya enviado
      // "join <palabra>": Twilio lo encola pero nunca lo entrega.
      console.log(`📤 Twilio aceptó mensaje ${result.sid} (${canal}) → ${to} | status=${result.status}`);
      return { sid: result.sid, canal };
    } catch (error: any) {
      // Log detallado del error real de Twilio para poder diagnosticar.
      console.error(
        `❌ Error al enviar por ${canal} → ${to}: ` +
          `code=${error?.code} status=${error?.status} msg=${error?.message} moreInfo=${error?.moreInfo}`,
      );

      // Fallback automático: si falla WhatsApp, intentar SMS
      if (canal === 'whatsapp' && this.twilioPhone) {
        console.warn('↩️ Fallback a SMS...');
        const smsTo = this.formatearDireccion(telefono, 'sms');
        try {
          const result = await this.twilioClient.messages.create({
            body: mensaje,
            from: this.twilioPhone,
            to: smsTo,
          });
          console.log(`📤 Twilio aceptó SMS (fallback) ${result.sid} → ${smsTo} | status=${result.status}`);
          return { sid: result.sid, canal: 'sms' };
        } catch (smsError: any) {
          console.error(
            `❌ Fallback SMS también falló → ${smsTo}: ` +
              `code=${smsError?.code} msg=${smsError?.message}`,
          );
          throw smsError;
        }
      }
      throw error;
    }
  }

  /** Devuelve un texto corto y útil para diagnosticar un error de Twilio. */
  private detalleError(error: any): string {
    if (!error) return 'error desconocido';
    const code = error.code ? `code:${error.code}` : '';
    const msg = error.message || String(error);
    return `${code} ${msg}`.trim().slice(0, 250);
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
      console.error('❌ Falló confirmación:', this.detalleError(error));
      return this.registrarSms(clienteId, telefono, 'confirmacion', mensaje, 'fallido', this.detalleError(error));
    }
  }

  async enviarSmsRecordatorio(clienteId: string, telefono: string, nombreCliente: string, hora: string, codigoUnico: string, canal?: CanalMensaje) {
    const mensaje = `Hola ${nombreCliente}, te esperamos hoy a las ${hora} en Tizón Meats. Código: ${codigoUnico}. Responde 1 para confirmar, 2 para cancelar.`;
    
    try {
      const { canal: canalUsado } = await this.enviarMensaje(telefono, mensaje, canal ?? this.canalDefault);
      return this.registrarSms(clienteId, telefono, 'recordatorio', mensaje, 'enviado', `canal:${canalUsado}`);
    } catch (error) {
      console.error('❌ Falló recordatorio:', this.detalleError(error));
      return this.registrarSms(clienteId, telefono, 'recordatorio', mensaje, 'fallido', this.detalleError(error));
    }
  }

  async enviarSmsListaEspera(nombreGrupo: string, telefono: string, canal?: CanalMensaje) {
    const mensaje = `¡Hola ${nombreGrupo}! Tu mesa en Tizón Meats está casi lista. Por favor acércate a la hostess. ¡Gracias!`;
    
    try {
      const { canal: canalUsado } = await this.enviarMensaje(telefono, mensaje, canal ?? this.canalDefault);
      return this.registrarSms(null, telefono, 'lista_espera', mensaje, 'enviado', `canal:${canalUsado}`);
    } catch (error) {
      console.error('❌ Falló lista_espera:', this.detalleError(error));
      return this.registrarSms(null, telefono, 'lista_espera', mensaje, 'fallido', this.detalleError(error));
    }
  }

  async enviarSmsAgradecimiento(clienteId: string, telefono: string, nombreCliente: string, canal?: CanalMensaje) {
    const mensaje = `Gracias por visitarnos hoy en Tizón Meats, ${nombreCliente}. ¿Cómo estuvo tu corte? Califícanos en tizon.me/review`;
    
    try {
      const { canal: canalUsado } = await this.enviarMensaje(telefono, mensaje, canal ?? this.canalDefault);
      return this.registrarSms(clienteId, telefono, 'agradecimiento', mensaje, 'enviado', `canal:${canalUsado}`);
    } catch (error) {
      console.error('❌ Falló agradecimiento:', this.detalleError(error));
      return this.registrarSms(clienteId, telefono, 'agradecimiento', mensaje, 'fallido', this.detalleError(error));
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
