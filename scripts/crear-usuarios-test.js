/**
 * Script para crear usuarios de prueba en Supabase Auth
 * Crea los 5 usuarios de staff del seed.sql en Supabase Authentication
 */

const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase - usa variables de entorno o reemplaza con tus claves
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://TU_PROYECTO.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'TU_SERVICE_ROLE_KEY'; // Service role key (admin)

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Usuarios del seed.sql
const usuarios = [
  {
    email: 'laura.menendez@tizonmeats.com',
    password: 'TizonOS2024!',
    nombre: 'Laura Menéndez',
    rol: 'gerencia',
  },
  {
    email: 'sofia.ramirez@tizonmeats.com',
    password: 'TizonOS2024!',
    nombre: 'Sofía Ramírez',
    rol: 'hostess',
  },
  {
    email: 'carlos.mendez@tizonmeats.com',
    password: 'TizonOS2024!',
    nombre: 'Carlos Méndez',
    rol: 'hostess',
  },
  {
    email: 'david.torres@tizonmeats.com',
    password: 'TizonOS2024!',
    nombre: 'David Torres',
    rol: 'mesero',
  },
  {
    email: 'isabel.guzman@tizonmeats.com',
    password: 'TizonOS2024!',
    nombre: 'Isabel Guzmán',
    rol: 'mesero',
  },
];

async function crearUsuarios() {
  console.log('🔐 Creando usuarios de prueba en Supabase Auth...\n');

  for (const usuario of usuarios) {
    try {
      console.log(`📤 Creando: ${usuario.nombre} (${usuario.email})`);

      const { data, error } = await supabase.auth.admin.createUser({
        email: usuario.email,
        password: usuario.password,
        email_confirm: true, // Auto-confirmar email
        user_metadata: {
          nombre: usuario.nombre,
          rol: usuario.rol,
        },
      });

      if (error) {
        if (error.message.includes('already registered')) {
          console.log(`   ⚠️  Ya existe (omitido)`);
        } else {
          console.error(`   ❌ Error: ${error.message}`);
        }
      } else {
        console.log(`   ✅ Creado exitosamente (ID: ${data.user.id})`);
      }
    } catch (err) {
      console.error(`   ❌ Error inesperado:`, err.message);
    }
  }

  console.log('\n✅ Proceso completado!');
  console.log('\n📋 Credenciales para login en la app móvil:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Email: sofia.ramirez@tizonmeats.com');
  console.log('Password: TizonOS2024!');
  console.log('Rol: hostess (acceso completo)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// Ejecutar
crearUsuarios().catch((err) => {
  console.error('❌ Error fatal:', err);
  process.exit(1);
});
