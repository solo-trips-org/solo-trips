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
  Dimensions,
  StatusBar,
} from "react-native";
import SafeArea from "@/components/SafeArea";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');
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

  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, string> = {
      Places: "location",
      Hotels: "bed",
      Event: "calendar",
      Guide: "person",
    };
    return iconMap[category] || "search";
  };

  return (
    <SafeArea>
      <StatusBar barStyle="light-content" backgroundColor="#7C3AED" />

      {/* Gradient Header */}
      <LinearGradient
        colors={['#3A0751', "#7C3AED", '#3A0751']}
        style={styles.gradientHeader}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Decorative Background Elements */}
        <View style={styles.headerBackground}>
          <View style={[styles.decorativeCircle, styles.circle1]} />
          <View style={[styles.decorativeCircle, styles.circle2]} />
        </View>

        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.logoContainer}>
              <Image
                source={require("@/assets/images/logo1.png")}
                style={styles.logo}
              />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Search & Discover</Text>
              <Text style={styles.headerSubtitle}>Find amazing places around you</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.container}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.innerContainer}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              style={styles.keyboardView}
              keyboardVerticalOffset={80}
            >
              {/* Search Section */}
              <View style={styles.searchSection}>
                <View style={styles.searchContainer}>
                  <View style={styles.searchInputContainer}>
                    <Ionicons name="search" size={20} color="#7C3AED" style={styles.searchIcon} />
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Search places, hotels, guides..."
                      placeholderTextColor="#999"
                      value={query}
                      onChangeText={(text) => setQuery(text)}
                    />
                    {query ? (
                      <TouchableOpacity onPress={() => setQuery("")} style={styles.clearButton}>
                        <Ionicons name="close-circle" size={20} color="#ccc" />
                      </TouchableOpacity>
                    ) : null}
                  </View>
                </View>

                {/* Modern Category Tabs */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.categoryScrollContainer}
                >
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setSelectedCategory(cat)}
                      style={[
                        styles.categoryTab,
                        selectedCategory === cat && styles.activeCategoryTab,
                      ]}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={getCategoryIcon(cat) as any}
                        size={18}
                        color={selectedCategory === cat ? "#fff" : "#7C3AED"}
                        style={styles.categoryIcon}
                      />
                      <Text
                        style={[
                          styles.categoryText,
                          selectedCategory === cat && styles.activeCategoryText,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Results Section */}
              <View style={styles.resultsSection}>
                <ScrollView
                  style={styles.scrollView}
                  contentContainerStyle={styles.scrollContent}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                >
                  {loading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="large" color="#7C3AED" />
                      <Text style={styles.loadingText}>Searching...</Text>
                    </View>
                  ) : results.length > 0 ? (
                    <View style={styles.resultsContainer}>
                      <Text style={styles.resultsHeader}>
                        Found {results.length} {selectedCategory.toLowerCase()}
                      </Text>
                      {results.map((item: any, index: number) => {
                        const rating = parseInt(item.averageRating || "0", 10);

                        return (
                          <TouchableOpacity
                            key={`${item._id}-${index}`}
                            style={styles.resultCard}
                            onPress={() => handleNavigate(item)}
                            activeOpacity={0.9}
                          >
                            <View style={styles.cardImageContainer}>
                              <Image
                                source={{ uri: item.image }}
                                style={styles.cardImage}
                                resizeMode="cover"
                              />
                              <View style={styles.categoryBadge}>
                                <Ionicons
                                  name={getCategoryIcon(selectedCategory) as any}
                                  size={12}
                                  color="#fff"
                                />
                              </View>
                            </View>

                            <View style={styles.cardContent}>
                              <Text style={styles.cardTitle} numberOfLines={2}>
                                {item.name || item.title}
                              </Text>

                              {/* Rating Stars */}
                              <View style={styles.ratingContainer}>
                                <View style={styles.starsContainer}>
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Ionicons
                                      key={i}
                                      name={i < rating ? "star" : "star-outline"}
                                      size={14}
                                      color="#FFD700"
                                    />
                                  ))}
                                </View>
                                <Text style={styles.ratingText}>
                                  {rating > 0 ? `${rating}.0` : "No rating"}
                                </Text>
                              </View>

                              <Text style={styles.cardSubtitle} numberOfLines={1}>
                                {item.phone || item.category || item.type || ""}
                              </Text>

                              <View style={styles.cardFooter}>
                                <Ionicons name="chevron-forward" size={16} color="#7C3AED" />
                              </View>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  ) : query ? (
                    <View style={styles.emptyStateContainer}>
                      <Ionicons name="search-outline" size={64} color="#ccc" />
                      <Text style={styles.emptyStateTitle}>No Results Found</Text>
                      <Text style={styles.emptyStateText}>
                        Try searching with different keywords or check another category
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.initialStateContainer}>
                      <Ionicons name="compass-outline" size={64} color="#7C3AED" />
                      <Text style={styles.initialStateTitle}>Start Your Search</Text>
                      <Text style={styles.initialStateText}>
                        Type in the search box above to discover amazing places, hotels, events, and guides
                      </Text>
                    </View>
                  )}
                </ScrollView>
              </View>
            </KeyboardAvoidingView>

            {/* Loading Overlay */}
            {detailsLoading && (
              <View style={styles.loadingOverlay}>
                <View style={styles.loadingModalContainer}>
                  <ActivityIndicator size="large" color="#7C3AED" />
                  <Text style={styles.loadingModalText}>Loading details...</Text>
                </View>
              </View>
            )}
          </View>
        </TouchableWithoutFeedback>
      </View>
    </SafeArea>
  );
}

const styles = StyleSheet.create({
  gradientHeader: {
    position: 'relative',
    overflow: 'hidden',
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  decorativeCircle: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 100,
  },
  circle1: {
    width: 100,
    height: 100,
    top: -30,
    right: -20,
  },
  circle2: {
    width: 70,
    height: 70,
    top: 20,
    left: -15,
    opacity: 0.6,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 20,
    position: 'relative',
    zIndex: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  logo: {
    width: 52,
    height: 52,
    resizeMode: 'contain',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '400',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  innerContainer: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  searchSection: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 15,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#2d3436',
  },
  clearButton: {
    padding: 5,
  },
  categoryScrollContainer: {
    paddingRight: 20,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 25,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  activeCategoryTab: {
    backgroundColor: "#7C3AED",
  },
  categoryIcon: {
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: "#7C3AED",
  },
  activeCategoryText: {
    color: '#fff',
  },
  resultsSection: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#764ba2',
    fontWeight: '500',
  },
  resultsContainer: {
    paddingHorizontal: 15,
    paddingTop: 20,
  },
  resultsHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2d3436',
    marginBottom: 20,
  },
  resultCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardImageContainer: {
    position: 'relative',
  },
  cardImage: {
    width: 130,
    height: 130,
  },
  categoryBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(102, 126, 234, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2d3436',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 12,
    color: '#636e72',
    fontWeight: '500',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#636e72',
    marginBottom: 8,
  },
  cardFooter: {
    alignItems: 'flex-end',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 80,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#636e72',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#b2bec3',
    textAlign: 'center',
    lineHeight: 22,
  },
  initialStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 80,
  },
  initialStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: "#7C3AED",
    marginTop: 20,
    marginBottom: 8,
  },
  initialStateText: {
    fontSize: 16,
    color: '#636e72',
    textAlign: 'center',
    lineHeight: 22,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingModalContainer: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  loadingModalText: {
    marginTop: 15,
    fontSize: 16,
    color: '#2d3436',
    fontWeight: '500',
  },
});