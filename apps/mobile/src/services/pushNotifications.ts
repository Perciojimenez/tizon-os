import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { tizonAPI } from './api';

// EAS projectId del proyecto Tizón OS (necesario para obtener el push token)
const EAS_PROJECT_ID = 'cbff190e-fc06-4141-a34a-fb315c06fd4f';

// Configurar cómo se muestran las notificaciones cuando la app está abierta
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    // Requeridos en Expo SDK 57+
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Solicita permisos, obtiene el Expo Push Token del dispositivo y lo
 * registra en el backend. Devuelve el token o null si no fue posible
 * (emulador, permisos denegados, etc.).
 */
export async function registrarPushNotifications(): Promise<string | null> {
  // Las notificaciones push solo funcionan en dispositivos físicos
  if (!Device.isDevice) {
    console.warn('Notificaciones push: no disponibles en emulador.');
    return null;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Notificaciones push: permiso no concedido.');
      return null;
    }

    // Canal de Android (debe crearse antes de recibir notificaciones)
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('tizon-alerts', {
        name: 'Alertas Tizón OS',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        sound: 'default',
        lightColor: '#c8102e',
      });
    }

    const token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: EAS_PROJECT_ID,
      })
    ).data;

    // Registrar el token en el backend
    try {
      await tizonAPI.registrarPushToken(token);
      console.log('Push token registrado en el backend:', token);
    } catch (e) {
      console.warn('Error registrando push token en backend:', e);
    }

    return token;
  } catch (err) {
    console.warn('Error configurando notificaciones push:', err);
    return null;
  }
}

/**
 * Elimina el token de push del dispositivo del backend (al cerrar sesión).
 */
export async function desregistrarPushNotifications(): Promise<void> {
  if (!Device.isDevice) return;
  try {
    const token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: EAS_PROJECT_ID,
      })
    ).data;
    await tizonAPI.eliminarPushToken(token);
  } catch (err) {
    console.warn('Error desregistrando push token:', err);
  }
}
