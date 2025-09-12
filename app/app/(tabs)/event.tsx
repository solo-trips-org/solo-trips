import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

export default function EventScreen() {
  const events = [
    {
      id: 1,
      title: "Sigiriya Rock Adventure",
      date: "20th September 2025",
      location: "Sigiriya, Sri Lanka",
      description: "Climb the ancient Sigiriya rock fortress, enjoy panoramic views, and explore the UNESCO World Heritage site.",
      image: "https://source.unsplash.com/600x400/?sigiriya"
    },
    {
      id: 2,
      title: "Colombo Food Festival",
      date: "25th September 2025",
      location: "Colombo, Sri Lanka",
      description: "A celebration of Sri Lankan street food, traditional cuisine, and international flavors with live music and performances.",
      image: "https://source.unsplash.com/600x400/?food,festival"
    },
    {
      id: 3,
      title: "Kandy Cultural Dance Night",
      date: "30th September 2025",
      location: "Kandy, Sri Lanka",
      description: "Experience traditional Kandyan dances, fire shows, and drumming performances in the heart of Kandy.",
      image: "https://source.unsplash.com/600x400/?kandy,culture"
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>

        {/* Header with Gradient */}
        <LinearGradient colors={['#4B0082', '#2E0740']} style={styles.header}>
          <Text style={styles.headerTitle}>🌍 Traveler Events</Text>
        </LinearGradient>

        {/* Event Cards */}
        {events.map((event) => (
          <View key={event.id} style={styles.card}>
            <Image source={{ uri: event.image }} style={styles.image} />

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
    paddingBottom: 20,
  },
  header: {
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: 180,
  },
  cardContent: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2E0740',
    marginBottom: 4,
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
    marginTop: 14,
    backgroundColor: '#6A0DAD',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
