import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type DetailItem = {
  _id?: string;
  name?: string;
  title?: string;
  description?: string;
  image?: string;
  city?: string;
  language?: string;
  gender?: string;
  averageRating?: number;
  price?: number;
  category?: string;
  date?: string;
  location?: string;
};

const { width, height } = Dimensions.get('window');

export default function DetailsPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const type = String(params.type);
  const id = String(params.id);
  const age = params.age ? String(params.age) : null;

  const [item, setItem] = useState<DetailItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);

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

  // Get type-specific details
  const getTypeInfo = () => {
    switch (type) {
      case 'places':
        return { icon: 'location', label: 'Tourist Place', color: '#10B981' };
      case 'hotels':
        return { icon: 'bed', label: 'Hotel', color: '#3B82F6' };
      case 'events':
        return { icon: 'calendar', label: 'Event', color: '#F59E0B' };
      case 'guides':
        return { icon: 'person', label: 'Guide', color: '#8B5CF6' };
      default:
        return { icon: 'information-circle', label: 'Details', color: '#7C3AED' };
    }
  };

  const typeInfo = getTypeInfo();

  // Render star rating
  const renderStars = (rating: number = 0) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <Ionicons key={i} name="star" size={18} color="#FFD700" style={{ marginRight: 2 }} />
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <Ionicons key={i} name="star-half" size={18} color="#FFD700" style={{ marginRight: 2 }} />
        );
      } else {
        stars.push(
          <Ionicons key={i} name="star-outline" size={18} color="#D1D5DB" style={{ marginRight: 2 }} />
        );
      }
    }

    return (
      <View style={styles.ratingContainer}>
        <View style={styles.starsContainer}>{stars}</View>
        <Text style={styles.ratingText}>
          {rating > 0 ? rating.toFixed(1) : 'No rating'} 
          {rating > 0 && <Text style={styles.ratingCount}> (4.2k reviews)</Text>}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient colors={['#7C3AED', '#A855F7']} style={styles.loadingGradient}>
          <ActivityIndicator size="large" color="#fff" />
        </LinearGradient>
        <Text style={styles.loadingText}>Loading details...</Text>
      </View>
    );
  }

  if (!item) {
    return (
      <View style={styles.errorContainer}>
        <LinearGradient colors={['#EF4444', '#DC2626']} style={styles.errorGradient}>
          <Ionicons name="alert-circle" size={48} color="#fff" />
        </LinearGradient>
        <Text style={styles.errorText}>No details found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#7C3AED" />
      <Stack.Screen
        options={{
          headerStyle: { backgroundColor: '#7C3AED' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700', fontSize: 18 },
          headerTitle: item?.name || item?.title || 'Details',
        }}
      />

      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image Section */}
        <View style={styles.imageSection}>
          {item.image ? (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: item.image }}
                style={styles.image}
                resizeMode="cover"
                onLoadStart={() => setImageLoading(true)}
                onLoadEnd={() => setImageLoading(false)}
              />
              {imageLoading && (
                <View style={styles.imageLoadingOverlay}>
                  <ActivityIndicator size="large" color="#7C3AED" />
                </View>
              )}
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.3)']}
                style={styles.imageGradient}
              />
              
              {/* Type Badge */}
              <View style={styles.typeBadge}>
                <LinearGradient
                  colors={[typeInfo.color, `${typeInfo.color}CC`]}
                  style={styles.typeBadgeGradient}
                >
                  <Ionicons name={typeInfo.icon as any} size={14} color="#fff" />
                  <Text style={styles.typeBadgeText}>{typeInfo.label}</Text>
                </LinearGradient>
              </View>
            </View>
          ) : (
            <View style={styles.noImageContainer}>
              <LinearGradient
                colors={['#F3F4F6', '#E5E7EB']}
                style={styles.noImageGradient}
              >
                <Ionicons name="image-outline" size={64} color="#9CA3AF" />
                <Text style={styles.noImageText}>No Image Available</Text>
              </LinearGradient>
            </View>
          )}
        </View>

        {/* Content Section */}
        <View style={styles.contentContainer}>
          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>{item.name || item.title}</Text>
            {renderStars(item.averageRating)}
          </View>

          {/* Info Cards */}
          <View style={styles.infoCardsContainer}>
            {age && (
              <View style={styles.infoCard}>
                <LinearGradient
                  colors={['rgba(124, 58, 237, 0.1)', 'rgba(168, 85, 247, 0.05)']}
                  style={styles.infoCardGradient}
                >
                  <Ionicons name="time" size={18} color="#7C3AED" />
                  <Text style={styles.infoCardLabel}>Age</Text>
                  <Text style={styles.infoCardValue}>{age}</Text>
                </LinearGradient>
              </View>
            )}

            {item.city && (
              <View style={styles.infoCard}>
                <LinearGradient
                  colors={['rgba(16, 185, 129, 0.1)', 'rgba(5, 150, 105, 0.05)']}
                  style={styles.infoCardGradient}
                >
                  <Ionicons name="location" size={18} color="#10B981" />
                  <Text style={styles.infoCardLabel}>City</Text>
                  <Text style={styles.infoCardValue}>{item.city}</Text>
                </LinearGradient>
              </View>
            )}

            {item.language && (
              <View style={styles.infoCard}>
                <LinearGradient
                  colors={['rgba(59, 130, 246, 0.1)', 'rgba(37, 99, 235, 0.05)']}
                  style={styles.infoCardGradient}
                >
                  <Ionicons name="language" size={18} color="#3B82F6" />
                  <Text style={styles.infoCardLabel}>Language</Text>
                  <Text style={styles.infoCardValue}>{item.language}</Text>
                </LinearGradient>
              </View>
            )}

            {item.gender && (
              <View style={styles.infoCard}>
                <LinearGradient
                  colors={['rgba(245, 158, 11, 0.1)', 'rgba(217, 119, 6, 0.05)']}
                  style={styles.infoCardGradient}
                >
                  <Ionicons name="person" size={18} color="#F59E0B" />
                  <Text style={styles.infoCardLabel}>Gender</Text>
                  <Text style={styles.infoCardValue}>{item.gender}</Text>
                </LinearGradient>
              </View>
            )}
          </View>

          {/* Description Section */}
          {item.description && (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>About</Text>
              <View style={styles.descriptionCard}>
                <LinearGradient
                  colors={['#FFFFFF', '#F9FAFB']}
                  style={styles.descriptionGradient}
                >
                  <Text style={styles.descriptionText}>{item.description}</Text>
                </LinearGradient>
              </View>
            </View>
          )}

          
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  loadingGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#7C3AED',
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    padding: 20,
  },
  errorGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  imageSection: {
    position: 'relative',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 300,
  },
  imageLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  typeBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  typeBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  typeBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  noImageContainer: {
    height: 250,
  },
  noImageGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '500',
    marginTop: 12,
  },
  contentContainer: {
    padding: 20,
  },
  titleSection: {
    marginBottom: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 15,
    letterSpacing: -0.5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 12,
  },
  ratingText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
  },
  ratingCount: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '400',
  },
  infoCardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 30,
    gap: 12,
  },
  infoCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  infoCardGradient: {
    padding: 16,
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  infoCardLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 8,
  },
  infoCardValue: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '700',
    marginTop: 4,
  },
  descriptionSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 15,
    letterSpacing: -0.3,
  },
  descriptionCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  descriptionGradient: {
    padding: 20,
    borderRadius: 16,
  },
  descriptionText: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
    fontWeight: '400',
  },

  primaryButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  secondaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.2)',
  },
  secondaryButtonText: {
    color: '#7C3AED',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
});