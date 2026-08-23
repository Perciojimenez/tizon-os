import { Injectable } from '@nestjs/common';
import { supabaseAdmin } from '../config/supabase.config';
import * as twilio from 'twilio';

@Injectable()
export class SmsService {
  private twilioSid = process.env.TWILIO_ACCOUNT_SID;
  private twilioToken = process.env.TWILIO_AUTH_TOKEN;
  private twilioPhone = process.env.TWILIO_PHONE_NUMBER;
  private twilioClient: twilio.Twilio;

  constructor() {
    if (this.twilioSid && this.twilioToken) {
      this.twilioClient = twilio.default(this.twilioSid, this.twilioToken);
    } else {
      console.warn('⚠️ Twilio no configurado. Los SMS se registrarán pero no se enviarán.');
    }
  }

  /**
   * Envía un SMS usando Twilio y registra el intento en la base de datos.
   */
  private async enviarSms(telefono: string, mensaje: string): Promise<string> {
    if (!this.twilioClient || !this.twilioPhone) {
      throw new Error('Twilio no está configurado correctamente');
    }

    try {
      const result = await this.twilioClient.messages.create({
        body: mensaje,
        from: this.twilioPhone,
        to: telefono,
      });
      return result.sid;
    } catch (error) {
      console.error('Error al enviar SMS:', error);
      throw error;
    }
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

  async enviarSmsConfirmacion(clienteId: string, telefono: string, nombreCliente: string, codigoUnico: string, fecha: string, hora: string, numComensales: number) {
    const mensaje = `¡Hola ${nombreCliente}! Tu reserva en Tizón Meats para ${fecha} a las ${hora} (${numComensales} personas) está confirmada. Código: ${codigoUnico}. Te esperamos.`;
    
    try {
      await this.enviarSms(telefono, mensaje);
      return this.registrarSms(clienteId, telefono, 'confirmacion', mensaje, 'enviado');
    } catch (error) {
      return this.registrarSms(clienteId, telefono, 'confirmacion', mensaje, 'fallido');
    }
  }

  async enviarSmsRecordatorio(clienteId: string, telefono: string, nombreCliente: string, hora: string, codigoUnico: string) {
    const mensaje = `Hola ${nombreCliente}, te esperamos hoy a las ${hora} en Tizón Meats. Código: ${codigoUnico}. Responde 1 para confirmar, 2 para cancelar.`;
    
    try {
      await this.enviarSms(telefono, mensaje);
      return this.registrarSms(clienteId, telefono, 'recordatorio', mensaje, 'enviado');
    } catch (error) {
      return this.registrarSms(clienteId, telefono, 'recordatorio', mensaje, 'fallido');
    }
  }

  async enviarSmsListaEspera(nombreGrupo: string, telefono: string) {
    const mensaje = `¡Hola ${nombreGrupo}! Tu mesa en Tizón Meats está casi lista. Por favor acércate a la hostess. ¡Gracias!`;
    
    try {
      await this.enviarSms(telefono, mensaje);
      return this.registrarSms(null, telefono, 'lista_espera', mensaje, 'enviado');
    } catch (error) {
      return this.registrarSms(null, telefono, 'lista_espera', mensaje, 'fallido');
    }
  }

  async enviarSmsAgradecimiento(clienteId: string, telefono: string, nombreCliente: string) {
    const mensaje = `Gracias por visitarnos hoy en Tizón Meats, ${nombreCliente}. ¿Cómo estuvo tu corte? Califícanos en tizon.me/review`;
    
    try {
      await this.enviarSms(telefono, mensaje);
      return this.registrarSms(clienteId, telefono, 'agradecimiento', mensaje, 'enviado');
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
    
    // Buscar la última reserva activa del cliente con este teléfono
    const { data: cliente } = await supabaseAdmin
      .from('clientes')
      .select('id, nombre')
      .eq('telefono', telefono)
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

      await this.registrarSms(cliente.id, telefono, 'recordatorio', respuesta, 'recibido', '1 - confirmada');
      
      return { procesado: true, accion: 'confirmada', reservaId: reserva.id };
    } 
    else if (texto === '2' || texto.includes('cancelar') || texto.includes('no')) {
      // Cancelar reserva
      await supabaseAdmin
        .from('reservas')
        .update({ estado: 'cancelada' })
        .eq('id', reserva.id);

      await this.registrarSms(cliente.id, telefono, 'recordatorio', respuesta, 'recibido', '2 - cancelada');

      return { procesado: true, accion: 'cancelada', reservaId: reserva.id };
    }

    // Respuesta no reconocida
    await this.registrarSms(cliente.id, telefono, 'recordatorio', respuesta, 'recibido', 'no reconocida');
    return { procesado: false, mensaje: 'Respuesta no reconocida' };
  }
}
