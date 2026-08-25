/**
 * Script para crear usuarios de Supabase Auth que corresponden a la tabla staff
 * 
 * IMPORTANTE: Este script debe ejecutarse UNA SOLA VEZ después de aplicar el seed.
 * Crea los usuarios en Supabase Auth para que puedan hacer login con email/password.
 * 
 * Uso: node scripts/crear-usuarios-auth.js
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://gfrfnnlasgepepocjddu.supabase.co';
// IMPORTANTE: este script necesita el SERVICE_ROLE_KEY (ver Railway)
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ ERROR: Falta SUPABASE_SERVICE_ROLE_KEY');
  console.log('Configúralo así:');
  console.log('  SUPABASE_SERVICE_ROLE_KEY=tu_key node scripts/crear-usuarios-auth.js');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Usuarios a crear (mismos que el seed.sql)
const usuarios = [
  {
    email: 'laura.menendez@tizonmeats.com',
    password: 'tizon2024', // Contraseña temporal - cambiar después
    nombre: 'Laura Menéndez',
    rol: 'gerencia'
  },
  {
    email: 'sofia.ramirez@tizonmeats.com',
    password: 'tizon2024',
    nombre: 'Sofía Ramírez',
    rol: 'hostess'
  },
  {
    email: 'diego.castillo@tizonmeats.com',
    password: 'tizon2024',
    nombre: 'Diego Castillo',
    rol: 'hostess'
  },
  {
    email: 'mateo.fuentes@tizonmeats.com',
    password: 'tizon2024',
    nombre: 'Mateo Fuentes',
    rol: 'mesero'
  },
  {
    email: 'valentina.ortega@tizonmeats.com',
    password: 'tizon2024',
    nombre: 'Valentina Ortega',
    rol: 'mesero'
  }
];

async function crearUsuarios() {
  console.log('🔐 Creando usuarios en Supabase Auth...\n');

  let creados = 0;
  let existentes = 0;
  let errores = 0;

  for (const usuario of usuarios) {
    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email: usuario.email,
        password: usuario.password,
        email_confirm: true, // Confirmar email automáticamente
        user_metadata: {
          nombre: usuario.nombre,
          rol: usuario.rol
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          console.log(`⏭️  ${usuario.email} - Ya existe`);
          existentes++;
        } else {
          console.error(`❌ ${usuario.email} - Error:`, error.message);
          errores++;
        }
      } else {
        console.log(`✅ ${usuario.email} - Creado (${usuario.rol})`);
        creados++;
      }
    } catch (err) {
      console.error(`❌ ${usuario.email} - Excepción:`, err.message);
      errores++;
    }
  }

  console.log('\n📊 Resumen:');
  console.log(`   Creados: ${creados}`);
  console.log(`   Ya existían: ${existentes}`);
  console.log(`   Errores: ${errores}`);
  console.log(`   Total: ${usuarios.length}`);
  
  if (creados > 0 || existentes > 0) {
    console.log('\n🎉 ¡Listo! Ahora puedes hacer login en la app con:');
    console.log('   Email: sofia.ramirez@tizonmeats.com');
    console.log('   Password: tizon2024');
    console.log('\n⚠️  IMPORTANTE: Cambia estas contraseñas en producción');
  }
}

crearUsuarios()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Error fatal:', err);
    process.exit(1);
  });
