import { Image } from 'expo-image';
import { StyleSheet, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import SearchBar from '@/components/Searchbar';

export default function HomeScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#2E0740' }}>
      {/* 📱 Status bar background white */}
      <StatusBar backgroundColor="white" barStyle="dark-content" />

      {/* 🔝 Fixed Header */}
      <ThemedView style={styles.headerBar}>
        {/* Left: Logo + Traveler text */}
        <ThemedView style={styles.headerLogoContainer}>
          <Image
            source={require('@/assets/images/logo1.png')}
            style={styles.reactLogo}
          />
          <ThemedText type="title" style={styles.headerTitle}>
            Traveler
          </ThemedText>
        </ThemedView>

        {/* Right: Bell icon */}
        <Image
          source={require('@/assets/images/bell1.png')}
          style={styles.bellIcon}
        />
      </ThemedView>

      {/* 📜 Scrollable Body */}
      <ScrollView style={{ flex: 1, backgroundColor: '#2E0740' }}>
        {/* 🔍 Search Bar */}
        <ThemedView style={styles.searchWrapper}>
          <SearchBar />
        </ThemedView>

        {/* 🏞️ Nearest Places */}
        <ThemedView style={styles.section}>
          <ThemedText type="title" style={styles.sectionTitle}>
            Nearest Places
          </ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[
              { img: require('@/assets/images/jaffna.png'), label: 'Jaffna Fort' },
              { img: require('@/assets/images/nallur.png'), label: 'Nallur Temple' },
              { img: require('@/assets/images/jaffna.png'), label: 'Dutch Fort' },
              { img: require('@/assets/images/nallur.png'), label: 'Casuarina Beach' },
              { img: require('@/assets/images/jaffna.png'), label: 'Library' },
              { img: require('@/assets/images/nallur.png'), label: 'Nagadeepa' },
            ].map((place, i) => (
              <ThemedView key={i} style={styles.card}>
                <Image source={place.img} style={styles.cardImage} />
                <ThemedText style={styles.cardLabel}>{place.label}</ThemedText>
              </ThemedView>
            ))}
          </ScrollView>
        </ThemedView>

        {/* 🏨 Recommended Hotels */}
        <ThemedView style={styles.section}>
          <ThemedText type="title" style={styles.sectionTitle}>
            Recommended Hotels
          </ThemedText>
          {[
            { img: require('@/assets/images/hotel1.png'), name: 'U.S Hotel', price: 'Rs.5000/night' },
            { img: require('@/assets/images/hotel2.png'), name: 'Jet Wing', price: 'Rs.8000/night' },
            { img: require('@/assets/images/hotel1.png'), name: 'Green Palace', price: 'Rs.6000/night' },
            { img: require('@/assets/images/hotel2.png'), name: 'Star Rest', price: 'Rs.4500/night' },
          ].map((hotel, i) => (
            <ThemedView key={i} style={styles.listCard}>
              <Image source={hotel.img} style={styles.listImage} />
              <ThemedView>
                <ThemedText style={styles.hotelTitle}>{hotel.name}</ThemedText>
                <ThemedText style={styles.hotelPrice}>{hotel.price}</ThemedText>
              </ThemedView>
            </ThemedView>
          ))}
        </ThemedView>

        {/* 🎉 Nearly Events */}
        <ThemedView style={styles.section}>
          <ThemedText type="title" style={styles.sectionTitle}>
            Nearly Events
          </ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[
              require('@/assets/images/event1.png'),
              require('@/assets/images/event2.png'),
              require('@/assets/images/event1.png'),
              require('@/assets/images/event2.png'),
            ].map((event, i) => (
              <Image key={i} source={event} style={styles.eventImage} />
            ))}
          </ScrollView>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerBar: {
    width: '100%',
    height: 80,
    backgroundColor: '#2E0740',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  headerLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2E0740',
  },
  reactLogo: { height: 40, width: 30, resizeMode: 'contain' },
  bellIcon: { height: 28, width: 28, resizeMode: 'contain' },
  headerTitle: { fontSize: 18, fontWeight: '600', fontFamily: 'poppins', color: 'white' },
  searchWrapper: { margin: 10, backgroundColor: '#2E0740' },
  section: { marginTop: 20, marginHorizontal: 10, backgroundColor: '#2E0740' },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 10, color: 'white', marginLeft: 10 },
  card: { alignItems: 'center', marginRight: 12, marginLeft: 10, backgroundColor: '#2E0740' },
  cardImage: { width: 120, height: 90, borderRadius: 10 },
  cardLabel: { marginTop: 5, fontSize: 13, fontWeight: '500', color: 'white' },
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3A0751',
    padding: 8,
    borderRadius: 10,
     borderWidth: 1,              // ✅ Add border width
  borderColor: '#AD8787',
    marginTop: 10,
    width: '92%',
    alignSelf: 'center',
  },
  listImage: { width: 70, height: 55, borderRadius: 8, marginRight: 10 },
  hotelTitle: { fontSize: 14, fontWeight: '600', color: 'white', backgroundColor: '#3A0751' },
  hotelPrice: { fontSize: 12, color: '#ccc', backgroundColor: '#3A0751' },
  eventImage: { width: 140, height: 90, borderRadius: 10, marginRight: 12, marginLeft: 10,marginBottom: 20},
});
