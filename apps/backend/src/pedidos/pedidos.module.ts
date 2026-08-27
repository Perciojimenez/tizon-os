import { Module } from '@nestjs/common';
import { PedidosController } from './pedidos.controller';
import { PedidosService } from './pedidos.service';
import { AuthModule } from '../auth/auth.module';
import { PushModule } from '../push/push.module';

/**
 * Módulo del Sistema de Pedidos & Comandas (Hito #7).
 * Importa AuthModule (para el AuthGuard) y PushModule (para notificar a cocina).
 */
@Module({
  imports: [AuthModule, PushModule],
  controllers: [PedidosController],
  providers: [PedidosService],
  exports: [PedidosService],
})
export class PedidosModule {}
