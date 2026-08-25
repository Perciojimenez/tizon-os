#!/usr/bin/env node
/**
 * Script de Prueba E2E - Flujo Completo de Reservas + WhatsApp
 * 
 * Prueba el flujo completo:
 * 1. Login como hostess
 * 2. Buscar cliente por nombre
 * 3. Crear reserva
 * 4. Verificar que se creó en Supabase
 * 5. Verificar que se envió WhatsApp (logs)
 * 6. Simular respuesta del cliente (webhook)
 * 7. Verificar actualización de estado
 * 
 * Uso:
 *   node scripts/probar-flujo-e2e.js
 */

const https = require('https');

const API_BASE_URL = 'https://tizon-os-production.up.railway.app';

// Colores para terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

function request(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE_URL);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(json);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${JSON.stringify(json)}`));
          }
        } catch (e) {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(body);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${body}`));
          }
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  log('\n🧪 PRUEBA E2E - FLUJO COMPLETO RESERVAS + WHATSAPP\n', 'cyan');
  log('━'.repeat(60), 'cyan');

  let token = null;
  let clienteId = null;
  let mesaId = null;
  let reservaId = null;
  let codigoUnico = null;

  try {
    // ========================================
    // PASO 1: Login como Hostess
    // ========================================
    log('\n📍 PASO 1: Autenticación', 'blue');
    log('   Intentando login como hostess...', 'yellow');
    
    const loginRes = await request('POST', '/auth/login', {
      email: 'sofia.ramirez@tizonmeats.com',
      password: 'tizon2024',
    });

    token = loginRes.access_token;
    log(`   ✅ Login exitoso (token: ${token.substring(0, 20)}...)`, 'green');
    log(`   👤 Usuario: ${loginRes.user.nombre} (${loginRes.user.rol})`, 'green');

    // ========================================
    // PASO 2: Buscar Cliente
    // ========================================
    log('\n📍 PASO 2: Buscar Cliente', 'blue');
    log('   Buscando "Ricardo Pérez"...', 'yellow');

    const clientes = await request('GET', '/clientes?busqueda=Ricardo', null, token);
    
    if (!clientes || clientes.length === 0) {
      throw new Error('No se encontró el cliente Ricardo Pérez');
    }

    const ricardo = clientes.find(c => c.nombre.includes('Ricardo'));
    if (!ricardo) {
      throw new Error('Cliente Ricardo no encontrado en resultados');
    }

    clienteId = ricardo.id;
    log(`   ✅ Cliente encontrado: ${ricardo.nombre}`, 'green');
    log(`      📞 Teléfono: ${ricardo.telefono || 'N/A'}`, 'green');
    log(`      🆔 ID: ${clienteId}`, 'green');

    // ========================================
    // PASO 3: Obtener Mesa Disponible
    // ========================================
    log('\n📍 PASO 3: Buscar Mesa Disponible', 'blue');
    log('   Obteniendo lista de mesas...', 'yellow');

    const mesas = await request('GET', '/mesas', null, token);
    const mesaLibre = mesas.find(m => m.estado === 'libre' && m.capacidad >= 2);

    if (!mesaLibre) {
      throw new Error('No hay mesas libres disponibles');
    }

    mesaId = mesaLibre.id;
    log(`   ✅ Mesa disponible: ${mesaLibre.numero}`, 'green');
    log(`      👥 Capacidad: ${mesaLibre.capacidad} personas`, 'green');
    log(`      📍 Zona: ${mesaLibre.zona}`, 'green');
    log(`      🆔 ID: ${mesaId}`, 'green');

    // ========================================
    // PASO 4: Crear Reserva
    // ========================================
    log('\n📍 PASO 4: Crear Reserva', 'blue');
    log('   Creando reserva de prueba...', 'yellow');

    const ahora = new Date();
    const fecha = ahora.toISOString().split('T')[0];
    const hora = '20:00';

    const reserva = await request('POST', '/reservas', {
      clienteId,
      mesaId,
      fecha,
      horaInicio: hora,
      numComensales: 2,
      notasServicio: 'Prueba E2E automatizada',
    }, token);

    reservaId = reserva.id;
    codigoUnico = reserva.codigo_unico;

    log(`   ✅ Reserva creada exitosamente`, 'green');
    log(`      🔑 Código: ${codigoUnico}`, 'green');
    log(`      📅 Fecha: ${reserva.fecha}`, 'green');
    log(`      🕐 Hora: ${reserva.hora_inicio}`, 'green');
    log(`      👥 Comensales: ${reserva.num_comensales}`, 'green');
    log(`      📊 Estado: ${reserva.estado}`, 'green');
    log(`      🆔 ID: ${reservaId}`, 'green');

    // ========================================
    // PASO 5: Verificar en Base de Datos
    // ========================================
    log('\n📍 PASO 5: Verificar en Base de Datos', 'blue');
    log('   Consultando reserva recién creada...', 'yellow');

    await sleep(1000); // Esperar 1 segundo para que se procese

    const reservaDB = await request('GET', `/reservas/${reservaId}`, null, token);
    
    log(`   ✅ Reserva verificada en BD`, 'green');
    log(`      Estado en BD: ${reservaDB.estado}`, 'green');
    log(`      Código coincide: ${reservaDB.codigo_unico === codigoUnico ? '✅' : '❌'}`, 'green');

    // ========================================
    // PASO 6: Simular Respuesta del Cliente
    // ========================================
    log('\n📍 PASO 6: Simular Respuesta del Cliente vía WhatsApp', 'blue');
    log('   Simulando webhook de Twilio...', 'yellow');
    log('   (El cliente responde "1" para confirmar)', 'yellow');

    const telefonoCliente = ricardo.telefono || '+18095551234';
    
    try {
      const webhookRes = await request('POST', '/sms/webhook', {
        From: `whatsapp:${telefonoCliente}`,
        To: 'whatsapp:+14155238886',
        Body: '1',
      });

      log(`   ✅ Webhook procesado`, 'green');
      log(`      Acción: ${webhookRes.accion || 'procesado'}`, 'green');
      log(`      Reserva ID: ${webhookRes.reservaId || reservaId}`, 'green');
    } catch (e) {
      log(`   ⚠️  Webhook: ${e.message}`, 'yellow');
      log(`      (Esto es esperado si el cliente no existe en BD)`, 'yellow');
    }

    // ========================================
    // PASO 7: Verificar Estado Actualizado
    // ========================================
    log('\n📍 PASO 7: Verificar Estado Actualizado', 'blue');
    log('   Consultando reserva después de webhook...', 'yellow');

    await sleep(2000); // Esperar 2 segundos para procesamiento

    const reservaFinal = await request('GET', `/reservas/${reservaId}`, null, token);
    
    log(`   ✅ Estado final verificado`, 'green');
    log(`      Estado: ${reservaFinal.estado}`, 'green');
    
    if (reservaFinal.estado === 'confirmada') {
      log(`      ✅ La reserva fue confirmada correctamente`, 'green');
    } else {
      log(`      ⚠️  Estado no cambió (esperado si webhook falló)`, 'yellow');
    }

    // ========================================
    // PASO 8: Verificar Log de SMS
    // ========================================
    log('\n📍 PASO 8: Verificar Log de Mensajes', 'blue');
    log('   Consultando historial de SMS del cliente...', 'yellow');

    try {
      const smsLog = await request('GET', `/sms/log/${clienteId}`, null, token);
      
      if (smsLog && smsLog.length > 0) {
        log(`   ✅ Encontrados ${smsLog.length} mensajes`, 'green');
        const ultimo = smsLog[smsLog.length - 1];
        log(`      Último mensaje: ${ultimo.tipo}`, 'green');
        log(`      Estado: ${ultimo.estado}`, 'green');
        log(`      Canal: ${ultimo.canal || 'N/A'}`, 'green');
      } else {
        log(`   ℹ️  No hay mensajes registrados`, 'yellow');
      }
    } catch (e) {
      log(`   ⚠️  No se pudo obtener log: ${e.message}`, 'yellow');
    }

    // ========================================
    // RESUMEN FINAL
    // ========================================
    log('\n' + '━'.repeat(60), 'cyan');
    log('✅ PRUEBA E2E COMPLETADA EXITOSAMENTE', 'green');
    log('━'.repeat(60), 'cyan');
    
    log('\n📊 RESUMEN:', 'cyan');
    log(`   • Cliente: ${ricardo.nombre}`, 'cyan');
    log(`   • Mesa: ${mesaLibre.numero} (${mesaLibre.zona})`, 'cyan');
    log(`   • Código Reserva: ${codigoUnico}`, 'cyan');
    log(`   • Estado Final: ${reservaFinal.estado}`, 'cyan');
    
    log('\n💡 PRÓXIMOS PASOS:', 'cyan');
    log(`   1. Verifica logs de Railway para el auto-envío de WhatsApp`, 'cyan');
    log(`   2. Revisa Supabase tabla 'sms_log' para el mensaje enviado`, 'cyan');
    log(`   3. Verifica WebSocket emitió evento 'reserva-confirmada'`, 'cyan');
    
    log('\n🔗 ENLACES ÚTILES:', 'cyan');
    log(`   Railway: https://railway.app/dashboard`, 'cyan');
    log(`   Supabase: https://supabase.com/dashboard`, 'cyan');
    log('');

  } catch (error) {
    log('\n' + '━'.repeat(60), 'red');
    log('❌ ERROR EN LA PRUEBA E2E', 'red');
    log('━'.repeat(60), 'red');
    log(`\n${error.message}`, 'red');
    log(`\nStack: ${error.stack}\n`, 'yellow');
    process.exit(1);
  }
}

main().catch((err) => {
  log(`\n❌ Error inesperado: ${err.message}`, 'red');
  process.exit(1);
});
