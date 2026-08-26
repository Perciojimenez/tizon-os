import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AppNavigator } from './src/navigation/AppNavigator';
import { socket } from './src/config/socket';
import { useSalaStore } from './src/store/salaStore';
import { useAuthStore } from './src/store/authStore';
import { supabase } from './src/config/supabase';

export default function App() {
  const { actualizarMesa, setPacingEstado, setListaEspera } = useSalaStore();
  const { loadStoredAuth, setToken, logout } = useAuthStore();

  useEffect(() => {
    // Cargar sesión almacenada al iniciar la app
    loadStoredAuth();

    // Escuchar cambios de autenticación de Supabase (renovación automática de token)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'TOKEN_REFRESHED' && session?.access_token) {
        // Token renovado automáticamente — actualizar en el store
        setToken(session.access_token);
      } else if (event === 'SIGNED_OUT') {
        logout();
      }
    });

    // Conectar WebSocket y escuchar eventos en tiempo real
    socket.on('mesa-actualizada', (data) => {
      console.log('🔄 WebSocket: Mesa actualizada', data);
      actualizarMesa(data.mesaId, { estado: data.estado });
    });

    socket.on('pacing-estado', (data) => {
      console.log('🔄 WebSocket: Pacing estado actualizado', data);
      setPacingEstado({ estado: data.estado, personas: data.personas, capacidad: data.capacidad });
    });

    socket.on('lista-espera-actualizada', (data) => {
      console.log('🔄 WebSocket: Lista espera actualizada', data);
    });

    socket.on('reserva-confirmada', (data) => {
      console.log('🔄 WebSocket: Reserva confirmada', data);
    });

    return () => {
      subscription.unsubscribe();
      socket.off('mesa-actualizada');
      socket.off('pacing-estado');
      socket.off('lista-espera-actualizada');
      socket.off('reserva-confirmada');
    };
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <AppNavigator />
    </>
  );
}
