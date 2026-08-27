import { Controller, Post, Delete, Body, UseGuards } from '@nestjs/common';
import { PushService } from './push.service';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/auth.decorator';
import type { CurrentUser as CurrentUserType } from '../auth/auth.service';

@Controller('push')
export class PushController {
  constructor(private pushService: PushService) {}

  /**
   * Registra el token de push del dispositivo del staff autenticado.
   */
  @Post('token')
  @UseGuards(AuthGuard)
  async registrarToken(
    @CurrentUser() user: CurrentUserType,
    @Body() body: { token: string },
  ) {
    return this.pushService.registrarToken(user.id, body.token);
  }

  /**
   * Elimina el token de push del dispositivo (p. ej. al cerrar sesión).
   */
  @Delete('token')
  @UseGuards(AuthGuard)
  async eliminarToken(@Body() body: { token: string }) {
    return this.pushService.eliminarToken(body.token);
  }
}
