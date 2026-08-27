import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  /**
   * KPIs y estadísticas del restaurante para el Dashboard de Gerencia.
   */
  @Get('kpis')
  @UseGuards(AuthGuard)
  async obtenerKpis() {
    return this.dashboardService.obtenerKpis();
  }
}
