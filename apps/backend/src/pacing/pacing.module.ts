import { Module } from '@nestjs/common';
import { PacingService } from './pacing.service';

@Module({
  providers: [PacingService],
  exports: [PacingService],
})
export class PacingModule {}
