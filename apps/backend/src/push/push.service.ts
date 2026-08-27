import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { supabaseAdmin } from '../config/supabase.config';

/**
 * Servicio de Notificaciones Push (Expo Push Notifications).
 *
 * Envía alertas en tiempo real al personal del restaurante sobre
 * eventos importantes (nuevas reservas, lista de espera, mesas listas).
 *
 * Usa la API pública de Expo Push (fetch nativo, sin librerías extra):
 *   https://exp.host/--/api/v2/push/send
 */
@Injectable()
export class PushService implements OnModuleInit {
  private readonly logger = new Logger(PushService.name);
  private readonly EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

  /**
   * Al iniciar el módulo, intenta asegurar que la tabla push_tokens exista.
   * Si no se puede crear automáticamente (permisos), se registrará una
   * advertencia; la tabla debe crearse manualmente en Supabase en ese caso.
   */
  async onModuleInit() {
    await this.asegurarTabla();
  }

  private async asegurarTabla() {
    try {
      // Verificar si la tabla existe haciendo una consulta mínima
      const { error } = await supabaseAdmin
        .from('push_tokens')
        .select('id')
        .limit(1);

      if (error) {
        this.logger.warn(
          `Tabla push_tokens no disponible (${error.message}). ` +
            'Debe crearse manualmente en Supabase si no existe.',
        );
      } else {
        this.logger.log('Tabla push_tokens verificada correctamente.');
      }
    } catch (err) {
      this.logger.warn(`No se pudo verificar la tabla push_tokens: ${err}`);
    }
  }

  /**
   * Registra (o actualiza) el token de push de un dispositivo del staff.
   */
  async registrarToken(staffId: string, token: string) {
    if (!token || !token.startsWith('ExponentPushToken')) {
      this.logger.warn(`Token de push inválido ignorado: ${token}`);
      return { ok: false, error: 'Token inválido' };
    }

    try {
      // upsert por token (único). Actualiza el staff_id si el token ya existía.
      const { error } = await supabaseAdmin
        .from('push_tokens')
        .upsert(
          { staff_id: staffId, token },
          { onConflict: 'token' },
        );

      if (error) {
        this.logger.error(`Error registrando token: ${error.message}`);
        return { ok: false, error: error.message };
      }

      this.logger.log(`Token de push registrado para staff ${staffId}`);
      return { ok: true };
    } catch (err) {
      this.logger.error(`Excepción registrando token: ${err}`);
      return { ok: false, error: String(err) };
    }
  }

  /**
   * Elimina el token de un dispositivo (p. ej. al cerrar sesión).
   */
  async eliminarToken(token: string) {
    try {
      const { error } = await supabaseAdmin
        .from('push_tokens')
        .delete()
        .eq('token', token);

      if (error) {
        this.logger.error(`Error eliminando token: ${error.message}`);
        return { ok: false, error: error.message };
      }
      return { ok: true };
    } catch (err) {
      this.logger.error(`Excepción eliminando token: ${err}`);
      return { ok: false, error: String(err) };
    }
  }

  /**
   * Obtiene todos los tokens de push registrados del staff.
   */
  private async obtenerTodosLosTokens(): Promise<string[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('push_tokens')
        .select('token');

      if (error) {
        this.logger.error(`Error obteniendo tokens: ${error.message}`);
        return [];
      }
      return (data || []).map((r) => r.token).filter(Boolean);
    } catch (err) {
      this.logger.error(`Excepción obteniendo tokens: ${err}`);
      return [];
    }
  }

  /**
   * Envía una notificación push a una lista de tokens vía la API de Expo.
   * Expo acepta hasta 100 mensajes por request; se envía en lotes.
   */
  async enviarNotificacion(
    tokens: string[],
    titulo: string,
    cuerpo: string,
    data?: Record<string, any>,
  ) {
    const destinos = tokens.filter(
      (t) => t && t.startsWith('ExponentPushToken'),
    );

    if (destinos.length === 0) {
      this.logger.log('No hay tokens de push registrados. Nada que enviar.');
      return { ok: true, enviados: 0 };
    }

    // Construir mensajes con el formato de Expo
    const mensajes = destinos.map((to) => ({
      to,
      sound: 'default',
      title: titulo,
      body: cuerpo,
      data: data || {},
      channelId: 'tizon-alerts',
      priority: 'high',
    }));

    // Enviar en lotes de 100
    let enviados = 0;
    try {
      for (let i = 0; i < mensajes.length; i += 100) {
        const lote = mensajes.slice(i, i + 100);
        const res = await fetch(this.EXPO_PUSH_URL, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Accept-Encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(lote),
        });

        if (!res.ok) {
          const texto = await res.text();
          this.logger.error(
            `Error de Expo Push (HTTP ${res.status}): ${texto}`,
          );
          continue;
        }

        const resultado = await res.json();
        enviados += lote.length;
        this.logger.log(
          `Notificación enviada a ${lote.length} dispositivo(s). ` +
            `Respuesta Expo: ${JSON.stringify(resultado?.data?.length ?? '')}`,
        );
      }
      return { ok: true, enviados };
    } catch (err) {
      this.logger.error(`Excepción enviando notificación: ${err}`);
      return { ok: false, error: String(err), enviados };
    }
  }

  /**
   * Notifica al staff sobre una nueva reserva creada.
   */
  async notificarNuevaReserva(
    codigoUnico: string,
    clienteNombre: string,
    hora: string,
  ) {
    const tokens = await this.obtenerTodosLosTokens();
    return this.enviarNotificacion(
      tokens,
      '🍽️ Nueva Reserva',
      `${clienteNombre} — ${hora} (${codigoUnico})`,
      { pantalla: 'Reservas', tipo: 'nueva_reserva', codigoUnico },
    );
  }

  /**
   * Notifica al staff sobre un nuevo grupo en la lista de espera.
   */
  async notificarListaEspera(nombreGrupo: string, numPersonas: number) {
    const tokens = await this.obtenerTodosLosTokens();
    return this.enviarNotificacion(
      tokens,
      '⏳ Nuevo grupo en espera',
      `${nombreGrupo} — ${numPersonas} persona(s)`,
      { pantalla: 'Espera', tipo: 'lista_espera' },
    );
  }

  /**
   * Notifica al staff que una mesa está lista para sentar.
   */
  async notificarMesaLista(codigoMesa: string) {
    const tokens = await this.obtenerTodosLosTokens();
    return this.enviarNotificacion(
      tokens,
      '✅ Mesa lista',
      `La mesa ${codigoMesa} está lista para sentar`,
      { pantalla: 'Plano', tipo: 'mesa_lista', codigoMesa },
    );
  }
}
