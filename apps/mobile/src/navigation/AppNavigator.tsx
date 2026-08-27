import React from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text, View } from 'react-native';
import { OfflineBanner } from '../components/OfflineBanner';

import { LoginScreen } from '../screens/LoginScreen';
import { PlanoScreen } from '../screens/PlanoScreen';
import { ReservasScreen } from '../screens/ReservasScreen';
import { NuevaReservaScreen } from '../screens/NuevaReservaScreen';
import { ListaEsperaScreen } from '../screens/ListaEsperaScreen';
import { CRMScreen } from '../screens/CRMScreen';
import { ClienteDetalleScreen } from '../screens/ClienteDetalleScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { GerenciaScreen } from '../screens/GerenciaScreen';
import { WhatsAppScreen } from '../screens/WhatsAppScreen';
import { useAuthStore } from '../store/authStore';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Referencia global de navegación para poder navegar desde fuera de
// componentes (p. ej. al tocar una notificación push).
export const navigationRef = createNavigationContainerRef();

/**
 * Navega a una pestaña principal según el nombre recibido en la
 * notificación push. Se usa desde los listeners en App.tsx.
 */
export function navegarADestino(pantalla?: string) {
  if (!pantalla || !navigationRef.isReady()) return;
  const pestanasValidas = ['Dashboard', 'Plano', 'Reservas', 'Espera', 'Clientes', 'Gerencia', 'WhatsApp'];
  if (pestanasValidas.includes(pantalla)) {
    // @ts-ignore - navegación dinámica por nombre
    navigationRef.navigate('Home', { screen: pantalla });
  }
}

const ICONS: { [key: string]: string } = {
  Dashboard: '📊',
  Plano: '🗺',
  Reservas: '📅',
  Espera: '⏳',
  Clientes: '👥',
  Gerencia: '📈',
  WhatsApp: '💬',
};

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: () => <Text style={{ fontSize: 20 }}>{ICONS[route.name] || '•'}</Text>,
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: '#999',
        headerStyle: { backgroundColor: '#1a1a1a' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="Plano" component={PlanoScreen} options={{ title: 'Plano de Sala' }} />
      <Tab.Screen name="Reservas" component={ReservasStack} options={{ title: 'Reservas', headerShown: false }} />
      <Tab.Screen name="Espera" component={ListaEsperaScreen} options={{ title: 'Lista de Espera' }} />
      <Tab.Screen name="Clientes" component={CRMStack} options={{ title: 'Huéspedes', headerShown: false }} />
      <Tab.Screen name="Gerencia" component={GerenciaScreen} options={{ title: 'Gerencia' }} />
      <Tab.Screen name="WhatsApp" component={WhatsAppScreen} options={{ title: 'WhatsApp' }} />
    </Tab.Navigator>
  );
}

function ReservasStack() {
  return (
    <Stack.Navigator screenOptions={{
      headerStyle: { backgroundColor: '#1a1a1a' },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: 'bold' },
    }}>
      <Stack.Screen name="ReservasList" component={ReservasScreen} options={{ title: 'Reservas' }} />
      <Stack.Screen name="NuevaReserva" component={NuevaReservaScreen} options={{ title: 'Nueva Reserva' }} />
    </Stack.Navigator>
  );
}

function CRMStack() {
  return (
    <Stack.Navigator screenOptions={{
      headerStyle: { backgroundColor: '#1a1a1a' },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: 'bold' },
    }}>
      <Stack.Screen name="CRMList" component={CRMScreen} options={{ title: 'Huéspedes' }} />
      <Stack.Screen name="ClienteDetalle" component={ClienteDetalleScreen} options={{ title: 'Perfil del Cliente' }} />
    </Stack.Navigator>
  );
}

export const AppNavigator = () => {
  const { user } = useAuthStore();

  return (
    <NavigationContainer ref={navigationRef}>
      {/* Contenedor que apila el aviso offline (si aplica) sobre toda la app.
          El banner ocupa espacio solo cuando hay algo que mostrar; en estado
          normal se oculta (devuelve null) y no afecta la vista. */}
      <View style={{ flex: 1 }}>
        {user && <OfflineBanner />}
        <View style={{ flex: 1 }}>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!user ? (
              <Stack.Screen name="Login" component={LoginScreen} />
            ) : (
              <Stack.Screen name="Home" component={HomeTabs} />
            )}
          </Stack.Navigator>
        </View>
      </View>
    </NavigationContainer>
  );
};
