import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, FlatList, ActivityIndicator, ScrollView,
} from 'react-native';
import { useClientes } from '../hooks/useClientes';
import { tizonAPI } from '../services/api';
import { Cliente } from '../store/salaStore';

interface Mesa {
  id: string;
  numero: number;
  capacidad: number;
  estado: string;
}

const ESTADO_COLOR: { [key: string]: string } = {
  libre: '#4CAF50',
  ocupada: '#FF9800',
  reservada: '#2196F3',
};

export const NuevaReservaScreen = ({ navigation }: any) => {
  // -- Búsqueda de cliente --
  const [busqueda, setBusqueda] = useState('');
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const { clientes, loading: loadingClientes, buscar } = useClientes();

  // -- Datos de la reserva --
  const [mesaSeleccionada, setMesaSeleccionada] = useState<Mesa | null>(null);
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [loadingMesas, setLoadingMesas] = useState(true);
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [hora, setHora] = useState('20:00');
  const [comensales, setComensales] = useState('2');
  const [guardando, setGuardando] = useState(false);

  // Cargar mesas al abrir pantalla
  useEffect(() => {
    const cargarMesas = async () => {
      try {
        const data = await tizonAPI.obtenerMesas();
        setMesas(data);
      } catch {
        Alert.alert('Error', 'No se pudieron cargar las mesas');
      } finally {
        setLoadingMesas(false);
      }
    };
    cargarMesas();
  }, []);

  const buscarCliente = async (texto: string) => {
    setBusqueda(texto);
    setClienteSeleccionado(null);
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
    if (!mesaSeleccionada) {
      Alert.alert('Falta mesa', 'Selecciona una mesa');
      return;
    }
    if (!fecha || !hora) {
      Alert.alert('Campos incompletos', 'Completa fecha y hora');
      return;
    }

    setGuardando(true);
    try {
      const reserva = await tizonAPI.crearReserva(
        clienteSeleccionado.id,
        mesaSeleccionada.id,   // UUID correcto de la mesa
        fecha,
        hora,
        parseInt(comensales, 10),
      );
      Alert.alert('✅ Reserva creada', `Código: ${reserva.codigo_unico}`, [
        { text: 'OK', onPress: () => navigation?.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Error', 'No se pudo crear la reserva. Verifica que la mesa esté disponible.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.titulo}>Nueva Reserva</Text>

      {/* ── Cliente ── */}
      <Text style={styles.label}>Cliente</Text>
      <TextInput
        style={styles.input}
        placeholder="Buscar por nombre o teléfono..."
        value={busqueda}
        onChangeText={buscarCliente}
      />
      {loadingClientes && <ActivityIndicator size="small" color="#2196F3" style={{ marginBottom: 8 }} />}
      {clientes.length > 0 && !clienteSeleccionado && (
        <View style={styles.dropdown}>
          {clientes.slice(0, 5).map((item) => (
            <TouchableOpacity key={item.id} style={styles.dropdownItem} onPress={() => seleccionarCliente(item)}>
              <Text style={styles.dropdownNombre}>{item.nombre}</Text>
              {item.etiquetas?.includes('VIP') && <Text style={styles.vipTag}>⭐ VIP</Text>}
              <Text style={styles.dropdownInfo}>
                {item.telefono || ''}{item.termino_carne_preferido ? ` · ${item.termino_carne_preferido}` : ''}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {clienteSeleccionado && (
        <View style={styles.clienteSeleccionado}>
          <Text style={styles.clienteNombre}>✓ {clienteSeleccionado.nombre}</Text>
          <TouchableOpacity onPress={() => { setClienteSeleccionado(null); setBusqueda(''); }}>
            <Text style={styles.cambiarBtn}>Cambiar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Mesa ── */}
      <Text style={styles.label}>Mesa</Text>
      {loadingMesas ? (
        <ActivityIndicator size="small" color="#2196F3" style={{ marginVertical: 12 }} />
      ) : (
        <View style={styles.mesasGrid}>
          {mesas.map((mesa) => {
            const seleccionada = mesaSeleccionada?.id === mesa.id;
            const color = ESTADO_COLOR[mesa.estado] || '#999';
            return (
              <TouchableOpacity
                key={mesa.id}
                style={[
                  styles.mesaBtn,
                  { borderColor: color },
                  seleccionada && { backgroundColor: color },
                ]}
                onPress={() => setMesaSeleccionada(seleccionada ? null : mesa)}
              >
                <Text style={[styles.mesaNum, seleccionada && { color: '#fff' }]}>
                  {mesa.numero}
                </Text>
                <Text style={[styles.mesaCap, seleccionada && { color: '#fff' }]}>
                  {mesa.capacidad}p
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
      {mesaSeleccionada && (
        <Text style={styles.mesaInfo}>
          Mesa {mesaSeleccionada.numero} · {mesaSeleccionada.capacidad} personas · {mesaSeleccionada.estado}
        </Text>
      )}

      {/* ── Fecha ── */}
      <Text style={styles.label}>Fecha</Text>
      <TextInput style={styles.input} placeholder="YYYY-MM-DD" value={fecha} onChangeText={setFecha} />

      {/* ── Hora ── */}
      <Text style={styles.label}>Hora</Text>
      <View style={styles.horasRow}>
        {['18:00', '19:00', '20:00', '20:30', '21:00', '21:30', '22:00'].map((h) => (
          <TouchableOpacity
            key={h}
            style={[styles.horaBtn, hora === h && styles.horaBtnActive]}
            onPress={() => setHora(h)}
          >
            <Text style={[styles.horaBtnText, hora === h && styles.horaBtnTextActive]}>{h}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Comensales ── */}
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

      {/* ── Botón crear ── */}
      <TouchableOpacity
        style={[styles.crearBtn, guardando && { opacity: 0.6 }]}
        onPress={crearReserva}
        disabled={guardando}
      >
        {guardando
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.crearBtnText}>Crear Reserva</Text>
        }
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  titulo: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#333' },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, color: '#555', marginTop: 4 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 10, fontSize: 14 },

  // Cliente
  dropdown: { borderWidth: 1, borderColor: '#eee', borderRadius: 8, marginBottom: 10 },
  dropdownItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  dropdownNombre: { fontSize: 14, fontWeight: '600', color: '#333' },
  dropdownInfo: { fontSize: 12, color: '#888', marginTop: 2 },
  vipTag: { fontSize: 12, color: '#FFC107', fontWeight: '600' },
  clienteSeleccionado: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#e8f5e9', borderRadius: 8, padding: 12, marginBottom: 12 },
  clienteNombre: { fontSize: 14, fontWeight: '600', color: '#2e7d32' },
  cambiarBtn: { fontSize: 12, color: '#2196F3', fontWeight: '600' },

  // Mesas
  mesasGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  mesaBtn: { width: 52, height: 52, borderRadius: 8, borderWidth: 2, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  mesaNum: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  mesaCap: { fontSize: 10, color: '#888' },
  mesaInfo: { fontSize: 13, color: '#555', marginBottom: 12, fontStyle: 'italic' },

  // Horas
  horasRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  horaBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, borderWidth: 1, borderColor: '#ddd' },
  horaBtnActive: { backgroundColor: '#2196F3', borderColor: '#2196F3' },
  horaBtnText: { fontSize: 13, color: '#555', fontWeight: '500' },
  horaBtnTextActive: { color: '#fff' },

  // Comensales
  comensalesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  numBtn: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: '#ddd', justifyContent: 'center', alignItems: 'center' },
  numBtnActive: { backgroundColor: '#2196F3', borderColor: '#2196F3' },
  numBtnText: { fontWeight: '600', color: '#666' },
  numBtnTextActive: { color: '#fff' },

  // Botón crear
  crearBtn: { backgroundColor: '#2196F3', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  crearBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
