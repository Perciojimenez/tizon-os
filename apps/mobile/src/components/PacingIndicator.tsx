import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface PacingIndicatorProps {
  estado?: string;
  personas?: number;
  capacidad?: number;
}

export const PacingIndicator = ({ estado = 'DESCONOCIDO', personas = 0, capacidad = 30 }: PacingIndicatorProps) => {
  const getColor = (estado: string) => {
    switch (estado) {
      case 'VERDE':
        return '#4CAF50';
      case 'AMARILLO':
        return '#FFC107';
      case 'ROJO':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.semaforo, { backgroundColor: getColor(estado) }]} />
      <View style={styles.info}>
        <Text style={styles.titulo}>Carga de Cocina</Text>
        <Text style={styles.estado}>{estado}</Text>
        <Text style={styles.detalle}>{personas}/{capacidad} personas</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  semaforo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  titulo: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  estado: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 2,
  },
  detalle: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
});
