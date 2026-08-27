import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { tizonAPI } from '../services/api';

interface MensajeLog {
  id: string;
  tipo: string;
  estado: string;
  telefono: string;
  created_at: string;
  respuesta_cliente?: string;
}

interface Stats {
  total: number;
  enviados: number;
  fallidos: number;
  hoy: number;
  porTipo: Record<string, number>;
}

const TIPO_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  confirmacion:  { label: 'Confirmación',  emoji: '✅', color: '#4CAF50' },
  recordatorio:  { label: 'Recordatorio',  emoji: '⏰', color: '#2196F3' },
  agradecimiento:{ label: 'Agradecimiento',emoji: '💌', color: '#9C27B0' },
  lista_espera:  { label: 'Lista espera',  emoji: '⏱', color: '#FF9800' },
};

const ESTADO_STYLE: Record<string, { color: string; bg: string; label: string }> = {
  enviado:  { color: '#2E7D32', bg: '#E8F5E9', label: 'Enviado ✓' },
  fallido:  { color: '#C62828', bg: '#FFEBEE', label: 'Falló ✗' },
  recibido: { color: '#1565C0', bg: '#E3F2FD', label: 'Respuesta' },
  pendiente:{ color: '#E65100', bg: '#FFF3E0', label: 'Pendiente' },
};

export const WhatsAppScreen = () => {
  const [mensajes, setMensajes] = useState<MensajeLog[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async (esRefresh = false) => {
    if (esRefresh) setRefreshing(true); else setLoading(true);
    setError(null);
    try {
      const [logs, statsData] = await Promise.all([
        tizonAPI.getWhatsAppResumen(),
        tizonAPI.getWhatsAppStats(),
      ]);
      setMensajes(logs);
      setStats(statsData);
    } catch (e: any) {
      setError(e?.message || 'No se pudo cargar el historial');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const formatFecha = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
      + ' ' + d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#25D366" />
        <Text style={styles.loadingText}>Cargando mensajes...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 30 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => cargar(true)} tintColor="#25D366" />}
    >
      {/* ── CABECERA ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💬 WhatsApp Business</Text>
        <Text style={styles.headerSub}>Mensajes automáticos a clientes</Text>
      </View>

      {/* ── ESTADO DE CONFIGURACIÓN ── */}
      {error ? (
        <View style={styles.alertCard}>
          <Text style={styles.alertEmoji}>⚠️</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.alertTitle}>Twilio no configurado</Text>
            <Text style={styles.alertText}>Los mensajes NO se están enviando. Configura las credenciales en Railway para activar WhatsApp.</Text>
          </View>
        </View>
      ) : (
        <View style={styles.okCard}>
          <Text style={styles.okEmoji}>✅</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.okTitle}>WhatsApp activo</Text>
            <Text style={styles.okText}>Los mensajes se envían automáticamente.</Text>
          </View>
        </View>
      )}

      {/* ── ESTADÍSTICAS ── */}
      {stats && (
        <>
          <Text style={styles.seccion}>Estadísticas</Text>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { borderLeftColor: '#25D366' }]}>
              <Text style={[styles.statNum, { color: '#25D366' }]}>{stats.hoy}</Text>
              <Text style={styles.statLbl}>Hoy</Text>
            </View>
            <View style={[styles.statCard, { borderLeftColor: '#4CAF50' }]}>
              <Text style={[styles.statNum, { color: '#4CAF50' }]}>{stats.enviados}</Text>
              <Text style={styles.statLbl}>Enviados</Text>
            </View>
            <View style={[styles.statCard, { borderLeftColor: '#F44336' }]}>
              <Text style={[styles.statNum, { color: '#F44336' }]}>{stats.fallidos}</Text>
              <Text style={styles.statLbl}>Fallidos</Text>
            </View>
            <View style={[styles.statCard, { borderLeftColor: '#2196F3' }]}>
              <Text style={[styles.statNum, { color: '#2196F3' }]}>{stats.total}</Text>
              <Text style={styles.statLbl}>Total</Text>
            </View>
          </View>

          {/* Por tipo */}
          <Text style={styles.seccion}>Por tipo de mensaje</Text>
          <View style={styles.card}>
            {Object.entries(TIPO_LABELS).map(([tipo, info]) => {
              const count = stats.porTipo[tipo] || 0;
              const total = stats.total || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <View key={tipo} style={styles.tipoRow}>
                  <Text style={styles.tipoEmoji}>{info.emoji}</Text>
                  <Text style={styles.tipoLabel}>{info.label}</Text>
                  <View style={styles.tipoBg}>
                    <View style={[styles.tipoFill, { width: `${pct}%`, backgroundColor: info.color }]} />
                  </View>
                  <Text style={[styles.tipoCount, { color: info.color }]}>{count}</Text>
                </View>
              );
            })}
          </View>
        </>
      )}

      {/* ── FLUJO AUTOMÁTICO ── */}
      <Text style={styles.seccion}>Flujo automático</Text>
      <View style={styles.card}>
        {[
          { emoji: '✅', label: 'Al crear reserva', desc: 'Confirmación inmediata con código único', active: true },
          { emoji: '⏰', label: '2 horas antes', desc: 'Recordatorio con opción de confirmar (1) o cancelar (2)', active: true },
          { emoji: '💌', label: 'Al completar visita', desc: 'Agradecimiento + link para calificar', active: true },
          { emoji: '⏱', label: 'Lista de espera', desc: 'Aviso cuando la mesa está lista (manual desde la app)', active: true },
        ].map((item, i) => (
          <View key={i} style={[styles.flujoRow, i > 0 && styles.flujoBorder]}>
            <Text style={styles.flujoEmoji}>{item.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.flujoLabel}>{item.label}</Text>
              <Text style={styles.flujoDesc}>{item.desc}</Text>
            </View>
            <View style={[styles.activeBadge, !item.active && styles.inactiveBadge]}>
              <Text style={[styles.activeTxt, !item.active && styles.inactiveTxt]}>
                {item.active ? 'ON' : 'OFF'}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* ── HISTORIAL ── */}
      <Text style={styles.seccion}>Últimos mensajes enviados</Text>
      {mensajes.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyEmoji}>📭</Text>
          <Text style={styles.emptyText}>Aún no se han enviado mensajes.</Text>
          <Text style={styles.emptyHint}>Los mensajes aparecerán aquí cuando WhatsApp esté configurado y se creen reservas.</Text>
        </View>
      ) : (
        <View style={styles.card}>
          {mensajes.map((m, i) => {
            const tipo = TIPO_LABELS[m.tipo] || { label: m.tipo, emoji: '📨', color: '#999' };
            const est = ESTADO_STYLE[m.estado] || { color: '#999', bg: '#f5f5f5', label: m.estado };
            return (
              <View key={m.id} style={[styles.logRow, i > 0 && styles.logBorder]}>
                <Text style={styles.logEmoji}>{tipo.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.logTipo}>{tipo.label}</Text>
                  <Text style={styles.logTel}>{m.telefono?.replace('whatsapp:', '')}</Text>
                  <Text style={styles.logFecha}>{formatFecha(m.created_at)}</Text>
                  {m.respuesta_cliente && (
                    <Text style={styles.logRespuesta}>↩ {m.respuesta_cliente}</Text>
                  )}
                </View>
                <View style={[styles.estadoBadge, { backgroundColor: est.bg }]}>
                  <Text style={[styles.estadoText, { color: est.color }]}>{est.label}</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      <TouchableOpacity style={styles.refreshBtn} onPress={() => cargar(true)}>
        <Text style={styles.refreshBtnText}>🔄  Actualizar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f9' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#999', fontSize: 14 },

  header: { backgroundColor: '#075E54', padding: 16, paddingTop: 20 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  headerSub: { color: '#b2dfdb', fontSize: 12, marginTop: 4 },

  alertCard: { margin: 16, backgroundColor: '#FFF8E1', borderRadius: 10, padding: 14, flexDirection: 'row', alignItems: 'flex-start', borderLeftWidth: 4, borderLeftColor: '#FFC107' },
  alertEmoji: { fontSize: 24, marginRight: 10, marginTop: 2 },
  alertTitle: { fontWeight: 'bold', color: '#E65100', marginBottom: 4 },
  alertText: { fontSize: 12, color: '#666' },
  okCard: { margin: 16, backgroundColor: '#E8F5E9', borderRadius: 10, padding: 14, flexDirection: 'row', alignItems: 'center', borderLeftWidth: 4, borderLeftColor: '#4CAF50' },
  okEmoji: { fontSize: 24, marginRight: 10 },
  okTitle: { fontWeight: 'bold', color: '#2E7D32', marginBottom: 2 },
  okText: { fontSize: 12, color: '#555' },

  seccion: { fontSize: 13, fontWeight: '700', color: '#888', marginTop: 16, marginBottom: 8, paddingHorizontal: 16, textTransform: 'uppercase', letterSpacing: 0.5 },

  statsRow: { flexDirection: 'row', paddingHorizontal: 12, gap: 8 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 10, padding: 10, alignItems: 'center', borderLeftWidth: 3, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 2 },
  statNum: { fontSize: 22, fontWeight: 'bold' },
  statLbl: { fontSize: 10, color: '#888', marginTop: 2 },

  card: { backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 12, padding: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 },

  tipoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  tipoEmoji: { fontSize: 18, width: 28 },
  tipoLabel: { fontSize: 13, color: '#555', width: 110 },
  tipoBg: { flex: 1, height: 8, backgroundColor: '#f0f0f0', borderRadius: 4, overflow: 'hidden', marginHorizontal: 8 },
  tipoFill: { height: '100%', borderRadius: 4 },
  tipoCount: { width: 28, fontSize: 13, fontWeight: 'bold', textAlign: 'right' },

  flujoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  flujoBorder: { borderTopWidth: 1, borderTopColor: '#f5f5f5' },
  flujoEmoji: { fontSize: 20, width: 34 },
  flujoLabel: { fontWeight: '600', fontSize: 13, color: '#333', marginBottom: 2 },
  flujoDesc: { fontSize: 11, color: '#888' },
  activeBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  inactiveBadge: { backgroundColor: '#f5f5f5' },
  activeTxt: { fontSize: 11, fontWeight: 'bold', color: '#4CAF50' },
  inactiveTxt: { color: '#bbb' },

  emptyCard: { backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 12, padding: 30, alignItems: 'center', elevation: 1 },
  emptyEmoji: { fontSize: 40, marginBottom: 10 },
  emptyText: { fontSize: 15, color: '#555', fontWeight: '600', marginBottom: 6 },
  emptyHint: { fontSize: 12, color: '#999', textAlign: 'center' },

  logRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 10 },
  logBorder: { borderTopWidth: 1, borderTopColor: '#f5f5f5' },
  logEmoji: { fontSize: 20, width: 30, marginTop: 2 },
  logTipo: { fontWeight: '600', fontSize: 13, color: '#333' },
  logTel: { fontSize: 12, color: '#888', marginTop: 1 },
  logFecha: { fontSize: 11, color: '#bbb', marginTop: 1 },
  logRespuesta: { fontSize: 11, color: '#2196F3', marginTop: 2, fontStyle: 'italic' },
  estadoBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginLeft: 6, alignSelf: 'flex-start', marginTop: 4 },
  estadoText: { fontSize: 11, fontWeight: '600' },

  refreshBtn: { margin: 16, backgroundColor: '#fff', borderRadius: 10, paddingVertical: 14, alignItems: 'center', elevation: 1, borderWidth: 1, borderColor: '#e0e0e0' },
  refreshBtnText: { color: '#25D366', fontWeight: '600', fontSize: 14 },
});
