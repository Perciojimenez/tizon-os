import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AppNavigator } from './src/navigation/AppNavigator';
import { socket } from './src/config/socket';
import { useSalaStore } from './src/store/salaStore';
import { useAuthStore } from './src/store/authStore';
import { supabase } from './src/config/supabase';

export default function App() {
  const { actualizarMesa, setPacingEstado } = useSalaStore();
  const { setToken, setUser, logout } = useAuthStore();

  useEffect(() => {
    // Escuchar TODOS los eventos de autenticación de Supabase
    // Esto maneja: sesión inicial al abrir app, renovación automática, y logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.access_token) {
        // Actualizar token en el store con el token fresco de Supabase
        setToken(session.access_token);

        // Si tenemos sesión, asegurar que el usuario esté cargado
        if (session.user?.email) {
          const { data: staffData } = await supabase
            .from('staff')
            .select('id, nombre, email, rol')
            .eq('email', session.user.email)
            .single();

          if (staffData) {
            setUser({
              id: staffData.id,
              email: staffData.email,
              rol: staffData.rol,
              nombre: staffData.nombre,
            });
          }
        }
      } else if (event === 'SIGNED_OUT') {
        logout();
      }
    });

    // Conectar WebSocket y escuchar eventos en tiempo real
    socket.on('mesa-actualizada', (data) => {
      actualizarMesa(data.mesaId, { estado: data.estado });
    });

    socket.on('pacing-estado', (data) => {
      setPacingEstado({ estado: data.estado, personas: data.personas, capacidad: data.capacidad });
    });

    socket.on('lista-espera-actualizada', () => {});
    socket.on('reserva-confirmada', () => {});

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
