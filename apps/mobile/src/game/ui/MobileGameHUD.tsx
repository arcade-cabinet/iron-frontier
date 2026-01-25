import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMobileGameStore } from '../store/mobileGameStore';

export const MobileGameHUD = () => {
  const insets = useSafeAreaInsets();
  const playerStats = useMobileGameStore((state) => state.playerStats);
  const openPanel = useMobileGameStore((state) => state.openPanel);

  if (!playerStats) return null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        {/* Health */}
        <View style={styles.statBox}>
          <Text style={styles.label}>HP</Text>
          <View style={styles.barContainer}>
            <View 
              style={[
                styles.healthBar, 
                { width: `${(playerStats.health / playerStats.maxHealth) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.value}>{playerStats.health}/{playerStats.maxHealth}</Text>
        </View>

        {/* Gold */}
        <View style={styles.statBox}>
          <Text style={styles.goldLabel}>$</Text>
          <Text style={styles.goldValue}>{playerStats.gold}</Text>
        </View>
      </View>

      {/* Bottom Bar (Buttons) */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <TouchableOpacity 
          style={styles.menuButton} 
          onPress={() => openPanel('character')}
        >
          <Text style={styles.buttonText}>Character</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuButton} 
          onPress={() => openPanel('inventory')}
        >
          <Text style={styles.buttonText}>Inventory</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuButton} 
          onPress={() => openPanel('menu')}
        >
          <Text style={styles.buttonText}>Menu</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    pointerEvents: 'box-none', // Allow clicks through to 3D scene
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    pointerEvents: 'box-none',
  },
  statBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#5c4d3c',
  },
  label: {
    color: '#d4a574',
    fontWeight: 'bold',
    fontSize: 14,
  },
  value: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  barContainer: {
    width: 100,
    height: 10,
    backgroundColor: '#333',
    borderRadius: 5,
    overflow: 'hidden',
  },
  healthBar: {
    height: '100%',
    backgroundColor: '#e74c3c',
  },
  goldLabel: {
    color: '#f1c40f',
    fontWeight: 'bold',
    fontSize: 16,
  },
  goldValue: {
    color: '#f1c40f',
    fontSize: 14,
    fontWeight: 'bold',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 16,
    pointerEvents: 'auto',
  },
  menuButton: {
    backgroundColor: '#5c4d3c',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#8b7355',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 3,
  },
  buttonText: {
    color: '#e0d0b0',
    fontWeight: '600',
    fontSize: 14,
  },
});
