import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PacingService } from './pacing.service';
import { SalaGateway } from '../websocket/websocket.gateway';

/**
 * Scheduler que calcula el estado de pacing (semáforo de cocina) cada 30
 * segundos y lo emite a todos los clientes conectados vía WebSocket.
 */
@Injectable()
export class PacingScheduler {
  private readonly logger = new Logger(PacingScheduler.name);

  constructor(
    private readonly pacingService: PacingService,
    private readonly salaGateway: SalaGateway,
  ) {}

  @Cron('*/30 * * * * *') // Cada 30 segundos
  async emitirPacingPeriodico() {
    try {
      const pacing = await this.pacingService.calcularEstadoPacing();
      this.salaGateway.emitirEstadoPacing(
        pacing.estado,
        pacing.personasProximos15Min,
        pacing.capacidadMax,
      );
      this.logger.debug(
        `Pacing emitido: ${pacing.estado} (${pacing.personasProximos15Min}/${pacing.capacidadMax})`,
      );
    } catch (err) {
      this.logger.error('Error en cron de pacing', err);
    }
  }
}
