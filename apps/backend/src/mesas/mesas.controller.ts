import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { MesasService } from './mesas.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('mesas')
@UseGuards(AuthGuard)
export class MesasController {
  constructor(private mesasService: MesasService) {}

  @Get()
  async obtenerMesas() {
    return this.mesasService.obtenerMesas();
  }

  @Get(':id')
  async obtenerMesa(@Param('id') id: string) {
    return this.mesasService.obtenerMesa(id);
  }

  @Patch(':id/estado')
  async actualizarEstado(@Param('id') id: string, @Body() body: { estado: string }) {
    return this.mesasService.actualizarEstadoMesa(id, body.estado);
  }

  @Get('zona/:zona')
  async obtenerPorZona(@Param('zona') zona: string) {
    return this.mesasService.obtenerMesasPorZona(zona);
  }

  @Get('libres/:capacidad')
  async obtenerLibres(@Param('capacidad') capacidad: string) {
    return this.mesasService.obtenerMesasLibres(parseInt(capacidad, 10));
  }
}
