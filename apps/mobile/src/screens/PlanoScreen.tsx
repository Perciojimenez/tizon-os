import React, { useState } from 'react';
import {
  View, ScrollView, StyleSheet, Text, ActivityIndicator,
  TouchableOpacity, Alert, Modal, RefreshControl,
} from 'react-native';
import { MesaCard } from '../components/MesaCard';
import { PacingIndicator } from '../components/PacingIndicator';
import { useMesas } from '../hooks/useMesas';
import { useSalaStore, Mesa } from '../store/salaStore';
import { useAuthStore } from '../store/authStore';
import { tizonAPI } from '../services/api';
import { supabase } from '../config/supabase';

const ESTADOS = [
  { key: 'libre',     label: 'Libre',     color: '#4CAF50' },
  { key: 'ocupada',   label: 'Ocupada',   color: '#FF9800' },
  { key: 'reservada', label: 'Reservada', color: '#2196F3' },
  { key: 'por_salir', label: 'Por salir', color: '#F44336' },
];

export const PlanoScreen = ({ navigation }: any) => {
  const { mesas, loading, error, refetch } = useMesas();
  const { pacingEstado } = useSalaStore();
  const { logout, user } = useAuthStore();

  const [mesaSel, setMesaSel] = useState<Mesa | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const cerrarSesion = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro que quieres cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar Sesión',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
          logout();
        },
      },
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const cambiarEstadoMesa = async (nuevoEstado: string) => {
    if (!mesaSel) return;
    try {
      await tizonAPI.actualizarEstadoMesa(mesaSel.id, nuevoEstado);
      setMesaSel(null);
      refetch();
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'No se pudo actualizar la mesa');
    }
  };

  if (loading && mesas.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.cargandoText}>Cargando mesas...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
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

      <View style={styles.mesasHeader}>
        <Text style={styles.sectionTitle}>Plano de Mesas</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.recargarBtn}>
          <Text style={styles.recargarText}>🔄 Recargar</Text>
        </TouchableOpacity>
      </View>

      {error && mesas.length === 0 ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>No se pudieron cargar las mesas.</Text>
          <Text style={styles.errorSub}>{error}</Text>
          <TouchableOpacity onPress={onRefresh} style={styles.reintentarBtn}>
            <Text style={styles.reintentarText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : mesas.length === 0 ? (
        <Text style={styles.vacio}>No hay mesas registradas.</Text>
      ) : (
        <View style={styles.mesasGrid}>
          {mesas.map((mesa) => (
            <MesaCard key={mesa.id} mesa={mesa} onPress={(m) => setMesaSel(m)} />
          ))}
        </View>
      )}

      <View style={{ height: 30 }} />

      {/* Modal de acciones de mesa */}
      <Modal visible={!!mesaSel} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>
                Mesa {mesaSel?.numero} · {mesaSel?.capacidad} personas
              </Text>
              <TouchableOpacity onPress={() => setMesaSel(null)}>
                <Text style={styles.modalCerrar}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSub}>Cambiar estado de la mesa:</Text>
            {ESTADOS.map((e) => (
              <TouchableOpacity
                key={e.key}
                style={[styles.estadoBtn, { backgroundColor: e.color }]}
                onPress={() => cambiarEstadoMesa(e.key)}
              >
                <Text style={styles.estadoBtnText}>{e.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 12 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  cargandoText: { marginTop: 12, color: '#888', fontSize: 14 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingVertical: 6 },
  bienvenida: { fontSize: 13, color: '#555', fontWeight: '500' },
  logoutBtn: { backgroundColor: '#ffebee', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  logoutText: { color: '#c62828', fontWeight: '600', fontSize: 13 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12, marginTop: 12, color: '#333' },
  mesasHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  recargarBtn: { padding: 8 },
  recargarText: { color: '#2196F3', fontSize: 13, fontWeight: '600' },
  mesasGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  vacio: { textAlign: 'center', color: '#999', marginTop: 30, fontSize: 14 },
  errorBox: { backgroundColor: '#fff3f3', borderRadius: 8, padding: 16, marginTop: 12, alignItems: 'center' },
  errorText: { color: '#c62828', fontWeight: '600', fontSize: 14 },
  errorSub: { color: '#999', fontSize: 12, marginTop: 4, textAlign: 'center' },
  reintentarBtn: { backgroundColor: '#2196F3', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 6, marginTop: 12 },
  reintentarText: { color: '#fff', fontWeight: '600' },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  modalTitulo: { fontSize: 17, fontWeight: 'bold', color: '#333' },
  modalCerrar: { fontSize: 20, color: '#999', padding: 4 },
  modalSub: { fontSize: 13, color: '#888', marginBottom: 12 },
  estadoBtn: { padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 8 },
  estadoBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});
