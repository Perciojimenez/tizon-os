import React from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OfflineBanner } from '../components/OfflineBanner';
import { ErrorBoundary } from '../components/ErrorBoundary';

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
import { PedidosScreen } from '../screens/PedidosScreen';
import { CocinaScreen } from '../screens/CocinaScreen';
import { CuentaScreen } from '../screens/CuentaScreen';
import { MasScreen } from '../screens/MasScreen';
import { useAuthStore } from '../store/authStore';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Referencia global de navegación para poder navegar desde fuera de
// componentes (p. ej. al tocar una notificación push).
export const navigationRef = createNavigationContainerRef();

// Estilo de header oscuro reutilizado por todos los Stacks.
const headerDark = {
  headerStyle: { backgroundColor: '#1a1a1a' },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: 'bold' as const },
};

/**
 * Mapea el nombre de pantalla recibido en una notificación push al
 * tab principal donde vive esa pantalla, para poder navegar al tocarla.
 */
const DESTINO_A_TAB: { [key: string]: { tab: string; screen?: string } } = {
  Plano: { tab: 'Sala', screen: 'Plano' },
  Espera: { tab: 'Sala', screen: 'Espera' },
  Reservas: { tab: 'Reservas' },
  Pedidos: { tab: 'Servicio', screen: 'Pedidos' },
  Cocina: { tab: 'Servicio', screen: 'Cocina' },
  Cuenta: { tab: 'Servicio', screen: 'Cuenta' },
  Clientes: { tab: 'Clientes', screen: 'CRMList' },
  WhatsApp: { tab: 'Clientes', screen: 'WhatsApp' },
  Dashboard: { tab: 'Gestion', screen: 'Dashboard' },
  Gerencia: { tab: 'Gestion', screen: 'Gerencia' },
};

export function navegarADestino(pantalla?: string) {
  if (!pantalla || !navigationRef.isReady()) return;
  const destino = DESTINO_A_TAB[pantalla];
  if (!destino) return;
  // @ts-ignore - navegación dinámica por nombre
  navigationRef.navigate('Home', {
    screen: destino.tab,
    params: destino.screen ? { screen: destino.screen } : undefined,
  });
}

// ---------- Stacks por área ----------

function SalaStack() {
  return (
    <Stack.Navigator screenOptions={headerDark}>
      <Stack.Screen name="Plano" component={PlanoScreen} options={{ title: 'Plano de Sala' }} />
      <Stack.Screen name="Espera" component={ListaEsperaScreen} options={{ title: 'Lista de Espera' }} />
    </Stack.Navigator>
  );
}

function ReservasStack() {
  return (
    <Stack.Navigator screenOptions={headerDark}>
      <Stack.Screen name="ReservasList" component={ReservasScreen} options={{ title: 'Reservas' }} />
      <Stack.Screen name="NuevaReserva" component={NuevaReservaScreen} options={{ title: 'Nueva Reserva' }} />
    </Stack.Navigator>
  );
}

function ServicioHub() {
  return (
    <MasScreen
      items={[
        { label: 'Tomar Pedido', descripcion: 'Registrar comandas por mesa', icon: '🍽️', target: 'Pedidos' },
        { label: 'Vista Cocina', descripcion: 'Comandas pendientes en cocina', icon: '👨‍🍳', target: 'Cocina' },
        { label: 'Cerrar Cuenta', descripcion: 'Generar la cuenta de la mesa', icon: '🧾', target: 'Cuenta' },
      ]}
    />
  );
}

function ServicioStack() {
  return (
    <Stack.Navigator screenOptions={headerDark}>
      <Stack.Screen name="ServicioHub" component={ServicioHub} options={{ title: 'Servicio' }} />
      <Stack.Screen name="Pedidos" component={PedidosScreen} options={{ title: 'Tomar Pedido' }} />
      <Stack.Screen name="Cocina" component={CocinaScreen} options={{ title: 'Cocina' }} />
      <Stack.Screen name="Cuenta" component={CuentaScreen} options={{ title: 'Cuenta' }} />
    </Stack.Navigator>
  );
}

function ClientesHub() {
  return (
    <MasScreen
      items={[
        { label: 'Huéspedes', descripcion: 'Base de clientes y perfiles', icon: '👥', target: 'CRMList' },
        { label: 'WhatsApp', descripcion: 'Mensajería y recordatorios', icon: '💬', target: 'WhatsApp' },
      ]}
    />
  );
}

function ClientesStack() {
  return (
    <Stack.Navigator screenOptions={headerDark}>
      <Stack.Screen name="ClientesHub" component={ClientesHub} options={{ title: 'Clientes' }} />
      <Stack.Screen name="CRMList" component={CRMScreen} options={{ title: 'Huéspedes' }} />
      <Stack.Screen name="ClienteDetalle" component={ClienteDetalleScreen} options={{ title: 'Perfil del Cliente' }} />
      <Stack.Screen name="WhatsApp" component={WhatsAppScreen} options={{ title: 'WhatsApp' }} />
    </Stack.Navigator>
  );
}

function GestionHub() {
  return (
    <MasScreen
      items={[
        { label: 'Dashboard', descripcion: 'Indicadores del día', icon: '📊', target: 'Dashboard' },
        { label: 'Gerencia', descripcion: 'Reportes y analítica', icon: '📈', target: 'Gerencia' },
      ]}
    />
  );
}

function GestionStack() {
  return (
    <Stack.Navigator screenOptions={headerDark}>
      <Stack.Screen name="GestionHub" component={GestionHub} options={{ title: 'Gestión' }} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Dashboard' }} />
      <Stack.Screen name="Gerencia" component={GerenciaScreen} options={{ title: 'Gerencia' }} />
    </Stack.Navigator>
  );
}

// ---------- Tabs principales (5) ----------

const TAB_ICONS: { [key: string]: string } = {
  Sala: '🗺',
  Reservas: '📅',
  Servicio: '🍽️',
  Clientes: '👥',
  Gestion: '📊',
};

function HomeTabs() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const esTablet = width > 600;
  const iconSize = esTablet ? 22 : 18;
  const labelSize = esTablet ? 12 : 10;
  const barHeight = esTablet ? 70 : 60;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: () => <Text style={{ fontSize: iconSize }}>{TAB_ICONS[route.name] || '•'}</Text>,
        tabBarLabelStyle: { fontSize: labelSize },
        tabBarStyle: {
          backgroundColor: '#1a1a1a',
          borderTopColor: '#333',
          height: barHeight + insets.bottom,
          paddingBottom: insets.bottom + (esTablet ? 8 : 4),
          paddingTop: esTablet ? 8 : 4,
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: '#999',
        headerShown: false,
        lazy: true,
      })}
    >
      <Tab.Screen name="Sala" component={SalaStack} options={{ title: 'Sala' }} />
      <Tab.Screen name="Reservas" component={ReservasStack} options={{ title: 'Reservas' }} />
      <Tab.Screen name="Servicio" component={ServicioStack} options={{ title: 'Servicio' }} />
      <Tab.Screen name="Clientes" component={ClientesStack} options={{ title: 'Clientes' }} />
      <Tab.Screen name="Gestion" component={GestionStack} options={{ title: 'Gestión' }} />
    </Tab.Navigator>
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
        {user && (
          <ErrorBoundary>
            <OfflineBanner />
          </ErrorBoundary>
        )}
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
