import { Controller, Post, Body, UseGuards, Get, Param } from '@nestjs/common';
import { SmsService } from './sms.service';
import { AuthGuard } from '../auth/auth.guard';

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
   * ENDPOINT DE PRUEBA (temporal) - Envía un SMS de prueba
   * TODO: Eliminar antes de producción final
   */
  @Post('test/enviar')
  async enviarSmsTest(@Body() body: { telefono: string; nombre: string; tipo?: string }) {
    const { telefono, nombre, tipo = 'confirmacion' } = body;

    if (tipo === 'confirmacion') {
      return this.smsService.enviarSmsConfirmacion(
        null,
        telefono,
        nombre,
        'TZN-TEST',
        '2026-08-24',
        '20:00',
        2,
      );
    } else if (tipo === 'recordatorio') {
      return this.smsService.enviarSmsRecordatorio(
        null,
        telefono,
        nombre,
        '20:00',
        'TZN-TEST',
      );
    } else if (tipo === 'lista_espera') {
      return this.smsService.enviarSmsListaEspera(nombre, telefono);
    } else if (tipo === 'agradecimiento') {
      return this.smsService.enviarSmsAgradecimiento(null, telefono, nombre);
    }

    return { error: 'Tipo de SMS no reconocido' };
  }
}
