import { Module } from '@nestjs/common';
import { SalaGateway } from './websocket.gateway';

@Module({
  providers: [SalaGateway],
  exports: [SalaGateway],
})
export class WebSocketModule {}
