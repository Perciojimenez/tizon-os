/**
 * Script para crear un cliente y reserva de prueba para WhatsApp
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://gfrfnnlasgepepocjddu.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY no configurada');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function crearReservaTest() {
  console.log('🔧 CREAR RESERVA DE PRUEBA PARA WHATSAPP\n');
  
  const telefono = '+18295217466';
  const nombre = 'Cliente Test WhatsApp';
  
  try {
    // 1. Buscar o crear cliente
    console.log('1️⃣ Buscando cliente con teléfono', telefono);
    let { data: clienteExistente } = await supabase
      .from('clientes')
      .select('*')
      .eq('telefono', telefono)
      .single();
    
    let clienteId;
    
    if (clienteExistente) {
      console.log('   ✅ Cliente ya existe:', clienteExistente.nombre);
      clienteId = clienteExistente.id;
    } else {
      console.log('   ➕ Creando nuevo cliente...');
      const { data: nuevoCliente, error: errorCliente } = await supabase
        .from('clientes')
        .insert({
          nombre,
          telefono,
          email: 'test@tizonmeats.com',
          termino_carne_preferido: 'medio',
        })
        .select()
        .single();
      
      if (errorCliente) throw new Error(`Error al crear cliente: ${errorCliente.message}`);
      console.log('   ✅ Cliente creado:', nuevoCliente.nombre);
      clienteId = nuevoCliente.id;
    }
    
    // 2. Buscar una mesa disponible
    console.log('\n2️⃣ Buscando mesa disponible...');
    const { data: mesas } = await supabase
      .from('mesas')
      .select('*')
      .eq('estado', 'libre')
      .limit(1);
    
    if (!mesas || mesas.length === 0) {
      throw new Error('No hay mesas disponibles');
    }
    
    const mesa = mesas[0];
    console.log(`   ✅ Mesa encontrada: ${mesa.numero} (${mesa.capacidad} personas, ${mesa.zona})`);
    
    // 3. Crear reserva para HOY a las 20:00
    const hoy = new Date();
    const fechaSolo = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
    const horaInicio = '20:00:00';
    const horaFin = '21:30:00';
    const codigoReserva = `TZN-WA${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    
    console.log('\n3️⃣ Creando reserva...');
    const { data: reserva, error: errorReserva } = await supabase
      .from('reservas')
      .insert({
        cliente_id: clienteId,
        mesa_id: mesa.id,
        fecha: fechaSolo,
        hora_inicio: horaInicio,
        hora_fin: horaFin,
        num_comensales: 2,
        codigo_unico: codigoReserva,
        estado: 'confirmada',
        notas_servicio: 'Reserva de prueba para WhatsApp bidireccional',
      })
      .select()
      .single();
    
    if (errorReserva) throw new Error(`Error al crear reserva: ${errorReserva.message}`);
    
    console.log('   ✅ Reserva creada exitosamente!');
    console.log(`   📅 Código: ${reserva.codigo_unico}`);
    console.log(`   🕐 Fecha: ${reserva.fecha} Hora: ${reserva.hora_inicio}`);
    console.log(`   👥 Personas: ${reserva.num_comensales}`);
    console.log(`   🪑 Mesa: ${mesa.numero}`);
    
    console.log('\n✅ RESERVA LISTA PARA PRUEBAS DE WHATSAPP');
    console.log('\n📋 PRÓXIMOS PASOS:');
    console.log('   1. Ejecuta: node test-whatsapp.js (envía confirmación)');
    console.log('   2. Responde "1" al WhatsApp que recibas');
    console.log('   3. El webhook procesará tu respuesta automáticamente');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

crearReservaTest();
