import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ListaEsperaService } from './lista-espera.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('lista-espera')
@UseGuards(AuthGuard)
export class ListaEsperaController {
  constructor(private listaEsperaService: ListaEsperaService) {}

  @Get()
  async obtenerLista() {
    return this.listaEsperaService.obtenerListaEspera();
  }

  @Get(':id')
  async obtenerEspera(@Param('id') id: string) {
    return this.listaEsperaService.obtenerEspera(id);
  }

  @Post()
  async crearWalkIn(@Body() body: { nombreGrupo: string; numPersonas: number; telefono?: string; clienteId?: string }) {
    return this.listaEsperaService.crearWalkIn(
      body.nombreGrupo,
      body.numPersonas,
      body.telefono,
      body.clienteId,
    );
  }

  @Patch(':id/estado')
  async actualizarEstado(@Param('id') id: string, @Body() body: { estado: string }) {
    return this.listaEsperaService.actualizarEstado(id, body.estado);
  }

  @Post(':id/asignar-mesa')
  async asignarMesa(@Param('id') id: string, @Body() body: { mesaId: string }) {
    return this.listaEsperaService.asignarMesa(id, body.mesaId);
  }

  @Get('conteo/ahora')
  async contarEsperando() {
    const count = await this.listaEsperaService.contarEsperandoAhora();
    return { esperandoAhora: count };
  }
}
