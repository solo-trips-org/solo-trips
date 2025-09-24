import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import SafeArea from '@/components/SafeArea';
interface Profile {
  username: string;
  firstName: string;
  email: string;
  profile: string;
  gender: string;
}

export default function ProfileScreen() {
  const router = useRouter();
  const [avatar, setAvatar] = useState<string>('https://cdn-icons-png.flaticon.com/512/149/149071.png');
  const [username, setUsername] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const [isEditing, setIsEditing] = useState(false);
  const [tempUsername, setTempUsername] = useState('');
  const [tempFirstName, setTempFirstName] = useState('');
  const [tempEmail, setTempEmail] = useState('');
  const [tempGender, setTempGender] = useState('');

  const API_URL = 'https://trips-api.tselven.com/api/profile';

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
          Alert.alert('Error', 'User not authenticated');
          setLoading(false);
          return;
        }

        const response = await fetch(API_URL, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errText = await response.text();
          console.log('❌ Fetch error response:', errText);
          throw new Error(`Error fetching profile: ${response.status}`);
        }

        const data = await response.json();
        const profile: Profile = data.user || data;

        setAvatar(profile.profile || 'https://cdn-icons-png.flaticon.com/512/149/149071.png');
        setUsername(profile.username || '');
        setFirstName(profile.firstName || '');
        setEmail(profile.email || '');
        setGender(profile.gender || '');
      } catch (error) {
        console.error('⚠️ Failed to fetch profile:', error);
        Alert.alert('Error', 'Unable to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Open modal with current values
  const handleEdit = () => {
    setTempUsername(username);
    setTempFirstName(firstName);
    setTempEmail(email);
    setTempGender(gender);
    setIsEditing(true);
  };

  // Save updated profile
  const handleSave = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      const body: Partial<Profile> = {
        username: tempUsername,
        firstName: tempFirstName, 
        email: tempEmail,
        gender: tempGender,
      };

      console.log("📤 Sending update body:", body);

      const res = await fetch(API_URL, {
        method: 'POST',   // ✅ backend expects POST
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      console.log("📡 Update response status:", res.status);

      if (!res.ok) {
        const errText = await res.text();
        console.log("❌ Update error response:", errText);
        Alert.alert('Error', 'Failed to update profile');
        return;
      }

      const updated = await res.json();
      console.log("✅ Updated profile response:", updated);

      const profile: Profile = updated.user || updated;

      // ✅ Update state with server-confirmed values
      setUsername(profile.username);
      setFirstName(profile.firstName);
      setEmail(profile.email);
      setGender(profile.gender);
      setAvatar(profile.profile || avatar);

      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error("⚠️ Update failed:", error);
      Alert.alert('Error', 'Something went wrong');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{ color: '#fff', marginTop: 10 }}>Loading profile…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeArea>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          {/* Avatar with edit icon */}
          <View style={styles.avatarContainer}>
            <Image source={{ uri: avatar }} style={styles.avatar} />
            <TouchableOpacity style={styles.editIcon} onPress={handleEdit}>
              <Ionicons name="create-outline" size={22} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Profile info */}
          <Text style={styles.name}>{firstName || username}</Text>

          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={18} color="#6a1b9a" />
            <Text style={styles.infoText}>{email}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={18} color="#6a1b9a" />
            <Text style={styles.infoText}>{username}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="male-female-outline" size={18} color="#6a1b9a" />
            <Text style={styles.infoText}>{gender}</Text>
          </View>

          {/* Settings Button */}
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => router.push('../Settings')}
          >
            <Ionicons name="settings-outline" size={18} color="#fff" />
            <Text style={styles.settingsText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={isEditing} animationType="slide" transparent>
        <View style={modernStyles.modalOverlay}>
          <View style={modernStyles.modalCard}>
            <Text style={modernStyles.modalTitle}>Edit Profile</Text>

            <TextInput
              style={modernStyles.input}
              value={tempFirstName}
              onChangeText={setTempFirstName}
              placeholder="First Name"
              placeholderTextColor="#888"
            />
            <TextInput
              style={modernStyles.input}
              value={tempUsername}
              onChangeText={setTempUsername}
              placeholder="Username"
              placeholderTextColor="#888"
            />
            <TextInput
              style={modernStyles.input}
              value={tempEmail}
              onChangeText={setTempEmail}
              placeholder="Email"
              placeholderTextColor="#888"
            />
            <TextInput
              style={modernStyles.input}
              value={tempGender}
              onChangeText={setTempGender}
              placeholder="Gender"
              placeholderTextColor="#888"
            />

            <View style={modernStyles.buttonRow}>
              <TouchableOpacity style={modernStyles.saveBtn} onPress={handleSave}>
                <Text style={modernStyles.btnText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={modernStyles.cancelBtn}
                onPress={() => setIsEditing(false)}
              >
                <Text style={modernStyles.btnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeArea>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor:"#4d004d", padding: 5, alignItems: 'center', flexGrow: 1, marginTop:0 },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 50,
    alignItems: 'center',
    shadowColor: '#9f27a1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
    marginTop :65 ,
  },
  avatarContainer: { position: 'relative', marginBottom: 15 },
  avatar: { width: 120, height: 120, borderRadius: 60 },
  editIcon: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#6a1b9a',
    padding: 6,
    borderRadius: 20,
    elevation: 4,
  },
  name: { fontSize: 24, fontWeight: 'bold', color: '#1f1e1e', marginBottom: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 5 },
  infoText: { fontSize: 16, color: '#444', marginLeft: 8 },
  settingsButton: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6a1b9a',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 12,
  },
  settingsText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
});

const modernStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 100,
  },
  modalCard: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#3d004f',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 15,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#6a1b9a',
    padding: 14,
    borderRadius: 15,
    marginRight: 5,
    alignItems: 'center',
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#999',
    padding: 14,
    borderRadius: 15,
    marginLeft: 5,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
