import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import {
  PedidosService,
  EstadoPedido,
  EstadoComanda,
  ItemComandaInput,
} from './pedidos.service';

/**
 * Endpoints REST del Sistema de Pedidos & Comandas.
 * Todos requieren autenticación (AuthGuard).
 */
@Controller('pedidos')
@UseGuards(AuthGuard)
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  /** GET /pedidos/menu?categoria= — carta completa (o por categoría). */
  @Get('menu')
  async obtenerMenu(@Query('categoria') categoria?: string) {
    return this.pedidosService.obtenerMenuItems(categoria);
  }

  /** GET /pedidos — todos los pedidos activos (vista de cocina). */
  @Get()
  async obtenerTodos() {
    return this.pedidosService.obtenerTodosPedidos();
  }

  /** GET /pedidos/mesa/:numero — pedido activo de una mesa. */
  @Get('mesa/:numero')
  async obtenerPorMesa(@Param('numero') numero: string) {
    return this.pedidosService.obtenerPedidoActivo(Number(numero));
  }

  /** GET /pedidos/:id/cuenta — cuenta detallada de un pedido. */
  @Get(':id/cuenta')
  async obtenerCuenta(@Param('id') id: string) {
    return this.pedidosService.obtenerCuenta(id);
  }

  /** POST /pedidos — crea (o recupera) el pedido activo de una mesa. */
  @Post()
  async crear(
    @Body() body: { mesa_numero: number; mesero_nombre?: string },
  ) {
    return this.pedidosService.crearPedido(body.mesa_numero, body.mesero_nombre);
  }

  /** POST /pedidos/:id/comandas — agrega items al pedido. */
  @Post(':id/comandas')
  async agregarComandas(
    @Param('id') id: string,
    @Body() body: { items: ItemComandaInput[] },
  ) {
    return this.pedidosService.agregarComandas(id, body.items);
  }

  /** POST /pedidos/:id/cerrar — cierra el pedido y devuelve la cuenta. */
  @Post(':id/cerrar')
  async cerrar(@Param('id') id: string) {
    return this.pedidosService.cerrarPedido(id);
  }

  /** PATCH /pedidos/:id/estado — actualiza el estado del pedido. */
  @Patch(':id/estado')
  async actualizarEstado(
    @Param('id') id: string,
    @Body() body: { estado: EstadoPedido },
  ) {
    return this.pedidosService.actualizarEstadoPedido(id, body.estado);
  }

  /** PATCH /pedidos/comandas/:id/estado — actualiza el estado de una comanda. */
  @Patch('comandas/:id/estado')
  async actualizarEstadoComanda(
    @Param('id') id: string,
    @Body() body: { estado: EstadoComanda },
  ) {
    return this.pedidosService.actualizarEstadoComanda(id, body.estado);
  }
}
