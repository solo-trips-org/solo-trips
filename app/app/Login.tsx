import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import * as MediaLibrary from 'expo-media-library';
import { Camera } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError } from 'axios';
import { Ionicons } from '@expo/vector-icons'; // 👁️ for password toggle

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true); // 👈 check token on startup
  const [showPassword, setShowPassword] = useState(false);

  // ✅ Permission request
  const requestAllPermissions = async (): Promise<boolean> => {
    try {
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      if (cameraStatus !== 'granted') {
        Alert.alert('Permission required', 'Camera permission is needed to continue.');
        return false;
      }

      const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
      if (mediaStatus !== 'granted') {
        Alert.alert('Permission required', 'Media permission is needed to continue.');
        return false;
      }

      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      if (locationStatus !== 'granted') {
        Alert.alert('Permission required', 'Location permission is needed to continue.');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Permission error:', error);
      Alert.alert('Error', 'Something went wrong while requesting permissions.');
      return false;
    }
  };

  // ✅ Auto skip login if token exists
  useEffect(() => {
    const checkToken = async () => {
      try {
        const savedToken = await AsyncStorage.getItem('authToken');
        if (savedToken) {
          console.log('Found saved token:', savedToken);
          router.replace('/'); // go home directly
        } else {
          setCheckingToken(false); // no token → show login page
        }
      } catch (e) {
        console.error('Token check error:', e);
        setCheckingToken(false);
      }
    };
    checkToken();
  }, []);

  // ✅ Login handler
  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Validation', 'Please enter username and password.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('https://trips-api.tselven.com/api/login', {
        username: username,
        password: password,
        role: 'user'
      });

      const { token, user } = response.data;

      // 🔑 Save token
      await AsyncStorage.setItem('authToken', token);

      console.log('JWT Token:', token);
      console.log('User Info:', user);

      Alert.alert('Success', `Welcome ${user.username}`);

      const granted = await requestAllPermissions();
      if (granted) {
        router.replace('/'); // go home
      }
    } catch (err) {
      const error = err as AxiosError<any>;
      console.error(error.response?.data || error.message);

      Alert.alert(
        'Login Failed',
        error.response?.data?.message || 'Invalid username or password'
      );
    } finally {
      setLoading(false);
    }
  };

  // ⏳ Show loading while checking token
  if (checkingToken) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient colors={['#3A0751', '#2E0740']} style={styles.container}>
          <ActivityIndicator size="large" color="#c000ff" />
        </LinearGradient>
      </SafeAreaView>
    );
  }

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
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.inputPassword}
            secureTextEntry={!showPassword}
            placeholder="••••••••"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? 'eye' : 'eye-off'}
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
        </View>

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
  
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  inputPassword: { flex: 1, paddingVertical: 10, color: '#fff' },

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
