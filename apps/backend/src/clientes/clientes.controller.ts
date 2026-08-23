import { Controller, Get, Post, Patch, Param, Body, UseGuards, Query } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('clientes')
@UseGuards(AuthGuard)
export class ClientesController {
  constructor(private clientesService: ClientesService) {}

  @Get()
  async obtenerClientes(@Query('busqueda') busqueda?: string) {
    return this.clientesService.obtenerClientes(busqueda);
  }

  @Get(':id')
  async obtenerCliente(@Param('id') id: string) {
    return this.clientesService.obtenerCliente(id);
  }

  @Post()
  async crearCliente(@Body() body: any) {
    return this.clientesService.crearCliente(
      body.nombre,
      body.telefono,
      body.email,
      body.terminoCarnePreferido,
      body.alergias,
      body.etiquetas,
    );
  }

  @Patch(':id')
  async actualizarCliente(@Param('id') id: string, @Body() updates: any) {
    return this.clientesService.actualizarCliente(id, updates);
  }

  @Post(':id/vip')
  async agregarVIP(@Param('id') id: string) {
    return this.clientesService.agregarVIP(id);
  }

  @Get('telefono/:telefono')
  async obtenerPorTelefono(@Param('telefono') telefono: string) {
    return this.clientesService.obtenerClientesPorTelefono(telefono);
  }
}
