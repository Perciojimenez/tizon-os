import { Injectable } from '@nestjs/common';
import { supabaseAdmin } from '../config/supabase.config';

@Injectable()
export class PacingService {
  /**
   * Calcula el estado de pacing (semáforo de carga de cocina).
   * Devuelve: VERDE (hay capacidad), AMARILLO (cuidado), ROJO (lleno).
   */
  async calcularEstadoPacing(ahora?: Date): Promise<{ estado: string; personasProximos15Min: number; capacidadMax: number }> {
    const fecha = ahora || new Date();
    const hace15Min = new Date(fecha.getTime() - 15 * 60000);

    // Obtener todas las ocupaciones en los próximos 15 minutos
    const { data: ocupaciones, error } = await supabaseAdmin
      .from('ocupacion_mesas')
      .select('num_comensales')
      .gte('hora_inicio', hace15Min.toISOString())
      .lte('hora_inicio', fecha.toISOString());

    if (error) throw new Error(`Error al calcular pacing: ${error.message}`);

    const personasAhora = (ocupaciones || []).reduce((sum, occ) => sum + occ.num_comensales, 0);
    const capacidadMax = 30; // De configuración

    let estado = 'VERDE';
    if (personasAhora >= capacidadMax * 0.8) estado = 'AMARILLO';
    if (personasAhora >= capacidadMax) estado = 'ROJO';

    return { estado, personasProximos15Min: personasAhora, capacidadMax };
  }

  async puedeAceptarComensales(numComensales: number): Promise<boolean> {
    const pacing = await this.calcularEstadoPacing();
    return (pacing.personasProximos15Min + numComensales) <= pacing.capacidadMax;
  }

  async obtenerOcupacion() {
    const { data, error } = await supabaseAdmin
      .from('ocupacion_mesas')
      .select('*')
      .is('hora_fin', null)
      .order('hora_inicio', { ascending: true });

    if (error) throw new Error(`Error: ${error.message}`);
    return data || [];
  }
}
