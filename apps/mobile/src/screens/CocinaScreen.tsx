import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { tizonAPI } from '../services/api';

// Paleta oscuro/dorado de Tizón OS
const BG = '#1a0a00';
const CARD = '#2a1600';
const GOLD = '#c9a84c';
const TEXT = '#ffffff';
const MUTED = '#b9a689';

interface Comanda {
  id: string;
  nombre_item: string;
  cantidad: number;
  estado: string;
  notas?: string;
}

interface Pedido {
  id: string;
  mesa_numero: number;
  estado: string;
  mesero_nombre?: string;
  created_at: string;
  comandas: Comanda[];
}

const REFRESH_MS = 30000; // auto-refresh cada 30 segundos

export const CocinaScreen = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const cargar = useCallback(async (esRefresh = false) => {
    if (esRefresh) setRefreshing(true);
    try {
      const data: Pedido[] = await tizonAPI.obtenerPedidosActivos();
      setPedidos(data);
      setError(null);
    } catch (e: any) {
      setError(e?.message || 'No se pudieron cargar los pedidos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    cargar();
    timer.current = setInterval(() => cargar(), REFRESH_MS);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [cargar]);

  const marcarComanda = async (comandaId: string, estado: string) => {
    try {
      await tizonAPI.actualizarEstadoComanda(comandaId, estado);
      await cargar();
    } catch {
      // el próximo refresh corregirá el estado
    }
  };

  const marcarPedidoListo = async (pedidoId: string) => {
    try {
      await tizonAPI.actualizarEstadoPedido(pedidoId, 'listo');
      await cargar();
    } catch {
      // ignore
    }
  };

  const minutosDesde = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    return Math.max(0, Math.floor(diff / 60000));
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={GOLD} size="large" />
        <Text style={styles.muted}>Cargando cocina…</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 12, paddingBottom: 30 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => cargar(true)} tintColor={GOLD} />
      }
    >
      <Text style={styles.titulo}>👨‍🍳 Cocina</Text>
      <Text style={styles.subtitulo}>Se actualiza solo cada 30 s · desliza para refrescar</Text>

      {error && <Text style={styles.error}>{error}</Text>}

      {pedidos.length === 0 && !error && (
        <View style={styles.vacio}>
          <Text style={styles.vacioTxt}>No hay pedidos activos</Text>
        </View>
      )}

      {pedidos.map((p) => {
        const mins = minutosDesde(p.created_at);
        const urgente = mins >= 20;
        const pendientes = p.comandas.filter(
          (c) => c.estado === 'pendiente' || c.estado === 'en_preparacion',
        );
        return (
          <View key={p.id} style={[styles.pedidoCard, urgente && styles.pedidoUrgente]}>
            <View style={styles.pedidoHeader}>
              <Text style={styles.mesaTxt}>Mesa {p.mesa_numero}</Text>
              <Text style={[styles.tiempo, urgente && styles.tiempoUrgente]}>
                ⏱ {mins} min
              </Text>
            </View>
            {!!p.mesero_nombre && <Text style={styles.mesero}>{p.mesero_nombre}</Text>}

            {p.comandas.map((c) => {
              const listo = c.estado === 'listo' || c.estado === 'entregado';
              return (
                <View key={c.id} style={styles.comandaFila}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.comandaTxt, listo && styles.comandaListo]}>
                      {c.cantidad}× {c.nombre_item}
                    </Text>
                    {!!c.notas && <Text style={styles.comandaNota}>📝 {c.notas}</Text>}
                  </View>
                  {listo ? (
                    <Text style={styles.checkListo}>✓ Listo</Text>
                  ) : (
                    <TouchableOpacity
                      style={styles.btnListo}
                      onPress={() => marcarComanda(c.id, 'listo')}
                    >
                      <Text style={styles.btnListoTxt}>Listo</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}

            {pendientes.length === 0 && p.comandas.length > 0 && (
              <TouchableOpacity style={styles.btnPedidoListo} onPress={() => marcarPedidoListo(p.id)}>
                <Text style={styles.btnPedidoListoTxt}>✅ Marcar pedido listo</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  center: { alignItems: 'center', justifyContent: 'center' },
  muted: { color: MUTED, marginTop: 10 },
  titulo: { color: GOLD, fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  subtitulo: { color: MUTED, fontSize: 12, textAlign: 'center', marginBottom: 14 },
  error: { color: '#ff8a80', textAlign: 'center', marginVertical: 10 },
  vacio: { padding: 40, alignItems: 'center' },
  vacioTxt: { color: MUTED, fontSize: 16 },

  pedidoCard: {
    backgroundColor: CARD, borderRadius: 14, padding: 14, marginBottom: 14,
    borderWidth: 1, borderColor: '#3a2807',
  },
  pedidoUrgente: { borderColor: '#e53935', borderWidth: 2 },
  pedidoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mesaTxt: { color: GOLD, fontSize: 20, fontWeight: 'bold' },
  tiempo: { color: MUTED, fontSize: 15, fontWeight: '600' },
  tiempoUrgente: { color: '#ff5252' },
  mesero: { color: MUTED, fontSize: 12, marginBottom: 6 },

  comandaFila: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#3a2807',
  },
  comandaTxt: { color: TEXT, fontSize: 16, fontWeight: '600' },
  comandaListo: { color: MUTED, textDecorationLine: 'line-through' },
  comandaNota: { color: '#ffcc80', fontSize: 12, marginTop: 2 },
  checkListo: { color: '#66bb6a', fontSize: 14, fontWeight: 'bold' },
  btnListo: {
    backgroundColor: GOLD, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8,
  },
  btnListoTxt: { color: BG, fontWeight: 'bold', fontSize: 14 },
  btnPedidoListo: {
    marginTop: 12, backgroundColor: '#2e5a1e', paddingVertical: 12,
    borderRadius: 10, alignItems: 'center',
  },
  btnPedidoListoTxt: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});
