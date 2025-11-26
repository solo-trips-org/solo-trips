import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Alert,
  Linking,
  Platform
} from "react-native";
import Clipboard from '@react-native-clipboard/clipboard';
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';
import MapComponent from "@/components/MapComponent";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get('window');

type FeesType = {
  amount?: number | string;
  currency?: string;
  required?: boolean;
  notes?: string;
};

type AddressType = {
  street?: string;
  city?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
};

type LocationType = {
  type?: string;
  coordinates?: [number, number]; // [longitude, latitude]
};

export default function PlaceMoreDetails() {
  const router = useRouter();
  const {
    id,
    name,
    image,
    rating,
    type,
    description,
    timing,
    address,
    fees,
    schedule,
    phone,
    gender,
    languages,
    location
  } = useLocalSearchParams();

  const [placeDetails, setPlaceDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Safely parse fees
  let parsedFees: FeesType = {};
  try {
    parsedFees = typeof fees === "string" ? JSON.parse(fees) : (fees as FeesType);
  } catch (e) {
    console.log("⚠️ Could not parse fees:", e);
    parsedFees = {};
  }

  // Safely parse address
  let parsedAddress: AddressType = {};
  try {
    parsedAddress = typeof address === "string" ? JSON.parse(address) : (address as AddressType);
  } catch (e) {
    console.log("⚠️ Could not parse address:", e);
    parsedAddress = {};
  }

  // Safely parse location
  let parsedLocation: LocationType = {};
  try {
    parsedLocation = typeof location === "string" ? JSON.parse(location) : (location as LocationType);
  } catch (e) {
    console.log("⚠️ Could not parse location:", e);
    parsedLocation = {};
  }

  // Detect if it's a Guide
  const isGuide = !!phone || !!gender || !!languages;

  // Determine image source with fallback for Guide
  const imageSource = image
    ? { uri: Array.isArray(image) ? image[0] : image }
    : isGuide
    ? { uri: "https://cdn-icons-png.flaticon.com/512/149/149071.png" }
    : undefined;

  // Parse languages nicely
  let parsedLanguages: string | undefined;
  if (languages) {
    try {
      let langs = typeof languages === "string" ? JSON.parse(languages) : languages;
      if (Array.isArray(langs)) {
        parsedLanguages = langs.join(", ");
      } else {
        parsedLanguages = langs;
      }
    } catch (e) {
      parsedLanguages = languages as string;
    }
  }

  const renderInfoCard = (icon: string, title: string, value: string, color = '#764ba2', onPress?: () => void) => (
    <TouchableOpacity 
      style={styles.infoCard}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View style={[styles.infoIconContainer, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <View style={styles.infoTextContainer}>
        <Text style={styles.infoLabel}>{title}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
      {onPress && (
        <Ionicons name="chevron-forward" size={20} color={color} style={{ marginLeft: 8 }} />
      )}
    </TouchableOpacity>
  );

  // Fetch full place details including location data
  useEffect(() => {
    const fetchPlaceDetails = async () => {
      if (!id) {
        console.log("⚠️ No ID provided");
        setLoading(false);
        return;
      }

      try {
        console.log("📡 Fetching place details for ID:", id);
        
        const token = await AsyncStorage.getItem("authToken");
        if (!token) {
          console.error("❌ No auth token found");
          Alert.alert(
            "Authentication Required",
            "Please login to view place details.",
            [
              {
                text: "OK",
                onPress: () => router.push("/Login")
              }
            ]
          );
          return;
        }

        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

        const response = await fetch(
          `https://trips-api.tselven.com/api/places/${id}`,
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            signal: controller.signal
          }
        );

        clearTimeout(timeoutId);

        console.log("📡 Response status:", response.status);

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Authentication failed. Please login again.");
          } else if (response.status === 404) {
            // Don't throw error for 404, just log it and continue with params data
            console.log("⚠️ Place not found in database, using parameter data only");
            setPlaceDetails(null);
            setError(null);
            setLoading(false);
            return;
          } else {
            throw new Error(`Server error: ${response.status}`);
          }
        }

        const data = await response.json();
        console.log("✅ Place details fetched successfully");
        console.log("📍 Location data:", data.location);
        
        setPlaceDetails(data);
        setError(null);
      } catch (error: any) {
        console.error("❌ Error fetching place details:", error.message);
        
        if (error.name === 'AbortError') {
          console.log("⚠️ Request timeout, continuing with parameter data");
          setPlaceDetails(null);
          setError(null);
        } else if (error.message.includes("Authentication")) {
          Alert.alert(
            "Session Expired",
            "Your login session has expired. Please login again.",
            [
              {
                text: "OK",
                onPress: () => router.push("/Login")
              }
            ]
          );
        } else {
          // For other errors, continue with parameter data
          console.log("⚠️ Continuing with parameter data only");
          setPlaceDetails(null);
          setError(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPlaceDetails();
  }, [id]);

  // Extract latitude and longitude from place details or parsed location
  const getCoordinatesFromPlace = () => {
    // First, try to get from fetched place details
    if (placeDetails?.location?.coordinates) {
      // GeoJSON format: [longitude, latitude]
      console.log("📍 Using coordinates from place details:", placeDetails.location.coordinates);
      return {
        latitude: placeDetails.location.coordinates[1],
        longitude: placeDetails.location.coordinates[0]
      };
    }
    
    // Second, try parsed location from params
    if (parsedLocation?.coordinates && Array.isArray(parsedLocation.coordinates)) {
      console.log("📍 Using coordinates from params location:", parsedLocation.coordinates);
      return {
        latitude: parsedLocation.coordinates[1],
        longitude: parsedLocation.coordinates[0]
      };
    }
    
    // Third, try parsed address if available
    if (parsedAddress?.latitude && parsedAddress?.longitude) {
      console.log("📍 Using coordinates from address:", parsedAddress);
      return {
        latitude: parseFloat(String(parsedAddress.latitude)),
        longitude: parseFloat(String(parsedAddress.longitude))
      };
    }
    
    // Default to Colombo, Sri Lanka coordinates
    console.log("⚠️ Using default coordinates (Colombo, Sri Lanka)");
    return {
      latitude: 6.9271,
      longitude: 79.8612
    };
  };

  const { latitude, longitude } = getCoordinatesFromPlace();
  
  // Format address for display
  const formatAddress = () => {
    if (!address) return '';
    try {
      const addr = typeof address === "string" ? JSON.parse(address) : address;
      return [addr.street, addr.city, addr.state].filter(Boolean).join(', ');
    } catch (e) {
      return address as string;
    }
  };

  const formattedAddress = formatAddress();

  // Handle phone call
  const handlePhoneCall = async (phoneNumber: string) => {
    const phoneNum = Array.isArray(phoneNumber) ? phoneNumber[0] : phoneNumber;
    // Remove any spaces, dashes, or special characters except +
    const cleanPhone = phoneNum.replace(/[^\d+]/g, '');
    
    const phoneUrl = Platform.OS === 'ios' ? `telprompt:${cleanPhone}` : `tel:${cleanPhone}`;
    
    try {
      const supported = await Linking.canOpenURL(phoneUrl);
      
      if (supported) {
        await Linking.openURL(phoneUrl);
      } else {
        // Show alert with phone number - simple version without clipboard
        Alert.alert(
          'Contact Number',
          `📞 ${phoneNum}\n\nPhone dialer is not available on this device.\n\nThis happens on emulators/simulators. Please test on a physical device to make calls.`,
          [
            {
              text: 'OK'
            }
          ]
        );
      }
    } catch (err) {
      console.error('Error opening phone dialer:', err);
      // Show the phone number in an alert as fallback
      Alert.alert(
        'Contact Number',
        `📞 ${phoneNum}\n\nUnable to open phone dialer. Please note this number.`,
        [{ text: 'OK' }]
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.loadingText}>Loading place details...</Text>
      </View>
    );
  }

  // Remove the error screen - now we show data even if API fails
  // if (error) { ... }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#7C3AED" />
      
      {/* Custom Header with Place Name */}
      <Stack.Screen
        options={{
          headerShown: true,
          title: name ? (Array.isArray(name) ? name[0] : name) : "Place Details",
          headerStyle: {
            backgroundColor: '#7C3AED',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
          },
          headerBackTitle: '',
        }}
      />

      <View style={styles.container}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Image Section */}
          {imageSource && (
            <View style={styles.imageSection}>
              <Image
                source={imageSource}
                style={isGuide ? styles.guideImage : styles.image}
                resizeMode="cover"
              />
              {isGuide && (
                <View style={styles.guideBadge}>
                  <LinearGradient colors={['#667eea', '#764ba2']} style={styles.guideBadgeGradient}>
                    <Ionicons name="person" size={16} color="#fff" />
                    <Text style={styles.guideBadgeText}>Guide</Text>
                  </LinearGradient>
                </View>
              )}
            </View>
          )}

          {/* Main Content Card */}
          <View style={styles.contentCard}>
            {/* Title Section */}
            <View style={styles.titleSection}>
              {name && (
                <Text style={styles.title} numberOfLines={2}>
                  {name}
                </Text>
              )}
              
              {type && (
                <View style={styles.typeContainer}>
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeText}>{type}</Text>
                  </View>
                </View>
              )}

              {/* Rating */}
              {rating && (
                <View style={styles.ratingSection}>
                  <View style={styles.starsContainer}>
                    {Array.from({ length: Number(rating) || 0 }).map((_, i) => (
                      <Ionicons key={i} name="star" size={18} color="#FFD700" />
                    ))}
                    {Array.from({ length: 5 - (Number(rating) || 0) }).map((_, i) => (
                      <Ionicons key={i + (Number(rating) || 0)} name="star-outline" size={18} color="#ddd" />
                    ))}
                  </View>
                  <Text style={styles.ratingText}>
                    {rating} out of 5
                  </Text>
                </View>
              )}
            </View>

            {/* Description */}
            {description && (
              <View style={styles.descriptionSection}>
                <Text style={styles.sectionTitle}>About</Text>
                <Text style={styles.description}>{description}</Text>
              </View>
            )}

            {/* Information Cards */}
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Information</Text>
              
              {/* Timing */}
              {timing && renderInfoCard("time-outline", "Opening Hours", Array.isArray(timing) ? timing[0] : timing)}
              
              {/* Fees */}
              {parsedFees?.amount != null && renderInfoCard(
                "card-outline", 
                "Entry Fee", 
                `${parsedFees.currency || ""}${parsedFees.amount}`,
                "#43e97b"
              )}

              {/* Guide-specific information */}
              {isGuide && (
                <View style={styles.guideInfoSection}>
                  {phone && renderInfoCard(
                    "call-outline", 
                    "Contact", 
                    Array.isArray(phone) ? phone[0] : phone, 
                    "#4facfe",
                    () => handlePhoneCall(Array.isArray(phone) ? phone[0] : phone)
                  )}
                  {gender && renderInfoCard("person-outline", "Gender", Array.isArray(gender) ? gender[0] : gender, "#f093fb")}
                  {parsedLanguages && renderInfoCard(
                    "language-outline", 
                    "Languages", 
                    parsedLanguages,
                    "#667eea"
                  )}
                </View>
              )}

              {/* Address Information */}
              {(parsedAddress.street || parsedAddress.city || parsedAddress.state || formattedAddress) && (
                <View style={styles.addressSection}>
                  <View style={styles.addressHeader}>
                    <Ionicons name="location-outline" size={20} color="#667eea" />
                    <Text style={styles.sectionTitle}>Address</Text>
                  </View>
                  <View style={styles.addressCard}>
                    {parsedAddress.street && (
                      <Text style={styles.addressText}>{parsedAddress.street}</Text>
                    )}
                    {parsedAddress.city && (
                      <Text style={styles.addressText}>{parsedAddress.city}</Text>
                    )}
                    {parsedAddress.state && (
                      <Text style={styles.addressText}>{parsedAddress.state}</Text>
                    )}
                    {!parsedAddress.street && !parsedAddress.city && !parsedAddress.state && formattedAddress && (
                      <Text style={styles.addressText}>{formattedAddress}</Text>
                    )}
                  </View>
                  
                  {/* Map Component - Always show with available coordinates */}
                  <View style={styles.mapContainer}>
                    <MapComponent 
                      latitude={latitude}
                      longitude={longitude}
                      address={formattedAddress || "Location"}
                      placeName={Array.isArray(name) ? name[0] : name || "Place"}
                    />
                    {latitude === 6.9271 && longitude === 79.8612 && (
                      <View style={styles.mapWarning}>
                        <Ionicons name="information-circle" size={16} color="#ff9800" />
                        <Text style={styles.mapWarningText}>
                          Showing approximate location (Colombo)
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  imageSection: {
    position: 'relative',
    marginHorizontal: 20,
    marginTop: 5,
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  guideImage: {
    width: '100%',
    height: 280,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  guideBadge: {
    position: 'absolute',
    top: 2,
    right: 15,
    borderRadius: 20,
    overflow: 'hidden',
  },
  guideBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  guideBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  contentCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    top: 30,
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  titleSection: {
    marginBottom: 25,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2d3436',
    marginBottom: 12,
    lineHeight: 32,
  },
  typeContainer: {
    marginBottom: 15,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#667eea20',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  typeText: {
    color: '#764ba2',
    fontSize: 14,
    fontWeight: '600',
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 10,
  },
  ratingText: {
    fontSize: 14,
    color: '#636e72',
    fontWeight: '500',
  },
  descriptionSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d3436',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: '#636e72',
    lineHeight: 24,
  },
  infoSection: {
    marginBottom: 25,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  infoIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#636e72',
    fontWeight: '500',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#2d3436',
    fontWeight: '600',
  },
  guideInfoSection: {
    marginTop: 10,
  },
  addressSection: {
    marginTop: 20,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  addressCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 16,
  },
  addressText: {
    fontSize: 16,
    color: '#2d3436',
    fontWeight: '500',
    marginBottom: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#636e72',
  },
  mapContainer: {
    marginTop: 15,
  },
  mapWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  mapWarningText: {
    fontSize: 13,
    color: '#856404',
    marginLeft: 8,
    flex: 1,
  },
});