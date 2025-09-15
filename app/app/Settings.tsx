import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function Settings() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* <Text style={styles.title}>Settings</Text> */}

      <TouchableOpacity
        style={styles.button}
        onPress={() => Alert.alert('Profile Settings')}
      >
        <Text style={styles.buttonText}>Profile Settings</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => Alert.alert('Notifications Settings')}
      >
        <Text style={styles.buttonText}>Notifications</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => Alert.alert('About App')}
      >
        <Text style={styles.buttonText}>About App</Text>
      </TouchableOpacity>

  
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#2a003f', // matches ProfileScreen dark theme
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    padding: 15,
    backgroundColor: '#d1a29c', // soft accent color
    borderRadius: 12,
    marginVertical: 10,
    alignItems: 'center',
    shadowColor: '#000', // subtle shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // for Android shadow
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
