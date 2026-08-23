import { Injectable } from '@nestjs/common';
import { supabaseAdmin } from '../config/supabase.config';

export interface CurrentUser {
  id: string;
  email: string;
  rol: 'hostess' | 'mesero' | 'gerencia';
}

@Injectable()
export class AuthService {
  async validateUser(token: string): Promise<CurrentUser | null> {
    try {
      // Verificar JWT con Supabase
      const { data, error } = await supabaseAdmin.auth.getUser(token);
      if (error || !data.user) return null;

      const email = data.user.email;

      // Obtener rol desde tabla staff
      const { data: staff, error: staffError } = await supabaseAdmin
        .from('staff')
        .select('id, rol')
        .eq('email', email)
        .eq('activo', true)
        .single();

      if (staffError || !staff) return null;

      return {
        id: staff.id,
        email,
        rol: staff.rol,
      };
    } catch (err) {
      return null;
    }
  }

  async getCurrentUser(token: string): Promise<CurrentUser | null> {
    return this.validateUser(token);
  }
}
