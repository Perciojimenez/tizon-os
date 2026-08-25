import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native';

import { LoginScreen } from '../screens/LoginScreen';
import { PlanoScreen } from '../screens/PlanoScreen';
import { ReservasScreen } from '../screens/ReservasScreen';
import { NuevaReservaScreen } from '../screens/NuevaReservaScreen';
import { ListaEsperaScreen } from '../screens/ListaEsperaScreen';
import { CRMScreen } from '../screens/CRMScreen';
import { ClienteDetalleScreen } from '../screens/ClienteDetalleScreen';
import { useAuthStore } from '../store/authStore';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const ICONS: { [key: string]: string } = {
  Plano: '🗺',
  Reservas: '📅',
  Espera: '⏳',
  Clientes: '👥',
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
      <Tab.Screen name="Plano" component={PlanoScreen} options={{ title: 'Plano de Sala' }} />
      <Tab.Screen name="Reservas" component={ReservasStack} options={{ title: 'Reservas', headerShown: false }} />
      <Tab.Screen name="Espera" component={ListaEsperaScreen} options={{ title: 'Lista de Espera' }} />
      <Tab.Screen name="Clientes" component={CRMStack} options={{ title: 'Huéspedes', headerShown: false }} />
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
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <Stack.Screen name="Home" component={HomeTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
