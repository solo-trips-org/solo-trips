import { View, Text, StyleSheet } from 'react-native';

export default function PlannerScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}> Planner Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 20, fontWeight: 'bold' },
});
