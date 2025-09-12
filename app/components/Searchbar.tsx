import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SearchBar() {
  const [query, setQuery] = useState('');

  return (
    <View style={styles.searchContainer}>
      <Ionicons name="search" size={20} color="#f4efefff" style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder="Search..."
        placeholderTextColor="#f4efefff" // Visible on dark background
        value={query}
        onChangeText={setQuery}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3A0751',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 0,
    borderWidth: 1,
    borderColor: '#AD8787',
    width: 200,
    height: 48,
  },
  icon: {
    marginRight: 8,
    color: '#f4efefff',
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#f4efefff', // Text color same as icon for good contrast
    paddingVertical: 0, // Removes default vertical padding
  },
});
