import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  RefreshControl,
} from 'react-native';
import { tizonAPI } from '../services/api';
import { Cliente } from '../store/salaStore';

// Opciones de término de carne (valor => etiqueta visible)
const TERMINACIONES: { valor: string; label: string }[] = [
  { valor: 'vuelta_y_vuelta', label: '🥩 Vuelta y vuelta' },
  { valor: 'punto_rojo', label: '🥩 Punto rojo' },
  { valor: 'medio', label: '🥩 Medio' },
  { valor: 'tres_cuartos', label: '🥩 Tres cuartos' },
  { valor: 'bien_cocido', label: '🥩 Bien cocido' },
];

const labelTermino = (valor?: string) => {
  if (!valor) return 'No especificado';
  const t = TERMINACIONES.find((x) => x.valor === valor);
  return t ? t.label : valor;
};

// Colores por estado de reserva
const ESTADO_COLOR: { [key: string]: string } = {
  pendiente: '#FF9800',
  confirmada: '#4CAF50',
  sentada: '#2196F3',
  completada: '#9E9E9E',
  cancelada: '#F44336',
};

const ESTADO_LABEL: { [key: string]: string } = {
  pendiente: 'Pendiente',
  confirmada: 'Confirmada',
  sentada: 'Sentada',
  completada: 'Completada',
  cancelada: 'Cancelada',
};

export const ClienteDetalleScreen = ({ route, navigation }: any) => {
  const { clienteId } = route.params || {};

  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [reservas, setReservas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // Modal de edición
  const [editando, setEditando] = useState(false);
  const [editNombre, setEditNombre] = useState('');
  const [editTelefono, setEditTelefono] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editTermino, setEditTermino] = useState<string>('');
  const [editAlergias, setEditAlergias] = useState('');

  const cargarDatos = useCallback(async () => {
    if (!clienteId) {
      setError('No se recibió el ID del cliente');
      setLoading(false);
      return;
    }
    try {
      setError(null);
      const [clienteData, reservasData] = await Promise.all([
        tizonAPI.obtenerCliente(clienteId),
        tizonAPI.obtenerReservasCliente(clienteId),
      ]);
      setCliente(clienteData);
      // Ordenar reservas por fecha descendente
      const ordenadas = Array.isArray(reservasData)
        ? [...reservasData].sort((a, b) => {
            const fa = `${a.fecha} ${a.hora_inicio || ''}`;
            const fb = `${b.fecha} ${b.hora_inicio || ''}`;
            return fb.localeCompare(fa);
          })
        : [];
      setReservas(ordenadas);
    } catch (err) {
      setError('No se pudo cargar la información del cliente');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [clienteId]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const onRefresh = () => {
    setRefreshing(true);
    cargarDatos();
  };

  const tieneEtiqueta = (etiqueta: string) =>
    !!cliente?.etiquetas?.includes(etiqueta);

  // Toggle VIP: usa el endpoint dedicado si activa; si desactiva, actualiza etiquetas
  const handleToggleVIP = async () => {
    if (!cliente) return;
    setGuardando(true);
    try {
      const esVIP = tieneEtiqueta('VIP');
      let actualizado;
      if (esVIP) {
        // Quitar VIP: filtrar etiquetas
        const nuevasEtiquetas = (cliente.etiquetas || []).filter((e) => e !== 'VIP');
        actualizado = await tizonAPI.actualizarCliente(cliente.id, { etiquetas: nuevasEtiquetas });
      } else {
        // Agregar VIP mediante endpoint dedicado
        actualizado = await tizonAPI.toggleVIP(cliente.id);
      }
      // Refrescar desde servidor para asegurar consistencia
      setCliente(actualizado && actualizado.id ? actualizado : { ...cliente });
      await cargarDatos();
    } catch (err) {
      Alert.alert('Error', 'No se pudo actualizar el estado VIP');
    } finally {
      setGuardando(false);
    }
  };

  // Toggle Cumpleaños: siempre vía PATCH actualizando etiquetas
  const handleToggleCumple = async () => {
    if (!cliente) return;
    setGuardando(true);
    try {
      const tieneCumple = tieneEtiqueta('cumpleanos');
      const etiquetasActuales = cliente.etiquetas || [];
      const nuevasEtiquetas = tieneCumple
        ? etiquetasActuales.filter((e) => e !== 'cumpleanos')
        : [...etiquetasActuales, 'cumpleanos'];
      const actualizado = await tizonAPI.actualizarCliente(cliente.id, { etiquetas: nuevasEtiquetas });
      setCliente(actualizado && actualizado.id ? actualizado : { ...cliente, etiquetas: nuevasEtiquetas });
      await cargarDatos();
    } catch (err) {
      Alert.alert('Error', 'No se pudo actualizar el cumpleaños');
    } finally {
      setGuardando(false);
    }
  };

  const abrirEdicion = () => {
    if (!cliente) return;
    setEditNombre(cliente.nombre || '');
    setEditTelefono(cliente.telefono || '');
    setEditEmail(cliente.email || '');
    setEditTermino(cliente.termino_carne_preferido || '');
    setEditAlergias((cliente.alergias || []).join(', '));
    setEditando(true);
  };

  const guardarEdicion = async () => {
    if (!cliente) return;
    if (!editNombre.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio');
      return;
    }
    setGuardando(true);
    try {
      const alergiasArray = editAlergias
        .split(',')
        .map((a) => a.trim())
        .filter((a) => a.length > 0);

      const updates: any = {
        nombre: editNombre.trim(),
        telefono: editTelefono.trim(),
        email: editEmail.trim(),
        alergias: alergiasArray,
      };
      if (editTermino) updates.termino_carne_preferido = editTermino;

      const actualizado = await tizonAPI.actualizarCliente(cliente.id, updates);
      setCliente(actualizado && actualizado.id ? actualizado : { ...cliente, ...updates });
      setEditando(false);
      await cargarDatos();
    } catch (err) {
      Alert.alert('Error', 'No se pudo guardar los cambios');
    } finally {
      setGuardando(false);
    }
  };

  // ---- RENDER ----

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#C62828" />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    );
  }

  if (error || !cliente) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>⚠️ {error || 'Cliente no encontrado'}</Text>
        <TouchableOpacity style={styles.reintentarBtn} onPress={cargarDatos}>
          <Text style={styles.reintentarText}>Reintentar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.volverBtn} onPress={() => navigation?.goBack()}>
          <Text style={styles.volverText}>← Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const esVIP = tieneEtiqueta('VIP');
  const tieneCumple = tieneEtiqueta('cumpleanos');

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#C62828" />}
      >
        {/* Header con nombre y badges */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.nombre}>{cliente.nombre}</Text>
            <View style={styles.badges}>
              {esVIP && <Text style={styles.badgeVIP}>⭐ VIP</Text>}
              {tieneCumple && <Text style={styles.badgeCumple}>🎂</Text>}
            </View>
          </View>
          <TouchableOpacity style={styles.editarBtn} onPress={abrirEdicion}>
            <Text style={styles.editarText}>✏️ Editar perfil</Text>
          </TouchableOpacity>
        </View>

        {/* Información de contacto */}
        <View style={styles.card}>
          <Text style={styles.cardTitulo}>Información</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>📱 Teléfono</Text>
            <Text style={styles.infoValue}>{cliente.telefono || 'No registrado'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>✉️ Email</Text>
            <Text style={styles.infoValue}>{cliente.email || 'No registrado'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>🥩 Término</Text>
            <Text style={styles.infoValue}>{labelTermino(cliente.termino_carne_preferido)}</Text>
          </View>
        </View>

        {/* Alergias */}
        {cliente.alergias && cliente.alergias.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitulo}>Alergias</Text>
            <View style={styles.alergiasWrap}>
              {cliente.alergias.map((a, i) => (
                <Text key={i} style={styles.alergiaBadge}>
                  ⚠️ {a}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValor}>{cliente.num_visitas ?? 0}</Text>
            <Text style={styles.statLabel}>Visitas</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValor}>${(cliente.gasto_total ?? 0).toLocaleString()}</Text>
            <Text style={styles.statLabel}>Gasto total</Text>
          </View>
        </View>

        {/* Botones de acción */}
        <View style={styles.accionesRow}>
          <TouchableOpacity
            style={[styles.accionBtn, esVIP ? styles.accionBtnVIPActivo : styles.accionBtnInactivo]}
            onPress={handleToggleVIP}
            disabled={guardando}
          >
            <Text style={[styles.accionText, esVIP && styles.accionTextActivo]}>
              {esVIP ? '⭐ Quitar VIP' : '⭐ Marcar VIP'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.accionBtn, tieneCumple ? styles.accionBtnCumpleActivo : styles.accionBtnInactivo]}
            onPress={handleToggleCumple}
            disabled={guardando}
          >
            <Text style={[styles.accionText, tieneCumple && styles.accionTextActivo]}>
              {tieneCumple ? '🎂 Quitar cumpleaños' : '🎂 Cumpleaños'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Historial de reservas */}
        <View style={styles.card}>
          <Text style={styles.cardTitulo}>Historial de reservas ({reservas.length})</Text>
          {reservas.length === 0 ? (
            <Text style={styles.sinReservas}>Sin reservas registradas</Text>
          ) : (
            reservas.map((r) => (
              <View key={r.id} style={styles.reservaItem}>
                <View style={styles.reservaTop}>
                  <Text style={styles.reservaFecha}>
                    📅 {r.fecha} · {(r.hora_inicio || '').substring(0, 5)}
                  </Text>
                  <Text
                    style={[styles.reservaEstado, { color: ESTADO_COLOR[r.estado] || '#999' }]}
                  >
                    {ESTADO_LABEL[r.estado] || r.estado}
                  </Text>
                </View>
                <View style={styles.reservaBottom}>
                  <Text style={styles.reservaInfo}>👥 {r.num_comensales} personas</Text>
                  {r.codigo_unico && <Text style={styles.reservaCodigo}>{r.codigo_unico}</Text>}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Modal de edición */}
      <Modal visible={editando} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <ScrollView>
              <Text style={styles.modalTitulo}>Editar cliente</Text>

              <Text style={styles.modalLabel}>Nombre *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Nombre completo"
                placeholderTextColor="#777"
                value={editNombre}
                onChangeText={setEditNombre}
              />

              <Text style={styles.modalLabel}>Teléfono</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="+1 809 000 0000"
                placeholderTextColor="#777"
                value={editTelefono}
                onChangeText={setEditTelefono}
                keyboardType="phone-pad"
              />

              <Text style={styles.modalLabel}>Email</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="cliente@correo.com"
                placeholderTextColor="#777"
                value={editEmail}
                onChangeText={setEditEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.modalLabel}>Término de carne</Text>
              <View style={styles.terminoWrap}>
                {TERMINACIONES.map((t) => (
                  <TouchableOpacity
                    key={t.valor}
                    style={[
                      styles.terminoChip,
                      editTermino === t.valor && styles.terminoChipActivo,
                    ]}
                    onPress={() => setEditTermino(t.valor)}
                  >
                    <Text
                      style={[
                        styles.terminoChipText,
                        editTermino === t.valor && styles.terminoChipTextActivo,
                      ]}
                    >
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.modalLabel}>Alergias (separadas por comas)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Mariscos, Gluten, Frutos secos"
                placeholderTextColor="#777"
                value={editAlergias}
                onChangeText={setEditAlergias}
              />

              <View style={styles.modalAcciones}>
                <TouchableOpacity
                  style={styles.modalCancelar}
                  onPress={() => setEditando(false)}
                  disabled={guardando}
                >
                  <Text style={{ color: '#aaa' }}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalConfirmar}
                  onPress={guardarEdicion}
                  disabled={guardando}
                >
                  {guardando ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Guardar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a1a' },
  centered: { flex: 1, backgroundColor: '#1a1a1a', justifyContent: 'center', alignItems: 'center', padding: 24 },
  loadingText: { color: '#aaa', marginTop: 12, fontSize: 14 },
  errorText: { color: '#F44336', fontSize: 15, textAlign: 'center', marginBottom: 16 },
  reintentarBtn: { backgroundColor: '#C62828', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8, marginBottom: 12 },
  reintentarText: { color: '#fff', fontWeight: 'bold' },
  volverBtn: { paddingHorizontal: 24, paddingVertical: 8 },
  volverText: { color: '#aaa' },

  header: { marginBottom: 16 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  nombre: { fontSize: 24, fontWeight: 'bold', color: '#fff', flex: 1, marginRight: 8 },
  badges: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badgeVIP: { color: '#1a1a1a', backgroundColor: '#FFC107', fontSize: 13, fontWeight: 'bold', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, overflow: 'hidden' },
  badgeCumple: { fontSize: 20 },
  editarBtn: { marginTop: 10, alignSelf: 'flex-start' },
  editarText: { color: '#C62828', fontSize: 14, fontWeight: '600' },

  card: { backgroundColor: '#2a2a2a', borderRadius: 12, padding: 16, marginBottom: 14 },
  cardTitulo: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#3a3a3a' },
  infoLabel: { color: '#aaa', fontSize: 14 },
  infoValue: { color: '#fff', fontSize: 14, fontWeight: '500', flex: 1, textAlign: 'right', marginLeft: 12 },

  alergiasWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  alergiaBadge: { color: '#fff', backgroundColor: '#C62828', fontSize: 13, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, overflow: 'hidden' },

  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  statCard: { flex: 1, backgroundColor: '#2a2a2a', borderRadius: 12, padding: 16, alignItems: 'center' },
  statValor: { color: '#FFC107', fontSize: 22, fontWeight: 'bold' },
  statLabel: { color: '#aaa', fontSize: 13, marginTop: 4 },

  accionesRow: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  accionBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1.5 },
  accionBtnInactivo: { backgroundColor: '#2a2a2a', borderColor: '#444' },
  accionBtnVIPActivo: { backgroundColor: '#FFC107', borderColor: '#FFC107' },
  accionBtnCumpleActivo: { backgroundColor: '#C62828', borderColor: '#C62828' },
  accionText: { color: '#ccc', fontSize: 14, fontWeight: '600' },
  accionTextActivo: { color: '#1a1a1a' },

  reservaItem: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#3a3a3a' },
  reservaTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reservaFecha: { color: '#fff', fontSize: 14, fontWeight: '500' },
  reservaEstado: { fontSize: 13, fontWeight: 'bold' },
  reservaBottom: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  reservaInfo: { color: '#aaa', fontSize: 13 },
  reservaCodigo: { color: '#777', fontSize: 12, fontFamily: 'monospace' },
  sinReservas: { color: '#777', fontSize: 14, textAlign: 'center', paddingVertical: 12 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#2a2a2a', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, maxHeight: '85%' },
  modalTitulo: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: '#fff' },
  modalLabel: { color: '#aaa', fontSize: 13, marginBottom: 6, marginTop: 8 },
  modalInput: { borderWidth: 1, borderColor: '#444', borderRadius: 8, padding: 12, marginBottom: 8, fontSize: 14, color: '#fff', backgroundColor: '#1a1a1a' },
  terminoWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  terminoChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#444', backgroundColor: '#1a1a1a' },
  terminoChipActivo: { backgroundColor: '#C62828', borderColor: '#C62828' },
  terminoChipText: { color: '#ccc', fontSize: 13 },
  terminoChipTextActivo: { color: '#fff', fontWeight: 'bold' },
  modalAcciones: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 16 },
  modalCancelar: { paddingHorizontal: 18, paddingVertical: 12 },
  modalConfirmar: { backgroundColor: '#C62828', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, minWidth: 100, alignItems: 'center' },
});
