import { Injectable } from '@nestjs/common';
import { supabaseAdmin } from '../config/supabase.config';

@Injectable()
export class MesasService {
  async obtenerMesas() {
    const { data, error } = await supabaseAdmin
      .from('mesas')
      .select('*')
      .eq('activa', true)
      .order('numero', { ascending: true });
    
    if (error) throw new Error(`Error al obtener mesas: ${error.message}`);
    return data || [];
  }

  async obtenerMesa(id: string) {
    const { data, error } = await supabaseAdmin
      .from('mesas')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw new Error(`Error al obtener mesa: ${error.message}`);
    return data;
  }

  async actualizarEstadoMesa(id: string, nuevoEstado: string) {
    const { data, error } = await supabaseAdmin
      .from('mesas')
      .update({ estado: nuevoEstado })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(`Error al actualizar mesa: ${error.message}`);
    return data;
  }

  async obtenerMesasPorZona(zona: string) {
    const { data, error } = await supabaseAdmin
      .from('mesas')
      .select('*')
      .eq('zona', zona)
      .eq('activa', true)
      .order('numero', { ascending: true });
    
    if (error) throw new Error(`Error al obtener mesas por zona: ${error.message}`);
    return data || [];
  }

  async obtenerMesasLibres(capacidadMinima: number) {
    const { data, error } = await supabaseAdmin
      .from('mesas')
      .select('*')
      .eq('estado', 'libre')
      .eq('activa', true)
      .gte('capacidad', capacidadMinima)
      .order('capacidad', { ascending: true });
    
    if (error) throw new Error(`Error al obtener mesas libres: ${error.message}`);
    return data || [];
  }
}
