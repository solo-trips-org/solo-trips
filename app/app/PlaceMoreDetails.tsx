import React from "react";
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";

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
    ? { uri: "https://cdn-icons-png.flaticon.com/512/149/149071.png" } // fallback guide image
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

  return (
    <>
      {/* Header with back button only */}
      <Stack.Screen
        options={{
          headerTitle: "",
          headerTransparent: true,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ padding: 15, marginBottom: 10 }}
            >
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>
          ),
        }}
      />

      <SafeAreaView style={{ flex: 1, backgroundColor: "#2E0740" }}>
        <ScrollView contentContainerStyle={styles.container}>
          {/* Image */}
          {imageSource && (
            <Image
              source={imageSource}
              style={isGuide ? styles.guideImage : styles.image}
            />
          )}

          {/* Title */}
          {name && <Text style={isGuide ? styles.guideTitle : styles.title}>{name}</Text>}

          {/* Rating */}
          {rating && (
            <View style={styles.ratingContainer}>
              {Array.from({ length: Number(rating) || 0 }).map((_, i) => (
                <Ionicons key={i} name="star" size={16} color="#FFD700" />
              ))}
            </View>
          )}

          {/* Type / Role */}
          {type && <Text style={isGuide ? styles.guideType : styles.type}>{type}</Text>}

          {/* Description */}
          {description && <Text style={isGuide ? styles.guideDescription : styles.description}>{description}</Text>}

          {/* Timing */}
          {timing && <Text style={styles.info}> Time -  {timing}</Text>}

          {/* Fees */}
          {parsedFees?.amount != null && (
            <Text style={styles.info}> Amount - {parsedFees.amount}</Text>
          )}

          {/* Phone, Gender, Languages – Guide Only */}
          {isGuide && (
            <View style={styles.guideDetails}>
              {phone && <Text style={styles.guideInfo}> {phone}</Text>}
              {gender && <Text style={styles.guideInfo}> {gender}</Text>}
              {parsedLanguages && <Text style={styles.guideInfo}> {parsedLanguages}</Text>}
            </View>
          )}

          {/* Address fields */}
          {parsedAddress.street && <Text style={styles.info}> Street: {parsedAddress.street}</Text>}
          {parsedAddress.city && <Text style={styles.info}>City: {parsedAddress.city}</Text>}
          {parsedAddress.state && <Text style={styles.info}> State: {parsedAddress.state}</Text>}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 100 },

  // Default styles
  image: { width: "100%", height: 200, borderRadius: 12, marginBottom: 16, marginTop: 50 },
  title: { fontSize: 22, fontWeight: "bold", color: "white", marginBottom: 8, marginTop: 20, marginLeft: 10 },
  type: { fontSize: 16, fontWeight: "600", color: "#E6C4FF", marginBottom: 8 },
  description: { fontSize: 14, color: "#ccc", marginBottom: 12 },
  info: { fontSize: 14, color: "#ccc", marginBottom: 6 },
  ratingContainer: { flexDirection: "row", marginBottom: 8 },

  // Guide-specific styles
  guideImage: { width: "80%", height: 220, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: "#c000ff",marginTop: 50, alignSelf: "center" },
  guideTitle: { fontSize: 24, fontWeight: "bold", color: "#f3f0e5ff", marginBottom: 8, marginTop: 20, marginLeft: 10 },
  guideType: { fontSize: 16, fontWeight: "700", color: "#d1d0ceff", marginBottom: 8 },
  guideDescription: { fontSize: 15, color: "#fff"},
  guideDetails: {  borderRadius: 10, marginVertical: 8 },
  guideInfo: { fontSize: 14, color: "#dddcd7ff", marginBottom: 4 },
});
