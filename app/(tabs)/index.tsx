import { StyleSheet, Text, View } from 'react-native';

export default function GameScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iron Frontier</Text>
      <Text style={styles.subtitle}>Expo Unified Architecture</Text>
      <Text style={styles.text}>Phase 1 Setup Complete</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1917', // steam-900
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fde047', // brass-300
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#ca8a04', // brass-600
    marginBottom: 24,
  },
  text: {
    fontSize: 16,
    color: '#a8a29e', // steam-400
  },
});
