import { Module } from '@nestjs/common';
import { PacingService } from './pacing.service';
import { PacingScheduler } from './pacing.scheduler';
import { WebSocketModule } from '../websocket/websocket.module';

@Module({
  imports: [WebSocketModule],
  providers: [PacingService, PacingScheduler],
  exports: [PacingService],
})
export class PacingModule {}
