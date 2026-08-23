import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/sala',
})
export class SalaGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`[Sala] Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`[Sala] Cliente desconectado: ${client.id}`);
  }

  /**
   * Emitir actualización de mesa a todos los clientes.
   */
  emitirActualizacionMesa(mesaId: string, estado: string, capacidad: number) {
    this.server.emit('mesa-actualizada', { mesaId, estado, capacidad, timestamp: new Date() });
  }

  /**
   * Emitir reserva confirmada.
   */
  emitirReservaConfirmada(reservaId: string, codigoUnico: string) {
    this.server.emit('reserva-confirmada', { reservaId, codigoUnico, timestamp: new Date() });
  }

  /**
   * Emitir estado de pacing (semáforo de cocina).
   */
  emitirEstadoPacing(estado: string, personas: number, capacidad: number) {
    this.server.emit('pacing-estado', { estado, personas, capacidad, timestamp: new Date() });
  }

  /**
   * Emitir lista de espera actualizada.
   */
  emitirListaEsperaActualizada(esperandoAhora: number) {
    this.server.emit('lista-espera-actualizada', { esperandoAhora, timestamp: new Date() });
  }

  @SubscribeMessage('ping')
  handlePing(client: Socket, data: any) {
    client.emit('pong', { timestamp: new Date() });
  }
}
