import { View, StyleSheet, TextInput, FlatList, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

import React, { useState } from 'react';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<string[]>([]);

  // Dummy search function
  const handleSearch = (text: string) => {
    setQuery(text);
    const data = ['Flight', 'Hotel', 'Tour', 'Restaurant', 'Guide'];
    const filtered = data.filter(item =>
      item.toLowerCase().includes(text.toLowerCase())
    );
    setResults(filtered);
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.safeHeader}>
        <ThemedView style={styles.headerBar}>
          <ThemedText type="title" style={styles.headerTitle}>
           Search
          </ThemedText>
        </ThemedView>
      </SafeAreaView>

      {/* Search Input */}
      <ThemedView style={styles.searchWrapper}>
        <TextInput
          style={styles.searchInput}
          placeholder="Type to search..."
          placeholderTextColor="#ccc"
          value={query}
          onChangeText={handleSearch}
        />
      </ThemedView>

      {/* Results */}
      <FlatList
        data={results}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <ThemedView style={styles.resultItem}>
            <ThemedText style={styles.resultText}>{item}</ThemedText>
          </ThemedView>
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
    color: 'white',
  },
  headerBar: {
    width: '100%',
backgroundColor: '#2E0740',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  searchWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchInput: {
    backgroundColor: '#3A0A55',
    borderRadius: 8,
    padding: 12,
    color: 'white',
    fontSize: 16,
  },
  resultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#4B0E6C',
  },
  resultText: {
    color: 'white',
    fontSize: 16,
  },
  noResult: {
    textAlign: 'center',
    marginTop: 20,
    color: '#ccc',
    fontSize: 16,
  },
});
