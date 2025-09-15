import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function PlaceMoreDetails() {
  const router = useRouter();
  const { id, name, image, rating, type } = useLocalSearchParams();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#2E0740' }}>
    

      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        {/* Place Image */}
        <Image source={{ uri: image as string }} style={styles.placeImage} />

        {/* Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.placeName}>{name}</Text>

          {/* Rating */}
          <View style={styles.ratingContainer}>
            {Array.from({ length: Number(rating) }).map((_, i) => (
              <Ionicons key={i} name="star" size={18} color="#FFD700" />
            ))}
          </View>

          {/* <Text style={styles.placeType}>{type}</Text> */}

          <Text style={styles.description}>
            Nallur Kandaswamy Kovil, located in Jaffna, Sri Lanka, is a renowned Hindu
            temple dedicated to Lord Murugan. Built in the 15th century, it showcases
            stunning Dravidian architecture with intricate carvings and golden gopurams.
            The temple is famous for its grand annual festival, attracting thousands of
            devotees and tourists worldwide.
          </Text>

          <Text style={styles.subHeading}>Historical & Cultural Tourist</Text>
          <Text style={styles.timing}>Opentime = 08.00 am - 06.00 pm</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  placeImage: {
    width: '100%',
    height: 220,
    resizeMode: 'cover',
  },
  detailsCard: {
    padding: 16,
    backgroundColor: '#3A0A55',
    borderRadius: 12,
    margin: 16,
  },
  placeName: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  placeType: {
    color: '#E6C4FF',
    fontSize: 14,
    marginBottom: 10,
  },
  description: {
    color: '#ccc',
    fontSize: 12,
    lineHeight: 20,
    marginBottom: 14,
    textAlign: 'justify',
  },
  subHeading: {
    color: '#FFD700',
    fontWeight: '600',
    fontSize: 15,
  },
  timing: {
    color: 'white',
    fontSize: 13,
    marginTop: 5,
  },
});
