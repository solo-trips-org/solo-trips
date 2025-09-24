// index.tsx
import React, { useEffect, useState } from 'react';
import {
  Image,
  StyleSheet,
  ScrollView,
  StatusBar,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import axios from 'axios';
import SafeArea from '@/components/SafeArea';

type Place = {
  _id?: string; // backend id
  name: string;
  image: string;
  age?: number | string;
  title?: string;
};

type Guide = {
  _id?: string;
  name: string;
  image: string;
  city?: string;
  language?: string;
  gender?: string;
};

const { width } = Dimensions.get('window');
const GRID_ITEM_WIDTH = (width - 150) / 2;

export default function HomeScreen() {
  const router = useRouter();
  const [nearestPlaces, setNearestPlaces] = useState<Place[]>([]);
  const [hotels, setHotels] = useState<Place[]>([]);
  const [events, setEvents] = useState<Place[]>([]);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [distance, setDistance] = useState<number>(100);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const savedDistance = await AsyncStorage.getItem('distanceFilter');
        const radius = savedDistance ? Number(savedDistance) : 100;
        setDistance(radius);

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
          `https://trips-api.tselven.com/api/near/places?lat=${latitude}&lng=${longitude}&radius=${radius}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const placesData = await placesRes.json();
        setNearestPlaces(Array.isArray(placesData) ? placesData : placesData?.places || []);

        // Fetch hotels
        const hotelRes = await fetch(
          `https://trips-api.tselven.com/api/near/hotels?latitude=${latitude}&longitude=${longitude}&radius=${radius}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const hotelData = await hotelRes.json();
        setHotels(Array.isArray(hotelData) ? hotelData : hotelData?.hotels || []);

        // Fetch events
        const eventRes = await fetch(
          `https://trips-api.tselven.com/api/near/events?lat=${latitude}&lng=${longitude}&radius=${radius}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const eventData = await eventRes.json();
        setEvents(Array.isArray(eventData) ? eventData : eventData?.events || []);

        // Fetch guides (optional)
        const guideRes = await fetch(
          `https://trips-api.tselven.com/api/near/guides?city=PointPedro&gender=male&language=Tamil`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const guideData = await guideRes.json();
        setGuides(Array.isArray(guideData) ? guideData : guideData?.guides || []);
      } catch (error) {
        console.error('API Error:', error);
        Alert.alert('Error', 'Failed to fetch data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Logout
  const handleLogout = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Error', 'No token found.');
        return;
      }

      await axios.post(
        'https://trips-api.tselven.com/api/logout',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await AsyncStorage.removeItem('authToken');
      Alert.alert('Logged out', 'You have been logged out.');
      router.replace('/Login');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  // Navigate to details page
  const goToDetails = (type: string, id?: string, age?: number | string) => {
    if (!id) return;

    router.push({
      pathname: '/details/[type]/[id]',
      params: {
        type,
        id,
        ...(age !== undefined ? { age: String(age) } : {}),
      },
    });
  };

  return (
    <SafeArea backgroundColor="#2E0740">
      <StatusBar backgroundColor="white" barStyle="dark-content" />

      {/* Header */}
      <View style={styles.headerBar}>
        <View style={styles.headerLogoContainer}>
          <Image source={require('@/assets/images/logo1.png')} style={styles.reactLogo} />
          <Text style={styles.headerTitle}>Traveler</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={25} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.headerLine} />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }}>
        <Text style={[styles.sectionTitle, { color: '#c000ff' }]}>
          Showing places within {distance} KM
        </Text>

        {/* Nearest Places */}
        <Text style={styles.sectionTitle}>Nearest Places</Text>
        {loading ? (
          <ActivityIndicator color="#c000ff" size="large" style={{ marginTop: 20 }} />
        ) : nearestPlaces.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.gridScrollContainer}>
            {nearestPlaces.map((place, index) => (
              <TouchableOpacity
                key={place._id ?? index}
                style={styles.placeCard}
                onPress={() => goToDetails('places', place._id, place.age)}
              >
                <Image source={{ uri: place.image }} style={styles.placeImage} />
                <Text style={styles.placeLabel} numberOfLines={2}>
                  {place.name}
                </Text>
              </TouchableOpacity>
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
              <TouchableOpacity
                key={hotel._id ?? index}
                style={styles.hotelCard}
                onPress={() => goToDetails('hotels', hotel._id)}
              >
                <Image source={{ uri: hotel.image }} style={styles.hotelImage} />
                <Text style={styles.hotelLabel} numberOfLines={2}>
                  {hotel.name}
                </Text>
              </TouchableOpacity>
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
              <TouchableOpacity
                key={event._id ?? index}
                style={styles.eventCard}
                onPress={() => goToDetails('events', event._id)}
              >
                <Image source={{ uri: event.image }} style={styles.eventImage} />
                <Text style={styles.eventLabel} numberOfLines={2}>
                  {event.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.emptyText}>No events nearby</Text>
        )}
      </ScrollView>
    </SafeArea>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2E0740' },
  headerBar: {
    width: '100%',
    height: 75,
    backgroundColor: '#2E0740',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
  headerLine: {
    borderWidth: 0.3,
    borderColor: '#c000ff',
    width: '100%',
    marginBottom: 10,
  },
  headerLogoContainer: { flexDirection: 'row', alignItems: 'center', gap: 1 ,marginTop:2},
  reactLogo: { height: 50, width: 50, resizeMode: 'contain' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: 'white', marginLeft: 2 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#c000ff',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 10, color: '#fff', marginLeft: 20 },
  emptyText: { color: '#aaa', marginLeft: 20, marginBottom: 15 },
  gridScrollContainer: { paddingHorizontal: 10 },

  placeCard: {
    marginTop: 10,
    width: GRID_ITEM_WIDTH,
    height: GRID_ITEM_WIDTH + 40,
    marginRight: 15,
    backgroundColor: '#f6f5f7',
    borderRadius: 7,
    overflow: 'hidden',
    shadowColor: '#c000ff',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 6,
    alignItems: 'center',
    marginBottom: 30,
  },
  placeImage: { width: '100%', height: GRID_ITEM_WIDTH - 5, backgroundColor: '#444' },
  placeLabel: { marginTop: 6, fontSize: 10, fontWeight: '600', color: '#701761', textAlign: 'center' },

  hotelCard: {
    width: GRID_ITEM_WIDTH,
    height: GRID_ITEM_WIDTH + 40,
    marginRight: 15,
    backgroundColor: '#f7f4f9',
    borderRadius: 7,
    overflow: 'hidden',
    shadowColor: '#c000ff',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 7,
    elevation: 7,
    alignItems: 'center',
    marginBottom: 30,
  },
  hotelImage: { width: '100%', height: GRID_ITEM_WIDTH - 10, backgroundColor: '#444' },
  hotelLabel: { marginTop: 6, fontSize: 10, fontWeight: '700', color: '#701761', textAlign: 'center' },

  eventCard: {
    marginTop: 10,
    width: GRID_ITEM_WIDTH,
    height: GRID_ITEM_WIDTH + 40,
    marginRight: 15,
    backgroundColor: '#f1eef3',
    borderRadius: 7,
    overflow: 'hidden',
    shadowColor: '#c000ff',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 7,
    elevation: 7,
    alignItems: 'center',
    marginBottom: 90,
  },
  eventImage: { width: '100%', height: GRID_ITEM_WIDTH - 8, backgroundColor: '#444' },
  eventLabel: { marginTop: 4, fontSize: 10, fontWeight: '600', color: '#701761', textAlign: 'center' },
});
