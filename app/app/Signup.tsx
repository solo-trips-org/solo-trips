import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const handleSignup = () => {
    router.push('/Verify'); 
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 🔵 Background Circles */}
      <View style={styles.backgroundCircle1} />
      <View style={styles.backgroundCircle2} />
      <View style={styles.backgroundCircle3} />

      <View style={styles.container}>
        <Text style={styles.label}>Email address</Text>
        <TextInput
          style={styles.input}
          placeholder="abc@gmail.com"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          placeholder="enter username"
          placeholderTextColor="#999"
          value={username}
          onChangeText={setUsername}
        />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ flex: 1, marginRight: 5 }}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              placeholder="••••"
              value={password}
              onChangeText={setPassword}
            />
          </View>
          <View style={{ flex: 1, marginLeft: 5 }}>
            <Text style={styles.label}>Confirm</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              placeholder="••••"
              value={confirm}
              onChangeText={setConfirm}
            />
          </View>
        </View>

        {/* Signup Button */}
        <TouchableOpacity style={styles.button} onPress={handleSignup}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        <Text style={styles.orText}>or</Text>

        {/* Google Button with Icon */}
        <TouchableOpacity style={styles.googleBtn}>
          <View style={styles.googleContent}>
            <Image
              source={require('../assets/google.png')}
              style={styles.googleIcon}
            />
            <Text style={styles.googleText}>Continue with Google</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.termsText}>
          By continuing, you agree to our <Text style={styles.link}>Terms</Text> & <Text style={styles.link}>Privacy</Text>.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#2b0040',marginTop:40,marginBottom:40 },
  container: { flex: 1, padding: 20, justifyContent: 'center' },

  // 🔵 Modern Background Circles
  backgroundCircle1: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 125,
    backgroundColor: '#3a0751',
    top: 10,
    left: -50,
    opacity: 0.6,
  },
  backgroundCircle2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 75,
    backgroundColor: '#520075',
    bottom: 20,
    right: 30,
    opacity: 0.7,
  },
  backgroundCircle3: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 125,
    backgroundColor: '#3a0751',
    top: 600,
    left: 20,
    opacity: 0.6,
    bottom: 100, right: 30,
  },
  label: { color: '#fff', marginBottom: 5, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    marginBottom: 15,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  button: {
    backgroundColor: '#c000ff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  orText: { textAlign: 'center', color: '#aaa', marginVertical: 10 },
  googleBtn: {
    backgroundColor: '#3A0751',
    borderColor: '#c000ff',
    borderWidth: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  googleContent: { flexDirection: 'row', alignItems: 'center' },
  googleIcon: { width: 20, height: 20, marginRight: 10 },
  googleText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  termsText: { textAlign: 'center', marginTop: 10, color: '#aaa', fontSize: 12 },
  link: { color: '#4d9fff', textDecorationLine: 'underline' },
});
