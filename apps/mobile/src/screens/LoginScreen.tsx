import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../config/supabase';

export const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { saveSession } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      // 1. Autenticar con Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (!data.session?.access_token) {
        throw new Error('No se obtuvo token de sesión');
      }

      // 2. Obtener datos del staff desde la tabla
      const { data: staffData, error: staffError } = await supabase
        .from('staff')
        .select('id, nombre, email, rol')
        .eq('email', data.user!.email)
        .single();

      if (staffError) {
        throw new Error('Usuario no encontrado en el sistema. Contacta al administrador.');
      }

      if (!staffData) {
        throw new Error('No se encontraron datos del usuario');
      }

      // 3. Guardar sesión completa (access + refresh token) para auto-renovación
      await saveSession(data.session.access_token, data.session.refresh_token, {
        id: staffData.id,
        email: staffData.email,
        rol: staffData.rol,
        nombre: staffData.nombre,
      });

      navigation?.replace('Home');
    } catch (err) {
      Alert.alert('Error de login', err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🍖 Tizón OS</Text>
      <Text style={styles.subtitle}>Sistema de Gestión de Sala</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        editable={!loading}
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        editable={!loading}
        secureTextEntry
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Iniciar Sesión</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.footer}>Credenciales de prueba:</Text>
      <Text style={styles.footerSmall}>sofia.ramirez@tizonmeats.com / tizon2024</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 12,
    color: '#999',
  },
  footerSmall: {
    textAlign: 'center',
    fontSize: 11,
    color: '#bbb',
    marginTop: 4,
  },
});
