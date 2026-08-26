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
  const { setToken, setUser, saveSession, loadStoredSession, logout } = useAuthStore();

  useEffect(() => {
    // 1. Restaurar sesión guardada en SecureStore y pasarla a Supabase
    //    Esto permite que Supabase renueve el token automáticamente
    loadStoredSession().then(async (stored) => {
      if (stored) {
        // Restaurar sesión en Supabase para que pueda auto-renovar
        await supabase.auth.setSession({
          access_token: stored.accessToken,
          refresh_token: stored.refreshToken,
        });
      }
    });

    // 2. Escuchar TODOS los eventos de auth de Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.access_token) {
        // Actualizar token en store con el token fresco
        setToken(session.access_token);

        // Si Supabase renovó el token, actualizar el refresh token guardado
        if ((event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session.refresh_token) {
          // Obtener datos del usuario si no los tenemos
          if (session.user?.email) {
            const { data: staffData } = await supabase
              .from('staff')
              .select('id, nombre, email, rol')
              .eq('email', session.user.email)
              .single();

            if (staffData) {
              await saveSession(session.access_token, session.refresh_token, {
                id: staffData.id,
                email: staffData.email,
                rol: staffData.rol,
                nombre: staffData.nombre,
              });
            }
          }
        }
      } else if (event === 'SIGNED_OUT') {
        logout();
      }
    });

    // 3. WebSocket eventos en tiempo real
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
