import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import { tizonAPI } from '../services/api';

// Paleta oscuro/dorado de Tizón OS
const BG = '#1a0a00';
const CARD = '#2a1600';
const GOLD = '#c9a84c';
const TEXT = '#ffffff';
const MUTED = '#b9a689';

interface CuentaItem {
  id: string;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

interface Cuenta {
  pedido_id: string;
  mesa_numero: number;
  mesero_nombre?: string;
  estado: string;
  restaurante: string;
  items: CuentaItem[];
  subtotal: number;
  impuesto: number;
  impuesto_pct: number;
  total: number;
}

const MESAS = Array.from({ length: 20 }, (_, i) => i + 1);

export const CuentaScreen = () => {
  const [mesaSel, setMesaSel] = useState<number | null>(null);
  const [cuenta, setCuenta] = useState<Cuenta | null>(null);
  const [loading, setLoading] = useState(false);
  const [cerrando, setCerrando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buscarMesa = async (numero: number) => {
    setMesaSel(numero);
    setLoading(true);
    setError(null);
    setCuenta(null);
    try {
      const pedido = await tizonAPI.obtenerPedidoMesa(numero);
      if (!pedido) {
        setError(`La mesa ${numero} no tiene un pedido activo.`);
        return;
      }
      const c: Cuenta = await tizonAPI.obtenerCuenta(pedido.id);
      setCuenta(c);
    } catch (e: any) {
      setError(e?.message || 'No se pudo cargar la cuenta');
    } finally {
      setLoading(false);
    }
  };

  const cerrarCuenta = () => {
    if (!cuenta) return;
    Alert.alert(
      'Cerrar cuenta',
      `¿Cerrar la cuenta de la mesa ${cuenta.mesa_numero} por $${cuenta.total.toFixed(2)}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar',
          style: 'destructive',
          onPress: async () => {
            setCerrando(true);
            try {
              const final: Cuenta = await tizonAPI.cerrarPedido(cuenta.pedido_id);
              setCuenta({ ...final, estado: 'cerrado' });
              Alert.alert('✅ Cuenta cerrada', `Mesa ${final.mesa_numero} cerrada correctamente.`);
            } catch (e: any) {
              Alert.alert('Error', e?.message || 'No se pudo cerrar la cuenta');
            } finally {
              setCerrando(false);
            }
          },
        },
      ],
    );
  };

  const reset = () => { setMesaSel(null); setCuenta(null); setError(null); };

  // ── Vista: selección de mesa ───────────────────────────────────────────
  if (mesaSel === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.titulo}>Ver la cuenta</Text>
        <Text style={styles.subtitulo}>Selecciona la mesa</Text>
        <ScrollView contentContainerStyle={styles.gridMesas}>
          {MESAS.map((n) => (
            <TouchableOpacity key={n} style={styles.mesaBtn} onPress={() => buscarMesa(n)}>
              <Text style={styles.mesaNum}>{n}</Text>
              <Text style={styles.mesaLbl}>Mesa</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }

  // ── Vista: comprobante ─────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <View style={styles.headerMesa}>
        <TouchableOpacity onPress={reset}>
          <Text style={styles.volver}>‹ Mesas</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitulo}>Mesa {mesaSel}</Text>
        <View style={{ width: 60 }} />
      </View>

      {loading ? (
        <ActivityIndicator color={GOLD} size="large" style={{ marginTop: 40 }} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : cuenta ? (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 30 }}>
          <View style={styles.recibo}>
            <Text style={styles.reciboMarca}>🥩 {cuenta.restaurante}</Text>
            <Text style={styles.reciboSub}>Comprobante · Mesa {cuenta.mesa_numero}</Text>
            {!!cuenta.mesero_nombre && (
              <Text style={styles.reciboMesero}>Atendió: {cuenta.mesero_nombre}</Text>
            )}
            <View style={styles.divisor} />

            {cuenta.items.map((it) => (
              <View key={it.id} style={styles.itemFila}>
                <Text style={styles.itemCant}>{it.cantidad}×</Text>
                <Text style={styles.itemNombre}>{it.nombre}</Text>
                <Text style={styles.itemMonto}>${it.subtotal.toFixed(2)}</Text>
              </View>
            ))}

            {cuenta.items.length === 0 && (
              <Text style={styles.muted}>Sin items en esta cuenta.</Text>
            )}

            <View style={styles.divisor} />
            <View style={styles.totalFila}>
              <Text style={styles.totalLbl}>Subtotal</Text>
              <Text style={styles.totalVal}>${cuenta.subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.totalFila}>
              <Text style={styles.totalLbl}>ITBIS ({cuenta.impuesto_pct}%)</Text>
              <Text style={styles.totalVal}>${cuenta.impuesto.toFixed(2)}</Text>
            </View>
            <View style={styles.totalFila}>
              <Text style={styles.granTotalLbl}>TOTAL</Text>
              <Text style={styles.granTotalVal}>${cuenta.total.toFixed(2)}</Text>
            </View>
          </View>

          {cuenta.estado === 'cerrado' ? (
            <View style={styles.cerradoBox}>
              <Text style={styles.cerradoTxt}>✓ Cuenta cerrada</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.btnCerrar, cerrando && styles.btnDisabled]}
              disabled={cerrando}
              onPress={cerrarCuenta}
            >
              {cerrando
                ? <ActivityIndicator color={BG} />
                : <Text style={styles.btnCerrarTxt}>Cerrar Cuenta</Text>}
            </TouchableOpacity>
          )}
        </ScrollView>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  titulo: { color: GOLD, fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginTop: 16 },
  subtitulo: { color: MUTED, fontSize: 13, textAlign: 'center', marginBottom: 12 },
  gridMesas: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', padding: 10 },
  mesaBtn: {
    width: 72, height: 72, margin: 8, borderRadius: 12, backgroundColor: CARD,
    borderWidth: 1, borderColor: GOLD, alignItems: 'center', justifyContent: 'center',
  },
  mesaNum: { color: GOLD, fontSize: 24, fontWeight: 'bold' },
  mesaLbl: { color: MUTED, fontSize: 11 },
  error: { color: '#ff8a80', textAlign: 'center', margin: 20, fontSize: 15 },
  muted: { color: MUTED, textAlign: 'center', marginVertical: 10 },

  headerMesa: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 12, backgroundColor: CARD,
    borderBottomWidth: 1, borderBottomColor: GOLD,
  },
  volver: { color: GOLD, fontSize: 16, width: 60 },
  headerTitulo: { color: TEXT, fontSize: 18, fontWeight: 'bold' },

  recibo: {
    backgroundColor: CARD, borderRadius: 14, padding: 18,
    borderWidth: 1, borderColor: GOLD,
  },
  reciboMarca: { color: GOLD, fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
  reciboSub: { color: TEXT, fontSize: 14, textAlign: 'center', marginTop: 4 },
  reciboMesero: { color: MUTED, fontSize: 12, textAlign: 'center', marginTop: 2 },
  divisor: { height: 1, backgroundColor: '#4a3410', marginVertical: 12 },

  itemFila: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5 },
  itemCant: { color: GOLD, fontSize: 14, fontWeight: 'bold', width: 34 },
  itemNombre: { color: TEXT, fontSize: 14, flex: 1 },
  itemMonto: { color: TEXT, fontSize: 14, fontWeight: '600' },

  totalFila: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  totalLbl: { color: MUTED, fontSize: 14 },
  totalVal: { color: TEXT, fontSize: 14, fontWeight: '600' },
  granTotalLbl: { color: GOLD, fontSize: 18, fontWeight: 'bold' },
  granTotalVal: { color: GOLD, fontSize: 20, fontWeight: 'bold' },

  btnCerrar: {
    backgroundColor: GOLD, paddingVertical: 15, borderRadius: 10,
    alignItems: 'center', marginTop: 20,
  },
  btnCerrarTxt: { color: BG, fontWeight: 'bold', fontSize: 16 },
  btnDisabled: { opacity: 0.5 },
  cerradoBox: {
    marginTop: 20, padding: 14, borderRadius: 10, backgroundColor: '#2e5a1e',
    alignItems: 'center',
  },
  cerradoTxt: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
