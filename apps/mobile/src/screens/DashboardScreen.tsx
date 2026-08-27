import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { tizonAPI } from '../services/api';

// ── Tipos ────────────────────────────────────────────────────────────────────
interface HoraPico {
  hora: string;
  reservas: number;
}
interface TopCliente {
  nombre: string;
  visitas: number;
  vip: boolean;
}
interface OcupacionZona {
  zona: string;
  total: number;
  ocupadas: number;
}
interface Kpis {
  reservasHoy: number;
  mesasOcupadas: number;
  mesasLibres: number;
  porcentajeOcupacion: number;
  clientesEnEspera: number;
  reservasConfirmadas: number;
  reservasSentadas: number;
  reservasCanceladas: number;
  reservasCompletadas: number;
  mensajesWhatsAppHoy: number;
  clientesVip: number;
  horasPico: HoraPico[];
  topClientes: TopCliente[];
  ocupacionPorZona: OcupacionZona[];
}

const PRIMARIO = '#c8102e';

// Nombres legibles de las zonas
const NOMBRE_ZONA: { [key: string]: string } = {
  salon_principal: 'Salón Principal',
  terraza: 'Terraza',
  privado: 'Privado',
  sin_zona: 'Sin zona',
};

function iniciales(nombre: string): string {
  const partes = nombre.trim().split(/\s+/);
  const a = partes[0]?.[0] || '';
  const b = partes[1]?.[0] || '';
  return (a + b).toUpperCase();
}

export function DashboardScreen() {
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cargarKpis = useCallback(async (esRefresh = false) => {
    try {
      if (!esRefresh) setError(null);
      const data = await tizonAPI.obtenerDashboardKpis();
      setKpis(data);
      setError(null);
    } catch (e: any) {
      setError(e?.message || 'No se pudieron cargar los datos');
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  useEffect(() => {
    cargarKpis();
    // Actualización automática cada 60 segundos
    intervalRef.current = setInterval(() => cargarKpis(true), 60000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [cargarKpis]);

  const onRefresh = useCallback(() => {
    setRefrescando(true);
    cargarKpis(true);
  }, [cargarKpis]);

  // ── Estado de carga inicial ────────────────────────────────────────────────
  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color={PRIMARIO} />
        <Text style={styles.textoCargando}>Cargando indicadores...</Text>
      </View>
    );
  }

  // ── Estado de error ─────────────────────────────────────────────────────────
  if (error && !kpis) {
    return (
      <View style={styles.centrado}>
        <Text style={styles.iconoError}>⚠️</Text>
        <Text style={styles.textoError}>{error}</Text>
        <TouchableOpacity
          style={styles.botonReintentar}
          onPress={() => {
            setCargando(true);
            cargarKpis();
          }}
        >
          <Text style={styles.textoBotonReintentar}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!kpis) return null;

  const maxReservasPico = Math.max(...kpis.horasPico.map((h) => h.reservas), 1);
  const maxVisitas = Math.max(...kpis.topClientes.map((c) => c.visitas), 1);

  return (
    <ScrollView
      style={styles.contenedor}
      contentContainerStyle={styles.contenido}
      refreshControl={
        <RefreshControl refreshing={refrescando} onRefresh={onRefresh} colors={[PRIMARIO]} tintColor={PRIMARIO} />
      }
    >
      {/* ── SECCIÓN 1: KPIs principales ── */}
      <View style={styles.gridKpis}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiEmoji}>🏠</Text>
          <Text style={styles.kpiValor}>{kpis.porcentajeOcupacion}%</Text>
          <Text style={styles.kpiEtiqueta}>Ocupación</Text>
          <Text style={styles.kpiSub}>
            {kpis.mesasOcupadas} de {kpis.mesasOcupadas + kpis.mesasLibres} mesas
          </Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={styles.kpiEmoji}>📅</Text>
          <Text style={styles.kpiValor}>{kpis.reservasHoy}</Text>
          <Text style={styles.kpiEtiqueta}>Reservas Hoy</Text>
          <Text style={styles.kpiSub}>
            {kpis.reservasConfirmadas} confirmadas, {kpis.reservasSentadas} sentadas
          </Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={styles.kpiEmoji}>⏳</Text>
          <Text style={styles.kpiValor}>{kpis.clientesEnEspera}</Text>
          <Text style={styles.kpiEtiqueta}>En Espera</Text>
          <Text style={styles.kpiSub}>grupos esperando</Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={styles.kpiEmoji}>💬</Text>
          <Text style={styles.kpiValor}>{kpis.mensajesWhatsAppHoy}</Text>
          <Text style={styles.kpiEtiqueta}>WhatsApp</Text>
          <Text style={styles.kpiSub}>mensajes hoy</Text>
        </View>
      </View>

      {/* ── SECCIÓN 2: Estado de reservas ── */}
      <View style={styles.card}>
        <Text style={styles.tituloSeccion}>Estado de Reservas</Text>
        <View style={styles.filaEstados}>
          <EstadoReserva color="#3b82f6" etiqueta="Confirmadas" valor={kpis.reservasConfirmadas} />
          <EstadoReserva color="#22c55e" etiqueta="Sentadas" valor={kpis.reservasSentadas} />
          <EstadoReserva color="#6b7280" etiqueta="Completadas" valor={kpis.reservasCompletadas} />
          <EstadoReserva color="#ef4444" etiqueta="Canceladas" valor={kpis.reservasCanceladas} />
        </View>
      </View>

      {/* ── SECCIÓN 3: Ocupación por zona ── */}
      <View style={styles.card}>
        <Text style={styles.tituloSeccion}>Ocupación por Zona</Text>
        {kpis.ocupacionPorZona.length === 0 ? (
          <Text style={styles.vacio}>Sin datos de zonas</Text>
        ) : (
          kpis.ocupacionPorZona.map((z) => {
            const pct = z.total > 0 ? Math.round((z.ocupadas / z.total) * 100) : 0;
            return (
              <View key={z.zona} style={styles.filaZona}>
                <View style={styles.zonaHeader}>
                  <Text style={styles.zonaNombre}>{NOMBRE_ZONA[z.zona] || z.zona}</Text>
                  <Text style={styles.zonaMesas}>
                    {z.ocupadas}/{z.total} mesas
                  </Text>
                </View>
                <View style={styles.barraFondo}>
                  <View style={[styles.barraProgreso, { width: `${pct}%` }]} />
                </View>
              </View>
            );
          })
        )}
      </View>

      {/* ── SECCIÓN 4: Horas pico ── */}
      <View style={styles.card}>
        <Text style={styles.tituloSeccion}>Horas Pico</Text>
        <Text style={styles.subtituloSeccion}>Últimos 7 días</Text>
        {kpis.horasPico.length === 0 ? (
          <Text style={styles.vacio}>Sin reservas registradas</Text>
        ) : (
          kpis.horasPico.map((h, i) => {
            const anchoPct = (h.reservas / maxReservasPico) * 100;
            // Degradado del más alto (rojo intenso) al más bajo (rojo claro)
            const opacidad = 1 - i * 0.15;
            return (
              <View key={h.hora} style={styles.filaHora}>
                <Text style={styles.horaTexto}>{h.hora}</Text>
                <View style={styles.barraHoraFondo}>
                  <View
                    style={[
                      styles.barraHora,
                      { width: `${anchoPct}%`, backgroundColor: PRIMARIO, opacity: opacidad },
                    ]}
                  />
                </View>
                <Text style={styles.horaValor}>{h.reservas}</Text>
              </View>
            );
          })
        )}
      </View>

      {/* ── SECCIÓN 5: Top clientes ── */}
      <View style={styles.card}>
        <Text style={styles.tituloSeccion}>Top Clientes</Text>
        {kpis.topClientes.length === 0 ? (
          <Text style={styles.vacio}>Sin clientes registrados</Text>
        ) : (
          kpis.topClientes.map((c, i) => (
            <View key={i} style={styles.filaCliente}>
              <View style={[styles.avatar, c.vip && styles.avatarVip]}>
                <Text style={[styles.avatarTexto, c.vip && styles.avatarTextoVip]}>
                  {iniciales(c.nombre)}
                </Text>
              </View>
              <View style={styles.clienteInfo}>
                <Text style={styles.clienteNombre}>
                  {c.nombre} {c.vip ? '⭐' : ''}
                </Text>
                <Text style={styles.clienteVisitas}>{c.visitas} visitas</Text>
              </View>
            </View>
          ))
        )}
      </View>

      <Text style={styles.pie}>Se actualiza automáticamente cada minuto</Text>
    </ScrollView>
  );
}

// ── Subcomponente: cuadro de estado de reserva ────────────────────────────────
function EstadoReserva({ color, etiqueta, valor }: { color: string; etiqueta: string; valor: number }) {
  return (
    <View style={styles.estadoItem}>
      <View style={[styles.estadoBadge, { backgroundColor: color }]}>
        <Text style={styles.estadoValor}>{valor}</Text>
      </View>
      <Text style={styles.estadoEtiqueta}>{etiqueta}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#f5f5f5' },
  contenido: { padding: 16, paddingBottom: 32 },
  centrado: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5', padding: 24 },
  textoCargando: { marginTop: 12, color: '#666', fontSize: 15 },
  iconoError: { fontSize: 40, marginBottom: 12 },
  textoError: { color: '#333', fontSize: 15, textAlign: 'center', marginBottom: 16 },
  botonReintentar: { backgroundColor: PRIMARIO, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  textoBotonReintentar: { color: '#fff', fontWeight: 'bold', fontSize: 15 },

  // KPIs
  gridKpis: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  kpiCard: {
    width: '48.5%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  kpiEmoji: { fontSize: 22, marginBottom: 4 },
  kpiValor: { fontSize: 32, fontWeight: 'bold', color: PRIMARIO },
  kpiEtiqueta: { fontSize: 14, fontWeight: '600', color: '#333', marginTop: 2 },
  kpiSub: { fontSize: 11, color: '#888', marginTop: 2 },

  // Cards genéricas
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 4,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  tituloSeccion: { fontSize: 17, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 4 },
  subtituloSeccion: { fontSize: 12, color: '#999', marginBottom: 12 },
  vacio: { color: '#999', fontSize: 14, fontStyle: 'italic', paddingVertical: 8 },

  // Estado de reservas
  filaEstados: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  estadoItem: { alignItems: 'center', flex: 1 },
  estadoBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  estadoValor: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  estadoEtiqueta: { fontSize: 11, color: '#666', textAlign: 'center' },

  // Zonas
  filaZona: { marginBottom: 14 },
  zonaHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  zonaNombre: { fontSize: 14, fontWeight: '600', color: '#333' },
  zonaMesas: { fontSize: 13, color: '#666' },
  barraFondo: { height: 10, backgroundColor: '#eee', borderRadius: 5, overflow: 'hidden' },
  barraProgreso: { height: 10, backgroundColor: PRIMARIO, borderRadius: 5 },

  // Horas pico
  filaHora: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  horaTexto: { width: 50, fontSize: 13, fontWeight: '600', color: '#333' },
  barraHoraFondo: { flex: 1, height: 20, backgroundColor: '#f0f0f0', borderRadius: 4, marginHorizontal: 8, overflow: 'hidden' },
  barraHora: { height: 20, borderRadius: 4 },
  horaValor: { width: 24, fontSize: 14, fontWeight: 'bold', color: PRIMARIO, textAlign: 'right' },

  // Top clientes
  filaCliente: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarVip: { backgroundColor: '#FFD700' },
  avatarTexto: { fontSize: 16, fontWeight: 'bold', color: '#555' },
  avatarTextoVip: { color: '#7a5c00' },
  clienteInfo: { flex: 1 },
  clienteNombre: { fontSize: 15, fontWeight: '600', color: '#1a1a1a' },
  clienteVisitas: { fontSize: 12, color: '#888', marginTop: 2 },

  pie: { textAlign: 'center', color: '#aaa', fontSize: 11, marginTop: 4 },
});
