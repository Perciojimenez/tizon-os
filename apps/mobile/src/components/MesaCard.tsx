import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { Mesa } from '../store/salaStore';

/**
 * MesaCard — Tarjeta de mesa con el mismo formato visual que el sitio web.
 *
 * Anatomía (de arriba hacia abajo):
 *   1. Fila de sillas (una por plaza de capacidad, máx 8; doradas si activa).
 *   2. Contador de comensales (cápsula, esquina superior derecha).
 *   3. Círculo central #1a1a1a con "MESA" + número.
 *   4. Pastilla (pill) de estado con el color correspondiente.
 * Todo dentro de un rectángulo redondeado con degradado + borde según estado.
 */

type Estado = 'libre' | 'ocupada' | 'reservada' | 'por_salir';

const GOLD = '#D4A017';
const CIRCULO_BG = '#1a1a1a';

// Degradado de fondo + color de borde por estado
const ESTILO_ESTADO: Record<
  Estado,
  { grad: [string, string]; borde: string; pillBg: string; pillText: string; label: string }
> = {
  libre: {
    grad: ['rgba(16,185,129,0.20)', 'rgba(4,120,87,0.05)'],
    borde: 'rgba(16,185,129,0.50)',
    pillBg: '#10B981',
    pillText: '#000000',
    label: 'LIBRE',
  },
  ocupada: {
    grad: ['rgba(212,160,23,0.30)', 'rgba(138,106,16,0.10)'],
    borde: 'rgba(212,160,23,0.60)',
    pillBg: '#D4A017',
    pillText: '#000000',
    label: 'OCUPADA',
  },
  por_salir: {
    grad: ['rgba(198,40,40,0.25)', 'rgba(122,20,20,0.10)'],
    borde: 'rgba(198,40,40,0.60)',
    pillBg: '#C62828',
    pillText: '#FFFFFF',
    label: 'POR SALIR',
  },
  reservada: {
    grad: ['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.05)'],
    borde: 'rgba(255,255,255,0.25)',
    pillBg: 'rgba(255,255,255,0.20)',
    pillText: '#FFFFFF',
    label: 'RESERVADA',
  },
};

interface MesaCardProps {
  mesa: Mesa;
  onPress?: (mesa: Mesa) => void;
  /** Muestra el anillo dorado de selección. */
  seleccionada?: boolean;
  /** Si es false, la tarjeta es estática (solo consulta). */
  interactiva?: boolean;
}

export const MesaCard = ({
  mesa,
  onPress,
  seleccionada = false,
  interactiva = true,
}: MesaCardProps) => {
  const estado = (mesa.estado || 'libre') as Estado;
  const cfg = ESTILO_ESTADO[estado] || ESTILO_ESTADO.libre;

  // Las sillas se pintan doradas cuando la mesa está activa (ocupada o por salir).
  const activa = estado === 'ocupada' || estado === 'por_salir';
  const colorSilla = activa ? GOLD : 'rgba(255,255,255,0.30)';

  // Una silla por plaza, máximo 8.
  const numSillas = Math.min(Math.max(mesa.capacidad || 0, 0), 8);

  const contenido = (
    <LinearGradient
      colors={cfg.grad}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={[
        styles.card,
        { borderColor: cfg.borde },
        seleccionada && styles.cardSeleccionada,
      ]}
    >
      {/* Contador de comensales — esquina superior derecha */}
      <View style={styles.comensales}>
        <Feather name="users" size={11} color={GOLD} />
        <Text style={styles.comensalesTxt}>{mesa.capacidad}</Text>
      </View>

      {/* Fila de sillas */}
      <View style={styles.sillasRow}>
        {Array.from({ length: numSillas }).map((_, i) => (
          <MaterialCommunityIcons
            key={i}
            name="sofa-single"
            size={11}
            color={colorSilla}
            style={styles.silla}
          />
        ))}
      </View>

      {/* Círculo central */}
      <View style={styles.circulo}>
        <Text style={styles.circuloMesa}>MESA</Text>
        <Text style={styles.circuloNumero}>{mesa.numero}</Text>
      </View>

      {/* Pill de estado */}
      <View style={[styles.pill, { backgroundColor: cfg.pillBg }]}>
        <Text style={[styles.pillTxt, { color: cfg.pillText }]}>{cfg.label}</Text>
      </View>
    </LinearGradient>
  );

  if (!interactiva || !onPress) {
    return <View style={styles.wrapper}>{contenido}</View>;
  }

  return (
    <TouchableOpacity
      style={styles.wrapper}
      onPress={() => onPress(mesa)}
      activeOpacity={0.85}
    >
      {contenido}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '48%',
    marginBottom: 12,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    minHeight: 150,
  },
  cardSeleccionada: {
    borderColor: GOLD,
    borderWidth: 2,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
  },
  // Comensales
  comensales: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.50)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  comensalesTxt: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 3,
  },
  // Sillas
  sillasRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    flexWrap: 'nowrap',
  },
  silla: {
    marginHorizontal: 2,
  },
  // Círculo central
  circulo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: CIRCULO_BG,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circuloMesa: {
    color: 'rgba(255,255,255,0.40)',
    fontSize: 9,
    letterSpacing: 1,
    fontWeight: '600',
  },
  circuloNumero: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    lineHeight: 26,
  },
  // Pill de estado
  pill: {
    marginTop: 8,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  pillTxt: {
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
