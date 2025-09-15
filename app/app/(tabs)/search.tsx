import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const categories = ['Places', 'Hotels', 'Event', 'Guide']; 

// Dummy data for Places, Hotels, Events
const dummyPlaces = [
  {
    id: '1',
    name: 'Nallur',
    rating: 3,
    type: 'Places',
    image: require('@/assets/images/nallur.png'),
    description:
      'Nallur Kandaswamy Kovil, located in Jaffna, Sri Lanka...',
    timing: '08.00 am - 06.00 pm',
  },
  {
    id: '2',
    name: 'Jaffna Fort',
    rating: 2,
    type: 'Places',
    image: require('@/assets/images/jaffna.png'),
    description:
      'Jaffna Fort is a historic fort built by the Portuguese...',
    timing: '09.00 am - 05.00 pm',
  },
  {
    id: '3',
    name: 'Luxury Hotel',
    rating: 4,
    type: 'Hotels',
    image: require('@/assets/images/nallur.png'),
    description: 'A modern luxury hotel offering premium facilities.',
    timing: '24 Hours',
  },
  {
    id: '4',
    name: 'Music Festival',
    rating: 5,
    type: 'Event',
    image: require('@/assets/images/jaffna.png'),
    description: 'An exciting music festival that attracts crowds.',
    timing: '06.00 pm - 12.00 am',
  },
];

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Places');
  const [guides, setGuides] = useState<any[]>([]);
  const [loadingGuides, setLoadingGuides] = useState(false);
  const router = useRouter();

  // 🔹 Fetch guides when category is "Guide"
  useEffect(() => {
    if (selectedCategory === 'Guide') {
      (async () => {
        try {
          setLoadingGuides(true);
          const res = await fetch(
            'https://trips-api.tselven.com/api/near/guides?city=PointPedro&gender=male&language=Tamil'
          );
          const data = await res.json();
          if (Array.isArray(data)) {
            setGuides(data);
          } else if (data?.guides) {
            setGuides(data.guides);
          } else {
            setGuides([]);
          }
        } catch (err) {
          console.error('Guide fetch error:', err);
          setGuides([]);
        } finally {
          setLoadingGuides(false);
        }
      })();
    }
  }, [selectedCategory]);

  const handleSearch = (text: string) => setQuery(text);

  // 🔹 Filter data based on category
  const filteredData =
    selectedCategory === 'Guide'
      ? guides.filter(g =>
          g.name?.toLowerCase().includes(query.toLowerCase())
        )
      : dummyPlaces.filter(
          p =>
            p.type === selectedCategory &&
            p.name.toLowerCase().includes(query.toLowerCase())
        );

  return (
    <ThemedView style={{ flex: 1, backgroundColor: '#2E0740' }}>
      <SafeAreaView edges={['top']} style={styles.safeHeader}>
        <View style={styles.headerBar}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Back</Text>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* 🔍 Search */}
        <View style={styles.searchWrapper}>
          <View style={styles.searchInputWrapper}>
            <Ionicons name="search" size={15} color="#ccc" style={{ marginHorizontal: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search places, hotels, guides..."
              placeholderTextColor="#ccc"
              value={query}
              onChangeText={handleSearch}
            />
          </View>
        </View>

        {/* 🏷 Category Tabs */}
        <View style={styles.tabContainer}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={[styles.tab, selectedCategory === cat && styles.activeTab]}
            >
              <Text style={[styles.tabText, selectedCategory === cat && styles.activeTabText]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 📌 Cards List */}
        <View style={styles.cardList}>
          {selectedCategory === 'Guide' && loadingGuides ? (
            <ActivityIndicator size="large" color="#c000ff" style={{ marginTop: 20 }} />
          ) : filteredData.length > 0 ? (
            filteredData.map((item: any) => (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                onPress={() =>
                  router.push({
                    pathname: '/PlaceMoreDetails',
                    params: {
                      id: item.id,
                      name: item.name,
                      image: item.image ?? Image.resolveAssetSource(require('@/assets/images/nallur.png')).uri,
                      rating: item.rating ?? 4,
                      type: selectedCategory,
                      description: item.description ?? 'No description available.',
                      timing: item.timing ?? 'Available',
                    },
                  })
                }
              >
                <Image
                  source={
                    item.image
                      ? { uri: item.image }
                      : require('@/assets/images/nallur.png')
                  }
                  style={styles.cardImage}
                />
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <View style={styles.ratingContainer}>
                    {Array.from({ length: item.rating ?? 4 }).map((_, i) => (
                      <Ionicons key={i} name="star" size={14} color="#FFD700" />
                    ))}
                  </View>
                  <Text style={styles.cardSubtitle}>{selectedCategory}</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <ThemedText style={styles.noResult}>No results found</ThemedText>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  safeHeader: { top: 5 },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 60,
    backgroundColor: '#2E0740',
    gap: 8,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3A0A55',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#c000ff',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: 'white' },
  searchWrapper: { paddingHorizontal: 16, paddingVertical: 13, borderRadius: 8, width: '80%', marginLeft: 35 },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3A0A55',
    borderRadius: 50,
    borderWidth: 0.5,
    borderColor: '#c000ff',
    marginBottom: 10,
  },
  searchInput: { flex: 1, height: 40, width: 210, color: 'white', fontSize: 14, paddingVertical: 10 },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 16,
    backgroundColor: '#3A0A55',
    borderRadius: 10,
    padding: 6,
    marginBottom: 12,
  },
  tab: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 8, borderWidth: 0.4, borderColor: '#c000ff' },
  activeTab: { backgroundColor: '#E6C4FF' },
  tabText: { color: '#ccc', fontSize: 14 },
  activeTabText: { color: '#2E0740', fontWeight: '600' },
  cardList: { paddingHorizontal: 20 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#3A0A55',
    borderRadius: 10,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardImage: { width: 90, height: 90, resizeMode: 'cover' },
  cardContent: { flex: 1, padding: 10, justifyContent: 'center' },
  cardTitle: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  ratingContainer: { flexDirection: 'row', marginVertical: 4 },
  cardSubtitle: { color: '#ccc', fontSize: 12, marginBottom: 4 },
  noResult: { textAlign: 'center', marginTop: 20, color: '#ccc', fontSize: 16 },
});
