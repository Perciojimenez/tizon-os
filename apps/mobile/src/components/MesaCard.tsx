import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Mesa } from '../store/salaStore';

interface MesaCardProps {
  mesa: Mesa;
  onPress?: (mesa: Mesa) => void;
}

export const MesaCard = ({ mesa, onPress }: MesaCardProps) => {
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'libre':
        return '#4CAF50'; // Verde
      case 'reservada':
        return '#2196F3'; // Azul
      case 'ocupada':
        return '#FF9800'; // Naranja
      case 'por_salir':
        return '#F44336'; // Rojo
      default:
        return '#9E9E9E'; // Gris
    }
  };

  const getEstadoLabel = (estado: string) => {
    const labels: { [key: string]: string } = {
      libre: 'Libre',
      reservada: 'Reservada',
      ocupada: 'Ocupada',
      por_salir: 'Por salir',
    };
    return labels[estado] || estado;
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: getEstadoColor(mesa.estado) },
      ]}
      onPress={() => onPress?.(mesa)}
      activeOpacity={0.7}
    >
      <Text style={styles.numero}>Mesa {mesa.numero}</Text>
      <Text style={styles.capacidad}>{mesa.capacidad} personas</Text>
      <Text style={styles.estado}>{getEstadoLabel(mesa.estado)}</Text>
      <Text style={styles.zona}>{mesa.zona}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 12,
    margin: 8,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numero: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  capacidad: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  estado: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  zona: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
    fontStyle: 'italic',
  },
});
