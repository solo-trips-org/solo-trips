import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  TextInput,
  Modal,
  Dimensions,
  StatusBar,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import SafeArea from '@/components/SafeArea';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

const { width, height } = Dimensions.get('window');

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
  const [imageUploading, setImageUploading] = useState(false);
  const [showImageOptions, setShowImageOptions] = useState(false);

  const API_URL = 'https://trips-api.tselven.com/api/profile';

  // Request permissions
  useEffect(() => {
    const requestPermissions = async () => {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
        console.log('Camera and media library permissions are required');
      }
    };
    requestPermissions();
  }, []);

  // Fetch profile
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

  // Edit Profile
  const handleEdit = () => {
    setTempUsername(username);
    setTempFirstName(firstName);
    setTempEmail(email);
    setTempGender(gender);
    setIsEditing(true);
  };

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
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const errText = await res.text();
        console.log("❌ Update error response:", errText);
        Alert.alert('Error', 'Failed to update profile');
        return;
      }
      const updated = await res.json();
      const profile: Profile = updated.user || updated;
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

  // Image Change
  const handleImageChange = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Library'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) openCamera();
          else if (buttonIndex === 2) openImageLibrary();
        }
      );
    } else {
      setShowImageOptions(true);
    }
  };

  // Camera
  const openCamera = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images as any,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled && result.assets[0]) {
      await compressAndUpload(result.assets[0]);
    }
  };

  // Library
  const openImageLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images as any,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled && result.assets[0]) {
      await compressAndUpload(result.assets[0]);
    }
  };

  // Compress & upload with better size management
  const compressAndUpload = async (imageAsset: ImagePicker.ImagePickerAsset) => {
    try {
      // Compress to max 600px width for smaller base64 size
      const maxWidth = 600;
      const resizeWidth = imageAsset.width > maxWidth ? maxWidth : imageAsset.width;
      
      console.log(`🔧 Compressing image from ${imageAsset.width}px to ${resizeWidth}px`);
      
      const manipResult = await ImageManipulator.manipulateAsync(
        imageAsset.uri,
        [{ resize: { width: resizeWidth } }],
        { 
          compress: 0.6, // Good balance of quality and size
          format: ImageManipulator.SaveFormat.JPEG 
        }
      );
      
      // Check compressed file size
      const fileInfo = await FileSystem.getInfoAsync(manipResult.uri);
      
      if (fileInfo.exists && 'size' in fileInfo) {
        console.log(`📊 Compressed file size: ${(fileInfo.size / 1024).toFixed(2)} KB`);
        
        // If still too large (>200KB), compress more aggressively
        if (fileInfo.size > 200 * 1024) {
          console.log('⚠️ File still too large, compressing more...');
          const secondCompression = await ImageManipulator.manipulateAsync(
            manipResult.uri,
            [{ resize: { width: 400 } }],
            { compress: 0.4, format: ImageManipulator.SaveFormat.JPEG }
          );
          await uploadImage({ ...imageAsset, uri: secondCompression.uri });
          return;
        }
      }
      
      await uploadImage({ ...imageAsset, uri: manipResult.uri });
    } catch (err) {
      console.error("❌ Compression failed:", err);
      Alert.alert("Error", "Image compression failed");
    }
  };

  // Upload image - Try base64 approach if FormData fails
  const uploadImage = async (imageAsset: ImagePicker.ImagePickerAsset) => {
    try {
      setImageUploading(true);
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      const fileInfo = await FileSystem.getInfoAsync(imageAsset.uri);
      
      console.log('📸 File Info:', fileInfo);
      
      if (!fileInfo.exists) {
        throw new Error('File does not exist');
      }

      // Try Method 1: FormData (original approach)
      console.log('📤 Attempting FormData upload...');
      const formDataSuccess = await tryFormDataUpload(imageAsset.uri, token);
      
      if (formDataSuccess) {
        return; // Success!
      }

      // Try Method 2: Base64 JSON upload (fallback)
      console.log('📤 Attempting Base64 upload as fallback...');
      await tryBase64Upload(imageAsset.uri, token);

    } catch (error: any) {
      console.error("⚠️ Detailed upload error:", error);
      
      let errorMessage = 'Failed to upload image. Please try again.';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.toString().includes('Network request failed')) {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      Alert.alert('Upload Error', errorMessage);
    } finally {
      setImageUploading(false);
      setShowImageOptions(false);
    }
  };

  // Method 1: FormData upload
  const tryFormDataUpload = async (uri: string, token: string): Promise<boolean> => {
    try {
      const uriParts = uri.split('.');
      const fileType = uriParts[uriParts.length - 1].toLowerCase();
      
      const validTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
      const finalFileType = validTypes.includes(fileType) ? fileType : 'jpg';

      let fileUri = uri;
      if (Platform.OS === 'ios' && fileUri.startsWith('file://')) {
        fileUri = fileUri.substring(7);
      }

      const fileToUpload = {
        uri: fileUri,
        type: `image/${finalFileType === 'jpg' ? 'jpeg' : finalFileType}`,
        name: `profile_${Date.now()}.${finalFileType}`,
      };

      console.log('📦 FormData file:', fileToUpload);

      const formData = new FormData();
      formData.append('profile', fileToUpload as any);

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      console.log('📥 FormData Response status:', response.status);
      const responseText = await response.text();
      console.log('📄 FormData Raw response:', responseText);

      if (!response.ok) {
        return false; // Failed, will try base64
      }

      const result = JSON.parse(responseText);
      const newImageUrl = 
        result.profile || 
        result.user?.profile || 
        result.imageUrl || 
        result.url || 
        result.data?.profile ||
        result.data?.url;
      
      if (newImageUrl) {
        setAvatar(newImageUrl);
        Alert.alert('Success', 'Profile image updated successfully');
        return true;
      }
      
      return false;
    } catch (error) {
      console.log('⚠️ FormData upload failed:', error);
      return false;
    }
  };

  // Method 2: Base64 JSON upload
  const tryBase64Upload = async (uri: string, token: string): Promise<void> => {
    console.log('🔄 Converting to base64...');
    
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        profile: `data:image/jpeg;base64,${base64}`,
      }),
    });

    console.log('📥 Base64 Response status:', response.status);
    const responseText = await response.text();
    console.log('📄 Base64 Raw response:', responseText);

    if (!response.ok) {
      let errorMessage = 'Upload failed';
      try {
        const errorJson = JSON.parse(responseText);
        errorMessage = errorJson.message || errorJson.error || errorMessage;
      } catch (e) {
        errorMessage = responseText || errorMessage;
      }
      
      if (response.status === 500) {
        throw new Error('Server error. Please contact support or check backend logs.');
      } else if (response.status === 413) {
        throw new Error('Image is too large. Please choose a smaller image.');
      } else if (response.status === 401) {
        throw new Error('Authentication failed. Please login again.');
      } else {
        throw new Error(errorMessage);
      }
    }

    const result = JSON.parse(responseText);
    console.log('✅ Base64 Parsed result:', result);
    
    const newImageUrl = 
      result.profile || 
      result.user?.profile || 
      result.imageUrl || 
      result.url || 
      result.data?.profile ||
      result.data?.url;
    
    if (newImageUrl) {
      setAvatar(newImageUrl);
      Alert.alert('Success', 'Profile image updated successfully (base64)');
    } else {
      console.warn('⚠️ No image URL found in response:', result);
      Alert.alert('Warning', 'Image uploaded but could not retrieve the URL');
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={['#3A0751', "#7C3AED", '#3A0751']} style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </LinearGradient>
    );
  }

  return (
    <SafeArea>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#3A0751', "#7C3AED", '#3A0751']} style={styles.container}>
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>My Profile</Text>
            <TouchableOpacity style={styles.headerButton} onPress={() => router.push('../Settings')}>
              <Ionicons name="settings-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Profile Card */}
          <View style={styles.profileCard}>
            {/* Avatar Section */}
            <View style={styles.avatarSection}>
              <View style={styles.avatarContainer}>
                <Image source={{ uri: avatar }} style={styles.avatar} />
                <View style={styles.avatarBorder} />
                <TouchableOpacity style={styles.editIcon} onPress={handleImageChange}>
                  {imageUploading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Ionicons name="camera" size={20} color="#fff" />
                  )}
                </TouchableOpacity>
              </View>
              <Text style={styles.userName}>{firstName || username}</Text>
              <Text style={styles.userHandle}>@{username}</Text>
            </View>

            {/* Info Cards */}
            <View style={styles.infoContainer}>
              <View style={styles.infoCard}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="mail" size={20} color="#667eea" />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{email}</Text>
                </View>
              </View>

              <View style={styles.infoCard}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="person" size={20} color="#667eea" />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Username</Text>
                  <Text style={styles.infoValue}>{username}</Text>
                </View>
              </View>

              <View style={styles.infoCard}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="male-female" size={20} color="#667eea" />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Gender</Text>
                  <Text style={styles.infoValue}>{gender}</Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionContainer}>
              <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                <LinearGradient colors={['#667eea', '#764ba2']} style={styles.editButtonGradient}>
                  <Ionicons name="create-outline" size={20} color="#fff" />
                  <Text style={styles.editButtonText}>Edit Profile</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>

      {/* Android Image Options Modal */}
      <Modal visible={showImageOptions} transparent animationType="fade">
        <View style={imageStyles.modalOverlay}>
          <View style={imageStyles.modalContainer}>
            <Text style={imageStyles.modalTitle}>Change Profile Picture</Text>
            
            <TouchableOpacity style={imageStyles.optionButton} onPress={openCamera}>
              <Ionicons name="camera" size={24} color="#667eea" />
              <Text style={imageStyles.optionText}>Take Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={imageStyles.optionButton} onPress={openImageLibrary}>
              <Ionicons name="image" size={24} color="#667eea" />
              <Text style={imageStyles.optionText}>Choose from Library</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[imageStyles.optionButton, imageStyles.cancelButton]} 
              onPress={() => setShowImageOptions(false)}
            >
              <Ionicons name="close" size={24} color="#666" />
              <Text style={[imageStyles.optionText, { color: '#666' }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modern Edit Modal */}
      <Modal visible={isEditing} animationType="slide" transparent>
        <View style={modernStyles.modalOverlay}>
          <View style={modernStyles.modalContainer}>
            {/* Modal Header */}
            <View style={modernStyles.modalHeader}>
              <Text style={modernStyles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setIsEditing(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Form */}
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={modernStyles.formContainer}>
                <View style={modernStyles.inputGroup}>
                  <Text style={modernStyles.inputLabel}>First Name</Text>
                  <TextInput
                    style={modernStyles.input}
                    value={tempFirstName}
                    onChangeText={setTempFirstName}
                    placeholder="Enter your first name"
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={modernStyles.inputGroup}>
                  <Text style={modernStyles.inputLabel}>Username</Text>
                  <TextInput
                    style={modernStyles.input}
                    value={tempUsername}
                    onChangeText={setTempUsername}
                    placeholder="Enter your username"
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={modernStyles.inputGroup}>
                  <Text style={modernStyles.inputLabel}>Email</Text>
                  <TextInput
                    style={modernStyles.input}
                    value={tempEmail}
                    onChangeText={setTempEmail}
                    placeholder="Enter your email"
                    placeholderTextColor="#999"
                    keyboardType="email-address"
                  />
                </View>

                <View style={modernStyles.inputGroup}>
                  <Text style={modernStyles.inputLabel}>Gender</Text>
                  <TextInput
                    style={modernStyles.input}
                    value={tempGender}
                    onChangeText={setTempGender}
                    placeholder="Enter your gender"
                    placeholderTextColor="#999"
                  />
                </View>
              </View>
            </ScrollView>

            {/* Modal Buttons */}
            <View style={modernStyles.buttonContainer}>
              <TouchableOpacity style={modernStyles.cancelButton} onPress={() => setIsEditing(false)}>
                <Text style={modernStyles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={modernStyles.saveButton} onPress={handleSave}>
                <LinearGradient colors={['#667eea', '#764ba2']} style={modernStyles.saveButtonGradient}>
                  <Text style={modernStyles.saveButtonText}>Save Changes</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeArea>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 12,
    fontWeight: '500',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 30,
    paddingBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  avatarSection: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarBorder: {
    position: 'absolute',
    top: -4,
    left: -4,
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 3,
    borderColor:"#7C3AED",
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2d3436',
    marginBottom: 4,
  },
  userHandle: {
    fontSize: 16,
    color: '#74b9ff',
    fontWeight: '500',
  },
  infoContainer: {
    paddingHorizontal: 20,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  infoIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#636e72',
    fontWeight: '500',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#2d3436',
    fontWeight: '600',
  },
  actionContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  editButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  editButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

const modernStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: height * 0.8,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2d3436',
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d3436',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    color: '#2d3436',
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginRight: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#636e72',
  },
  saveButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginLeft: 10,
  },
  saveButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

const imageStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: width * 0.8,
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d3436',
    textAlign: 'center',
    marginBottom: 20,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: '#f8f9fa',
  },
  cancelButton: {
    backgroundColor: '#e9ecef',
    marginTop: 10,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3436',
    marginLeft: 12,
  },
});