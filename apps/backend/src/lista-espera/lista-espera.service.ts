import { Injectable } from '@nestjs/common';
import { supabaseAdmin } from '../config/supabase.config';

@Injectable()
export class ListaEsperaService {
  async crearWalkIn(nombreGrupo: string, numPersonas: number, telefono?: string, clienteId?: string) {
    const { data, error } = await supabaseAdmin
      .from('lista_espera')
      .insert([{
        cliente_id: clienteId,
        nombre_grupo: nombreGrupo,
        num_personas: numPersonas,
        telefono,
        estado: 'esperando',
        tiempo_espera_estimado: 20,
      }])
      .select()
      .single();

    if (error) throw new Error(`Error al crear walk-in: ${error.message}`);
    return data;
  }

  async obtenerListaEspera() {
    const { data, error } = await supabaseAdmin
      .from('lista_espera')
      .select('*')
      .in('estado', ['esperando', 'avisado'])
      .order('hora_llegada', { ascending: true });
    
    if (error) throw new Error(`Error al obtener lista de espera: ${error.message}`);
    return data || [];
  }

  async obtenerEspera(id: string) {
    const { data, error } = await supabaseAdmin
      .from('lista_espera')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw new Error(`Error al obtener espera: ${error.message}`);
    return data;
  }

  async actualizarEstado(id: string, nuevoEstado: string) {
    const { data, error } = await supabaseAdmin
      .from('lista_espera')
      .update({ estado: nuevoEstado })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(`Error al actualizar espera: ${error.message}`);
    return data;
  }

  async asignarMesa(id: string, mesaId: string) {
    return this.actualizarEstado(id, 'sentado');
  }

  async contarEsperandoAhora() {
    const { count, error } = await supabaseAdmin
      .from('lista_espera')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'esperando');
    
    if (error) throw new Error(`Error: ${error.message}`);
    return count || 0;
  }
}
