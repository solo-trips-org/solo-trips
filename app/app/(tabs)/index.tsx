import React, { useEffect, useState } from 'react';
import { Image } from 'expo-image';
import {
  StyleSheet,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

type Place = {
  id?: number;
  name: string;
  lat: number;
  lng: number;
  image: string;
};

const { width } = Dimensions.get('window');
const GRID_ITEM_WIDTH = (width - 150) / 2; // card size

export default function HomeScreen() {
  const router = useRouter();
  const [nearestPlaces, setNearestPlaces] = useState<Place[]>([]);
  const [hotels, setHotels] = useState<Place[]>([]);
  const [events, setEvents] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission denied', 'Location permission is required.');
          setLoading(false);
          return;
        }

        const loc = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = loc.coords;

        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
          Alert.alert('Error', 'No token found, please login again.');
          router.replace('/Login');
          return;
        }

        // Fetch nearest places
        const placesRes = await fetch(
          `https://trips-api.tselven.com/api/near/places?lat=${latitude}&lng=${longitude}&radius=10`,

// nearby place ku ipdi kudunga
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        const placesData = await placesRes.json();
        setNearestPlaces(Array.isArray(placesData) ? placesData : placesData?.places || []);

        // Fetch hotels
        const hotelRes = await fetch(
          `https://trips-api.tselven.com/api/near/hotels?latitude=9.6615&longitude=80.0255&radius=5`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const hotelData = await hotelRes.json();
        setHotels(Array.isArray(hotelData) ? hotelData : hotelData?.hotels || []);

        // Fetch events
        const eventRes = await fetch(
          `https://trips-api.tselven.com/api/near/events?lat=9.6678&lng=80.0142&radius=5`,

// nearby place ku ipdi kudunga/
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const eventData = await eventRes.json();
        setEvents(Array.isArray(eventData) ? eventData : eventData?.events || []);
      } catch (error) {
        console.error('API Error:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredPlaces = nearestPlaces.filter(place =>
    place.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      Alert.alert('Logged out', 'You have been logged out.');
      router.replace('/Login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="white" barStyle="dark-content" />

      {/* Header */}
      <View style={styles.headerBar}>
        <View style={styles.headerLogoContainer}>
          <Image source={require('@/assets/images/logo1.png')} style={styles.reactLogo} />
          <Text style={styles.headerTitle}>Traveler</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchInputWrapper}>
          <Ionicons name="search" size={20} color="#ccc" style={{ marginHorizontal: 5 }} />
          <TextInput
            placeholder="Search places..."
            placeholderTextColor="#ccc"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Nearest Places */}
        <Text style={styles.sectionTitle}>Nearest Places</Text>
        {loading ? (
          <ActivityIndicator color="#c000ff" size="large" style={{ marginTop: 20 }} />
        ) : filteredPlaces.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.gridScrollContainer}>
            {filteredPlaces.map((place, index) => (
              <View key={place.id ?? index} style={styles.gridCard}>
                <Image source={{ uri: place.image }} style={styles.gridImage} />
                <Text style={styles.gridLabel}>{place.name}</Text>
              </View>
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.emptyText}>No nearby places found</Text>
        )}

        {/* Hotels */}
        <Text style={styles.sectionTitle}>Recommended Hotels</Text>
        {hotels.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.gridScrollContainer}>
            {hotels.map((hotel, index) => (
              <View key={hotel.id ?? index} style={styles.gridCard}>
                <Image source={{ uri: hotel.image }} style={styles.gridImage} />
                <Text style={styles.gridLabel}>{hotel.name}</Text>
              </View>
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.emptyText}>No hotels nearby</Text>
        )}

        {/* Events */}
        <Text style={styles.sectionTitle}>Nearby Events</Text>
        {events.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.gridScrollContainer}>
            {events.map((event, index) => (
              <View key={event.id ?? index} style={styles.gridCard}>
                <Image source={{ uri: event.image }} style={styles.gridImage} />
                <Text style={styles.gridLabel}>{event.name}</Text>
              </View>
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.emptyText}>No events nearby</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2E0740' },
  headerBar: {
    width: '100%',
    height: 70,
    backgroundColor: '#2E0740',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  headerLogoContainer: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  reactLogo: { height: 60, width: 50, resizeMode: 'contain' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: 'white', marginLeft: 2 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#c000ff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  searchWrapper: { margin: 10 },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3A0751',
    borderRadius: 50,
    paddingHorizontal: 8,
    borderWidth: 0.5,
    borderColor: '#c000ff',
    width: '90%',
    height: 45,
    marginLeft: 25,
  },
  searchInput: { flex: 1, height: 40, color: '#fff' },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 10, color: '#fff', marginLeft: 20 },
  emptyText: { color: '#aaa', marginLeft: 20, marginBottom: 15 },

  // Horizontal scroll container
  gridScrollContainer: {
    paddingHorizontal: 10,
  },
  gridCard: {
    width: GRID_ITEM_WIDTH,
    marginRight: 15,
    alignItems: 'center',
    backgroundColor: '#3A0751',
    padding: 8,
    borderRadius: 12,
  },
  gridImage: {
    width: GRID_ITEM_WIDTH - 20,
    height: GRID_ITEM_WIDTH - 20,
    borderRadius: 10,
  },
  gridLabel: { marginTop: 6, fontSize: 12, color: '#fff', textAlign: 'center' },
});
