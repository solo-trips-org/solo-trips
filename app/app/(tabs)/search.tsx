import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import SafeArea from "@/components/SafeArea";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const categories = ["Places", "Hotels", "Event", "Guide"];

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Places");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [guideLanguage, setGuideLanguage] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const loadToken = async () => {
      const savedToken = await AsyncStorage.getItem("authToken");
      setToken(savedToken);
    };
    loadToken();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const loadLanguage = async () => {
        const lang = await AsyncStorage.getItem("guideLanguage");
        setGuideLanguage(lang);
      };
      loadLanguage();
    }, [])
  );

  useEffect(() => {
    if (!query || !token) {
      setResults([]);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `https://trips-api.tselven.com/api/search?q=${encodeURIComponent(
            query
          )}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = response.data.results || {};
        const categoryMap: Record<string, string> = {
          Places: "places",
          Hotels: "hotels",
          Event: "events",
          Guide: "guides",
        };

        let itemsArray: any[] = data[categoryMap[selectedCategory]] || [];

        // Filter guides by language
        if (selectedCategory === "Guide" && guideLanguage) {
          itemsArray = itemsArray.filter(
            (item) =>
              item.languages &&
              item.languages.some((lang: string) => lang === guideLanguage)
          );
        }

        // Ensure every item has an averageRating
        itemsArray = itemsArray.map((item) => ({
          ...item,
          averageRating: item.averageRating ?? 0,
        }));

        setResults(itemsArray);
      } catch (error: any) {
        console.error("❌ Search API error:", error);
        if (error.response?.status === 401) {
          Alert.alert(
            "Session expired",
            "Your login session has expired. Please login again."
          );
          router.push("/Login");
        }
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchData, 500);
    return () => clearTimeout(debounce);
  }, [query, selectedCategory, token, guideLanguage]);

  const fetchDetails = async (type: string, id: string) => {
    try {
      setDetailsLoading(true);
      const savedToken = await AsyncStorage.getItem("authToken");
      if (!savedToken) {
        Alert.alert("Error", "No auth token found. Please login again.");
        router.push("/Login");
        return null;
      }

      const typeMap: Record<string, string> = {
        places: "places",
        hotels: "hotels",
        event: "events",
        guide: "guides",
      };
      const apiType = typeMap[type] || type;

      const res = await fetch(
        `https://trips-api.tselven.com/api/${apiType}/${id}`,
        {
          headers: { Authorization: `Bearer ${savedToken}` },
        }
      );

      if (!res.ok) return null;
      const details = await res.json();
      return details;
    } catch (err) {
      console.error("❌ Fetch details error:", err);
      return null;
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleNavigate = async (item: any) => {
    const typeMap: Record<string, string> = {
      Places: "places",
      Hotels: "hotels",
      Event: "events",
      Guide: "guides",
    };
    const apiType =
      typeMap[selectedCategory] || selectedCategory.toLowerCase();
    await fetchDetails(apiType, item._id || item.id);

    let params: any = {};

    if (selectedCategory === "Places") {
      params = {
        id: item._id,
        name: item.name,
        image: item.image,
        description: item.description,
        type: item.category,
        address: item.address ? JSON.stringify(item.address) : "",
        timing: item.openingHours || "",
        fees: item.fees ? JSON.stringify(item.fees) : "",
        averageRating: String(item.averageRating ?? 0),
      };
    } else if (selectedCategory === "Hotels") {
      params = {
        id: item._id,
        name: item.name,
        image: item.image,
        description: item.description,
        type: item.type,
        address: item.address ? JSON.stringify(item.address) : "",
        averageRating: String(item.averageRating ?? 0),
      };
    } else if (selectedCategory === "Event") {
      params = {
        id: item._id,
        name: item.title,
        image: item.image,
        description: item.description,
        address: item.address ? JSON.stringify(item.address) : "",
        schedule: item.schedule ? JSON.stringify(item.schedule) : "",
        averageRating: String(item.averageRating ?? 0),
      };
    } else if (selectedCategory === "Guide") {
      params = {
        id: item._id,
        name: item.name,
        phone: item.phone,
        gender: item.gender,
        languages: item.languages ? JSON.stringify(item.languages) : "",
        address: item.address ? JSON.stringify(item.address) : "",
        image: item.image,
        description: "Licensed Guide",
        averageRating: String(item.averageRating ?? 0),
      };
    }

    router.push({ pathname: "/PlaceMoreDetails", params });
  };

  return (
    <SafeArea>
      <ThemedView style={{ flex: 1, backgroundColor: "#2E0740" }}>
        {/* Dismiss keyboard when tapping outside */}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={{ flex: 1 }}>
            {/* Header */}
            <View style={styles.headerBar}>
              <View style={styles.headerLogoContainer}>
                <Image
                  source={require("@/assets/images/logo1.png")}
                  style={styles.reactLogo}
                />
                <Text style={styles.headerTitle}>Traveler</Text>
              </View>
            </View>
            <View style={styles.headerLine} />

            {/* 🔑 KeyboardAvoidingView wraps ALL scroll content */}
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              style={{ flex: 1 }}
              keyboardVerticalOffset={80} // keep tab bar fixed
            >
              <ScrollView
                contentContainerStyle={{ paddingBottom: 100 }}
                keyboardShouldPersistTaps="handled"
              >
                {/* Search Input */}
                <View style={styles.searchWrapper}>
                  <View style={styles.searchInputWrapper}>
                    <Ionicons
                      name="search"
                      size={15}
                      color="#ccc"
                      style={{ marginHorizontal: 8 }}
                    />
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Search places, hotel, guide..."
                      placeholderTextColor="#ccc"
                      value={query}
                      onChangeText={(text) => setQuery(text)}
                    />
                  </View>
                </View>

                {/* Category Tabs */}
                <View style={styles.tabContainer}>
                  {categories.map((cat) => (
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

                {/* Results */}
                <View style={styles.cardList}>
                  {loading ? (
                    <ActivityIndicator
                      size="large"
                      color="#c000ff"
                      style={{ marginTop: 20 }}
                    />
                  ) : results.length > 0 ? (
                    results.map((item: any, index: number) => {
                      const rating = parseInt(
                        item.averageRating || "0",
                        10
                      );

                      return (
                        <TouchableOpacity
                          key={`${item._id}-${index}`}
                          style={styles.card}
                          onPress={() => handleNavigate(item)}
                        >
                          <Image
                            source={{ uri: item.image }}
                            style={styles.cardImage}
                          />
                          <View style={styles.cardContent}>
                            <Text style={styles.cardTitle}>
                              {item.name || item.title}
                            </Text>

                            {/* ⭐ Average Rating */}
                            <View style={styles.ratingContainer}>
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Ionicons
                                  key={i}
                                  name={i < rating ? "star" : "star-outline"}
                                  size={14}
                                  color="#FFD700"
                                />
                              ))}
                            </View>

                            <Text style={styles.cardSubtitle}>
                              {item.phone || item.category || ""}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })
                  ) : (
                    query && (
                      <ThemedText style={styles.noResult}>
                        No results found
                      </ThemedText>
                    )
                  )}
                </View>
              </ScrollView>
            </KeyboardAvoidingView>

            {detailsLoading && (
              <ActivityIndicator
                size="large"
                color="#c000ff"
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: [{ translateX: -20 }, { translateY: -20 }],
                }}
              />
            )}
          </View>
        </TouchableWithoutFeedback>
      </ThemedView>
    </SafeArea>
  );
}

const styles = StyleSheet.create({
  safeHeader: { top: 5 },
  headerLogoContainer: { flexDirection: "row", alignItems: "center", gap: 1 },
  reactLogo: {
    height: 50,
    width: 50,
    resizeMode: "contain",
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
    marginLeft: 2,
  },
  headerBar: {
    width: "100%",
    height: 75,
    backgroundColor: "#2E0740",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 5,
  },
  headerLine: { height: 1, backgroundColor: "#c000ff", width: "100%" },
  searchWrapper: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 8,
    width: "80%",
    marginLeft: 35,
    top: 10,
  },
  searchInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3A0A55",
    borderRadius: 50,
    borderWidth: 0.5,
    borderColor: "#c000ff",
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    width: 210,
    color: "white",
    fontSize: 14,
    paddingVertical: 10,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginHorizontal: 16,
    backgroundColor: "#3A0A55",
    borderRadius: 10,
    padding: 6,
    marginBottom: 12,
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 0.4,
    borderColor: "#c000ff",
    backgroundColor: "transparent",
  },
  activeTab: { backgroundColor: "#E6C4FF" },
  tabText: { color: "#ccc", fontSize: 14 },
  activeTabText: { color: "#2E0740", fontWeight: "600" },
  cardList: { paddingHorizontal: 20 },
  card: {
    flexDirection: "row",
    backgroundColor: "#3A0A55",
    borderRadius: 10,
    marginBottom: 16,
    overflow: "hidden",
  },
  cardImage: { width: 90, height: 90, resizeMode: "cover" },
  cardContent: { flex: 1, padding: 10, justifyContent: "center" },
  cardTitle: { color: "white", fontSize: 16, fontWeight: "bold" },
  ratingContainer: { flexDirection: "row", marginVertical: 4 },
  cardSubtitle: { color: "#ccc", fontSize: 12, marginBottom: 4 },
  noResult: { textAlign: "center", marginTop: 20, color: "#ccc", fontSize: 16 },
});
