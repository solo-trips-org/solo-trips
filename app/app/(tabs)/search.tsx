import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';

const categories = ['Places', 'Hotels', 'Event', 'All'];

const dummyPlaces = [
  {
    id: '1',
    name: 'Nallur',
    rating: 3,
    type: 'Historical & Cultural Tourist',
    image: require('@/assets/images/nallur.png'), // Use your image here
  },
  {
    id: '2',
    name: 'JaffnaFort',
    rating: 2,
    type: 'Historical & Cultural Tourist',
    image: require('@/assets/images/jaffna.png'),
  },
  {
    id: '3',
    name: 'Nallur',
    rating: 2,
    type: 'Historical & Cultural Tourist',
    image: require('@/assets/images/nallur.png'),
  },
];

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Places');

  const handleSearch = (text: string) => {
    setQuery(text);
    // Optional: Filter results based on query
  };

  const filteredPlaces = dummyPlaces.filter(place =>
    place.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <ThemedView style={{ flex: 1, backgroundColor: '#2E0740' }}>
      <SafeAreaView edges={['top']} style={styles.safeHeader}>
        <ThemedView style={styles.headerBar}>
          <ThemedText type="title" style={styles.headerTitle}>
            Traveler
          </ThemedText>
        </ThemedView>
      </SafeAreaView>

      {/* Search Input */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchInputWrapper}>
          <Ionicons name="search" size={20} color="#ccc" style={{ marginHorizontal: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search places, hotel..."
            placeholderTextColor="#ccc"
            value={query}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      {/* Category Tabs */}
      <View style={styles.tabContainer}>
        {categories.map(cat => (
          <TouchableOpacity
            key={cat}
            onPress={() => setSelectedCategory(cat)}
            style={[
              styles.tab,
              selectedCategory === cat && styles.activeTab,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                selectedCategory === cat && styles.activeTabText,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recommended List */}
      <FlatList
        data={filteredPlaces}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={item.image} style={styles.cardImage} />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <View style={styles.ratingContainer}>
                {Array.from({ length: item.rating }).map((_, i) => (
                  <Ionicons key={i} name="star" size={14} color="#FFD700" />
                ))}
              </View>
              <Text style={styles.cardSubtitle}>{item.type}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          query ? (
            <ThemedText style={styles.noResult}>No results found</ThemedText>
          ) : null
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  safeHeader: {
    top: 5,
  },
  headerBar: {
    width: '100%',
    backgroundColor: '#2E0740',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  searchWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3A0A55',
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    height: 45,
    color: 'white',
    fontSize: 16,
    paddingVertical: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 16,
    backgroundColor: '#3A0A55',
    borderRadius: 10,
    padding: 6,
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#E6C4FF',
  },
  tabText: {
    color: '#ccc',
    fontSize: 14,
  },
  activeTabText: {
    color: '#2E0740',
    fontWeight: '600',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#3A0A55',
    borderRadius: 10,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardImage: {
    width: 80,
    height: 80,
    resizeMode: 'cover',
  },
  cardContent: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
  },
  cardTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  cardSubtitle: {
    color: '#ccc',
    fontSize: 12,
  },
  noResult: {
    textAlign: 'center',
    marginTop: 20,
    color: '#ccc',
    fontSize: 16,
  },
});
