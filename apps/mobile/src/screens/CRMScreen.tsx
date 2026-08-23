import React, { useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Modal } from 'react-native';
import { useClientes } from '../hooks/useClientes';
import { Cliente } from '../store/salaStore';

export const CRMScreen = ({ navigation }: any) => {
  const [busqueda, setBusqueda] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoTelefono, setNuevoTelefono] = useState('');
  const [nuevoEmail, setNuevoEmail] = useState('');
  const { clientes, loading, buscar, crear } = useClientes();

  const handleBuscar = (texto: string) => {
    setBusqueda(texto);
    if (texto.length >= 2) buscar(texto);
    else if (texto.length === 0) buscar('');
  };

  const crearCliente = async () => {
    if (!nuevoNombre) { Alert.alert('Error', 'El nombre es obligatorio'); return; }
    const cliente = await crear(nuevoNombre, nuevoTelefono || undefined, nuevoEmail || undefined);
    if (cliente) {
      setModalVisible(false);
      setNuevoNombre(''); setNuevoTelefono(''); setNuevoEmail('');
    } else {
      Alert.alert('Error', 'No se pudo crear el cliente');
    }
  };

  const TERMINACIONES: { [key: string]: string } = {
    vuelta_y_vuelta: '🥩 V&V',
    punto_rojo: '🥩 Punto rojo',
    medio: '🥩 Medio',
    tres_cuartos: '🥩 ¾',
    bien_cocido: '🥩 Bien cocido',
  };

  const renderCliente = ({ item }: { item: Cliente }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation?.navigate('ClienteDetalle', { clienteId: item.id })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.nombre}>{item.nombre}</Text>
        <View style={styles.tags}>
          {item.etiquetas?.includes('VIP') && <Text style={styles.tagVIP}>⭐ VIP</Text>}
          {item.etiquetas?.includes('cumpleanos') && <Text style={styles.tagCump}>🎂</Text>}
        </View>
      </View>
      {item.telefono && <Text style={styles.info}>📱 {item.telefono}</Text>}
      {item.termino_carne_preferido && (
        <Text style={styles.info}>{TERMINACIONES[item.termino_carne_preferido] || item.termino_carne_preferido}</Text>
      )}
      {item.alergias && item.alergias.length > 0 && (
        <Text style={styles.alergia}>⚠️ {item.alergias.join(', ')}</Text>
      )}
      <View style={styles.cardFooter}>
        <Text style={styles.visitas}>{item.num_visitas ?? 0} visitas</Text>
        {item.gasto_total && item.gasto_total > 0 && (
          <Text style={styles.gasto}>${item.gasto_total?.toLocaleString()}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <Text style={styles.titulo}>CRM Huéspedes</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Text style={styles.addBtnText}>+ Nuevo</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.buscador}
        placeholder="🔍  Buscar por nombre o teléfono..."
        value={busqueda}
        onChangeText={handleBuscar}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#2196F3" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={clientes}
          keyExtractor={(item) => item.id}
          renderItem={renderCliente}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {busqueda.length > 0 ? 'Sin resultados' : 'Escribe para buscar un cliente'}
            </Text>
          }
        />
      )}

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitulo}>Nuevo Cliente</Text>
            <TextInput style={styles.modalInput} placeholder="Nombre completo *" value={nuevoNombre} onChangeText={setNuevoNombre} />
            <TextInput style={styles.modalInput} placeholder="Teléfono" value={nuevoTelefono} onChangeText={setNuevoTelefono} keyboardType="phone-pad" />
            <TextInput style={styles.modalInput} placeholder="Email" value={nuevoEmail} onChangeText={setNuevoEmail} keyboardType="email-address" />
            <View style={styles.modalAcciones}>
              <TouchableOpacity style={styles.modalCancelar} onPress={() => setModalVisible(false)}>
                <Text style={{ color: '#666' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmar} onPress={crearCliente}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Crear</Text>
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
  headerBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  titulo: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  addBtn: { backgroundColor: '#4CAF50', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 6 },
  addBtnText: { color: '#fff', fontWeight: 'bold' },
  buscador: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 11, marginBottom: 12, fontSize: 14, backgroundColor: '#fafafa' },
  card: { backgroundColor: '#f9f9f9', borderRadius: 8, padding: 14, marginBottom: 8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  nombre: { fontWeight: 'bold', fontSize: 15, color: '#333' },
  tags: { flexDirection: 'row', gap: 6 },
  tagVIP: { color: '#FFC107', fontSize: 13, fontWeight: '600' },
  tagCump: { fontSize: 13 },
  info: { fontSize: 13, color: '#555', marginBottom: 2 },
  alergia: { fontSize: 12, color: '#F44336', marginTop: 2 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  visitas: { fontSize: 12, color: '#999' },
  gasto: { fontSize: 12, color: '#4CAF50', fontWeight: '600' },
  empty: { textAlign: 'center', color: '#999', marginTop: 40, fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 24 },
  modalTitulo: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#333' },
  modalInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 14 },
  modalAcciones: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 4 },
  modalCancelar: { paddingHorizontal: 16, paddingVertical: 10 },
  modalConfirmar: { backgroundColor: '#4CAF50', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
});
