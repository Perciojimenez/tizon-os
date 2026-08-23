import { Injectable } from '@nestjs/common';
import { supabaseAdmin } from '../config/supabase.config';

@Injectable()
export class ClientesService {
  async crearCliente(nombre: string, telefono?: string, email?: string, terminoCarnePreferido?: string, alergias: string[] = [], etiquetas: string[] = []) {
    const { data, error } = await supabaseAdmin
      .from('clientes')
      .insert([{
        nombre,
        telefono,
        email,
        termino_carne_preferido: terminoCarnePreferido,
        alergias,
        etiquetas,
      }])
      .select()
      .single();

    if (error) throw new Error(`Error al crear cliente: ${error.message}`);
    return data;
  }

  async obtenerClientes(busqueda?: string) {
    let query = supabaseAdmin.from('clientes').select('*');
    
    if (busqueda) {
      query = query.or(`nombre.ilike.%${busqueda}%,telefono.ilike.%${busqueda}%`);
    }

    const { data, error } = await query.order('nombre', { ascending: true });
    if (error) throw new Error(`Error al obtener clientes: ${error.message}`);
    return data || [];
  }

  async obtenerCliente(id: string) {
    const { data, error } = await supabaseAdmin
      .from('clientes')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw new Error(`Error al obtener cliente: ${error.message}`);
    return data;
  }

  async actualizarCliente(id: string, updates: any) {
    const { data, error } = await supabaseAdmin
      .from('clientes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(`Error al actualizar cliente: ${error.message}`);
    return data;
  }

  async agregarVIP(id: string) {
    const cliente = await this.obtenerCliente(id);
    const etiquetas = cliente.etiquetas || [];
    if (!etiquetas.includes('VIP')) {
      etiquetas.push('VIP');
    }
    return this.actualizarCliente(id, { etiquetas });
  }

  async obtenerClientesPorTelefono(telefono: string) {
    const { data, error } = await supabaseAdmin
      .from('clientes')
      .select('*')
      .eq('telefono', telefono);
    
    if (error) throw new Error(`Error: ${error.message}`);
    return data || [];
  }
}
