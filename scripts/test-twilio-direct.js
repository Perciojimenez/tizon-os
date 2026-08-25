/**
 * Script de diagnóstico directo de Twilio
 * Prueba envío de SMS y WhatsApp sin pasar por el backend
 */

const twilio = require('twilio');

// Credenciales - reemplaza con las tuyas
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || 'TU_ACCOUNT_SID';
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || 'TU_AUTH_TOKEN';
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER || '+14247244485';
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER || '+14155238886';

// Número de destino para la prueba
const NUMERO_DESTINO = process.env.TEST_PHONE || '+18297224351';

console.log('🔍 DIAGNÓSTICO DE TWILIO\n');
console.log('Configuración:');
console.log(`  TWILIO_ACCOUNT_SID: ${TWILIO_ACCOUNT_SID}`);
console.log(`  TWILIO_AUTH_TOKEN: ${TWILIO_AUTH_TOKEN ? '***' + TWILIO_AUTH_TOKEN.slice(-4) : 'NO CONFIGURADO'}`);
console.log(`  TWILIO_PHONE_NUMBER: ${TWILIO_PHONE_NUMBER}`);
console.log(`  TWILIO_WHATSAPP_NUMBER: ${TWILIO_WHATSAPP_NUMBER}`);
console.log(`  NUMERO_DESTINO: ${NUMERO_DESTINO}\n`);

if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || TWILIO_ACCOUNT_SID === 'TU_ACCOUNT_SID') {
  console.error('❌ Error: Configura las variables de entorno de Twilio');
  console.error('   export TWILIO_ACCOUNT_SID=...');
  console.error('   export TWILIO_AUTH_TOKEN=...');
  process.exit(1);
}

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

async function testSMS() {
  console.log('📱 TEST 1: Envío de SMS tradicional\n');
  
  try {
    console.log(`   From: ${TWILIO_PHONE_NUMBER}`);
    console.log(`   To: ${NUMERO_DESTINO}`);
    console.log(`   Body: "Test SMS desde Tizón OS - ${new Date().toISOString()}"`);
    
    const message = await client.messages.create({
      body: `Test SMS desde Tizón OS - ${new Date().toISOString()}`,
      from: TWILIO_PHONE_NUMBER,
      to: NUMERO_DESTINO,
    });
    
    console.log(`   ✅ SMS enviado exitosamente!`);
    console.log(`   SID: ${message.sid}`);
    console.log(`   Status: ${message.status}`);
    console.log(`   Date created: ${message.dateCreated}\n`);
    
    return true;
  } catch (error) {
    console.error(`   ❌ Error al enviar SMS:`);
    console.error(`   Code: ${error.code}`);
    console.error(`   Message: ${error.message}`);
    console.error(`   More info: ${error.moreInfo}\n`);
    return false;
  }
}

async function testWhatsApp() {
  console.log('💬 TEST 2: Envío de WhatsApp\n');
  
  try {
    const fromWhatsApp = `whatsapp:${TWILIO_WHATSAPP_NUMBER}`;
    const toWhatsApp = `whatsapp:${NUMERO_DESTINO}`;
    
    console.log(`   From: ${fromWhatsApp}`);
    console.log(`   To: ${toWhatsApp}`);
    console.log(`   Body: "Test WhatsApp desde Tizón OS - ${new Date().toISOString()}"`);
    
    const message = await client.messages.create({
      body: `Test WhatsApp desde Tizón OS - ${new Date().toISOString()}`,
      from: fromWhatsApp,
      to: toWhatsApp,
    });
    
    console.log(`   ✅ WhatsApp enviado exitosamente!`);
    console.log(`   SID: ${message.sid}`);
    console.log(`   Status: ${message.status}`);
    console.log(`   Date created: ${message.dateCreated}\n`);
    
    return true;
  } catch (error) {
    console.error(`   ❌ Error al enviar WhatsApp:`);
    console.error(`   Code: ${error.code}`);
    console.error(`   Message: ${error.message}`);
    console.error(`   More info: ${error.moreInfo}\n`);
    return false;
  }
}

async function runTests() {
  const smsSuccess = await testSMS();
  await new Promise(resolve => setTimeout(resolve, 2000)); // Espera 2s entre tests
  const whatsappSuccess = await testWhatsApp();
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 RESUMEN:');
  console.log(`   SMS: ${smsSuccess ? '✅ OK' : '❌ FALLO'}`);
  console.log(`   WhatsApp: ${whatsappSuccess ? '✅ OK' : '❌ FALLO'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  if (!smsSuccess && !whatsappSuccess) {
    console.error('💡 SOLUCIONES POSIBLES:');
    console.error('   1. Verifica que TWILIO_ACCOUNT_SID y TWILIO_AUTH_TOKEN sean correctos');
    console.error('   2. Verifica que el número de destino esté en formato E.164 (+1...)');
    console.error('   3. Para WhatsApp: asegúrate de haber enviado "join force-zebra" al Sandbox');
    console.error('   4. Verifica saldo en tu cuenta de Twilio: https://console.twilio.com');
  }
}

runTests().catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});
