import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
  TouchableOpacity, RefreshControl, Dimensions,
} from 'react-native';
import { tizonAPI } from '../services/api';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 48;

interface DashboardData {
  fecha: string;
  hoy: { total: number; confirmadas: number; sentadas: number; canceladas: number; completadas: number; comensales: number; walkins: number };
  semana: { total: number; grafica: { fecha: string; label: string; total: number; completadas: number }[] };
  mes: { total: number; tasaExito: number };
  sala: { totalMesas: number; mesasOcupadas: number; ocupacionActual: number };
  topClientes: { id: string; nombre: string; num_visitas: number; etiquetas?: string[]; termino_carne_preferido?: string }[];
  horariosPico: { hora: string; count: number }[];
}

const TERMINACIONES: Record<string, string> = {
  vuelta_y_vuelta: 'V&V',
  punto_rojo: 'Punto rojo',
  medio: 'Medio',
  tres_cuartos: '¾',
  bien_cocido: 'Bien cocido',
};

// ──────────────────────────────────────────────────────
//  Tarjeta de métrica
// ──────────────────────────────────────────────────────
const MetricCard = ({ label, value, sub, color = '#2196F3', emoji }: any) => (
  <View style={[styles.metricCard, { borderLeftColor: color }]}>
    <Text style={styles.metricEmoji}>{emoji}</Text>
    <Text style={[styles.metricValue, { color }]}>{value}</Text>
    <Text style={styles.metricLabel}>{label}</Text>
    {sub ? <Text style={styles.metricSub}>{sub}</Text> : null}
  </View>
);

// ──────────────────────────────────────────────────────
//  Gráfica de barras (pura React Native, sin libs extra)
// ──────────────────────────────────────────────────────
const BarChart = ({ datos }: { datos: DashboardData['semana']['grafica'] }) => {
  const maxVal = Math.max(...datos.map(d => d.total), 1);
  const BAR_HEIGHT = 120;
  return (
    <View style={styles.chartContainer}>
      {datos.map((d, i) => {
        const barH = Math.max((d.total / maxVal) * BAR_HEIGHT, 4);
        const esHoy = i === datos.length - 1;
        return (
          <View key={d.fecha} style={styles.barGroup}>
            <Text style={styles.barValue}>{d.total > 0 ? d.total : ''}</Text>
            <View style={styles.barWrapper}>
              <View style={[styles.bar, { height: barH, backgroundColor: esHoy ? '#2196F3' : '#BBDEFB' }]} />
            </View>
            <Text style={[styles.barLabel, esHoy && styles.barLabelHoy]}>{d.label}</Text>
          </View>
        );
      })}
    </View>
  );
};

// ──────────────────────────────────────────────────────
//  Barra de progreso
// ──────────────────────────────────────────────────────
const ProgressBar = ({ pct, color }: { pct: number; color: string }) => (
  <View style={styles.progressBg}>
    <View style={[styles.progressFill, { width: `${Math.min(pct, 100)}%`, backgroundColor: color }]} />
  </View>
);

// ──────────────────────────────────────────────────────
//  PANTALLA PRINCIPAL
// ──────────────────────────────────────────────────────
export const GerenciaScreen = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async (esRefresh = false) => {
    if (esRefresh) setRefreshing(true); else setLoading(true);
    setError(null);
    try {
      const res = await tizonAPI.getDashboard();
      setData(res);
    } catch (e: any) {
      setError(e?.message || 'No se pudo cargar el dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Cargando métricas...</Text>
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorIcon}>📊</Text>
        <Text style={styles.errorText}>{error || 'Sin datos'}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => cargar()}>
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { hoy, semana, mes, sala, topClientes, horariosPico } = data;
  const horaPico = horariosPico.length > 0
    ? horariosPico.reduce((a, b) => a.count > b.count ? a : b)
    : null;

  const colorOcupacion = sala.ocupacionActual >= 80 ? '#F44336' : sala.ocupacionActual >= 50 ? '#FF9800' : '#4CAF50';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 30 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => cargar(true)} tintColor="#2196F3" />}
    >
      {/* ── CABECERA ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📊 Dashboard Gerencia</Text>
        <Text style={styles.headerFecha}>{new Date(data.fecha + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
      </View>

      {/* ── MÉTRICAS HOY ── */}
      <Text style={styles.seccion}>Hoy</Text>
      <View style={styles.metricRow}>
        <MetricCard emoji="📋" label="Reservas" value={hoy.total} color="#2196F3" />
        <MetricCard emoji="✅" label="Completadas" value={hoy.completadas} color="#4CAF50" />
        <MetricCard emoji="❌" label="Canceladas" value={hoy.canceladas} color="#F44336" />
        <MetricCard emoji="👥" label="Comensales" value={hoy.comensales} color="#9C27B0" />
      </View>

      {/* ── OCUPACIÓN ACTUAL ── */}
      <Text style={styles.seccion}>Sala ahora mismo</Text>
      <View style={styles.card}>
        <View style={styles.ocupacionRow}>
          <Text style={styles.ocupacionPct}>{sala.ocupacionActual}%</Text>
          <Text style={styles.ocupacionSub}>{sala.mesasOcupadas} de {sala.totalMesas} mesas activas</Text>
        </View>
        <ProgressBar pct={sala.ocupacionActual} color={colorOcupacion} />
        <View style={styles.leyendaRow}>
          <Text style={[styles.leyenda, { color: '#4CAF50' }]}>● 0–49% Tranquilo</Text>
          <Text style={[styles.leyenda, { color: '#FF9800' }]}>● 50–79% Activo</Text>
          <Text style={[styles.leyenda, { color: '#F44336' }]}>● 80%+ Lleno</Text>
        </View>
        {hoy.walkins > 0 && (
          <Text style={styles.walkinText}>⏱ {hoy.walkins} walk-in{hoy.walkins !== 1 ? 's' : ''} hoy en lista de espera</Text>
        )}
      </View>

      {/* ── GRÁFICA 7 DÍAS ── */}
      <Text style={styles.seccion}>Últimos 7 días</Text>
      <View style={styles.card}>
        <View style={styles.semanaResumen}>
          <View style={styles.semanaItem}>
            <Text style={styles.semanaNum}>{semana.total}</Text>
            <Text style={styles.semanaLbl}>Total</Text>
          </View>
          <View style={styles.semanaItem}>
            <Text style={[styles.semanaNum, { color: '#4CAF50' }]}>{mes.tasaExito}%</Text>
            <Text style={styles.semanaLbl}>Tasa éxito mes</Text>
          </View>
          <View style={styles.semanaItem}>
            <Text style={[styles.semanaNum, { color: '#9C27B0' }]}>{mes.total}</Text>
            <Text style={styles.semanaLbl}>Este mes</Text>
          </View>
        </View>
        <BarChart datos={semana.grafica} />
        <Text style={styles.chartLeyenda}>■ Azul = hoy   ■ Celeste = días anteriores</Text>
      </View>

      {/* ── HORARIOS PICO ── */}
      {horariosPico.length > 0 && (
        <>
          <Text style={styles.seccion}>Horarios pico (últimos 30 días)</Text>
          <View style={styles.card}>
            {horaPico && (
              <Text style={styles.horaPicoDestacada}>🔥 Hora más concurrida: <Text style={{ fontWeight: 'bold', color: '#F44336' }}>{horaPico.hora}</Text> ({horaPico.count} reservas)</Text>
            )}
            <View style={styles.horasGrid}>
              {horariosPico.map(h => {
                const maxCount = Math.max(...horariosPico.map(x => x.count), 1);
                const pct = (h.count / maxCount) * 100;
                const c = pct >= 80 ? '#F44336' : pct >= 50 ? '#FF9800' : '#4CAF50';
                return (
                  <View key={h.hora} style={styles.horaItem}>
                    <Text style={styles.horaLabel}>{h.hora}</Text>
                    <View style={styles.horaBgBar}>
                      <View style={[styles.horaFillBar, { width: `${pct}%`, backgroundColor: c }]} />
                    </View>
                    <Text style={[styles.horaCount, { color: c }]}>{h.count}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </>
      )}

      {/* ── TOP CLIENTES ── */}
      {topClientes.length > 0 && (
        <>
          <Text style={styles.seccion}>Top {topClientes.length} clientes frecuentes</Text>
          <View style={styles.card}>
            {topClientes.map((c, i) => {
              const iniciales = c.nombre.trim().split(' ').slice(0, 2).map((p: string) => p[0]).join('').toUpperCase();
              const esVIP = c.etiquetas?.includes('VIP');
              return (
                <View key={c.id} style={[styles.clienteRow, i > 0 && styles.clienteRowBorder]}>
                  <Text style={styles.clienteRank}>#{i + 1}</Text>
                  <View style={[styles.clienteAvatar, esVIP && styles.clienteAvatarVIP]}>
                    <Text style={styles.clienteAvatarText}>{iniciales}</Text>
                  </View>
                  <View style={styles.clienteInfo}>
                    <View style={styles.clienteNombreRow}>
                      <Text style={styles.clienteNombre}>{c.nombre}</Text>
                      {esVIP && <Text style={styles.vipBadge}>⭐ VIP</Text>}
                    </View>
                    {c.termino_carne_preferido && (
                      <Text style={styles.clienteTermino}>🥩 {TERMINACIONES[c.termino_carne_preferido] || c.termino_carne_preferido}</Text>
                    )}
                  </View>
                  <View style={styles.clienteVisitas}>
                    <Text style={styles.clienteVisitasNum}>{c.num_visitas ?? 0}</Text>
                    <Text style={styles.clienteVisitasLbl}>visitas</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </>
      )}

      {/* ── PIE de página ── */}
      <TouchableOpacity style={styles.refreshBtn} onPress={() => cargar(true)}>
        <Text style={styles.refreshBtnText}>🔄  Actualizar datos</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// ──────────────────────────────────────────────────────
//  ESTILOS
// ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f9' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loadingText: { marginTop: 12, color: '#999', fontSize: 14 },
  errorIcon: { fontSize: 48, marginBottom: 12 },
  errorText: { color: '#F44336', fontSize: 14, textAlign: 'center', marginBottom: 16 },
  retryBtn: { backgroundColor: '#2196F3', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryText: { color: '#fff', fontWeight: 'bold' },

  header: { backgroundColor: '#1a1a1a', padding: 16, paddingTop: 20 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  headerFecha: { color: '#aaa', fontSize: 12, marginTop: 4, textTransform: 'capitalize' },

  seccion: { fontSize: 13, fontWeight: '700', color: '#888', marginTop: 16, marginBottom: 8, paddingHorizontal: 16, textTransform: 'uppercase', letterSpacing: 0.5 },

  // Métricas en fila
  metricRow: { flexDirection: 'row', paddingHorizontal: 12, gap: 8 },
  metricCard: { flex: 1, backgroundColor: '#fff', borderRadius: 10, padding: 10, alignItems: 'center', borderLeftWidth: 3, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 2 },
  metricEmoji: { fontSize: 20, marginBottom: 4 },
  metricValue: { fontSize: 22, fontWeight: 'bold' },
  metricLabel: { fontSize: 10, color: '#888', textAlign: 'center', marginTop: 2 },
  metricSub: { fontSize: 10, color: '#bbb', marginTop: 1 },

  // Cards genéricas
  card: { backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 12, padding: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 },

  // Ocupación
  ocupacionRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 10 },
  ocupacionPct: { fontSize: 36, fontWeight: 'bold', color: '#1a1a1a', marginRight: 10 },
  ocupacionSub: { fontSize: 13, color: '#666' },
  progressBg: { height: 12, backgroundColor: '#f0f0f0', borderRadius: 6, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 6 },
  leyendaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  leyenda: { fontSize: 10, color: '#888' },
  walkinText: { marginTop: 10, fontSize: 13, color: '#FF9800', fontWeight: '500' },

  // Resumen semana
  semanaResumen: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  semanaItem: { alignItems: 'center' },
  semanaNum: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a' },
  semanaLbl: { fontSize: 11, color: '#999', marginTop: 2 },

  // Gráfica de barras
  chartContainer: { flexDirection: 'row', alignItems: 'flex-end', height: 160, justifyContent: 'space-between' },
  barGroup: { alignItems: 'center', flex: 1 },
  barValue: { fontSize: 10, color: '#555', marginBottom: 2, fontWeight: '600' },
  barWrapper: { width: '70%', alignItems: 'center', justifyContent: 'flex-end', height: 120 },
  bar: { width: '100%', borderRadius: 4, minHeight: 4 },
  barLabel: { fontSize: 10, color: '#999', marginTop: 6 },
  barLabelHoy: { color: '#2196F3', fontWeight: 'bold' },
  chartLeyenda: { fontSize: 10, color: '#bbb', textAlign: 'center', marginTop: 10 },

  // Horarios pico
  horasGrid: { marginTop: 12 },
  horaPicoDestacada: { fontSize: 13, color: '#555', marginBottom: 10 },
  horaItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  horaLabel: { width: 45, fontSize: 12, color: '#555', fontWeight: '600' },
  horaBgBar: { flex: 1, height: 10, backgroundColor: '#f0f0f0', borderRadius: 5, overflow: 'hidden', marginHorizontal: 8 },
  horaFillBar: { height: '100%', borderRadius: 5 },
  horaCount: { width: 28, fontSize: 12, fontWeight: 'bold', textAlign: 'right' },

  // Top clientes
  clienteRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  clienteRowBorder: { borderTopWidth: 1, borderTopColor: '#f5f5f5' },
  clienteRank: { fontSize: 14, fontWeight: 'bold', color: '#bbb', width: 28 },
  clienteAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#2196F3', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  clienteAvatarVIP: { backgroundColor: '#FFC107' },
  clienteAvatarText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  clienteInfo: { flex: 1 },
  clienteNombreRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  clienteNombre: { fontWeight: '600', fontSize: 14, color: '#333' },
  vipBadge: { fontSize: 11, color: '#FFC107', fontWeight: '600' },
  clienteTermino: { fontSize: 12, color: '#888', marginTop: 2 },
  clienteVisitas: { alignItems: 'center' },
  clienteVisitasNum: { fontSize: 20, fontWeight: 'bold', color: '#2196F3' },
  clienteVisitasLbl: { fontSize: 10, color: '#bbb' },

  // Botón de refresh
  refreshBtn: { margin: 16, backgroundColor: '#fff', borderRadius: 10, paddingVertical: 14, alignItems: 'center', elevation: 1, borderWidth: 1, borderColor: '#e0e0e0' },
  refreshBtnText: { color: '#2196F3', fontWeight: '600', fontSize: 14 },
});
