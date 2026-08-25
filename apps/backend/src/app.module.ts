import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { MesasModule } from './mesas/mesas.module';
import { ReservasModule } from './reservas/reservas.module';
import { ClientesModule } from './clientes/clientes.module';
import { ListaEsperaModule } from './lista-espera/lista-espera.module';
import { PacingModule } from './pacing/pacing.module';
import { SmsModule } from './sms/sms.module';
import { WebSocketModule } from './websocket/websocket.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    MesasModule,
    ReservasModule,
    ClientesModule,
    ListaEsperaModule,
    PacingModule,
    SmsModule,
    WebSocketModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
