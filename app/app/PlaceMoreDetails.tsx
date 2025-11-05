import React from "react";
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Dimensions,
  StatusBar
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';

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
  } = useLocalSearchParams();

  // Safely parse fees
  let parsedFees: FeesType = {};
  try {
    parsedFees = typeof fees === "string" ? JSON.parse(fees) : (fees as FeesType);
  } catch (e) {
    parsedFees = {};
  }

  // Safely parse address
  let parsedAddress: AddressType = {};
  try {
    parsedAddress = typeof address === "string" ? JSON.parse(address) : (address as AddressType);
  } catch (e) {
    parsedAddress = {};
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

  const renderInfoCard = (icon: string, title: string, value: string, color = '#764ba2') => (
    <View style={styles.infoCard}>
      <View style={[styles.infoIconContainer, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <View style={styles.infoTextContainer}>
        <Text style={styles.infoLabel}>{title}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );

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
              {/* Content */}
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
                  {phone && renderInfoCard("call-outline", "Contact", Array.isArray(phone) ? phone[0] : phone, "#4facfe")}
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
              {(parsedAddress.street || parsedAddress.city || parsedAddress.state) && (
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
  header: {
    paddingBottom: 0,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  headerRight: {
    flexDirection: 'row',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
   
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
  actionSection: {
    marginTop: 10,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 15,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    paddingVertical: 14,
    borderRadius: 12,
    marginHorizontal: 5,
  },
  secondaryButtonText: {
    color: '#764ba2',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});