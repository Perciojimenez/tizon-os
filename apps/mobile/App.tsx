import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AppNavigator } from './src/navigation/AppNavigator';
import { socket } from './src/config/socket';
import { useSalaStore } from './src/store/salaStore';
import { useAuthStore } from './src/store/authStore';

export default function App() {
  const { actualizarMesa, setPacingEstado, setListaEspera } = useSalaStore();
  const { loadStoredAuth } = useAuthStore();

  useEffect(() => {
    // Cargar sesión almacenada al iniciar la app
    loadStoredAuth();
    
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
      // Refetch lista de espera
    });

    socket.on('reserva-confirmada', (data) => {
      console.log('🔄 WebSocket: Reserva confirmada', data);
      // Actualizar UI en pantallas de reservas
      // Este evento se dispara cuando:
      // 1. Se crea una nueva reserva
      // 2. El cliente confirma/cancela por WhatsApp
      // 3. Se actualiza el estado de una reserva
    });

    return () => {
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
