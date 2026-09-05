import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, ScrollView, Modal,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useClientes } from '../hooks/useClientes';
import { tizonAPI } from '../services/api';

interface Mesa {
  id: string;
  numero: number;
  capacidad: number;
  estado: string;
}

// ── Paleta (idéntica al sitio web) ───────────────────────────────
const BG = '#1a1a1a';
const CARD = '#242424';
const CARD_BORDER = 'rgba(255,255,255,0.08)';
const INPUT_BG = '#2a2a2a';
const INPUT_BORDER = 'rgba(255,255,255,0.10)';
const TEXT = '#FFFFFF';
const MUTED = '#9CA3AF';
const GOLD = '#D4A017';
const RED = '#C62828';

// ── Helpers de fecha ────────────────────────────────────────────
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DIAS_SEMANA = ['D','L','M','M','J','V','S'];

const hoyStr = () => new Date().toISOString().split('T')[0];

const formatFechaLabel = (fecha: string) => {
  if (!fecha) return '';
  const [y, m, d] = fecha.split('-').map(Number);
  return `${d} de ${MESES[m - 1]} ${y}`;
};

// ── Horarios disponibles (grid del sitio web) ───────────────────
const HORAS = ['12:00', '13:00', '14:00', '19:00', '20:00', '21:00', '22:00'];

// ════════════════════════════════════════════════════════════════
export const NuevaReservaScreen = ({ navigation }: any) => {

  // ── Estado (misma lógica de negocio) ─────────────────────────
  const { buscar, crear } = useClientes();

  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [loadingMesas, setLoadingMesas] = useState(true);

  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [comentarios, setComentarios] = useState('');
  const [canal, setCanal] = useState<'sms' | 'whatsapp'>('sms');

  const [fecha, setFecha] = useState(hoyStr());
  const [hora, setHora] = useState('20:00');
  const [comensales, setComensales] = useState(2);
  const [guardando, setGuardando] = useState(false);

  // Modal calendario
  const [modalCalendario, setModalCalendario] = useState(false);
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

  // ── Buscar una mesa libre que quepa a los comensales ─────────
  const buscarMesaDisponible = (): Mesa | null => {
    const libres = mesas.filter((m) => m.estado === 'libre');
    // Preferir la mesa libre más pequeña que quepa a los comensales.
    const aptas = libres
      .filter((m) => m.capacidad >= comensales)
      .sort((a, b) => a.capacidad - b.capacidad);
    if (aptas.length > 0) return aptas[0];
    // Si ninguna cumple la capacidad exacta, usar cualquier mesa libre.
    if (libres.length > 0) return libres.sort((a, b) => b.capacidad - a.capacidad)[0];
    return null;
  };

  // ── Encontrar o crear el cliente por teléfono ────────────────
  const obtenerOCrearCliente = async (): Promise<string> => {
    const tel = telefono.trim();
    // Buscar clientes existentes que coincidan con el teléfono.
    try {
      const encontrados = await tizonAPI.buscarClientes(tel);
      if (Array.isArray(encontrados) && encontrados.length > 0) {
        const soloDigitos = (s: string) => (s || '').replace(/\D/g, '');
        const match = encontrados.find(
          (c: any) => soloDigitos(c.telefono) === soloDigitos(tel),
        );
        if (match) return match.id;
      }
    } catch {
      // Si falla la búsqueda, continuamos e intentamos crear.
    }
    // Crear un cliente nuevo con nombre + teléfono.
    const nuevo = await crear(nombre.trim(), tel);
    if (!nuevo?.id) throw new Error('No se pudo registrar el cliente');
    return nuevo.id;
  };

  // ── Crear reserva ────────────────────────────────────────────
  const crearReserva = async () => {
    if (!nombre.trim())   { Alert.alert('Falta el nombre',   'Escribe el nombre completo');       return; }
    if (!telefono.trim()) { Alert.alert('Falta el teléfono', 'Escribe el teléfono móvil');        return; }
    if (!fecha)           { Alert.alert('Falta la fecha',    'Selecciona una fecha');             return; }
    if (!hora)            { Alert.alert('Falta la hora',     'Selecciona una hora');              return; }

    const mesa = buscarMesaDisponible();
    if (!mesa) {
      Alert.alert('Sin mesas disponibles', 'No hay mesas libres en este momento. Intenta con otro horario.');
      return;
    }

    setGuardando(true);
    try {
      const clienteId = await obtenerOCrearCliente();
      const reserva = await tizonAPI.crearReserva(
        clienteId,
        mesa.id,
        fecha,
        hora,
        comensales,
      );
      Alert.alert(
        '✅ Reserva creada',
        `Mesa ${mesa.numero} · ${comensales} personas\nCódigo: ${reserva.codigo_unico}`,
        [{ text: 'OK', onPress: () => navigation?.goBack() }],
      );
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error desconocido';
      Alert.alert('No se pudo crear la reserva', mensaje);
    } finally {
      setGuardando(false);
    }
  };

  // ── Calendario ───────────────────────────────────────────────
  const diasEnMes = (mth: number, a: number) => new Date(a, mth + 1, 0).getDate();
  const primerDia = (mth: number, a: number) => new Date(a, mth, 1).getDay();

  const seleccionarDia = (dia: number) => {
    const mm = String(mesVista + 1).padStart(2, '0');
    const dd = String(dia).padStart(2, '0');
    setFecha(`${anioVista}-${mm}-${dd}`);
    setModalCalendario(false);
  };

  const cambiarMes = (delta: number) => {
    let mth = mesVista + delta;
    let a = anioVista;
    if (mth < 0)  { mth = 11; a--; }
    if (mth > 11) { mth = 0;  a++; }
    setMesVista(mth);
    setAnioVista(a);
  };

  const renderCalendario = () => {
    const total = diasEnMes(mesVista, anioVista);
    const inicio = primerDia(mesVista, anioVista);
    const hoyISO = hoyStr();
    const celdas: (number | null)[] = [...Array(inicio).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)];
    while (celdas.length % 7 !== 0) celdas.push(null);

    return (
      <View>
        <View style={cal.navRow}>
          <TouchableOpacity onPress={() => cambiarMes(-1)} style={cal.navBtn}><Text style={cal.navArrow}>◀</Text></TouchableOpacity>
          <Text style={cal.mesLabel}>{MESES[mesVista]} {anioVista}</Text>
          <TouchableOpacity onPress={() => cambiarMes(1)} style={cal.navBtn}><Text style={cal.navArrow}>▶</Text></TouchableOpacity>
        </View>
        <View style={cal.semanaRow}>
          {DIAS_SEMANA.map((d, i) => <Text key={i} style={cal.diaLabel}>{d}</Text>)}
        </View>
        {Array.from({ length: celdas.length / 7 }, (_, fila) => (
          <View key={fila} style={cal.semanaRow}>
            {celdas.slice(fila * 7, fila * 7 + 7).map((dia, col) => {
              if (!dia) return <View key={col} style={cal.celda} />;
              const mm = String(mesVista + 1).padStart(2, '0');
              const dd = String(dia).padStart(2, '0');
              const iso = `${anioVista}-${mm}-${dd}`;
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
                  <Text style={[cal.diaNum, selec && { color: '#000' }, pasado && { color: '#555' }]}>{dia}</Text>
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
    <ScrollView style={s.container} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">

      {/* ── ENCABEZADO ── */}
      <Text style={s.etiqueta}>RESERVA EN 1 MINUTO</Text>
      <Text style={s.tituloGrande}>Reserva tu Mesa</Text>
      <Text style={s.subtitulo}>
        Elige día, hora y número de personas. Confirmamos al instante con un código a tu teléfono.
      </Text>
      <View style={s.pasosRow}>
        <View style={[s.paso, s.pasoActivo]} />
        <View style={s.paso} />
        <View style={s.paso} />
      </View>

      {/* ── TARJETA CENTRAL ── */}
      <View style={s.card}>

        {/* Sección 1: Personas */}
        <View style={s.labelRow}>
          <Feather name="user" size={15} color={GOLD} />
          <Text style={s.label}>¿Cuántas personas?</Text>
        </View>
        <View style={s.contadorRow}>
          <TouchableOpacity
            style={s.circBtn}
            onPress={() => setComensales((n) => Math.max(1, n - 1))}
          >
            <Text style={s.circBtnText}>−</Text>
          </TouchableOpacity>
          <Text style={s.contadorNum}>{comensales}</Text>
          <TouchableOpacity
            style={s.circBtn}
            onPress={() => setComensales((n) => Math.min(20, n + 1))}
          >
            <Text style={s.circBtnText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Sección 2: Fecha */}
        <View style={s.labelRow}>
          <Feather name="calendar" size={15} color={GOLD} />
          <Text style={s.label}>Fecha *</Text>
        </View>
        <TouchableOpacity style={s.inputBox} onPress={() => setModalCalendario(true)}>
          <Text style={s.inputText}>{formatFechaLabel(fecha)}</Text>
          <Feather name="chevron-down" size={18} color={MUTED} />
        </TouchableOpacity>

        {/* Sección 3: Hora */}
        <View style={s.labelRow}>
          <Feather name="clock" size={15} color={GOLD} />
          <Text style={s.label}>Hora *</Text>
        </View>
        <View style={s.horasGrid}>
          {HORAS.map((hh) => {
            const activo = hora === hh;
            return (
              <TouchableOpacity
                key={hh}
                style={[s.horaBtn, activo && s.horaBtnActivo]}
                onPress={() => setHora(hh)}
              >
                <Text style={[s.horaText, activo && s.horaTextActivo]}>{hh}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Sección 4: Nombre */}
        <View style={s.labelRow}>
          <Feather name="user" size={15} color={GOLD} />
          <Text style={s.label}>Nombre completo *</Text>
        </View>
        <TextInput
          style={s.textInput}
          placeholder="Tu nombre"
          placeholderTextColor={MUTED}
          value={nombre}
          onChangeText={setNombre}
        />

        {/* Sección 5: Teléfono */}
        <View style={s.labelRow}>
          <Feather name="phone" size={15} color={GOLD} />
          <Text style={s.label}>Teléfono móvil *</Text>
        </View>
        <TextInput
          style={s.textInput}
          placeholder="Ej: 809 123 4567"
          placeholderTextColor={MUTED}
          keyboardType="phone-pad"
          value={telefono}
          onChangeText={setTelefono}
        />
        <Text style={s.ayuda}>Te enviaremos un código para confirmar tu reserva.</Text>

        {/* Sección 6: Canal */}
        <View style={s.labelRow}>
          <Feather name="message-square" size={15} color={GOLD} />
          <Text style={s.label}>¿Cómo enviamos el código?</Text>
        </View>
        <View style={s.canalRow}>
          <TouchableOpacity
            style={[s.canalBtn, canal === 'sms' && s.canalBtnActivo]}
            onPress={() => setCanal('sms')}
          >
            <Text style={[s.canalText, canal === 'sms' && s.canalTextActivo]}>📱 SMS</Text>
          </TouchableOpacity>
          <View style={s.canalWrap}>
            <View style={s.badge}><Text style={s.badgeText}>pronto</Text></View>
            <TouchableOpacity style={[s.canalBtn, s.canalBtnDisabled]} disabled>
              <Text style={s.canalText}>💬 WhatsApp</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sección 7: Comentarios */}
        <View style={s.labelRow}>
          <Feather name="message-circle" size={15} color={GOLD} />
          <Text style={s.label}>Comentarios (opcional)</Text>
        </View>
        <TextInput
          style={[s.textInput, s.textArea]}
          placeholder="Alergias, ocasión especial, silla para bebé..."
          placeholderTextColor={MUTED}
          value={comentarios}
          onChangeText={setComentarios}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        {/* Botón principal */}
        <TouchableOpacity
          style={[s.cta, (guardando || loadingMesas) && { opacity: 0.6 }]}
          onPress={crearReserva}
          disabled={guardando || loadingMesas}
        >
          {guardando
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.ctaText}>Buscar Mesa y Continuar</Text>}
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />

      {/* ══════════════════ MODAL CALENDARIO ══════════════════ */}
      <Modal visible={modalCalendario} transparent animationType="slide">
        <View style={mod.overlay}>
          <View style={mod.sheet}>
            <View style={mod.header}>
              <Text style={mod.titulo}>Seleccionar Fecha</Text>
              <TouchableOpacity onPress={() => setModalCalendario(false)}><Text style={mod.cerrar}>✕</Text></TouchableOpacity>
            </View>
            {renderCalendario()}
            <TouchableOpacity style={mod.btnHoy} onPress={() => { setFecha(hoyStr()); setModalCalendario(false); }}>
              <Text style={mod.btnHoyText}>Ir a Hoy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
};

// ── Estilos principales ──────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  content: { padding: 16 },

  // Encabezado
  etiqueta: { color: GOLD, fontSize: 12, fontWeight: '700', letterSpacing: 2, textAlign: 'center', marginTop: 8 },
  tituloGrande: { color: TEXT, fontSize: 30, fontWeight: 'bold', textAlign: 'center', marginTop: 6, fontFamily: undefined },
  subtitulo: { color: MUTED, fontSize: 13, textAlign: 'center', marginTop: 8, lineHeight: 19, paddingHorizontal: 10 },
  pasosRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 14, marginBottom: 18 },
  paso: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 5 },
  pasoActivo: { backgroundColor: GOLD, width: 22 },

  // Tarjeta
  card: {
    backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: CARD_BORDER,
    padding: 20,
  },

  labelRow: { flexDirection: 'row', alignItems: 'center', marginTop: 18, marginBottom: 8 },
  label: { color: TEXT, fontSize: 14, fontWeight: '600', marginLeft: 8 },

  // Contador
  contadorRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  circBtn: {
    width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, borderColor: GOLD,
    justifyContent: 'center', alignItems: 'center',
  },
  circBtnText: { color: GOLD, fontSize: 24, fontWeight: 'bold', lineHeight: 26 },
  contadorNum: { color: TEXT, fontSize: 32, fontWeight: 'bold', marginHorizontal: 36, minWidth: 40, textAlign: 'center' },

  // Inputs
  inputBox: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: INPUT_BG, borderRadius: 8, borderWidth: 1, borderColor: INPUT_BORDER,
    paddingHorizontal: 14, paddingVertical: 13,
  },
  inputText: { color: TEXT, fontSize: 15 },
  textInput: {
    backgroundColor: INPUT_BG, borderRadius: 8, borderWidth: 1, borderColor: INPUT_BORDER,
    paddingHorizontal: 14, paddingVertical: 12, color: TEXT, fontSize: 15,
  },
  textArea: { height: 96, paddingTop: 12 },
  ayuda: { color: MUTED, fontSize: 12, marginTop: 6 },

  // Horas
  horasGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
  horaBtn: {
    width: '22%', margin: '1.5%', paddingVertical: 12, borderRadius: 8,
    backgroundColor: INPUT_BG, borderWidth: 1, borderColor: INPUT_BORDER, alignItems: 'center',
  },
  horaBtnActivo: { backgroundColor: GOLD, borderColor: GOLD },
  horaText: { color: TEXT, fontSize: 14, fontWeight: '600' },
  horaTextActivo: { color: '#000' },

  // Canal
  canalRow: { flexDirection: 'row', gap: 12 },
  canalWrap: { flex: 1, position: 'relative' },
  canalBtn: {
    flex: 1, paddingVertical: 13, borderRadius: 8, alignItems: 'center',
    backgroundColor: INPUT_BG, borderWidth: 1, borderColor: INPUT_BORDER,
  },
  canalBtnActivo: { backgroundColor: GOLD, borderColor: GOLD },
  canalBtnDisabled: { opacity: 0.5 },
  canalText: { color: TEXT, fontSize: 14, fontWeight: '600' },
  canalTextActivo: { color: '#000' },
  badge: {
    position: 'absolute', top: -8, right: 6, zIndex: 2,
    backgroundColor: GOLD, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2,
  },
  badgeText: { color: '#000', fontSize: 10, fontWeight: '700' },

  // CTA
  cta: {
    backgroundColor: RED, borderRadius: 10, paddingVertical: 16,
    alignItems: 'center', marginTop: 24,
  },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

// ── Estilos Modal base ───────────────────────────────────────────
const mod = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: CARD, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  titulo: { fontSize: 17, fontWeight: 'bold', color: TEXT },
  cerrar: { fontSize: 20, color: MUTED, padding: 4 },
  btnHoy: { marginTop: 16, backgroundColor: 'rgba(212,160,23,0.15)', borderRadius: 8, padding: 12, alignItems: 'center' },
  btnHoyText: { color: GOLD, fontWeight: '600' },
});

// ── Estilos Calendario ───────────────────────────────────────────
const cal = StyleSheet.create({
  navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  navBtn: { padding: 8 },
  navArrow: { fontSize: 18, color: GOLD, fontWeight: 'bold' },
  mesLabel: { fontSize: 16, fontWeight: 'bold', color: TEXT },
  semanaRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 4 },
  diaLabel: { width: 36, textAlign: 'center', fontSize: 12, color: MUTED, fontWeight: '600' },
  celda: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  celdaHoy: { borderWidth: 1.5, borderColor: GOLD },
  celdaSelec: { backgroundColor: GOLD },
  celdaPasado: { opacity: 0.4 },
  diaNum: { fontSize: 14, color: TEXT },
});
