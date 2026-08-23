import { Controller, Get } from '@nestjs/common';

/**
 * Controlador raíz con endpoints públicos de salud.
 * Útil para verificar que el servicio está vivo (Railway healthcheck).
 */
@Controller()
export class AppController {
  @Get()
  root() {
    return {
      servicio: 'Tizón OS Backend',
      version: '2.0.0',
      estado: 'activo',
      restaurante: 'Tizón Meats',
    };
  }

  @Get('health')
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
