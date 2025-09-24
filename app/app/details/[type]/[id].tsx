import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons'; // ⭐ Import icons

type DetailItem = {
  _id?: string;
  name?: string;
  title?: string;
  description?: string;
  image?: string;
  city?: string;
  language?: string;
  gender?: string;
  averageRating?: number; // 👈 added rating field
};

export default function DetailsPage() {
  const params = useLocalSearchParams();
  const type = String(params.type);
  const id = String(params.id);
  const age = params.age ? String(params.age) : null;

  const [item, setItem] = useState<DetailItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) return;

        const res = await fetch(`https://trips-api.tselven.com/api/${type}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);

        const data = await res.json();

        if (data.places && data.places.length > 0) setItem(data.places[0]);
        else if (data.hotels && data.hotels.length > 0) setItem(data.hotels[0]);
        else if (data.events && data.events.length > 0) setItem(data.events[0]);
        else setItem(data);
      } catch (err) {
        console.error('Details fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [type, id]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#fff" />;

  if (!item) return <Text style={{ color: '#fff', padding: 20 }}>No details found</Text>;

  // ⭐ Render star rating
  const renderStars = (rating: number = 0) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"} // filled or empty
          size={22}
          color="#FFD700" // gold color
          style={{ marginRight: 2 }}
        />
      );
    }
    return <View style={{ flexDirection: 'row', marginBottom: 10 }}>{stars}</View>;
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: item?.name || item?.title || 'Details',
        }}
      />

      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.image} />
        ) : (
          <View style={[styles.image, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#444' }]}>
            <Text style={{ color: '#ccc' }}>No Image Available</Text>
          </View>
        )}

        {/* Title */}
        <Text style={styles.title}>{item.name || item.title}</Text>

        {/* ⭐ Rating */}
        {renderStars(item.averageRating)}

        {/* Other Details */}
        {age && <Text style={styles.description}>Age: {age}</Text>}
        {item.description && <Text style={styles.description}>{item.description}</Text>}
        {item.city && <Text style={styles.description}>City: {item.city}</Text>}
        {item.language && <Text style={styles.description}>Language: {item.language}</Text>}
        {item.gender && <Text style={styles.description}>Gender: {item.gender}</Text>}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2E0740', padding: 20 },
  image: { width: '100%', height: 250, borderRadius: 10, marginBottom: 20 },
  title: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 10 },
  description: { fontSize: 16, color: '#ccc', marginBottom: 5 },
});
