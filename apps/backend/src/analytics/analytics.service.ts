import { Injectable } from '@nestjs/common';
import { supabaseAdmin } from '../config/supabase.config';

@Injectable()
export class AnalyticsService {

  async getDashboard() {
    const hoy = new Date().toISOString().split('T')[0];

    // Últimos 7 días (incluyendo hoy)
    const fechas7dias: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      fechas7dias.push(d.toISOString().split('T')[0]);
    }
    const fechaInicio7 = fechas7dias[0];

    // Últimos 30 días
    const hace30 = new Date();
    hace30.setDate(hace30.getDate() - 29);
    const fechaInicio30 = hace30.toISOString().split('T')[0];

    // ── RESERVAS HOY ───────────────────────────────────────────────────────────
    const { data: reservasHoy } = await supabaseAdmin
      .from('reservas')
      .select('id, estado, num_comensales')
      .eq('fecha', hoy);

    const totalHoy = reservasHoy?.length || 0;
    const confirmadas = reservasHoy?.filter(r => r.estado === 'confirmada').length || 0;
    const sentadas = reservasHoy?.filter(r => r.estado === 'sentada').length || 0;
    const canceladas = reservasHoy?.filter(r => r.estado === 'cancelada').length || 0;
    const completadas = reservasHoy?.filter(r => r.estado === 'completada').length || 0;
    const comensalesHoy = reservasHoy?.reduce((sum, r) => sum + (r.num_comensales || 0), 0) || 0;

    // ── RESERVAS ÚLTIMOS 7 DÍAS ────────────────────────────────────────────────
    const { data: reservas7 } = await supabaseAdmin
      .from('reservas')
      .select('fecha, estado, num_comensales')
      .gte('fecha', fechaInicio7)
      .lte('fecha', hoy);

    // Agrupar por fecha
    const porFecha: Record<string, { total: number; completadas: number; canceladas: number }> = {};
    fechas7dias.forEach(f => { porFecha[f] = { total: 0, completadas: 0, canceladas: 0 }; });
    reservas7?.forEach(r => {
      if (porFecha[r.fecha]) {
        porFecha[r.fecha].total++;
        if (r.estado === 'completada' || r.estado === 'sentada') porFecha[r.fecha].completadas++;
        if (r.estado === 'cancelada') porFecha[r.fecha].canceladas++;
      }
    });
    const grafica7dias = fechas7dias.map(f => ({
      fecha: f,
      label: new Date(f + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'short' }),
      total: porFecha[f].total,
      completadas: porFecha[f].completadas,
      canceladas: porFecha[f].canceladas,
    }));

    // ── TOTALES SEMANA Y MES ───────────────────────────────────────────────────
    const totalSemana = reservas7?.length || 0;

    const { data: reservas30 } = await supabaseAdmin
      .from('reservas')
      .select('id, estado')
      .gte('fecha', fechaInicio30)
      .lte('fecha', hoy);
    const totalMes = reservas30?.length || 0;
    const completadasMes = reservas30?.filter(r => r.estado === 'completada' || r.estado === 'sentada').length || 0;
    const tasaExitoMes = totalMes > 0 ? Math.round((completadasMes / totalMes) * 100) : 0;

    // ── MESAS ─────────────────────────────────────────────────────────────────
    const { data: mesas } = await supabaseAdmin
      .from('mesas')
      .select('id, estado');
    const totalMesas = mesas?.length || 0;
    const mesasOcupadas = mesas?.filter(m => m.estado === 'ocupada' || m.estado === 'reservada').length || 0;
    const ocupacionActual = totalMesas > 0 ? Math.round((mesasOcupadas / totalMesas) * 100) : 0;

    // ── TOP CLIENTES ──────────────────────────────────────────────────────────
    const { data: topClientes } = await supabaseAdmin
      .from('clientes')
      .select('id, nombre, num_visitas, etiquetas, termino_carne_preferido')
      .order('num_visitas', { ascending: false })
      .limit(5);

    // ── HORARIOS PICO (últimos 30 días) ───────────────────────────────────────
    const { data: reservasConHora } = await supabaseAdmin
      .from('reservas')
      .select('hora_inicio, num_comensales')
      .gte('fecha', fechaInicio30)
      .lte('fecha', hoy)
      .not('hora_inicio', 'is', null);

    const porHora: Record<string, number> = {};
    reservasConHora?.forEach(r => {
      const hora = r.hora_inicio?.slice(0, 2) + ':00';
      porHora[hora] = (porHora[hora] || 0) + 1;
    });
    const horariosPico = Object.entries(porHora)
      .map(([hora, count]) => ({ hora, count }))
      .sort((a, b) => a.hora.localeCompare(b.hora));

    // ── LISTA DE ESPERA HOY ────────────────────────────────────────────────────
    const { data: listaEspera } = await supabaseAdmin
      .from('lista_espera')
      .select('id, estado')
      .gte('created_at', hoy + 'T00:00:00')
      .lte('created_at', hoy + 'T23:59:59');
    const walkins = listaEspera?.length || 0;

    return {
      fecha: hoy,
      hoy: {
        total: totalHoy,
        confirmadas,
        sentadas,
        canceladas,
        completadas,
        comensales: comensalesHoy,
        walkins,
      },
      semana: {
        total: totalSemana,
        grafica: grafica7dias,
      },
      mes: {
        total: totalMes,
        tasaExito: tasaExitoMes,
      },
      sala: {
        totalMesas,
        mesasOcupadas,
        ocupacionActual,
      },
      topClientes: topClientes || [],
      horariosPico,
    };
  }
}
