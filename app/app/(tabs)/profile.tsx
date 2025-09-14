import { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen() {
  const [avatar, setAvatar] = useState('https://cdn-icons-png.flaticon.com/512/149/149071.png'); // default user icon
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [editing, setEditing] = useState(false); // toggle edit mode

  // Pick image from gallery
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert('Permission needed to access gallery!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const saveProfile = () => {
    if (!name || !email || !location) {
      alert('Please fill all fields!');
      return;
    }
    setEditing(false);
    alert('Profile updated!');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Profile Picture */}
        <TouchableOpacity onPress={pickImage}>
          <Image source={{ uri: avatar }} style={styles.avatar} />
        </TouchableOpacity>

        {/* Info or Edit Form */}
        {editing ? (
          <View style={styles.infoCard}>
            <TextInput
              style={styles.input}
              placeholder="Your Name"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              placeholder="Location"
              value={location}
              onChangeText={setLocation}
            />

            <TouchableOpacity style={styles.button} onPress={saveProfile}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.logout]} onPress={() => setEditing(false)}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.infoCard}>
            <Text style={styles.name}>{name || 'Your Name'}</Text>
            <Text style={styles.email}>{email || 'your.email@example.com'}</Text>
            <Text style={styles.location}>{location || '📍 Your Location'}</Text>
            <Text style={styles.joined}>Joined: Jan 2024</Text>

            <TouchableOpacity style={styles.button} onPress={() => setEditing(true)}>
              <Text style={styles.buttonText}>{name ? 'Edit Profile' : 'Add Profile'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Logout Button */}
        {!editing && (
          <TouchableOpacity style={[styles.button, styles.logout]}>
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#e0f2f1' },
  container: { alignItems: 'center', padding: 20 },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginTop: 40,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 6,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    width: '90%',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 4,
    marginBottom: 30,
  },
  name: { fontSize: 24, fontWeight: 'bold', marginBottom: 6 },
  email: { fontSize: 16, color: '#666', marginBottom: 4 },
  location: { fontSize: 16, color: '#444', marginBottom: 4 },
  joined: { fontSize: 14, color: '#777', marginTop: 4 },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#26a69a',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginBottom: 15,
    alignItems: 'center',
    width: '70%',
  },
  logout: { backgroundColor: '#ef5350' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
