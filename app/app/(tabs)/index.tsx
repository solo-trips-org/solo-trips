import React, { useEffect, useState } from 'react';
import { Image } from 'expo-image';
import { StyleSheet, ScrollView, StatusBar, ActivityIndicator, Text, TextInput, View } from 'react-native';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

type Place = {
  name: string;
  lat: number;
  lng: number;
  img: any;
};

type Hotel = {
  name: string;
  price: string;
  img: any;
};

export default function HomeScreen() {
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [nearestPlaces, setNearestPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const allPlaces: Place[] = [
    { name: 'Jaffna Fort', lat: 9.6616, lng: 80.0255, img: require('@/assets/images/jaffna.png') },
    { name: 'Nallur Temple', lat: 9.6660, lng: 80.0250, img: require('@/assets/images/nallur.png') },
    { name: 'Dutch Fort', lat: 9.6630, lng: 80.0230, img: require('@/assets/images/jaffna.png') },
    { name: 'Casuarina Beach', lat: 9.6770, lng: 80.0300, img: require('@/assets/images/nallur.png') },
    { name: 'Library', lat: 9.6620, lng: 80.0260, img: require('@/assets/images/jaffna.png') },
    { name: 'Nagadeepa', lat: 9.6700, lng: 80.0320, img: require('@/assets/images/nallur.png') },
  ];

  const hotels: Hotel[] = [
    { name: 'U.S Hotel', price: 'Rs.5000/night', img: require('@/assets/images/hotel1.png') },
    { name: 'Jet Wing', price: 'Rs.8000/night', img: require('@/assets/images/hotel2.png') },
    { name: 'Green Palace', price: 'Rs.6000/night', img: require('@/assets/images/hotel1.png') },
    { name: 'Star Rest', price: 'Rs.4500/night', img: require('@/assets/images/hotel2.png') },
  ];

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          alert('Permission to access location was denied');
          setLoading(false);
          setNearestPlaces(allPlaces); // fallback to show all
          return;
        }

        const loc = await Location.getCurrentPositionAsync({});
        setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });

        // For testing: increase radius to show places
        const nearby = allPlaces.filter(place => {
          const distance = getDistanceFromLatLonInKm(
            loc.coords.latitude,
            loc.coords.longitude,
            place.lat,
            place.lng
          );
          return distance <= 400; // 400 km radius for testing
        });

        setNearestPlaces(nearby);
      } catch (error) {
        console.error(error);
        setNearestPlaces(allPlaces); // fallback
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const deg2rad = (deg: number) => deg * (Math.PI / 180);

  const filteredPlaces = nearestPlaces.filter(place => place.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="white" barStyle="dark-content" />

      {/* Header */}
      <View style={styles.headerBar}>
        <View style={styles.headerLogoContainer}>
          <Image source={require('@/assets/images/logo1.png')} style={styles.reactLogo} />
          <Text style={styles.headerTitle}>Traveler</Text>
        </View>
        <Image source={require('@/assets/images/bell1.png')} style={styles.bellIcon} />
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

      <ScrollView style={{ flex: 1 }}>
        {/* Nearest Places */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nearest Places</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {loading ? (
              <ActivityIndicator color="#c000ff" size="small" style={{ marginLeft: 10 }} />
            ) : filteredPlaces.length > 0 ? (
              filteredPlaces.map((place, i) => (
                <View key={i} style={styles.card}>
                  <Image source={place.img} style={styles.cardImage} />
                  <Text style={styles.cardLabel}>{place.name}</Text>
                </View>
              ))
            ) : (
              <Text style={{ color: '#fff', margin: 10 }}>No nearby places found</Text>
            )}
          </ScrollView>
        </View>

        {/* Recommended Hotels */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended Hotels</Text>
          {hotels.map((hotel, i) => (
            <View key={i} style={styles.listCard}>
              <Image source={hotel.img} style={styles.listImage} />
              <View>
                <Text style={styles.hotelTitle}>{hotel.name}</Text>
                <Text style={styles.hotelPrice}>{hotel.price}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Nearby Events */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nearby Events</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[ 
              { img: require('@/assets/images/event1.png'), name: 'Music Fest' },
              { img: require('@/assets/images/event2.png'), name: 'Food Carnival' },
            ].map((event, i) => (
              <View key={i} style={{ marginRight: 12, alignItems: 'center' }}>
                <Image source={event.img} style={styles.eventImage} />
                <Text style={styles.eventName}>{event.name}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2E0740' },
  headerBar: { width: '100%', height: 80, backgroundColor: '#2E0740', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10 },
  headerLogoContainer: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  reactLogo: { height: 60, width: 50, resizeMode: 'contain' },
  bellIcon: { height: 28, width: 28, resizeMode: 'contain' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: 'white', marginLeft: 8 },
  searchWrapper: { margin: 10 },
  searchInputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#3A0751', borderRadius: 8, paddingHorizontal: 8 },
  searchInput: { flex: 1, height: 40, color: '#fff' },
  section: { marginTop: 20, marginHorizontal: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 10, color: 'white' },
  card: { alignItems: 'center', marginRight: 12 },
  cardImage: { width: 120, height: 90, borderRadius: 10 },
  cardLabel: { marginTop: 5, fontSize: 13, fontWeight: '500', color: 'white' },
  listCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#3A0751', padding: 8, borderRadius: 10, borderWidth: 1, borderColor: '#AD8787', marginTop: 10, width: '92%', alignSelf: 'center' },
  listImage: { width: 70, height: 55, borderRadius: 8, marginRight: 10 },
  hotelTitle: { fontSize: 14, fontWeight: '600', color: 'white' },
  hotelPrice: { fontSize: 12, color: '#ccc' },
  eventImage: { width: 140, height: 90, borderRadius: 10, marginRight: 12 },
  eventName: { color: 'white', fontSize: 12, marginTop: 4 },
});
