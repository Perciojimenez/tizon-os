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
      <View style={styles.reservaHeader}>
        <Text style={styles.codigo}>{item.codigo_unico}</Text>
        <View style={[styles.estadoBadge, { backgroundColor: ESTADOS_COLOR[item.estado] }]}>
          <Text style={styles.estadoText}>{ESTADOS_LABEL[item.estado]}</Text>
        </View>
      </View>
      <Text style={styles.hora}>{item.hora_inicio?.slice(0, 5)} · {item.num_comensales} personas</Text>
      
      {item.estado === 'confirmada' && (
        <View style={styles.acciones}>
          <TouchableOpacity style={styles.btn} onPress={() => cambiarEstado(item.id, 'sentada')}>
            <Text style={styles.btnText}>Sentar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnCancelar]} onPress={() => cambiarEstado(item.id, 'cancelada')}>
            <Text style={styles.btnText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      )}
      {item.estado === 'sentada' && (
        <TouchableOpacity style={[styles.btn, styles.btnCompletar]} onPress={() => cambiarEstado(item.id, 'completada')}>
          <Text style={styles.btnText}>Completar</Text>
        </TouchableOpacity>
      )}
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
  reservaCard: { backgroundColor: '#f9f9f9', borderRadius: 8, padding: 14, marginBottom: 10 },
  reservaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  codigo: { fontWeight: 'bold', fontSize: 15, color: '#333' },
  estadoBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  estadoText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  hora: { color: '#555', fontSize: 13 },
  acciones: { flexDirection: 'row', marginTop: 10, gap: 8 },
  btn: { backgroundColor: '#4CAF50', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 6, marginRight: 8 },
  btnCancelar: { backgroundColor: '#F44336' },
  btnCompletar: { backgroundColor: '#9E9E9E', marginTop: 10, alignSelf: 'flex-start' },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  empty: { textAlign: 'center', color: '#999', marginTop: 40, fontSize: 14 },
  fechaNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f0f4ff', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12, marginBottom: 14 },
  flechaBtn: { padding: 8 },
  flechaText: { fontSize: 18, color: '#2196F3', fontWeight: 'bold' },
  fechaCenter: { alignItems: 'center', flex: 1 },
  fechaLabel: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  fechaSub: { fontSize: 11, color: '#888', marginTop: 1 },
});
