import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, FlatList, ActivityIndicator } from 'react-native';
import { useClientes } from '../hooks/useClientes';
import { tizonAPI } from '../services/api';
import { Cliente } from '../store/salaStore';

export const NuevaReservaScreen = ({ navigation }: any) => {
  const [busqueda, setBusqueda] = useState('');
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [mesaId, setMesaId] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [hora, setHora] = useState('20:00');
  const [comensales, setComensales] = useState('2');
  const [guardando, setGuardando] = useState(false);
  const { clientes, loading, buscar } = useClientes();

  const buscarCliente = async (texto: string) => {
    setBusqueda(texto);
    if (texto.length >= 2) {
      await buscar(texto);
    }
  };

  const seleccionarCliente = (cliente: Cliente) => {
    setClienteSeleccionado(cliente);
    setBusqueda(cliente.nombre);
  };

  const crearReserva = async () => {
    if (!clienteSeleccionado) {
      Alert.alert('Falta cliente', 'Busca y selecciona un cliente');
      return;
    }
    if (!mesaId || !fecha || !hora) {
      Alert.alert('Campos incompletos', 'Completa mesa, fecha y hora');
      return;
    }

    setGuardando(true);
    try {
      const reserva = await tizonAPI.crearReserva(
        clienteSeleccionado.id,
        mesaId,
        fecha,
        hora,
        parseInt(comensales, 10),
      );
      Alert.alert('✅ Reserva creada', `Código: ${reserva.codigo_unico}`, [
        { text: 'OK', onPress: () => navigation?.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Error', 'No se pudo crear la reserva');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Nueva Reserva</Text>
      <Text style={styles.label}>Cliente</Text>
      <TextInput
        style={styles.input}
        placeholder="Buscar por nombre o teléfono..."
        value={busqueda}
        onChangeText={buscarCliente}
      />
      {loading && <ActivityIndicator size="small" color="#2196F3" style={{ marginBottom: 8 }} />}
      {clientes.length > 0 && !clienteSeleccionado && (
        <FlatList
          data={clientes.slice(0, 5)}
          keyExtractor={(item) => item.id}
          style={styles.dropdown}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.dropdownItem} onPress={() => seleccionarCliente(item)}>
              <Text style={styles.dropdownNombre}>{item.nombre}</Text>
              {item.etiquetas?.includes('VIP') && <Text style={styles.vipTag}>⭐ VIP</Text>}
              <Text style={styles.dropdownInfo}>
                {item.telefono || ''}{item.termino_carne_preferido ? ` · ${item.termino_carne_preferido}` : ''}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}

      <Text style={styles.label}>Mesa (número)</Text>
      <TextInput style={styles.input} placeholder="Ej: 5" value={mesaId} onChangeText={setMesaId} keyboardType="numeric" />

      <Text style={styles.label}>Fecha</Text>
      <TextInput style={styles.input} placeholder="YYYY-MM-DD" value={fecha} onChangeText={setFecha} />

      <Text style={styles.label}>Hora</Text>
      <TextInput style={styles.input} placeholder="HH:MM" value={hora} onChangeText={setHora} />

      <Text style={styles.label}>Comensales</Text>
      <View style={styles.comensalesRow}>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
          <TouchableOpacity
            key={n}
            style={[styles.numBtn, comensales === String(n) && styles.numBtnActive]}
            onPress={() => setComensales(String(n))}
          >
            <Text style={[styles.numBtnText, comensales === String(n) && styles.numBtnTextActive]}>{n}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={[styles.crearBtn, guardando && { opacity: 0.6 }]} onPress={crearReserva} disabled={guardando}>
        {guardando ? <ActivityIndicator color="#fff" /> : <Text style={styles.crearBtnText}>Crear Reserva</Text>}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  titulo: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#333' },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 4, color: '#555' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 14 },
  dropdown: { borderWidth: 1, borderColor: '#eee', borderRadius: 8, marginBottom: 12, maxHeight: 180 },
  dropdownItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  dropdownNombre: { fontSize: 14, fontWeight: '600', color: '#333' },
  dropdownInfo: { fontSize: 12, color: '#888', marginTop: 2 },
  vipTag: { fontSize: 12, color: '#FFC107', fontWeight: '600' },
  comensalesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  numBtn: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: '#ddd', justifyContent: 'center', alignItems: 'center' },
  numBtnActive: { backgroundColor: '#2196F3', borderColor: '#2196F3' },
  numBtnText: { fontWeight: '600', color: '#666' },
  numBtnTextActive: { color: '#fff' },
  crearBtn: { backgroundColor: '#2196F3', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  crearBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
