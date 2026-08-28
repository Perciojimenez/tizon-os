import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export interface MenuItem {
  label: string;
  descripcion?: string;
  icon: string;
  target: string;
}

interface Props {
  items: MenuItem[];
}

/**
 * Pantalla de menú reutilizable con botones grandes.
 * Se usa como "hub" para los tabs Servicio, Clientes y Gestión.
 * Navega al screen indicado en `target` dentro del mismo Stack.
 */
export const MasScreen = ({ items }: Props) => {
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();
  const esTablet = width > 600;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {items.map((item) => (
        <TouchableOpacity
          key={item.target}
          style={styles.card}
          activeOpacity={0.7}
          onPress={() => navigation.navigate(item.target)}
        >
          <Text style={[styles.icon, { fontSize: esTablet ? 44 : 36 }]}>{item.icon}</Text>
          <View style={styles.textWrap}>
            <Text style={[styles.label, { fontSize: esTablet ? 20 : 17 }]}>{item.label}</Text>
            {item.descripcion ? (
              <Text style={styles.descripcion}>{item.descripcion}</Text>
            ) : null}
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a1a' },
  content: { padding: 16 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 18,
    marginBottom: 14,
  },
  icon: { marginRight: 16 },
  textWrap: { flex: 1 },
  label: { color: '#fff', fontWeight: 'bold' },
  descripcion: { color: '#999', fontSize: 13, marginTop: 2 },
  chevron: { color: '#666', fontSize: 28, marginLeft: 8 },
});
