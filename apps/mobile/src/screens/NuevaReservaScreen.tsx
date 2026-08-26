import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, ScrollView, Modal, FlatList,
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

// ── Helpers de fecha ────────────────────────────────────────────
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DIAS_SEMANA = ['D','L','M','M','J','V','S'];

const hoyStr = () => new Date().toISOString().split('T')[0];

const formatFechaLabel = (fecha: string) => {
  if (!fecha) return '';
  const [y, m, d] = fecha.split('-').map(Number);
  return `${d} de ${MESES[m - 1]} ${y}`;
};

// ── Selector de Mesa ────────────────────────────────────────────
const ESTADO_COLOR: { [k: string]: string } = {
  libre: '#4CAF50',
  ocupada: '#FF9800',
  reservada: '#2196F3',
};

// ── Horas disponibles ───────────────────────────────────────────
const HORAS = ['12:00','12:30','13:00','13:30','14:00','14:30','15:00','18:00','18:30','19:00','19:30','20:00','20:30','21:00','21:30','22:00','22:30'];

// ════════════════════════════════════════════════════════════════
export const NuevaReservaScreen = ({ navigation }: any) => {

  // ── Estado ──────────────────────────────────────────────────
  const [busqueda, setBusqueda] = useState('');
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const { clientes, loading: loadingClientes, buscar } = useClientes();

  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [loadingMesas, setLoadingMesas] = useState(true);
  const [mesaSeleccionada, setMesaSeleccionada] = useState<Mesa | null>(null);

  const [fecha, setFecha] = useState(hoyStr());
  const [hora, setHora] = useState('20:00');
  const [comensales, setComensales] = useState('2');
  const [guardando, setGuardando] = useState(false);

  // Modales
  const [modalCalendario, setModalCalendario] = useState(false);
  const [modalHora, setModalHora] = useState(false);
  const [modalMesas, setModalMesas] = useState(false);

  // Mes/año del calendario
  const hoyDate = new Date();
  const [mesVista, setMesVista] = useState(hoyDate.getMonth());
  const [anioVista, setAnioVista] = useState(hoyDate.getFullYear());

  // ── Cargar mesas ─────────────────────────────────────────────
  useEffect(() => {
    tizonAPI.obtenerMesas()
      .then(setMesas)
      .catch(() => Alert.alert('Error', 'No se pudieron cargar las mesas'))
      .finally(() => setLoadingMesas(false));
  }, []);

  // ── Buscar cliente ───────────────────────────────────────────
  const buscarCliente = async (texto: string) => {
    setBusqueda(texto);
    setClienteSeleccionado(null);
    if (texto.length >= 2) await buscar(texto);
  };

  // ── Crear reserva ────────────────────────────────────────────
  const crearReserva = async () => {
    if (!clienteSeleccionado) { Alert.alert('Falta cliente', 'Busca y selecciona un cliente'); return; }
    if (!mesaSeleccionada)    { Alert.alert('Falta mesa',    'Selecciona una mesa');           return; }
    if (!fecha)               { Alert.alert('Falta fecha',   'Selecciona una fecha');          return; }
    if (!hora)                { Alert.alert('Falta hora',    'Selecciona una hora');           return; }

    setGuardando(true);
    try {
      const reserva = await tizonAPI.crearReserva(
        clienteSeleccionado.id,
        mesaSeleccionada.id,
        fecha,
        hora,
        parseInt(comensales, 10),
      );
      Alert.alert('✅ Reserva creada', `Código: ${reserva.codigo_unico}`, [
        { text: 'OK', onPress: () => navigation?.goBack() },
      ]);
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error desconocido';
      Alert.alert('No se pudo crear la reserva', mensaje);
    } finally {
      setGuardando(false);
    }
  };

  // ── Calendario ───────────────────────────────────────────────
  const diasEnMes = (m: number, a: number) => new Date(a, m + 1, 0).getDate();
  const primerDia = (m: number, a: number) => new Date(a, m, 1).getDay();

  const seleccionarDia = (dia: number) => {
    const m = String(mesVista + 1).padStart(2, '0');
    const d = String(dia).padStart(2, '0');
    setFecha(`${anioVista}-${m}-${d}`);
    setModalCalendario(false);
  };

  const cambiarMes = (delta: number) => {
    let m = mesVista + delta;
    let a = anioVista;
    if (m < 0)  { m = 11; a--; }
    if (m > 11) { m = 0;  a++; }
    setMesVista(m);
    setAnioVista(a);
  };

  const renderCalendario = () => {
    const total = diasEnMes(mesVista, anioVista);
    const inicio = primerDia(mesVista, anioVista);
    const hoyISO = hoyStr();
    const celdas: (number | null)[] = [...Array(inicio).fill(null), ...Array.from({length: total}, (_, i) => i + 1)];
    // rellenar hasta múltiplo de 7
    while (celdas.length % 7 !== 0) celdas.push(null);

    return (
      <View>
        {/* Nav mes */}
        <View style={cal.navRow}>
          <TouchableOpacity onPress={() => cambiarMes(-1)} style={cal.navBtn}><Text style={cal.navArrow}>◀</Text></TouchableOpacity>
          <Text style={cal.mesLabel}>{MESES[mesVista]} {anioVista}</Text>
          <TouchableOpacity onPress={() => cambiarMes(1)} style={cal.navBtn}><Text style={cal.navArrow}>▶</Text></TouchableOpacity>
        </View>
        {/* Días semana */}
        <View style={cal.semanaRow}>
          {DIAS_SEMANA.map((d, i) => <Text key={i} style={cal.diaLabel}>{d}</Text>)}
        </View>
        {/* Grilla */}
        {Array.from({length: celdas.length / 7}, (_, fila) => (
          <View key={fila} style={cal.semanaRow}>
            {celdas.slice(fila * 7, fila * 7 + 7).map((dia, col) => {
              if (!dia) return <View key={col} style={cal.celda} />;
              const m = String(mesVista + 1).padStart(2, '0');
              const d = String(dia).padStart(2, '0');
              const iso = `${anioVista}-${m}-${d}`;
              const esHoy = iso === hoyISO;
              const selec = iso === fecha;
              const pasado = iso < hoyISO;
              return (
                <TouchableOpacity
                  key={col}
                  style={[cal.celda, esHoy && cal.celdaHoy, selec && cal.celdaSelec, pasado && cal.celdaPasado]}
                  onPress={() => !pasado && seleccionarDia(dia)}
                  disabled={pasado}
                >
                  <Text style={[cal.diaNum, selec && {color:'#fff'}, pasado && {color:'#ccc'}]}>{dia}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  // ── RENDER PRINCIPAL ─────────────────────────────────────────
  return (
    <ScrollView style={s.container} keyboardShouldPersistTaps="handled">
      <Text style={s.titulo}>Nueva Reserva</Text>

      {/* ── 1. CLIENTE ── */}
      <Text style={s.label}>👤 Cliente</Text>
      <TextInput
        style={s.input}
        placeholder="Buscar por nombre o teléfono..."
        value={busqueda}
        onChangeText={buscarCliente}
      />
      {loadingClientes && <ActivityIndicator size="small" color="#2196F3" style={{marginBottom:8}} />}
      {clientes.length > 0 && !clienteSeleccionado && (
        <View style={s.dropdown}>
          {clientes.slice(0, 6).map(item => (
            <TouchableOpacity key={item.id} style={s.dropdownItem} onPress={() => { setClienteSeleccionado(item); setBusqueda(item.nombre); }}>
              <Text style={s.dropNombre}>{item.nombre} {item.etiquetas?.includes('VIP') ? '⭐' : ''}</Text>
              <Text style={s.dropInfo}>{item.telefono || ''}{item.termino_carne_preferido ? ` · ${item.termino_carne_preferido}` : ''}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {clienteSeleccionado && (
        <View style={s.seleccionadoBox}>
          <Text style={s.seleccionadoNombre}>✓ {clienteSeleccionado.nombre}</Text>
          <TouchableOpacity onPress={() => { setClienteSeleccionado(null); setBusqueda(''); }}>
            <Text style={s.cambiarLink}>Cambiar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── 2. MESA ── */}
      <Text style={s.label}>🪑 Mesa</Text>
      <TouchableOpacity style={[s.selectorBtn, mesaSeleccionada && s.selectorBtnActivo]} onPress={() => setModalMesas(true)}>
        {loadingMesas
          ? <ActivityIndicator size="small" color="#2196F3" />
          : <Text style={[s.selectorText, mesaSeleccionada && {color:'#333', fontWeight:'600'}]}>
              {mesaSeleccionada ? `Mesa ${mesaSeleccionada.numero} · ${mesaSeleccionada.capacidad} personas · ${mesaSeleccionada.estado}` : 'Toca para seleccionar mesa →'}
            </Text>
        }
      </TouchableOpacity>

      {/* ── 3. FECHA ── */}
      <Text style={s.label}>📅 Fecha</Text>
      <TouchableOpacity style={[s.selectorBtn, fecha && s.selectorBtnActivo]} onPress={() => setModalCalendario(true)}>
        <Text style={[s.selectorText, fecha && {color:'#333', fontWeight:'600'}]}>
          {fecha ? formatFechaLabel(fecha) : 'Toca para seleccionar fecha →'}
        </Text>
      </TouchableOpacity>

      {/* ── 4. HORA ── */}
      <Text style={s.label}>🕐 Hora</Text>
      <TouchableOpacity style={[s.selectorBtn, hora && s.selectorBtnActivo]} onPress={() => setModalHora(true)}>
        <Text style={[s.selectorText, hora && {color:'#333', fontWeight:'600'}]}>
          {hora || 'Toca para seleccionar hora →'}
        </Text>
      </TouchableOpacity>

      {/* ── 5. COMENSALES ── */}
      <Text style={s.label}>👥 Comensales</Text>
      <View style={s.numRow}>
        {[1,2,3,4,5,6,7,8].map(n => (
          <TouchableOpacity
            key={n}
            style={[s.numBtn, comensales === String(n) && s.numBtnActivo]}
            onPress={() => setComensales(String(n))}
          >
            <Text style={[s.numText, comensales === String(n) && {color:'#fff'}]}>{n}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── BOTÓN CREAR ── */}
      <TouchableOpacity style={[s.crearBtn, guardando && {opacity:0.6}]} onPress={crearReserva} disabled={guardando}>
        {guardando ? <ActivityIndicator color="#fff" /> : <Text style={s.crearText}>Crear Reserva</Text>}
      </TouchableOpacity>
      <View style={{height: 50}} />

      {/* ══════════════════ MODAL CALENDARIO ══════════════════ */}
      <Modal visible={modalCalendario} transparent animationType="slide">
        <View style={m.overlay}>
          <View style={m.sheet}>
            <View style={m.header}>
              <Text style={m.titulo}>Seleccionar Fecha</Text>
              <TouchableOpacity onPress={() => setModalCalendario(false)}><Text style={m.cerrar}>✕</Text></TouchableOpacity>
            </View>
            {renderCalendario()}
            <TouchableOpacity style={m.btnHoy} onPress={() => { setFecha(hoyStr()); setModalCalendario(false); }}>
              <Text style={m.btnHoyText}>Ir a Hoy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ══════════════════ MODAL HORA ══════════════════ */}
      <Modal visible={modalHora} transparent animationType="slide">
        <View style={m.overlay}>
          <View style={m.sheet}>
            <View style={m.header}>
              <Text style={m.titulo}>Seleccionar Hora</Text>
              <TouchableOpacity onPress={() => setModalHora(false)}><Text style={m.cerrar}>✕</Text></TouchableOpacity>
            </View>
            <View style={h.grid}>
              {HORAS.map(hh => (
                <TouchableOpacity
                  key={hh}
                  style={[h.btn, hora === hh && h.btnActivo]}
                  onPress={() => { setHora(hh); setModalHora(false); }}
                >
                  <Text style={[h.text, hora === hh && {color:'#fff', fontWeight:'bold'}]}>{hh}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* ══════════════════ MODAL MESAS ══════════════════ */}
      <Modal visible={modalMesas} transparent animationType="slide">
        <View style={m.overlay}>
          <View style={[m.sheet, {maxHeight:'85%'}]}>
            <View style={m.header}>
              <Text style={m.titulo}>Seleccionar Mesa</Text>
              <TouchableOpacity onPress={() => setModalMesas(false)}><Text style={m.cerrar}>✕</Text></TouchableOpacity>
            </View>
            <Text style={mesa.leyenda}>🟢 Libre  🟠 Ocupada  🔵 Reservada</Text>
            <ScrollView>
              <View style={mesa.grid}>
                {mesas.map(me => {
                  const color = ESTADO_COLOR[me.estado] || '#999';
                  const selec = mesaSeleccionada?.id === me.id;
                  return (
                    <TouchableOpacity
                      key={me.id}
                      style={[mesa.btn, {borderColor: color}, selec && {backgroundColor: color}]}
                      onPress={() => { setMesaSeleccionada(me); setModalMesas(false); }}
                    >
                      <Text style={[mesa.num, selec && {color:'#fff'}]}>{me.numero}</Text>
                      <Text style={[mesa.cap, selec && {color:'#fff'}]}>{me.capacidad}p</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
};

// ── Estilos principales ──────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex:1, backgroundColor:'#fff', padding:16 },
  titulo: { fontSize:20, fontWeight:'bold', marginBottom:16, color:'#333' },
  label: { fontSize:13, fontWeight:'600', color:'#555', marginBottom:6, marginTop:10 },
  input: { borderWidth:1, borderColor:'#ddd', borderRadius:8, padding:12, fontSize:14, marginBottom:8 },
  dropdown: { borderWidth:1, borderColor:'#eee', borderRadius:8, marginBottom:10 },
  dropdownItem: { padding:12, borderBottomWidth:1, borderBottomColor:'#f5f5f5' },
  dropNombre: { fontSize:14, fontWeight:'600', color:'#333' },
  dropInfo: { fontSize:12, color:'#888', marginTop:2 },
  seleccionadoBox: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', backgroundColor:'#e8f5e9', borderRadius:8, padding:12, marginBottom:10 },
  seleccionadoNombre: { fontSize:14, fontWeight:'600', color:'#2e7d32' },
  cambiarLink: { fontSize:12, color:'#2196F3', fontWeight:'600' },
  selectorBtn: { borderWidth:1, borderColor:'#ddd', borderRadius:8, padding:14, marginBottom:10, backgroundColor:'#fafafa' },
  selectorBtnActivo: { borderColor:'#2196F3', backgroundColor:'#f0f7ff' },
  selectorText: { fontSize:14, color:'#aaa' },
  numRow: { flexDirection:'row', flexWrap:'wrap', gap:8, marginBottom:16 },
  numBtn: { width:44, height:44, borderRadius:22, borderWidth:1, borderColor:'#ddd', justifyContent:'center', alignItems:'center' },
  numBtnActivo: { backgroundColor:'#2196F3', borderColor:'#2196F3' },
  numText: { fontWeight:'600', color:'#666' },
  crearBtn: { backgroundColor:'#2196F3', padding:16, borderRadius:8, alignItems:'center', marginTop:8 },
  crearText: { color:'#fff', fontWeight:'bold', fontSize:16 },
});

// ── Estilos Modal base ───────────────────────────────────────────
const m = StyleSheet.create({
  overlay: { flex:1, backgroundColor:'rgba(0,0,0,0.5)', justifyContent:'flex-end' },
  sheet: { backgroundColor:'#fff', borderTopLeftRadius:20, borderTopRightRadius:20, padding:20 },
  header: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:16 },
  titulo: { fontSize:17, fontWeight:'bold', color:'#333' },
  cerrar: { fontSize:20, color:'#999', padding:4 },
  btnHoy: { marginTop:16, backgroundColor:'#f0f7ff', borderRadius:8, padding:12, alignItems:'center' },
  btnHoyText: { color:'#2196F3', fontWeight:'600' },
});

// ── Estilos Calendario ───────────────────────────────────────────
const cal = StyleSheet.create({
  navRow: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:12 },
  navBtn: { padding:8 },
  navArrow: { fontSize:18, color:'#2196F3', fontWeight:'bold' },
  mesLabel: { fontSize:16, fontWeight:'bold', color:'#333' },
  semanaRow: { flexDirection:'row', justifyContent:'space-around', marginBottom:4 },
  diaLabel: { width:36, textAlign:'center', fontSize:12, color:'#999', fontWeight:'600' },
  celda: { width:36, height:36, borderRadius:18, justifyContent:'center', alignItems:'center' },
  celdaHoy: { borderWidth:1.5, borderColor:'#2196F3' },
  celdaSelec: { backgroundColor:'#2196F3' },
  celdaPasado: { opacity:0.4 },
  diaNum: { fontSize:14, color:'#333' },
});

// ── Estilos Hora ─────────────────────────────────────────────────
const h = StyleSheet.create({
  grid: { flexDirection:'row', flexWrap:'wrap', gap:10, justifyContent:'center', paddingVertical:8 },
  btn: { paddingHorizontal:16, paddingVertical:10, borderRadius:8, borderWidth:1, borderColor:'#ddd', backgroundColor:'#fafafa' },
  btnActivo: { backgroundColor:'#2196F3', borderColor:'#2196F3' },
  text: { fontSize:15, color:'#555', fontWeight:'500' },
});

// ── Estilos Mesas ────────────────────────────────────────────────
const mesa = StyleSheet.create({
  leyenda: { fontSize:12, color:'#888', marginBottom:12, textAlign:'center' },
  grid: { flexDirection:'row', flexWrap:'wrap', gap:10, justifyContent:'center', paddingBottom:20 },
  btn: { width:60, height:60, borderRadius:10, borderWidth:2, justifyContent:'center', alignItems:'center', backgroundColor:'#fff' },
  num: { fontSize:16, fontWeight:'bold', color:'#333' },
  cap: { fontSize:11, color:'#888' },
});
