import { Module } from '@nestjs/common';
import { ListaEsperaService } from './lista-espera.service';
import { ListaEsperaController } from './lista-espera.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ListaEsperaController],
  providers: [ListaEsperaService],
  exports: [ListaEsperaService],
})
export class ListaEsperaModule {}
