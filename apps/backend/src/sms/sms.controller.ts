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
}
