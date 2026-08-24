/**
 * Script de prueba para el flujo SMS de Tizón OS
 * Envía un SMS de confirmación de reserva usando el backend en producción
 */

const API_URL = 'https://tizon-os-production.up.railway.app';

// Número que recibirá el SMS de prueba
const TU_NUMERO = '+13219484666';
const TU_NOMBRE = 'Percio';

async function enviarSmsTest() {
  console.log('🚀 PRUEBA DE FLUJO SMS - Tizón OS\n');
  console.log(`📱 Destinatario: ${TU_NOMBRE} (${TU_NUMERO})`);
  console.log(`🔗 Backend: ${API_URL}\n`);

  try {
    console.log('📤 Enviando SMS de confirmación de prueba...');
    const response = await fetch(`${API_URL}/sms/test/enviar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        telefono: TU_NUMERO,
        nombre: TU_NOMBRE,
        tipo: 'confirmacion', // Opciones: confirmacion, recordatorio, lista_espera, agradecimiento
        canal: 'sms', // 🔑 Forzar SMS (el default es WhatsApp)
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error HTTP ${response.status}: ${errorText}`);
    }

    const resultado = await response.json();
    console.log('✅ SMS enviado exitosamente!\n');
    console.log('📊 Resultado:', JSON.stringify(resultado, null, 2));
    console.log('\n💬 Revisa tu teléfono - deberías recibir el SMS en unos segundos.');
    console.log('\n🔄 FLUJO COMPLETO DE PRUEBA:');
    console.log('  1. ✅ SMS de confirmación enviado');
    console.log('  2. ⏳ Espera el SMS en tu teléfono');
    console.log('  3. 💬 (OPCIONAL) Responde "1" para confirmar');
    console.log('  4. 🤖 El webhook procesará tu respuesta automáticamente');
    console.log('\n📝 Mensaje esperado:');
    console.log('  "¡Hola Percio! Tu reserva en Tizón Meats para 2026-08-24 a las 20:00 (2 personas) está confirmada. Código: TZN-TEST. Te esperamos."');
  } catch (error) {
    console.error('\n❌ Error al enviar SMS:', error.message);
    console.error('\n💡 Verifica que:');
    console.error('  - El backend esté desplegado y corriendo');
    console.error('  - Las credenciales de Twilio estén configuradas');
    console.error('  - El número de teléfono esté en formato internacional (+1...)');
  }
}

// Ejecutar
enviarSmsTest();
