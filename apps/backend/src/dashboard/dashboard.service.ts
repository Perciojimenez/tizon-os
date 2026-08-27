import { Injectable, Logger } from '@nestjs/common';
import { supabaseAdmin } from '../config/supabase.config';

/**
 * Servicio del Dashboard de Gerencia.
 * Calcula KPIs y estadísticas del restaurante consultando Supabase
 * con el cliente admin (service role). Las agrupaciones que la API REST
 * de Supabase no soporta directamente se resuelven en memoria con JS.
 */
@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  private esVip(etiquetas: string[] | null): boolean {
    if (!etiquetas || !Array.isArray(etiquetas)) return false;
    return etiquetas.some((e) => String(e).toLowerCase() === 'vip');
  }

  private hoyISO(): string {
    // Fecha de hoy en formato YYYY-MM-DD
    return new Date().toISOString().split('T')[0];
  }

  async obtenerKpis() {
    const hoy = this.hoyISO();

    // Ejecutar todas las consultas en paralelo
    const [
      { data: mesas },
      { data: reservasHoy },
      { data: listaEspera },
      { data: clientes },
      { data: smsHoy },
      reservas7dias,
    ] = await Promise.all([
      supabaseAdmin.from('mesas').select('id, zona, estado, activa'),
      supabaseAdmin.from('reservas').select('id, estado, hora_inicio').eq('fecha', hoy),
      supabaseAdmin.from('lista_espera').select('id, estado'),
      supabaseAdmin.from('clientes').select('nombre, total_visitas, etiquetas'),
      supabaseAdmin
        .from('sms_log')
        .select('id')
        .gte('created_at', hoy + 'T00:00:00'),
      this.reservasUltimos7Dias(),
    ]);

    const mesasActivas = (mesas || []).filter((m) => m.activa !== false);
    const totalMesas = mesasActivas.length;

    // Una mesa cuenta como ocupada si está 'ocupada' o 'por_salir'
    const estaOcupada = (estado: string) =>
      estado === 'ocupada' || estado === 'por_salir';

    const mesasOcupadas = mesasActivas.filter((m) => estaOcupada(m.estado)).length;
    const mesasLibres = mesasActivas.filter((m) => m.estado === 'libre').length;
    const porcentajeOcupacion =
      totalMesas > 0 ? Math.round((mesasOcupadas / totalMesas) * 100) : 0;

    // Reservas de hoy por estado
    const reservas = reservasHoy || [];
    const contarEstado = (estado: string) =>
      reservas.filter((r) => r.estado === estado).length;

    const reservasConfirmadas = contarEstado('confirmada');
    const reservasSentadas = contarEstado('sentada');
    const reservasCanceladas = contarEstado('cancelada');
    const reservasCompletadas = contarEstado('completada');

    // Lista de espera
    const clientesEnEspera = (listaEspera || []).filter(
      (l) => l.estado === 'esperando',
    ).length;

    // Clientes VIP
    const clientesLista = clientes || [];
    const clientesVip = clientesLista.filter((c) => this.esVip(c.etiquetas)).length;

    // Top clientes por visitas
    const topClientes = [...clientesLista]
      .sort((a, b) => (b.total_visitas || 0) - (a.total_visitas || 0))
      .slice(0, 5)
      .map((c) => ({
        nombre: c.nombre,
        visitas: c.total_visitas || 0,
        vip: this.esVip(c.etiquetas),
      }));

    // Horas pico (últimos 7 días)
    const horasPico = this.calcularHorasPico(reservas7dias);

    // Ocupación por zona
    const ocupacionPorZona = this.calcularOcupacionPorZona(mesasActivas, estaOcupada);

    return {
      reservasHoy: reservas.length,
      mesasOcupadas,
      mesasLibres,
      porcentajeOcupacion,
      clientesEnEspera,
      reservasConfirmadas,
      reservasSentadas,
      reservasCanceladas,
      reservasCompletadas,
      mensajesWhatsAppHoy: (smsHoy || []).length,
      clientesVip,
      horasPico,
      topClientes,
      ocupacionPorZona,
    };
  }

  /**
   * Obtiene las reservas de los últimos 7 días (para calcular horas pico).
   */
  private async reservasUltimos7Dias() {
    const hace7 = new Date();
    hace7.setDate(hace7.getDate() - 7);
    const desde = hace7.toISOString().split('T')[0];
    const { data } = await supabaseAdmin
      .from('reservas')
      .select('hora_inicio')
      .gte('fecha', desde);
    return data || [];
  }

  /**
   * Agrupa las reservas por hora (HH:00) y devuelve las top 5.
   */
  private calcularHorasPico(reservas: { hora_inicio: string }[]) {
    const conteo: Record<string, number> = {};
    (reservas || []).forEach((r) => {
      if (!r.hora_inicio) return;
      const hora = String(r.hora_inicio).slice(0, 2) + ':00';
      conteo[hora] = (conteo[hora] || 0) + 1;
    });
    return Object.entries(conteo)
      .map(([hora, cantidad]) => ({ hora, reservas: cantidad }))
      .sort((a, b) => b.reservas - a.reservas)
      .slice(0, 5);
  }

  /**
   * Agrupa las mesas por zona con su total y cuántas están ocupadas.
   */
  private calcularOcupacionPorZona(
    mesas: { zona: string; estado: string }[],
    estaOcupada: (estado: string) => boolean,
  ) {
    const zonas: Record<string, { total: number; ocupadas: number }> = {};
    (mesas || []).forEach((m) => {
      const zona = m.zona || 'sin_zona';
      if (!zonas[zona]) zonas[zona] = { total: 0, ocupadas: 0 };
      zonas[zona].total += 1;
      if (estaOcupada(m.estado)) zonas[zona].ocupadas += 1;
    });
    return Object.entries(zonas).map(([zona, v]) => ({
      zona,
      total: v.total,
      ocupadas: v.ocupadas,
    }));
  }
}
