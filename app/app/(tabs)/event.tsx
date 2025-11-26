import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  Image, Dimensions, ActivityIndicator, Alert, StatusBar
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SafeArea from '@/components/SafeArea';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function EventScreen() {
  const insets = useSafeAreaInsets();
  const [district, setDistrict] = useState('');
  const [time, setTime] = useState('');
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
          Alert.alert('Error', 'No auth token found, please login.');
          return;
        }

        const response = await fetch('https://trips-api.tselven.com/api/events', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        const eventList = Array.isArray(data) ? data : data.data || [];
        setEvents(eventList);
      } catch (error) {
        console.error("Error fetching events:", error);
        Alert.alert("Error", "Failed to fetch events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const clearFilters = () => {
    setDistrict('');
    setTime('');
  };

  const filteredEvents = events.filter(event => {
    const matchesDistrict = district 
      ? event.address?.city?.toLowerCase().includes(district.toLowerCase()) 
      : true;

    const matchesTime = time ? (() => {
      if (!event.schedule?.from) return true;
      const hour = new Date(event.schedule.from).getHours();
      if (time === 'morning') return hour >= 5 && hour < 12;
      if (time === 'afternoon') return hour >= 12 && hour < 17;
      if (time === 'evening') return hour >= 17 && hour <= 21;
      return true;
    })() : true;

    return matchesDistrict && matchesTime;
  });

  return (
    <SafeArea>
      <StatusBar barStyle="light-content" backgroundColor="#7C3AED" />
      
      {/* Modern Gradient Header */}
      <LinearGradient
        colors={['#3A0751', "#7C3AED", '#3A0751']}
        style={styles.gradientHeader}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
      >
        <View style={styles.headerBackground}>
          <View style={[styles.decorativeCircle, styles.circle1]} />
          <View style={[styles.decorativeCircle, styles.circle2]} />
        </View>
        
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <Ionicons name="calendar" size={32} color="#fff" style={styles.headerIcon} />
            <View>
              <Text style={styles.headerTitle}>Events & Activities</Text>
              <Text style={styles.headerSubtitle}>Discover amazing experiences</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Filter Section */}
        <View style={styles.filterSection}>
          <LinearGradient
            colors={['#ffffff', '#f8f9fa']}
            style={styles.filterContainer}
          >
            <Text style={styles.filterTitle}>Filter Events</Text>
            
            <View style={styles.filterRow}>
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>District</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={district}
                    style={styles.picker}
                    onValueChange={(value) => setDistrict(value)}
                  >
                    <Picker.Item label="All Districts" value="" />
                    <Picker.Item label="Colombo" value="Colombo" />
                    <Picker.Item label="Kandy" value="Kandy" />
                    <Picker.Item label="Jaffna" value="Jaffna" />
                    <Picker.Item label="Galle" value="Galle" />
                  </Picker>
                </View>
              </View>

              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>Time</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={time}
                    style={styles.picker}
                    onValueChange={(value) => setTime(value)}
                  >
                    <Picker.Item label="Any Time" value="" />
                    <Picker.Item label="Morning" value="morning" />
                    <Picker.Item label="Afternoon" value="afternoon" />
                    <Picker.Item label="Evening" value="evening" />
                  </Picker>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
              <LinearGradient
                colors={['#7C3AED', '#9333EA']}
                style={styles.clearGradient}
              >
                <Ionicons name="close-circle" size={16} color="#fff" />
                <Text style={styles.clearText}>Clear Filters</Text>
              </LinearGradient>
            </TouchableOpacity>
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
            <Text style={styles.loadingText}>Loading events...</Text>
          </View>
        ) : (
          <>
            {/* Results Count */}
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsCount}>
                {filteredEvents.length} {filteredEvents.length === 1 ? 'Event' : 'Events'} Found
              </Text>
            </View>

            {/* Events List */}
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event, index) => (
                <TouchableOpacity 
                  key={event._id ?? index} 
                  style={styles.eventCard}
                  activeOpacity={0.9}
                >
                  <View style={styles.cardImageContainer}>
                    <Image 
                      source={{ uri: event.image }} 
                      style={styles.cardImage} 
                      resizeMode="cover"
                    />
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.7)']}
                      style={styles.imageGradient}
                    />
                    <View style={styles.dateChip}>
                      <Ionicons name="calendar-outline" size={14} color="#fff" />
                      <Text style={styles.dateText}>
                        {new Date(event.schedule?.from).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardContent}>
                    <Text style={styles.eventTitle} numberOfLines={2}>
                      {event.title}
                    </Text>

                    <View style={styles.eventDetails}>
                      <View style={styles.detailRow}>
                        <Ionicons name="location" size={16} color="#7C3AED" />
                        <Text style={styles.detailText}>
                          {event.address?.city}, {event.address?.state}
                        </Text>
                      </View>
                      
                      <View style={styles.detailRow}>
                        <Ionicons name="time" size={16} color="#7C3AED" />
                        <Text style={styles.detailText}>
                          {new Date(event.schedule?.from).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </Text>
                      </View>
                    </View>

                    {event.description && (
                      <Text style={styles.eventDescription} numberOfLines={2}>
                        {event.description}
                      </Text>
                    )}

                    <View style={styles.cardFooter}>
                      <View style={styles.priceTag}>
                        <Text style={styles.priceLabel}>Entry</Text>
                        <Text style={styles.priceValue}>FREE</Text>
                      </View>
                      <TouchableOpacity style={styles.viewButton}>
                        {/* <Text style={styles.viewButtonText}>View Details</Text> */}
                        {/* <Ionicons name="chevron-forward" size={16} color="#7C3AED" /> */}
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <LinearGradient
                  colors={['#F3F4F6', '#E5E7EB']}
                  style={styles.emptyGradient}
                >
                  <Ionicons name="calendar-outline" size={64} color="#9CA3AF" />
                  <Text style={styles.emptyTitle}>No Events Found</Text>
                  <Text style={styles.emptyText}>
                    Try adjusting your filters to see more events
                  </Text>
                </LinearGradient>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeArea>
  );
}

const styles = StyleSheet.create({
  gradientHeader: {
    position: 'relative',
    overflow: 'hidden',
    paddingBottom: 20,
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
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 15,
    position: 'relative',
    zIndex: 1,
  },
  headerTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  container: {
    paddingBottom: 100,
  
  },
  filterSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
       paddingLeft:8,
    paddingRight: 8, 
  },
  filterContainer: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
   
    elevation: 5,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 5,
    marginBottom: 16,
    
  },
  filterGroup: {
    flex: 1,
    
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  pickerWrapper: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    borderWidth: 1,
    width: 150,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    fontWeight: 100,
  },
  picker: {
    height: 60,
    fontSize: 12,
    color: '#6B7280',
  },
  
  clearButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  clearGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  clearText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 60,
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
  resultsHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  eventCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    backgroundColor: '#fff',
    overflow: 'hidden',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  cardImageContainer: {
    height: 200,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  dateChip: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(124, 58, 237, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  dateText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  cardContent: {
    padding: 20,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 12,
  },
  eventDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  eventDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  priceTag: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  priceLabel: {
    fontSize: 11,
    color: '#16A34A',
    fontWeight: '600',
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 16,
    color: '#16A34A',
    fontWeight: '800',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewButtonText: {
    fontSize: 14,
    color: '#7C3AED',
    fontWeight: '700',
  },
  emptyState: {
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  emptyGradient: {
    borderRadius: 20,
    paddingVertical: 50,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});