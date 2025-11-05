// index.tsx - Fixed header with scrollable stats (no circles in stats)
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
  RefreshControl,
} from 'react-native';
import * as Location from 'expo-location';

import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import axios from 'axios';
import SafeArea from '@/components/SafeArea';
import { LinearGradient } from 'expo-linear-gradient';

type Place = {
  _id?: string;
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

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.72;
const SMALL_CARD_WIDTH = width * 0.43;

export default function HomeScreen() {
  const router = useRouter();
  const [nearestPlaces, setNearestPlaces] = useState<Place[]>([]);
  const [hotels, setHotels] = useState<Place[]>([]);
  const [events, setEvents] = useState<Place[]>([]);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [distance, setDistance] = useState<number>(100);
  const [userLocation, setUserLocation] = useState<string>('Loading...');

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

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

      // Get reverse geocoding for location name
      try {
        const locationData = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (locationData.length > 0) {
          const location = locationData[0];
          setUserLocation(`${location.city || location.district || 'Unknown'}, ${location.region || location.country || ''}`);
        }
      } catch (error) {
        console.log('Geocoding error:', error);
        setUserLocation('Current Location');
      }

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

  useEffect(() => {
    fetchData();
  }, []);

  // Logout
  const handleLogout = async () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
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
              router.replace('/Login');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
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

  const renderPlaceCard = (place: Place, index: number, type: 'place' | 'hotel' | 'event') => (
    <TouchableOpacity
      key={place._id ?? index}
      style={[styles.modernCard, type === 'place' ? styles.featuredCard : styles.regularCard]}
      onPress={() => goToDetails(
        type === 'place' ? 'places' : type === 'hotel' ? 'hotels' : 'events', 
        place._id, 
        place.age
      )}
      activeOpacity={0.9}
    >
      <View style={styles.cardImageContainer}>
        <Image 
          source={{ uri: place.image }} 
          style={styles.cardImage} 
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.cardGradient}
        />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {place.name || place.title}
          </Text>
          <View style={styles.cardFooter}>
            <View style={styles.iconContainer}>
              <Ionicons 
                name={type === 'place' ? 'location' : type === 'hotel' ? 'bed' : 'calendar'} 
                size={10} 
                color="#fff" 
              />
            </View>
            <Text style={styles.cardSubtitle}>
              {type === 'place' ? 'Tourist Spot' : type === 'hotel' ? 'Hotel' : 'Event'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeArea>
      <StatusBar barStyle="light-content" backgroundColor="#7C3AED" />
      
      {/* Fixed Header - Only Location and Logout */}
      <LinearGradient 
        colors={['#3A0751', "#7C3AED", '#3A0751']} 
        style={styles.fixedHeader}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
      >
        {/* Decorative Background Elements */}
        <View style={styles.headerBackground}>
          <View style={[styles.decorativeCircle, styles.circle1]} />
          <View style={[styles.decorativeCircle, styles.circle2]} />
        </View>
        
        <View style={styles.fixedHeaderContent}>
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={16} color="rgba(255,255,255,0.9)" />
            <Text style={styles.locationText} numberOfLines={1}>
              {userLocation}
            </Text>
          </View>
          
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <LinearGradient
              colors={['#FFFFFF', '#F8FAFC']}
              style={styles.logoutGradient}
            >
              <Ionicons name="log-out-outline" size={20} color="#510345ff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#7C3AED']}
            tintColor="#7C3AED"
          />
        }
      >
        {/* Stats Container - Now inside ScrollView (No circles) */}
        <View style={styles.statsSection}>
          <LinearGradient 
            colors={['#3A0751', "#7C3AED", '#3A0751']} 
            style={styles.statsBackground}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
          >
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.15)']}
                  style={styles.statGradient}
                >
                  <Text style={styles.statNumber}>{distance}</Text>
                  <Text style={styles.statLabel}>KM Radius</Text>
                </LinearGradient>
              </View>
              <View style={styles.statCard}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.15)']}
                  style={styles.statGradient}
                >
                  <Text style={styles.statNumber}>{nearestPlaces.length + hotels.length + events.length}</Text>
                  <Text style={styles.statLabel}>Places Found</Text>
                </LinearGradient>
              </View>
            </View>
          </LinearGradient>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <LinearGradient
              colors={['#7C3AED', '#A855F7']}
              style={styles.loadingGradient}
            >
              <ActivityIndicator size="large" color="#fff" />
            </LinearGradient>
            <Text style={styles.loadingText}>Discovering amazing places...</Text>
          </View>
        ) : (
          <>
            {/* Featured Places */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                  <Text style={styles.sectionTitle}>Nearest Places</Text>
                  <View style={styles.sectionTitleUnderline} />
                </View>
              </View>
              
              {nearestPlaces.length > 0 ? (
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalScrollContainer}
                  decelerationRate="fast"
                  snapToInterval={CARD_WIDTH + 20}
                >
                  {nearestPlaces.map((place, index) => renderPlaceCard(place, index, 'place'))}
                </ScrollView>
              ) : (
                <View style={styles.emptyStateContainer}>
                  <LinearGradient
                    colors={['#F3F4F6', '#E5E7EB']}
                    style={styles.emptyStateGradient}
                  >
                    <Ionicons name="location-outline" size={40} color="#9CA3AF" />
                    <Text style={styles.emptyStateText}>No places found nearby</Text>
                    <Text style={styles.emptyStateSubtext}>Try adjusting your search radius</Text>
                  </LinearGradient>
                </View>
              )}
            </View>

            {/* Hotels Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                  <Text style={styles.sectionTitle}>Recommended Hotels</Text>
                  <View style={styles.sectionTitleUnderline} />
                </View>
              </View>
              
              {hotels.length > 0 ? (
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalScrollContainer}
                >
                  {hotels.map((hotel, index) => renderPlaceCard(hotel, index, 'hotel'))}
                </ScrollView>
              ) : (
                <View style={styles.emptyStateContainer}>
                  <LinearGradient
                    colors={['#F3F4F6', '#E5E7EB']}
                    style={styles.emptyStateGradient}
                  >
                    <Ionicons name="bed-outline" size={40} color="#9CA3AF" />
                    <Text style={styles.emptyStateText}>No hotels found nearby</Text>
                  </LinearGradient>
                </View>
              )}
            </View>

            {/* Events Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                  <Text style={styles.sectionTitle}>Nearly Events</Text>
                  <View style={styles.sectionTitleUnderline} />
                </View>
              </View>
              
              {events.length > 0 ? (
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalScrollContainer}
                >
                  {events.map((event, index) => renderPlaceCard(event, index, 'event'))}
                </ScrollView>
              ) : (
                <View style={styles.emptyStateContainer}>
                  <LinearGradient
                    colors={['#F3F4F6', '#E5E7EB']}
                    style={styles.emptyStateGradient}
                  >
                    <Ionicons name="calendar-outline" size={40} color="#9CA3AF" />
                    <Text style={styles.emptyStateText}>No events happening nearby</Text>
                  </LinearGradient>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeArea>
  );
}

const styles = StyleSheet.create({
  // Fixed Header Styles
  fixedHeader: {
    paddingTop: 10,
    paddingBottom: 15,
    position: 'relative',
    overflow: 'hidden',
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  decorativeCircle: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 100,
  },
  circle1: {
    width: 100,
    height: 100,
    top: -30,
    right: -20,
  },
  circle2: {
    width: 70,
    height: 70,
    top: 20,
    left: -15,
    opacity: 0.6,
  },
  fixedHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    position: 'relative',
    zIndex: 1,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 15,
  },
  locationText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.95)',
    marginLeft: 8,
    flex: 1,
    fontWeight: '600',
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  logoutGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Stats Section - Now scrollable (no circles)
  statsSection: {
    marginBottom: 15,
  },
  statsBackground: {
    paddingVertical: 5,
    paddingHorizontal: 60,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
  },
  statGradient: {
    paddingHorizontal: 2,
    paddingVertical: 3,
    borderRadius: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 13,
    fontWeight: '800',
    color: '#fff',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  loadingGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#7C3AED',
    fontWeight: '600',
  },
  section: {
    marginBottom: 35,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 18,
  },
  sectionTitleContainer: {
    position: 'relative',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1F2937',
    letterSpacing: -0.5,
  },
  sectionTitleUnderline: {
    position: 'absolute',
    bottom: -4,
    left: 0,
    width: '60%',
    height: 3,
    backgroundColor: '#7C3AED',
    borderRadius: 2,
  },
  horizontalScrollContainer: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  modernCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginRight: 16,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
  featuredCard: {
    width: CARD_WIDTH,
    height: 230,
  },
  regularCard: {
    width: SMALL_CARD_WIDTH,
    height: 190,
  },
  cardImageContainer: {
    flex: 1,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '65%',
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  cardSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateGradient: {
    borderRadius: 20,
    paddingVertical: 30,
    paddingHorizontal: 40,
    alignItems: 'center',
    width: '100%',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6B7280',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 6,
    textAlign: 'center',
  },
});