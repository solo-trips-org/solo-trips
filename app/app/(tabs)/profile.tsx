import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

interface Profile {
  avatar: string;
  name: string;
  email: string;
  bio: string;
  phone: string;
  dob: string;
  gender: string;
  interest: string;
}

export default function ProfileScreen() {
  const router = useRouter();

  const [avatar, setAvatar] = useState<string>('https://cdn-icons-png.flaticon.com/512/149/149071.png');
  const [name, setName] = useState<string>('PriyoThiru');
  const [email, setEmail] = useState<string>('priyot@gmail.com');
  const [bio, setBio] = useState<string>('Traveler | Explorer | Foodie');
  const [phone, setPhone] = useState<string>('');
  const [dob, setDob] = useState<Date | null>(null);
  const [gender, setGender] = useState<string>('');
  const [interest, setInterest] = useState<string>('');

  const [editMode, setEditMode] = useState<boolean>(false);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

  // Load profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const saved = await AsyncStorage.getItem('profile');
        if (saved) {
          const profile: Profile = JSON.parse(saved);
          setAvatar(profile.avatar || avatar);
          setName(profile.name || '');
          setEmail(profile.email || '');
          setBio(profile.bio || '');
          setPhone(profile.phone || '');
          setDob(profile.dob ? new Date(profile.dob) : null);
          setGender(profile.gender || '');
          setInterest(profile.interest || '');
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      }
    };
    loadProfile();
  }, []);

  // Pick avatar image
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert('Permission needed to access gallery!');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  // Save profile
  const saveProfile = async () => {
    try {
      const profile: Profile = {
        avatar,
        name,
        email,
        bio,
        phone,
        dob: dob ? dob.toISOString() : '',
        gender,
        interest,
      };
      await AsyncStorage.setItem('profile', JSON.stringify(profile));
      Alert.alert('Success', 'Profile saved!');
      setEditMode(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile.');
      console.error(error);
    }
  };

  // Delete profile
  const deleteAccount = async () => {
    Alert.alert('Delete Account', 'Are you sure you want to delete your account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('profile');
          setAvatar('https://cdn-icons-png.flaticon.com/512/149/149071.png');
          setName('');
          setEmail('');
          setBio('');
          setPhone('');
          setDob(null);
          setGender('');
          setInterest('');
          Alert.alert('Deleted', 'Your account has been removed.');
          router.push('/Login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Card Container */}
        <View style={styles.card}>
          {/* Avatar */}
          <TouchableOpacity onPress={editMode ? pickImage : undefined}>
            <Image source={{ uri: avatar }} style={styles.avatar} />
          </TouchableOpacity>

          {/* Name / Email / Bio */}
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.email}>{email}</Text>
          <Text style={styles.bio}>{bio}</Text>

          {/* Editable fields */}
          {editMode && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Phone number"
                placeholderTextColor="#aaa"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />

              <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
                <Text style={{ color: dob ? '#fff' : '#aaa' }}>
                  {dob ? dob.toDateString() : 'Select Date of Birth'}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={dob || new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
                    setShowDatePicker(Platform.OS === 'ios');
                    if (selectedDate) setDob(selectedDate);
                  }}
                />
              )}

              <View style={styles.pickerContainer}>
                <Picker selectedValue={gender} onValueChange={(val) => setGender(val)} style={styles.picker}>
                  <Picker.Item label="Select Gender" value="" />
                  <Picker.Item label="Male" value="male" />
                  <Picker.Item label="Female" value="female" />
                  <Picker.Item label="Other" value="other" />
                </Picker>
              </View>

              <View style={styles.pickerContainer}>
                <Picker selectedValue={interest} onValueChange={(val) => setInterest(val)} style={styles.picker}>
                  <Picker.Item label="Select Interest" value="" />
                  <Picker.Item label="Adventure" value="adventure" />
                  <Picker.Item label="Culture" value="culture" />
                  <Picker.Item label="Food" value="food" />
                  <Picker.Item label="Nature" value="nature" />
                </Picker>
              </View>
            </>
          )}

          {/* Buttons Row */}
          <View style={styles.buttonRow}>
            {/* Edit / Save */}
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: editMode ? '#d1a29c' : '#555' }]}
              onPress={editMode ? saveProfile : () => setEditMode(true)}
            >
              <Ionicons
                name={editMode ? 'save' : 'create'}
                size={18}
                color="#fff"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.actionText}>{editMode ? 'Save' : 'Edit'}</Text>
            </TouchableOpacity>

            {/* Settings */}
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#6a1b9a' }]}
              onPress={() => router.push('../Settings')}
            >
              <Ionicons name="settings" size={18} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.actionText}>Settings</Text>
            </TouchableOpacity>

            {/* Delete */}
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#ef5350' }]}
              onPress={deleteAccount}
            >
              <Ionicons name="trash" size={18} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.actionText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Modern card style
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#3d004f' },
  container: { padding: 20, alignItems: 'center' },
  card: {
    width: '100%',
    backgroundColor: '#2a003f',
    borderRadius: 20,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#fff',
    marginBottom: 15,
  },
  name: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  email: { fontSize: 14, color: '#ddd', marginVertical: 4 },
  bio: { fontSize: 14, color: '#bbb', marginBottom: 15, textAlign: 'center' },
  input: {
    width: '100%',
    backgroundColor: '#3d004f',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 12,
    color: '#fff',
  },
  pickerContainer: {
    width: '100%',
    backgroundColor: '#3d004f',
    borderRadius: 12,
    marginBottom: 12,
  },
  picker: { color: '#fff' },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 15,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    marginHorizontal: 1.5,
    width: '30%',
  },
  actionText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
