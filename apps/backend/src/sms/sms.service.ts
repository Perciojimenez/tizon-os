import { Injectable } from '@nestjs/common';
import { supabaseAdmin } from '../config/supabase.config';

@Injectable()
export class SmsService {
  private twilioSid = process.env.TWILIO_ACCOUNT_SID;
  private twilioToken = process.env.TWILIO_AUTH_TOKEN;
  private twilioPhone = process.env.TWILIO_PHONE;

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
    
    // TODO: integrar Twilio aquí
    return this.registrarSms(clienteId, telefono, 'confirmacion', mensaje, 'enviado');
  }

  async enviarSmsRecordatorio(clienteId: string, telefono: string, nombreCliente: string, hora: string, codigoUnico: string) {
    const mensaje = `Hola ${nombreCliente}, te esperamos hoy a las ${hora} en Tizón Meats. Código: ${codigoUnico}. Responde 1 para confirmar, 2 para cancelar.`;
    
    // TODO: integrar Twilio aquí
    return this.registrarSms(clienteId, telefono, 'recordatorio', mensaje, 'enviado');
  }

  async enviarSmsListaEspera(nombreGrupo: string, telefono: string) {
    const mensaje = `¡Hola ${nombreGrupo}! Tu mesa en Tizón Meats está casi lista. Por favor acércate a la hostess. ¡Gracias!`;
    
    // TODO: integrar Twilio aquí
    return this.registrarSms(null, telefono, 'lista_espera', mensaje, 'enviado');
  }

  async enviarSmsAgradecimiento(clienteId: string, telefono: string, nombreCliente: string) {
    const mensaje = `Gracias por visitarnos hoy en Tizón Meats, ${nombreCliente}. ¿Cómo estuvo tu corte? Califícanos en tizon.me/review`;
    
    // TODO: integrar Twilio aquí
    return this.registrarSms(clienteId, telefono, 'agradecimiento', mensaje, 'enviado');
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
    // TODO: lógica para procesar respuestas SMS (1=confirma, 2=cancela)
    return { procesado: true };
  }
}
