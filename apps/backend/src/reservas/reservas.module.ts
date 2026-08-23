import { Module } from '@nestjs/common';
import { ReservasService } from './reservas.service';
import { ReservasController } from './reservas.controller';
import { CodigoUnicoService } from './codigo-unico.service';
import { AuthModule } from '../auth/auth.module';
import { SmsModule } from '../sms/sms.module';

@Module({
  imports: [AuthModule, SmsModule],
  controllers: [ReservasController],
  providers: [ReservasService, CodigoUnicoService],
  exports: [ReservasService],
})
export class ReservasModule {}
