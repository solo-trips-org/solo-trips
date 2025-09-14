import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EventDetailsScreen({ route }: any) {
  const { event } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <Image source={event.image} style={styles.image} />
      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.text}>Type: {event.type}</Text>
      <Text style={styles.text}>More details coming soon...</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2E0740',
    padding: 16,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 6,
  },
});
