import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet, Text, ActivityIndicator, FlatList } from 'react-native';
import { MesaCard } from '../components/MesaCard';
import { PacingIndicator } from '../components/PacingIndicator';
import { useMesas } from '../hooks/useMesas';
import { useSalaStore } from '../store/salaStore';

export const PlanoScreen = ({ navigation }: any) => {
  const { mesas, loading } = useMesas();
  const { pacingEstado } = useSalaStore();

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Pacing - Motor de Cocina</Text>
      <PacingIndicator 
        estado={pacingEstado?.estado}
        personas={pacingEstado?.personas}
        capacidad={pacingEstado?.capacidad}
      />

      <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Plano de Mesas</Text>
      
      <View style={styles.mesasGrid}>
        {mesas.map((mesa) => (
          <MesaCard 
            key={mesa.id} 
            mesa={mesa}
            onPress={(m) => navigation?.navigate('MesaDetail', { mesaId: m.id })}
          />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 12,
    color: '#333',
  },
  mesasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
