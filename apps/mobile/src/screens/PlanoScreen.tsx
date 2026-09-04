import React, { useState, useEffect, useRef } from 'react';
import {
  View, ScrollView, StyleSheet, Text, ActivityIndicator,
  TouchableOpacity, Alert, Modal, RefreshControl, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MesaCard } from '../components/MesaCard';
import { PacingIndicator } from '../components/PacingIndicator';
import { useMesas } from '../hooks/useMesas';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useSalaStore, Mesa } from '../store/salaStore';
import { useAuthStore } from '../store/authStore';
import { tizonAPI } from '../services/api';
import { supabase } from '../config/supabase';

const GOLD = '#D4A017';
const BG = '#1a1a1a';

// Orden y etiqueta bonita de cada zona
const ZONAS: { key: Mesa['zona']; label: string }[] = [
  { key: 'salon_principal', label: 'Salón Principal' },
  { key: 'terraza', label: 'Terraza' },
  { key: 'privado', label: 'Privado' },
];

// Estados para el modal de cambio (mantiene la lógica de negocio existente)
const ESTADOS = [
  { key: 'libre',     label: 'Libre',     color: '#10B981' },
  { key: 'ocupada',   label: 'Ocupada',   color: '#D4A017' },
  { key: 'reservada', label: 'Reservada', color: 'rgba(255,255,255,0.25)' },
  { key: 'por_salir', label: 'Por salir', color: '#C62828' },
];

// Configuración de la leyenda
const LEYENDA = [
  { key: 'libre',     label: 'Libres',     color: '#10B981' },
  { key: 'ocupada',   label: 'Ocupadas',   color: '#D4A017' },
  { key: 'por_salir', label: 'Por salir',  color: '#C62828' },
  { key: 'reservada', label: 'Reservadas', color: 'rgba(255,255,255,0.25)' },
];

// ── Indicador "En vivo" con punto parpadeante ────────────────────────────
const EnVivo = ({ conectado }: { conectado: boolean }) => {
  const opacidad = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!conectado) return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacidad, { toValue: 0.2, duration: 700, useNativeDriver: true }),
        Animated.timing(opacidad, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [conectado]);

  if (!conectado) {
    return (
      <View style={styles.envivoRow}>
        <View style={[styles.envivoDot, { backgroundColor: '#C62828' }]} />
        <Text style={[styles.envivoTxt, { color: '#C62828' }]}>Sin conexión</Text>
      </View>
    );
  }

  return (
    <View style={styles.envivoRow}>
      <Animated.View style={[styles.envivoDot, { backgroundColor: '#10B981', opacity: opacidad }]} />
      <Text style={[styles.envivoTxt, { color: '#10B981' }]}>En vivo</Text>
    </View>
  );
};

// ── Contenedor de zona (arco superior + título dorado + cuadrícula) ───────
const ZonaContainer = ({
  label,
  mesas,
  onSelect,
}: {
  label: string;
  mesas: Mesa[];
  onSelect: (m: Mesa) => void;
}) => (
  <LinearGradient
    colors={['rgba(212,160,23,0.06)', 'transparent']}
    start={{ x: 0, y: 0 }}
    end={{ x: 0, y: 1 }}
    style={styles.zona}
  >
    <Text style={styles.zonaTitulo}>{label}</Text>
    <View style={styles.zonaGrid}>
      {mesas.map((m) => (
        <MesaCard key={m.id} mesa={m} onPress={onSelect} />
      ))}
    </View>
  </LinearGradient>
);

export const PlanoScreen = ({ navigation }: any) => {
  const { mesas, loading, error, refetch } = useMesas();
  const { pacingEstado } = useSalaStore();
  const { logout, user } = useAuthStore();
  const { isConnected } = useNetworkStatus();

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

  // Conteos reales por estado (para la leyenda)
  const conteos = {
    libre: mesas.filter((m) => m.estado === 'libre').length,
    ocupada: mesas.filter((m) => m.estado === 'ocupada').length,
    por_salir: mesas.filter((m) => m.estado === 'por_salir').length,
    reservada: mesas.filter((m) => m.estado === 'reservada').length,
  };

  if (loading && mesas.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={GOLD} />
        <Text style={styles.cargandoText}>Cargando mesas...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={GOLD} />
      }
    >
      {/* Header con usuario y botón logout */}
      <View style={styles.headerRow}>
        <Text style={styles.bienvenida}>👋 {user?.nombre || user?.email}</Text>
        <TouchableOpacity onPress={cerrarSesion} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      {/* Encabezado principal */}
      <View style={styles.tituloRow}>
        <Text style={styles.tituloGrande}>
          Plano del <Text style={styles.tituloGold}>Salón</Text> y Comensales
        </Text>
        <EnVivo conectado={isConnected} />
      </View>

      <TouchableOpacity onPress={onRefresh} style={styles.actualizarBtn}>
        <Text style={styles.actualizarTxt}>🔄 Actualizar</Text>
      </TouchableOpacity>

      {/* Pacing */}
      <Text style={styles.sectionTitle}>Pacing · Motor de Cocina</Text>
      <PacingIndicator
        estado={pacingEstado?.estado}
        personas={pacingEstado?.personas}
        capacidad={pacingEstado?.capacidad}
      />

      {/* Leyenda */}
      <View style={styles.leyendaBox}>
        <Text style={styles.leyendaTitulo}>LEYENDA</Text>
        <View style={styles.leyendaGrid}>
          {LEYENDA.map((l) => (
            <View key={l.key} style={styles.leyendaItem}>
              <View
                style={[
                  styles.leyendaCuadro,
                  { backgroundColor: l.color },
                  l.key === 'reservada' && { borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
                ]}
              />
              <Text style={styles.leyendaTxt}>
                {l.label} ({conteos[l.key as keyof typeof conteos]})
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Contenido de mesas */}
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
        <View style={{ marginTop: 8 }}>
          {ZONAS.map((z) => {
            const mesasZona = mesas
              .filter((m) => m.zona === z.key)
              .sort((a, b) => a.numero - b.numero);
            if (mesasZona.length === 0) return null;
            return (
              <ZonaContainer
                key={z.key}
                label={z.label}
                mesas={mesasZona}
                onSelect={(m) => setMesaSel(m)}
              />
            );
          })}

          {/* Mesas de zonas no reconocidas (fallback) */}
          {(() => {
            const conocidas = ZONAS.map((z) => z.key);
            const otras = mesas.filter((m) => !conocidas.includes(m.zona));
            if (otras.length === 0) return null;
            return (
              <ZonaContainer
                label="Otras"
                mesas={otras.sort((a, b) => a.numero - b.numero)}
                onSelect={(m) => setMesaSel(m)}
              />
            );
          })()}
        </View>
      )}

      <View style={{ height: 40 }} />

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
                <Text
                  style={[
                    styles.estadoBtnText,
                    (e.key === 'libre' || e.key === 'ocupada') && { color: '#000' },
                  ]}
                >
                  {e.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG, padding: 12 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: BG },
  cargandoText: { marginTop: 12, color: '#888', fontSize: 14 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingVertical: 6 },
  bienvenida: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
  logoutBtn: { backgroundColor: 'rgba(198,40,40,0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  logoutText: { color: '#C62828', fontWeight: '600', fontSize: 13 },

  // Encabezado principal
  tituloRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 4 },
  tituloGrande: { flex: 1, fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', paddingRight: 8 },
  tituloGold: { color: GOLD },
  envivoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  envivoDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  envivoTxt: { fontSize: 12, fontWeight: '600' },
  actualizarBtn: {
    alignSelf: 'flex-start', marginTop: 10,
    backgroundColor: 'rgba(212,160,23,0.15)', borderWidth: 1, borderColor: 'rgba(212,160,23,0.4)',
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8,
  },
  actualizarTxt: { color: GOLD, fontSize: 13, fontWeight: '600' },

  sectionTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 10, marginTop: 18, color: 'rgba(255,255,255,0.85)' },

  // Leyenda
  leyendaBox: {
    marginTop: 16, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', padding: 14,
  },
  leyendaTitulo: { color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 10 },
  leyendaGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  leyendaItem: { flexDirection: 'row', alignItems: 'center', width: '50%', marginBottom: 8 },
  leyendaCuadro: { width: 16, height: 16, borderRadius: 4, marginRight: 8 },
  leyendaTxt: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },

  // Zonas
  zona: {
    borderTopLeftRadius: 48, borderTopRightRadius: 48,
    borderBottomLeftRadius: 16, borderBottomRightRadius: 16,
    borderWidth: 1, borderColor: 'rgba(212,160,23,0.25)',
    paddingVertical: 24, paddingHorizontal: 16, marginBottom: 20,
  },
  zonaTitulo: {
    color: GOLD, fontSize: 19, fontWeight: 'bold', textAlign: 'center', marginBottom: 20,
  },
  zonaGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },

  vacio: { textAlign: 'center', color: '#999', marginTop: 30, fontSize: 14 },
  errorBox: { backgroundColor: 'rgba(198,40,40,0.10)', borderRadius: 8, padding: 16, marginTop: 16, alignItems: 'center' },
  errorText: { color: '#C62828', fontWeight: '600', fontSize: 14 },
  errorSub: { color: '#999', fontSize: 12, marginTop: 4, textAlign: 'center' },
  reintentarBtn: { backgroundColor: GOLD, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 6, marginTop: 12 },
  reintentarText: { color: '#000', fontWeight: '600' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#242424', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  modalTitulo: { fontSize: 17, fontWeight: 'bold', color: '#FFFFFF' },
  modalCerrar: { fontSize: 20, color: '#999', padding: 4 },
  modalSub: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 12 },
  estadoBtn: { padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 8 },
  estadoBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});
