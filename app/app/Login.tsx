import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import * as MediaLibrary from 'expo-media-library';
import { Camera } from 'expo-camera';

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const requestAllPermissions = async () => {
    setLoading(true);
    try {
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      if (cameraStatus !== 'granted') {
        Alert.alert('Permission required', 'Camera permission is needed to continue.');
        setLoading(false);
        return false;
      }

      const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
      if (mediaStatus !== 'granted') {
        Alert.alert('Permission required', 'Media permission is needed to continue.');
        setLoading(false);
        return false;
      }

      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      if (locationStatus !== 'granted') {
        Alert.alert('Permission required', 'Location permission is needed to continue.');
        setLoading(false);
        return false;
      }

      setLoading(false);
      return true;
    } catch (error) {
      console.error('Permission error:', error);
      Alert.alert('Error', 'Something went wrong while requesting permissions.');
      setLoading(false);
      return false;
    }
  };

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Validation', 'Please enter username and password.');
      return;
    }

    const granted = await requestAllPermissions();
    if (granted) {
      router.replace('/'); 
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top','bottom','left','right']}>
      <LinearGradient colors={['#3A0751', '#2E0740']} style={styles.container}>
        
        {/* 🔵 Background Circles */}
        <View style={styles.circle1} />
        <View style={styles.circle2} />
        <View style={styles.circle3} />

        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          placeholder="enter username"
          placeholderTextColor="#999"
          value={username}
          onChangeText={setUsername}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          placeholder="••••••••"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
        </TouchableOpacity>

        <Text style={styles.orText}>or</Text>

        <TouchableOpacity style={styles.googleBtn}>
          <View style={styles.googleContent}>
            <Image source={require('../assets/google.png')} style={styles.googleIcon} />
            <Text style={styles.googleText}>Continue with Google</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.signupContainer}>
          <Text style={styles.accountText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/Signup')}>
            <Text style={styles.signupText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#2E0740' },
  container: { flex: 1, padding: 20, justifyContent: 'center' },

  // 🔵 Background Circles
  circle1: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 110,
    backgroundColor: '#520075',
    top: 10,
    left: 10,
    opacity: 0.6,
  },
  circle2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 75,
    backgroundColor: '#7a00b3',
    bottom: 80,
    right: -30,
    opacity: 0.5,
  },
  circle3: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 50,
    backgroundColor: '#c000ff',
    bottom: 10,
    left: 40,
    opacity: 0.4,
  },

  label: { color: '#fff', marginBottom: 5, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#555', borderRadius: 5, padding: 10, color: '#fff', marginBottom: 15 },
  button: { backgroundColor: '#c000ff', padding: 15, borderRadius: 5, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  orText: { textAlign: 'center', color: '#aaa', marginVertical: 10 },
  googleBtn: { backgroundColor: '#3A0751', borderColor: '#c000ff', borderWidth: 1, padding: 15, borderRadius: 5, alignItems: 'center' },
  googleContent: { flexDirection: 'row', alignItems: 'center' },
  googleIcon: { width: 20, height: 20, marginRight: 10 },
  googleText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  signupContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  accountText: { color: '#aaa', fontSize: 14 },
  signupText: { color: '#c000ff', fontWeight: 'bold', fontSize: 14 },
});
