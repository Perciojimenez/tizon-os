import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

/**
 * OfflineBanner — Barra de aviso global.
 *
 *  - Rojo   → sin conexión (modo offline activo).
 *  - Ámbar  → sincronizando cambios tras recuperar la conexión.
 *  - Oculto → todo en línea y sin sincronización en curso.
 *
 * Se coloca una sola vez (encima del navegador) para que aparezca en
 * todas las pantallas de la app.
 */
export function OfflineBanner() {
  const { isConnected, isSyncing, lastSync, pendientes } = useNetworkStatus();
  const insets = useSafeAreaInsets();

  // Todo normal: no mostramos nada.
  if (isConnected && !isSyncing) return null;

  return (
    <View
      style={[
        styles.banner,
        { paddingTop: 8 + insets.top },
        isSyncing ? styles.syncing : styles.offline,
      ]}
    >
      <Text style={styles.text}>
        {isSyncing
          ? '🔄 Sincronizando cambios...'
          : '📵 Sin conexión — Modo Offline activo'}
      </Text>
      {!isConnected && pendientes > 0 && (
        <Text style={styles.subtext}>
          {pendientes} cambio{pendientes === 1 ? '' : 's'} pendiente
          {pendientes === 1 ? '' : 's'} de enviar
        </Text>
      )}
      {isConnected && isSyncing && lastSync && (
        <Text style={styles.subtext}>Última sincronización: {lastSync}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  offline: { backgroundColor: '#ef4444' },
  syncing: { backgroundColor: '#f59e0b' },
  text: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  subtext: { color: '#fff', fontSize: 11, marginTop: 2 },
});
