import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  Image, Dimensions, ActivityIndicator, Alert 
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SafeArea from '@/components/SafeArea';

const { width } = Dimensions.get('window');

export default function EventScreen() {
  const [district, setDistrict] = useState('');
  const [time, setTime] = useState('');
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch events with token
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
        console.log("Fetched events:", data);

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

  // Clear filters
  const clearFilters = () => {
    setDistrict('');
    setTime('');
  };

  // Apply filters
  const filteredEvents = events.filter(event => {
    // District filter
    const matchesDistrict = district 
      ? event.address.city?.toLowerCase().includes(district.toLowerCase()) 
      : true;

    // Time filter
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
    <SafeArea backgroundColor="#2E0740">
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Banner */}
        <View style={styles.bannerWrapper}>
          <Image
            source={require('../../assets/event_banner.png')}
            style={styles.bannerImage}
            resizeMode="cover"
          />
          {/* <Text style={styles.bannerText}>Witness the grandeur of the Nallur Kovil Festival</Text> */}
        </View>

        {/* Filters */}
        <View style={styles.filterRow}>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={district}
              dropdownIconColor="#fff"
              style={styles.picker}
              onValueChange={(value) => setDistrict(value)}
            >
              <Picker.Item label="Select District" value="" />
              <Picker.Item label="Colombo" value="Colombo" />
              <Picker.Item label="Kandy" value="Kandy" />
              <Picker.Item label="Jaffna" value="Jaffna" />
              <Picker.Item label="Galle" value="Galle" />
            </Picker>
          </View>

          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={time}
              dropdownIconColor="#fff"
              style={styles.picker}
              onValueChange={(value) => setTime(value)}
            >
              <Picker.Item label="Select Time" value="" />
              <Picker.Item label="Morning" value="morning" />
              <Picker.Item label="Afternoon" value="afternoon" />
              <Picker.Item label="Evening" value="evening" />
            </Picker>
          </View>

          <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        </View>

        {/* Loading state */}
        {loading && <ActivityIndicator size="large" color="#fff" style={{ marginTop: 20 }} />}

        {!loading && (
          <>
            {/* Featured Events Horizontal Scroll */}
            <Text style={styles.sectionTitle}>Featured Events</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.gridScrollContainer}
              style={{ paddingLeft: 16, marginBottom: 20 }}
            >
              {filteredEvents.map((event, index) => (
                <TouchableOpacity 
                  key={event._id ?? index} 
                  style={styles.eventCard} 
                  onPress={() => console.log("Go to details of", event._id)}
                >
                  <Image source={{ uri: event.image }} style={styles.horizontalEventImage} />
                  <Text style={styles.eventLabel} numberOfLines={2}>{event.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Events Section */}
            <Text style={styles.sectionTitle}>Events</Text>
            {filteredEvents.slice(0, 3).map(event => (
              <View key={event._id} style={styles.card}>
                <Image source={{ uri: event.image }} style={styles.eventImage} resizeMode="cover"/>
                <View style={styles.cardContent}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventInfo}>
                    From: {new Date(event.schedule.from).toLocaleString()}
                  </Text>
                  <Text style={styles.eventInfo}>
                    To: {new Date(event.schedule.to).toLocaleString()}
                  </Text>
                  <Text style={styles.eventInfo}>{event.address.city}, {event.address.state}</Text>
                  <Text style={styles.eventInfo}>{event.address.street}</Text>
                  <Text style={styles.eventDescription}>{event.description}</Text>
                  {/* <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>Register</Text>
                  </TouchableOpacity> */}
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeArea>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 140 },
  bannerWrapper: { marginHorizontal: 16, marginTop: 0, borderRadius: 0, overflow: 'hidden', position: 'relative' },
  bannerImage: { width: width - 32, height: 230, borderRadius: 0},
  bannerText: { position: 'absolute', bottom: 10, left: 10, right: 10, color: '#fff', fontSize: 14, fontWeight: '600', textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 0, padding: 6 },
  filterRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 14, marginVertical: 18, justifyContent: 'space-between' },
  pickerWrapper: { flex: 1, backgroundColor: '#2E0740', borderRadius: 10, marginRight: 8, overflow: 'hidden' },
  picker: { height: 52, color: '#fff' },
  clearButton: { backgroundColor: '#6A0DAD', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  clearText: { color: '#fff', fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#fff', marginLeft: 16, marginBottom: 10 },
  gridScrollContainer: { paddingRight: 16 },
  eventCard: { marginRight: 12, width: 140, borderRadius: 12, overflow: 'hidden', backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 3 },
  horizontalEventImage: { width: 140, height: 100 },
  eventLabel: { padding: 6, fontSize: 14, fontWeight: '600', color: '#2E0740', textAlign: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 16, marginHorizontal: 16, marginVertical: 12, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 6, marginTop: 10 },
  eventImage: { width: width - 32, height: 150 },
  cardContent: { padding: 16 },
  eventTitle: { fontSize: 20, fontWeight: '700', color: '#2E0740', marginBottom: 6 },
  eventInfo: { fontSize: 14, color: '#666', marginBottom: 2 },
  eventDescription: { fontSize: 14, color: '#444', marginTop: 8, lineHeight: 20 },
  button: { marginTop: 16, backgroundColor: '#6A0DAD', paddingVertical: 14, borderRadius: 12, alignItems: 'center', shadowColor: '#6A0DAD', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 3 }, shadowRadius: 6, elevation: 4 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
