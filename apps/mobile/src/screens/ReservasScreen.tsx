import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useReservas } from '../hooks/useReservas';
import { tizonAPI } from '../services/api';
import { Reserva } from '../store/salaStore';

export const ReservasScreen = ({ navigation }: any) => {
  const hoy = new Date().toISOString().split('T')[0];
  const [fechaSeleccionada, setFechaSeleccionada] = useState(hoy);
  const { reservas, loading, refetch } = useReservas({ fecha: fechaSeleccionada });

  const cambiarDia = (dias: number) => {
    const d = new Date(fechaSeleccionada);
    d.setDate(d.getDate() + dias);
    setFechaSeleccionada(d.toISOString().split('T')[0]);
  };

  const labelFecha = () => {
    if (fechaSeleccionada === hoy) return 'Hoy';
    const ayer = new Date(); ayer.setDate(ayer.getDate() - 1);
    if (fechaSeleccionada === ayer.toISOString().split('T')[0]) return 'Ayer';
    const manana = new Date(); manana.setDate(manana.getDate() + 1);
    if (fechaSeleccionada === manana.toISOString().split('T')[0]) return 'Mañana';
    return fechaSeleccionada;
  };

  const ESTADOS_COLOR: { [key: string]: string } = {
    pendiente: '#FF9800',
    confirmada: '#2196F3',
    sentada: '#4CAF50',
    completada: '#9E9E9E',
    cancelada: '#F44336',
  };

  const ESTADOS_LABEL: { [key: string]: string } = {
    pendiente: 'Pendiente',
    confirmada: 'Confirmada',
    sentada: 'Sentada',
    completada: 'Completada',
    cancelada: 'Cancelada',
  };

  const cambiarEstado = async (id: string, nuevoEstado: string) => {
    try {
      await tizonAPI.actualizarEstadoReserva(id, nuevoEstado);
      refetch();
    } catch (err) {
      Alert.alert('Error', 'No se pudo actualizar la reserva');
    }
  };

  const renderReserva = ({ item }: { item: Reserva }) => (
    <View style={styles.reservaCard}>
      <View style={styles.reservaContent}>
        {/* Hora prominente a la izquierda */}
        <View style={styles.horaBox}>
          <Text style={styles.horaGrande}>{item.hora_inicio?.slice(0, 5)}</Text>
        </View>

        {/* Info central */}
        <View style={styles.infoBox}>
          <View style={styles.infoRow}>
            <Text style={styles.codigo}>{item.codigo_unico}</Text>
            <View style={[styles.estadoBadge, { backgroundColor: ESTADOS_COLOR[item.estado] }]}>
              <Text style={styles.estadoText}>{ESTADOS_LABEL[item.estado]}</Text>
            </View>
          </View>
          <Text style={styles.detalle}>👥 {item.num_comensales} comensales</Text>
          
          {item.estado === 'confirmada' && (
            <View style={styles.acciones}>
              <TouchableOpacity style={styles.btn} onPress={() => cambiarEstado(item.id, 'sentada')}>
                <Text style={styles.btnText}>✓ Sentar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.btnCancelar]} onPress={() => cambiarEstado(item.id, 'cancelada')}>
                <Text style={styles.btnText}>✕ Cancelar</Text>
              </TouchableOpacity>
            </View>
          )}
          {item.estado === 'sentada' && (
            <TouchableOpacity style={[styles.btn, styles.btnCompletar]} onPress={() => cambiarEstado(item.id, 'completada')}>
              <Text style={styles.btnText}>✓ Completar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <Text style={styles.titulo}>Reservas</Text>
        <TouchableOpacity style={styles.nuevoBtn} onPress={() => navigation?.navigate('NuevaReserva')}>
          <Text style={styles.nuevoBtnText}>+ Nueva</Text>
        </TouchableOpacity>
      </View>

      {/* Selector de fecha */}
      <View style={styles.fechaNav}>
        <TouchableOpacity onPress={() => cambiarDia(-1)} style={styles.flechaBtn}>
          <Text style={styles.flechaText}>◀</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setFechaSeleccionada(hoy)} style={styles.fechaCenter}>
          <Text style={styles.fechaLabel}>{labelFecha()}</Text>
          <Text style={styles.fechaSub}>{fechaSeleccionada}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => cambiarDia(1)} style={styles.flechaBtn}>
          <Text style={styles.flechaText}>▶</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2196F3" style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={reservas}
          keyExtractor={(item) => item.id}
          renderItem={renderReserva}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={<Text style={styles.empty}>No hay reservas para {labelFecha().toLowerCase()}</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 12 },
  headerBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  titulo: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  nuevoBtn: { backgroundColor: '#2196F3', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 6 },
  nuevoBtnText: { color: '#fff', fontWeight: 'bold' },
  // Card mejorada con diseño aprobado
  reservaCard: { backgroundColor: '#fff', borderRadius: 10, marginBottom: 10, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, borderWidth: 1, borderColor: '#f0f0f0' },
  reservaContent: { flexDirection: 'row', padding: 12 },
  // Hora prominente a la izquierda
  horaBox: { width: 60, justifyContent: 'center', alignItems: 'center', borderRightWidth: 2, borderRightColor: '#2196F3', marginRight: 12 },
  horaGrande: { fontSize: 20, fontWeight: 'bold', color: '#2196F3' },
  // Info central
  infoBox: { flex: 1 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  codigo: { fontWeight: 'bold', fontSize: 15, color: '#333' },
  estadoBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  estadoText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  detalle: { color: '#666', fontSize: 13, marginBottom: 8 },
  acciones: { flexDirection: 'row', marginTop: 8, gap: 8 },
  btn: { backgroundColor: '#4CAF50', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 6, marginRight: 8 },
  btnCancelar: { backgroundColor: '#F44336' },
  btnCompletar: { backgroundColor: '#9E9E9E', marginTop: 8, alignSelf: 'flex-start' },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 12 },
  empty: { textAlign: 'center', color: '#999', marginTop: 40, fontSize: 14 },
  fechaNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f0f4ff', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12, marginBottom: 14 },
  flechaBtn: { padding: 8 },
  flechaText: { fontSize: 18, color: '#2196F3', fontWeight: 'bold' },
  fechaCenter: { alignItems: 'center', flex: 1 },
  fechaLabel: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  fechaSub: { fontSize: 11, color: '#888', marginTop: 1 },
});
