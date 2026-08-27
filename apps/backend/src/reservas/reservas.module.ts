import { Module, forwardRef } from '@nestjs/common';
import { ReservasService } from './reservas.service';
import { ReservasController } from './reservas.controller';
import { CodigoUnicoService } from './codigo-unico.service';
import { AuthModule } from '../auth/auth.module';
import { SmsModule } from '../sms/sms.module';
import { WebSocketModule } from '../websocket/websocket.module';
import { PushModule } from '../push/push.module';

@Module({
  imports: [AuthModule, SmsModule, forwardRef(() => WebSocketModule), PushModule],
  controllers: [ReservasController],
  providers: [ReservasService, CodigoUnicoService],
  exports: [ReservasService],
})
export class ReservasModule {}
