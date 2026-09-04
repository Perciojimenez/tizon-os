import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import { tizonAPI } from '../services/api';
import { MesaCard } from '../components/MesaCard';
import { useMesas } from '../hooks/useMesas';
import { Mesa } from '../store/salaStore';

// Zonas para agrupar las mesas en la selección
const ZONAS_PEDIDOS: { key: Mesa['zona']; label: string }[] = [
  { key: 'salon_principal', label: 'Salón Principal' },
  { key: 'terraza', label: 'Terraza' },
  { key: 'privado', label: 'Privado' },
];

// Paleta oscuro/dorado de Tizón OS
const BG = '#1a0a00';
const CARD = '#2a1600';
const GOLD = '#c9a84c';
const TEXT = '#ffffff';
const MUTED = '#b9a689';

interface MenuItem {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  categoria: string;
  tiempo_preparacion?: number;
}

interface Comanda {
  id: string;
  nombre_item: string;
  precio_unitario: number;
  cantidad: number;
  estado: string;
}

interface Pedido {
  id: string;
  mesa_numero: number;
  estado: string;
  total: number;
  comandas: Comanda[];
}

const CATEGORIAS: { key: string; label: string }[] = [
  { key: 'entrada', label: 'Entradas' },
  { key: 'principal', label: 'Principales' },
  { key: 'guarnicion', label: 'Guarniciones' },
  { key: 'bebida', label: 'Bebidas' },
  { key: 'postre', label: 'Postres' },
];

const MESAS = Array.from({ length: 20 }, (_, i) => i + 1);

export const PedidosScreen = () => {
  const { mesas } = useMesas();
  const [mesaSel, setMesaSel] = useState<number | null>(null);
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [catActiva, setCatActiva] = useState<string>('principal');
  // Carrito local: menu_item_id -> cantidad
  const [carrito, setCarrito] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar el menú una sola vez.
  useEffect(() => {
    (async () => {
      try {
        const data = await tizonAPI.obtenerMenu();
        setMenu(data);
      } catch (e: any) {
        setError(e?.message || 'No se pudo cargar el menú');
      }
    })();
  }, []);

  // Al seleccionar una mesa, abre o crea su pedido activo.
  const abrirMesa = useCallback(async (numero: number) => {
    setMesaSel(numero);
    setCarrito({});
    setLoading(true);
    setError(null);
    try {
      const p: Pedido = await tizonAPI.crearPedido(numero);
      setPedido(p);
    } catch (e: any) {
      setError(e?.message || 'No se pudo abrir la mesa');
      setPedido(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const cambiarCantidad = (id: string, delta: number) => {
    setCarrito((prev) => {
      const actual = prev[id] || 0;
      const nuevo = Math.max(0, actual + delta);
      const copia = { ...prev };
      if (nuevo === 0) delete copia[id];
      else copia[id] = nuevo;
      return copia;
    });
  };

  const menuPorCategoria = menu.filter((m) => m.categoria === catActiva);

  const totalCarrito = Object.entries(carrito).reduce((s, [id, cant]) => {
    const item = menu.find((m) => m.id === id);
    return s + (item ? Number(item.precio) * cant : 0);
  }, 0);

  const itemsCarrito = Object.entries(carrito).length;

  const agregarAlPedido = async () => {
    if (!pedido || itemsCarrito === 0) return;
    setEnviando(true);
    try {
      const items = Object.entries(carrito).map(([menu_item_id, cantidad]) => ({
        menu_item_id,
        cantidad,
      }));
      await tizonAPI.agregarComandas(pedido.id, items);
      const actualizado: Pedido = await tizonAPI.obtenerPedidoMesa(pedido.mesa_numero);
      setPedido(actualizado);
      setCarrito({});
      Alert.alert('✅ Agregado', 'Los items se agregaron al pedido.');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'No se pudo agregar al pedido');
    } finally {
      setEnviando(false);
    }
  };

  const enviarACocina = async () => {
    if (!pedido) return;
    if (!pedido.comandas || pedido.comandas.length === 0) {
      Alert.alert('Pedido vacío', 'Agrega items antes de enviar a cocina.');
      return;
    }
    setEnviando(true);
    try {
      await tizonAPI.actualizarEstadoPedido(pedido.id, 'en_cocina');
      const actualizado: Pedido = await tizonAPI.obtenerPedidoMesa(pedido.mesa_numero);
      setPedido(actualizado);
      Alert.alert('👨‍🍳 Enviado', `Pedido de la mesa ${pedido.mesa_numero} enviado a cocina.`);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'No se pudo enviar a cocina');
    } finally {
      setEnviando(false);
    }
  };

  // ── Vista: selección de mesa ───────────────────────────────────────────
  if (mesaSel === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.titulo}>Selecciona una mesa</Text>
        <Text style={styles.subtitulo}>Toca la mesa para tomar el pedido</Text>

        {mesas.length > 0 ? (
          <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 24 }}>
            {ZONAS_PEDIDOS.map((z) => {
              const mesasZona = mesas
                .filter((m) => m.zona === z.key)
                .sort((a, b) => a.numero - b.numero);
              if (mesasZona.length === 0) return null;
              return (
                <View key={z.key} style={styles.zonaBloque}>
                  <Text style={styles.zonaTitulo}>{z.label}</Text>
                  <View style={styles.zonaGrid}>
                    {mesasZona.map((m) => (
                      <MesaCard key={m.id} mesa={m} onPress={(mm) => abrirMesa(mm.numero)} />
                    ))}
                  </View>
                </View>
              );
            })}
          </ScrollView>
        ) : (
          // Fallback: si aún no hay datos de mesas, mostrar la cuadrícula numérica.
          <ScrollView contentContainerStyle={styles.gridMesas}>
            {MESAS.map((n) => (
              <TouchableOpacity key={n} style={styles.mesaBtn} onPress={() => abrirMesa(n)}>
                <Text style={styles.mesaNum}>{n}</Text>
                <Text style={styles.mesaLbl}>Mesa</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
        {error && <Text style={styles.error}>{error}</Text>}
      </View>
    );
  }

  // ── Vista: pedido de la mesa ───────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/* Encabezado de mesa */}
      <View style={styles.headerMesa}>
        <TouchableOpacity onPress={() => { setMesaSel(null); setPedido(null); }}>
          <Text style={styles.volver}>‹ Mesas</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitulo}>Mesa {mesaSel}</Text>
        {pedido && (
          <View style={[styles.badge, estadoBadge(pedido.estado)]}>
            <Text style={styles.badgeTxt}>{estadoLabel(pedido.estado)}</Text>
          </View>
        )}
      </View>

      {loading ? (
        <ActivityIndicator color={GOLD} size="large" style={{ marginTop: 40 }} />
      ) : (
        <>
          {/* Tabs de categorías */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs}
            contentContainerStyle={{ paddingHorizontal: 8 }}>
            {CATEGORIAS.map((c) => (
              <TouchableOpacity
                key={c.key}
                style={[styles.tab, catActiva === c.key && styles.tabActiva]}
                onPress={() => setCatActiva(c.key)}
              >
                <Text style={[styles.tabTxt, catActiva === c.key && styles.tabTxtActiva]}>
                  {c.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Lista del menú por categoría */}
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 12, paddingBottom: 20 }}>
            {menuPorCategoria.map((item) => {
              const cant = carrito[item.id] || 0;
              return (
                <View key={item.id} style={styles.itemCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemNombre}>{item.nombre}</Text>
                    {!!item.descripcion && (
                      <Text style={styles.itemDesc}>{item.descripcion}</Text>
                    )}
                    <Text style={styles.itemPrecio}>${Number(item.precio).toFixed(2)}</Text>
                  </View>
                  <View style={styles.stepper}>
                    <TouchableOpacity style={styles.stepBtn} onPress={() => cambiarCantidad(item.id, -1)}>
                      <Text style={styles.stepTxt}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.stepCant}>{cant}</Text>
                    <TouchableOpacity style={styles.stepBtn} onPress={() => cambiarCantidad(item.id, 1)}>
                      <Text style={styles.stepTxt}>＋</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Panel inferior: resumen y acciones */}
          <View style={styles.panel}>
            {pedido && pedido.comandas?.length > 0 && (
              <Text style={styles.panelPedido}>
                Ya en el pedido: {pedido.comandas.reduce((s, c) => s + c.cantidad, 0)} item(s) · Total ${Number(pedido.total).toFixed(2)}
              </Text>
            )}
            <View style={styles.panelFila}>
              <Text style={styles.panelResumen}>
                {itemsCarrito > 0
                  ? `${Object.values(carrito).reduce((a, b) => a + b, 0)} nuevo(s) · $${totalCarrito.toFixed(2)}`
                  : 'Sin items nuevos'}
              </Text>
              <TouchableOpacity
                style={[styles.btnAgregar, (itemsCarrito === 0 || enviando) && styles.btnDisabled]}
                disabled={itemsCarrito === 0 || enviando}
                onPress={agregarAlPedido}
              >
                <Text style={styles.btnAgregarTxt}>+ Agregar</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.btnCocina, enviando && styles.btnDisabled]}
              disabled={enviando}
              onPress={enviarACocina}
            >
              {enviando
                ? <ActivityIndicator color={BG} />
                : <Text style={styles.btnCocinaTxt}>👨‍🍳 Enviar a Cocina</Text>}
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

function estadoLabel(estado: string) {
  const map: Record<string, string> = {
    abierto: 'Abierto', en_cocina: 'En cocina', listo: 'Listo',
    cerrado: 'Cerrado', cancelado: 'Cancelado',
  };
  return map[estado] || estado;
}

function estadoBadge(estado: string) {
  const map: Record<string, object> = {
    abierto: { backgroundColor: '#3a2a00' },
    en_cocina: { backgroundColor: '#7a4a00' },
    listo: { backgroundColor: '#2e5a1e' },
  };
  return map[estado] || { backgroundColor: '#3a2a00' };
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  titulo: { color: GOLD, fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginTop: 16 },
  subtitulo: { color: MUTED, fontSize: 13, textAlign: 'center', marginBottom: 12 },
  gridMesas: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', padding: 10 },
  zonaBloque: { marginBottom: 20 },
  zonaTitulo: { color: GOLD, fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 14 },
  zonaGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  mesaBtn: {
    width: 72, height: 72, margin: 8, borderRadius: 12, backgroundColor: CARD,
    borderWidth: 1, borderColor: GOLD, alignItems: 'center', justifyContent: 'center',
  },
  mesaNum: { color: GOLD, fontSize: 24, fontWeight: 'bold' },
  mesaLbl: { color: MUTED, fontSize: 11 },
  error: { color: '#ff8a80', textAlign: 'center', margin: 12 },

  headerMesa: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 12, backgroundColor: CARD,
    borderBottomWidth: 1, borderBottomColor: GOLD,
  },
  volver: { color: GOLD, fontSize: 16 },
  headerTitulo: { color: TEXT, fontSize: 18, fontWeight: 'bold' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeTxt: { color: TEXT, fontSize: 12, fontWeight: '600' },

  tabs: { maxHeight: 48, backgroundColor: BG },
  tab: {
    paddingHorizontal: 14, paddingVertical: 8, marginHorizontal: 4, marginVertical: 6,
    borderRadius: 18, backgroundColor: CARD, borderWidth: 1, borderColor: '#4a3410',
  },
  tabActiva: { backgroundColor: GOLD, borderColor: GOLD },
  tabTxt: { color: MUTED, fontSize: 13, fontWeight: '600' },
  tabTxtActiva: { color: BG },

  itemCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: CARD,
    borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#3a2807',
  },
  itemNombre: { color: TEXT, fontSize: 15, fontWeight: '600' },
  itemDesc: { color: MUTED, fontSize: 12, marginTop: 2 },
  itemPrecio: { color: GOLD, fontSize: 15, fontWeight: 'bold', marginTop: 4 },
  stepper: { flexDirection: 'row', alignItems: 'center' },
  stepBtn: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: '#3a2807',
    alignItems: 'center', justifyContent: 'center',
  },
  stepTxt: { color: GOLD, fontSize: 20, fontWeight: 'bold' },
  stepCant: { color: TEXT, fontSize: 16, fontWeight: 'bold', minWidth: 28, textAlign: 'center' },

  panel: {
    backgroundColor: CARD, padding: 12, borderTopWidth: 1, borderTopColor: GOLD,
  },
  panelPedido: { color: MUTED, fontSize: 12, marginBottom: 8 },
  panelFila: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  panelResumen: { color: TEXT, fontSize: 15, fontWeight: '600', flex: 1 },
  btnAgregar: {
    backgroundColor: '#3a2807', borderWidth: 1, borderColor: GOLD,
    paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10,
  },
  btnAgregarTxt: { color: GOLD, fontWeight: 'bold', fontSize: 14 },
  btnCocina: {
    backgroundColor: GOLD, paddingVertical: 14, borderRadius: 10, alignItems: 'center',
  },
  btnCocinaTxt: { color: BG, fontWeight: 'bold', fontSize: 16 },
  btnDisabled: { opacity: 0.5 },
});
