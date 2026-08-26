import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet, Text, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { MesaCard } from '../components/MesaCard';
import { PacingIndicator } from '../components/PacingIndicator';
import { useMesas } from '../hooks/useMesas';
import { useSalaStore } from '../store/salaStore';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../config/supabase';

export const PlanoScreen = ({ navigation }: any) => {
  const { mesas, loading } = useMesas();
  const { pacingEstado } = useSalaStore();
  const { logout, user } = useAuthStore();

  const cerrarSesion = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut();
            logout();
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header con usuario y botón logout */}
      <View style={styles.headerRow}>
        <Text style={styles.bienvenida}>👋 {user?.nombre || user?.email}</Text>
        <TouchableOpacity onPress={cerrarSesion} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Pacing - Motor de Cocina</Text>
      <PacingIndicator
        estado={pacingEstado?.estado}
        personas={pacingEstado?.personas}
        capacidad={pacingEstado?.capacidad}
      />

      <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Plano de Mesas</Text>

      <View style={styles.mesasGrid}>
        {mesas.map((mesa) => (
          <MesaCard
            key={mesa.id}
            mesa={mesa}
            onPress={(m) => navigation?.navigate('MesaDetail', { mesaId: m.id })}
          />
        ))}
      </View>

      <View style={{ height: 20 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 6,
  },
  bienvenida: {
    fontSize: 13,
    color: '#555',
    fontWeight: '500',
  },
  logoutBtn: {
    backgroundColor: '#ffebee',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  logoutText: {
    color: '#c62828',
    fontWeight: '600',
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 12,
    color: '#333',
  },
  mesasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
