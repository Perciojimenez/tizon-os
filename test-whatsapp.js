/**
 * Script de prueba para el flujo WhatsApp de Tizón OS
 * Envía un mensaje de WhatsApp de confirmación de reserva usando el backend en producción
 */

const API_URL = 'https://tizon-os-production.up.railway.app';

// TU número de teléfono (el que conectaste al Sandbox de Twilio con "join force-zebra")
const TU_NUMERO = '+18297224351';
const TU_NOMBRE = 'Percio';

async function enviarWhatsAppTest() {
  console.log('🚀 PRUEBA DE FLUJO WHATSAPP - Tizón OS\n');
  console.log(`📱 Destinatario: ${TU_NOMBRE} (${TU_NUMERO})`);
  console.log(`🔗 Backend: ${API_URL}`);
  console.log(`✅ Sandbox conectado: join force-zebra\n`);

  try {
    console.log('📤 Enviando WhatsApp de confirmación de reserva...');
    const response = await fetch(`${API_URL}/sms/test/enviar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        telefono: TU_NUMERO,
        nombre: TU_NOMBRE,
        tipo: 'confirmacion',
        canal: 'whatsapp', // 🔑 Clave: especificar WhatsApp
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error HTTP ${response.status}: ${errorText}`);
    }

    const resultado = await response.json();
    console.log('✅ WhatsApp enviado exitosamente!\n');
    console.log('📊 Resultado:', JSON.stringify(resultado, null, 2));
    console.log('\n💬 Revisa WhatsApp - deberías recibir el mensaje en unos segundos.');
    console.log('\n🔄 FLUJO COMPLETO DE PRUEBA:');
    console.log('  1. ✅ WhatsApp de confirmación enviado');
    console.log('  2. ⏳ Espera el mensaje en WhatsApp');
    console.log('  3. 💬 (OPCIONAL) Responde "1" para confirmar');
    console.log('  4. 🤖 El webhook procesará tu respuesta automáticamente');
    console.log('\n📝 Mensaje esperado en WhatsApp:');
    console.log(`  "¡Hola ${TU_NOMBRE}! Tu reserva en Tizón Meats para 2026-08-24 a las 20:00 (2 personas) está confirmada. Código: TZN-TEST. Te esperamos."`);
    console.log('\n📌 Nota: El número del Sandbox es +1 415 523 8886');
  } catch (error) {
    console.error('\n❌ Error al enviar WhatsApp:', error.message);
    console.error('\n💡 Verifica que:');
    console.error('  - El backend esté desplegado y corriendo');
    console.error('  - Las credenciales de Twilio estén configuradas (TWILIO_WHATSAPP_NUMBER)');
    console.error('  - Tu número esté conectado al Sandbox (enviaste "join force-zebra")');
    console.error('  - El número de teléfono esté en formato internacional (+1...)');
  }
}

// Ejecutar
enviarWhatsAppTest();
