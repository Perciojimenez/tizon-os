import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, TextInput, Modal } from 'react-native';
import { tizonAPI } from '../services/api';

export const ListaEsperaScreen = () => {
  const [lista, setLista] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [nombreGrupo, setNombreGrupo] = useState('');
  const [numPersonas, setNumPersonas] = useState('2');
  const [telefono, setTelefono] = useState('');

  const cargarLista = async () => {
    setLoading(true);
    try {
      const data = await tizonAPI.obtenerListaEspera();
      setLista(data);
    } catch (err) {
      Alert.alert('Error', 'No se pudo cargar la lista de espera');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarLista(); }, []);

  const agregarWalkIn = async () => {
    if (!nombreGrupo || !numPersonas) {
      Alert.alert('Campos incompletos', 'Nombre del grupo y personas son requeridos');
      return;
    }
    try {
      await tizonAPI.crearWalkIn(nombreGrupo, parseInt(numPersonas), telefono || undefined);
      setModalVisible(false);
      setNombreGrupo(''); setNumPersonas('2'); setTelefono('');
      cargarLista();
    } catch (err) {
      Alert.alert('Error', 'No se pudo agregar a la lista');
    }
  };

  const avisar = async (id: string) => {
    try {
      await tizonAPI.actualizarEstadoEspera(id, 'avisado');
      cargarLista();
    } catch (err) {
      Alert.alert('Error', 'No se pudo avisar al grupo');
    }
  };

  const sentar = async (id: string) => {
    try {
      await tizonAPI.actualizarEstadoEspera(id, 'sentado');
      cargarLista();
    } catch (err) {
      Alert.alert('Error', 'No se pudo sentar al grupo');
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.nombre}>{item.nombre_grupo}</Text>
        <Text style={styles.personas}>{item.num_personas} pax</Text>
      </View>
      {item.telefono && <Text style={styles.tel}>📱 {item.telefono}</Text>}
      <Text style={styles.espera}>⏱ {item.tiempo_espera_estimado ?? 20} min est.</Text>
      <View style={styles.acciones}>
        {item.estado === 'esperando' && (
          <TouchableOpacity style={styles.btnAvisar} onPress={() => avisar(item.id)}>
            <Text style={styles.btnText}>📲 Avisar</Text>
          </TouchableOpacity>
        )}
        {(item.estado === 'esperando' || item.estado === 'avisado') && (
          <TouchableOpacity style={styles.btnSentar} onPress={() => sentar(item.id)}>
            <Text style={styles.btnText}>Sentar</Text>
          </TouchableOpacity>
        )}
        <View style={[styles.estadoBadge, item.estado === 'avisado' && styles.estadoAvisado]}>
          <Text style={styles.estadoText}>{item.estado}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <Text style={styles.titulo}>Lista de Espera</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Text style={styles.addBtnText}>+ Walk-in</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2196F3" style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={lista}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.empty}>No hay grupos esperando</Text>}
        />
      )}

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitulo}>Nuevo Walk-in</Text>
            <TextInput style={styles.modalInput} placeholder="Nombre del grupo" value={nombreGrupo} onChangeText={setNombreGrupo} />
            <TextInput style={styles.modalInput} placeholder="N° personas" value={numPersonas} onChangeText={setNumPersonas} keyboardType="numeric" />
            <TextInput style={styles.modalInput} placeholder="Teléfono (opcional)" value={telefono} onChangeText={setTelefono} keyboardType="phone-pad" />
            <View style={styles.modalAcciones}>
              <TouchableOpacity style={styles.modalCancelar} onPress={() => setModalVisible(false)}>
                <Text style={{ color: '#666' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmar} onPress={agregarWalkIn}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Agregar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 12 },
  headerBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  titulo: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  addBtn: { backgroundColor: '#FF9800', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 6 },
  addBtnText: { color: '#fff', fontWeight: 'bold' },
  // Card mejorada con diseño consistente
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 10, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, borderWidth: 1, borderColor: '#f0f0f0' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  nombre: { fontWeight: 'bold', fontSize: 15, color: '#333' },
  personas: { fontWeight: 'bold', color: '#FF9800', fontSize: 15 },
  tel: { fontSize: 13, color: '#666', marginBottom: 2 },
  espera: { fontSize: 12, color: '#999', marginBottom: 8 },
  acciones: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btnAvisar: { backgroundColor: '#FF9800', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 6, marginRight: 6 },
  btnSentar: { backgroundColor: '#4CAF50', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 6, marginRight: 6 },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 12 },
  estadoBadge: { backgroundColor: '#f0f0f0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  estadoAvisado: { backgroundColor: '#FFF3E0', borderWidth: 1, borderColor: '#FFB74D' },
  estadoText: { fontSize: 11, color: '#666', fontWeight: '500' },
  empty: { textAlign: 'center', color: '#999', marginTop: 40, fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 24 },
  modalTitulo: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#333' },
  modalInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 14 },
  modalAcciones: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 4 },
  modalCancelar: { paddingHorizontal: 16, paddingVertical: 10 },
  modalConfirmar: { backgroundColor: '#2196F3', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
});
