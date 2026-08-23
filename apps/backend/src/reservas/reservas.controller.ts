import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { ReservasService } from './reservas.service';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/auth.decorator';

@Controller('reservas')
@UseGuards(AuthGuard)
export class ReservasController {
  constructor(private reservasService: ReservasService) {}

  @Get()
  async obtenerReservas(@Query() filtros?: any) {
    return this.reservasService.obtenerReservas(filtros);
  }

  @Get(':id')
  async obtenerReserva(@Param('id') id: string) {
    return this.reservasService.obtenerReserva(id);
  }

  @Post()
  async crearReserva(
    @Body() body: { clienteId: string; mesaId: string; fecha: string; horaInicio: string; numComensales: number; notasServicio?: string },
    @CurrentUser() user: any,
  ) {
    return this.reservasService.crearReserva(
      body.clienteId,
      body.mesaId,
      body.fecha,
      body.horaInicio,
      body.numComensales,
      user.id,
      body.notasServicio,
    );
  }

  @Patch(':id/estado')
  async actualizarEstado(@Param('id') id: string, @Body() body: { estado: string }) {
    return this.reservasService.actualizarEstado(id, body.estado);
  }

  @Delete(':id')
  async cancelarReserva(@Param('id') id: string) {
    return this.reservasService.cancelarReserva(id);
  }

  @Get('fecha/:fecha')
  async obtenerPorFecha(@Param('fecha') fecha: string) {
    return this.reservasService.obtenerReservasPorFecha(fecha);
  }
}
