import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { useState } from 'react';

const { width } = Dimensions.get('window');

export default function EventScreen() {
  const [district, setDistrict] = useState('');
  const [time, setTime] = useState('');

  // ✅ Events with details & real images
  const events = [
    {
      id: 1,
      title: "Sigiriya Rock Adventure",
      date: "20th September 2025",
      location: "Sigiriya, Sri Lanka",
      description: "Climb the ancient Sigiriya rock fortress and enjoy panoramic views.",
      image: "https://upload.wikimedia.org/wikipedia/commons/2/2e/Sigiriya_rock_fortress_Sri_Lanka.jpg"
    },
    {
      id: 2,
      title: "Colombo Food Festival",
      date: "25th September 2025",
      location: "Colombo, Sri Lanka",
      description: "A celebration of Sri Lankan street food, traditional cuisine, and live music.",
      image: "https://www.sundaytimes.lk/180617/uploads/colombo-food-festival.jpg"
    },
    {
      id: 3,
      title: "Kandy Cultural Dance Night",
      date: "30th September 2025",
      location: "Kandy, Sri Lanka",
      description: "Traditional Kandyan dances, fire shows, and drumming performances.",
      image: "https://www.lakpura.com/images/LK94000429-01-E.jpg"
    },
    {
      id: 4,
      title: "Jaffna Music Festival",
      date: "10th October 2025",
      location: "Jaffna, Sri Lanka",
      description: "An energetic music festival showcasing northern Sri Lanka’s culture.",
      image: "https://www.musicmatters.lk/images/jaffna-music-festival.jpg"
    },
  ];

  const clearFilters = () => {
    setDistrict('');
    setTime('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* 🔹 Local Banner */}
        <View style={styles.bannerWrapper}>
          <Image
            source={require('../../assets/images/ev.jpg')}
            style={styles.bannerImage}
            resizeMode="cover"
          />
          <Text style={styles.bannerText}>Witness the grandeur of the Nallur Kovil Festival</Text>
        </View>

        {/* 🔹 Filters */}
        <View style={styles.filterRow}>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={district}
              dropdownIconColor="#fff"
              style={styles.picker}
              onValueChange={(value) => setDistrict(value)}
            >
              <Picker.Item label="Select District" value="" />
              <Picker.Item label="Colombo" value="colombo" />
              <Picker.Item label="Kandy" value="kandy" />
              <Picker.Item label="Jaffna" value="jaffna" />
              <Picker.Item label="Galle" value="galle" />
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

        {/* 🔹 Events Section */}
        <Text style={styles.sectionTitle}>Events</Text>
        {events.slice(0, 2).map(event => (
          <View key={event.id} style={styles.card}>
            <Image source={{ uri: event.image }} style={styles.eventImage} resizeMode="cover" />
            <View style={styles.cardContent}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventInfo}>📅 {event.date}</Text>
              <Text style={styles.eventInfo}>📍 {event.location}</Text>
              <Text style={styles.eventDescription}>{event.description}</Text>

              <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>Register</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* 🔹 Upcoming Events Section */}
        <Text style={styles.sectionTitle}>Upcoming Events</Text>
        {events.slice(2, 4).map(event => (
          <View key={event.id} style={styles.card}>
            <Image source={{ uri: event.image }} style={styles.eventImage} resizeMode="cover" />
            <View style={styles.cardContent}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventInfo}>📅 {event.date}</Text>
              <Text style={styles.eventInfo}>📍 {event.location}</Text>
              <Text style={styles.eventDescription}>{event.description}</Text>

              <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>Register</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1C0127',
  },
  container: {
    paddingBottom: 40,
  },

  // 🔹 Banner
  bannerWrapper: {
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  bannerImage: {
    width: width - 32,
    height: 230,
    borderRadius: 16,
  },
  bannerText: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 8,
    padding: 6,
  },

  // 🔹 Filters
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 14,
    marginVertical: 18,
    justifyContent: 'space-between',
  },
  pickerWrapper: {
    flex: 1,
    backgroundColor: '#2E0740',
    borderRadius: 10,
    marginRight: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 52,
    color: '#fff',
  },
  clearButton: {
    backgroundColor: '#6A0DAD',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  clearText: {
    color: '#fff',
    fontWeight: '600',
  },

  // 🔹 Sections
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 16,
    marginBottom: 10,
  },

  // 🔹 Event Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6,
  },
  eventImage: {
    width: width - 32,
    height: 100,
  },
  cardContent: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2E0740',
    marginBottom: 6,
  },
  eventInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  eventDescription: {
    fontSize: 14,
    color: '#444',
    marginTop: 8,
    lineHeight: 20,
  },
  button: {
    marginTop: 16,
    backgroundColor: '#6A0DAD',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#6A0DAD',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
