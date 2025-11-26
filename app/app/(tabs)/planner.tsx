import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Image,
  Alert,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome5 } from "@expo/vector-icons";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import HistoryDrawer from "@/app/HistoryDrawer";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const API_BASE_URL = "https://trips-api.tselven.com/api";

// Transport modes with capacity limits
const TRANSPORT_MODES = [
  { id: "bike", label: "Bike", icon: "motorcycle", capacity: { min: 1, max: 2, recommended: 1 } },
  { id: "threewheeler", label: "Three-Wheeler", icon: "taxi", capacity: { min: 1, max: 3, recommended: 3 } },
  { id: "car", label: "Car", icon: "car", capacity: { min: 1, max: 6, recommended: 4 } },
  { id: "bus", label: "Bus", icon: "bus", capacity: { min: 7, max: 50, recommended: 15 } },
];

// Types
// ---------------------------
interface Place {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  address?: any;
}

interface Event {
  _id: string;
  name: string;
  title?: string;
  description?: string;
  image?: string;
  date?: string;
}

interface Hotel {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  price?: number;
  priceRange?: string;
}

interface TimeSlot {
  place: {
    id: string;
    name: string;
    description: string;
    image?: string;
    address?: any;
    averageRating?: number;
    category?: string;
  };
  hotel: {
    id: string;
    name: string;
    description: string;
    image?: string;
    address?: any;
    averageRating?: number;
    priceRange?: string;
  } | null;
  events: Array<{
    id: string;
    title: string;
    description: string;
    image?: string;
    address?: any;
    schedule?: any;
    averageRating?: number;
  }>;
}

interface DayAgenda {
  day: number;
  date: string | null;
  agenda: {
    morning: TimeSlot | null;
    afternoon: TimeSlot | null;
    evening: TimeSlot | null;
  };
}

interface TripData {
  success: boolean;
  days: DayAgenda[];
  createdAt?: string;
}

// ---------------------------
// PlannerScreen
// ---------------------------
export default function PlannerScreen() {
  const insets = useSafeAreaInsets();
  const [wayPoints, setWayPoints] = useState<string[]>([]);
  const [members, setMembers] = useState("1");
  const [transportMode, setTransportMode] = useState("bike");
  const [places, setPlaces] = useState<Place[]>([]);
  const [filteredPlaces, setFilteredPlaces] = useState<Place[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [tripResults, setTripResults] = useState<TripData | null>(null);
  const [loading, setLoading] = useState(false);

  const [startDate, setStartDate] = useState(startOfDay(new Date()));
  const [endDate, setEndDate] = useState(startOfDay(new Date(Date.now() + 86400000)));

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [historyVisible, setHistoryVisible] = useState(false);

  // ---------------------------
  // Helpers
  // ---------------------------
  function startOfDay(d: Date) {
    const dt = new Date(d);
    dt.setHours(0, 0, 0, 0);
    return dt;
  }

  const getPlaceName = (placeId: string) =>
    places.find((p) => p._id === placeId)?.name || placeId;

  const getPlaceDetails = (placeId: string) =>
    places.find((p) => p._id === placeId);

  const calculateDays = () => {
    const start = startOfDay(startDate);
    const end = startOfDay(endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays);
  };

  // Get capacity info for current transport mode
  const getCurrentCapacity = () => {
    return TRANSPORT_MODES.find(m => m.id === transportMode)?.capacity || { min: 1, max: 50, recommended: 4 };
  };

  // Auto-suggest transport based on number of travelers with visual feedback
  useEffect(() => {
    const count = parseInt(members, 10);
    if (count && count > 0) {
      let suggestedMode = transportMode;
      
      if (count === 1) {
        suggestedMode = "bike";
      } else if (count >= 2 && count <= 3) {
        suggestedMode = "threewheeler";
      } else if (count >= 4 && count <= 6) {
        suggestedMode = "car";
      } else if (count >= 7) {
        suggestedMode = "bus";
      }
      
      // Only update if suggestion is different from current mode
      if (suggestedMode !== transportMode) {
        setTransportMode(suggestedMode);
        
        // Show a brief notification
        const modeName = TRANSPORT_MODES.find(m => m.id === suggestedMode)?.label;
        Alert.alert(
          "🚗 Transport Suggestion",
          `For ${count} traveler${count > 1 ? 's' : ''}, we recommend: ${modeName}`,
          [{ text: "OK" }],
          { cancelable: true }
        );
      }
    }
  }, [members]);

  // Update traveler count when transport mode is manually changed
  const handleTransportChange = (newMode: string) => {
    const selectedTransport = TRANSPORT_MODES.find(m => m.id === newMode);
    if (selectedTransport) {
      setTransportMode(newMode);
      // Set to recommended capacity for that transport
      setMembers(String(selectedTransport.capacity.recommended));
    }
  };

  // Validate traveler count against transport capacity with auto-switching
  const handleMembersChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, "");
    
    // Allow empty input
    if (numericValue === "") {
      setMembers("");
      return;
    }
    
    const count = parseInt(numericValue, 10);
    const capacity = getCurrentCapacity();

    if (count > capacity.max) {
      // Auto-switch to appropriate transport
      if (count >= 7) {
        setTransportMode("bus");
        setMembers(numericValue);
        Alert.alert(
          "🚌 Transport Auto-Switched",
          `Switched to Bus for ${count} travelers!`
        );
      } else {
        Alert.alert(
          "Capacity Exceeded",
          `${TRANSPORT_MODES.find(m => m.id === transportMode)?.label} can accommodate maximum ${capacity.max} travelers.`
        );
        setMembers(String(capacity.max));
      }
    } else {
      setMembers(numericValue);
    }
  };

  // ---------------------------
  // Fetch Data
  // ---------------------------
  useEffect(() => {
    fetchPlaces();
  }, []);

  const fetchPlaces = async () => {
    try {
      setPlacesLoading(true);
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Authentication Required", "Please login to continue.");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/places`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch places");

      const data = await res.json();
      const placesData = Array.isArray(data.data) ? data.data : [];
      setPlaces(placesData);
      setFilteredPlaces(placesData);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to load places.");
      setPlaces([]);
      setFilteredPlaces([]);
    } finally {
      setPlacesLoading(false);
    }
  };

  // ---------------------------
  // Search functionality
  // ---------------------------
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    if (text.trim() === "") {
      setFilteredPlaces(places);
      setShowSearchResults(false);
    } else {
      const filtered = places.filter((place) =>
        place.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredPlaces(filtered);
      setShowSearchResults(true);
    }
  };

  const handleAddWaypoint = (placeId: string) => {
    if (!wayPoints.includes(placeId)) {
      setWayPoints([...wayPoints, placeId]);
      setSearchQuery("");
      setShowSearchResults(false);
      setFilteredPlaces(places);
    } else {
      Alert.alert("Already Added", "This place is already in your waypoints.");
    }
  };

  const handleRemoveWaypoint = (placeId: string) => {
    setWayPoints(wayPoints.filter((id) => id !== placeId));
  };

  // ---------------------------
  // Save Trip History
  // ---------------------------
  const saveHistory = async (tripData: TripData) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) return;

      await fetch(`${API_BASE_URL}/history`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          plan: {
            inputs: {
              wayPoints: wayPoints,
              personCount: parseInt(members, 10),
              transportMode: transportMode,
              daysOfTrip: calculateDays(),
              startTimestamp: startDate.toISOString(),
              endTimestamp: endDate.toISOString(),
            },
            result: tripData,
          },
        }),
      });
    } catch (err) {
      console.error("Failed to save history", err);
    }
  };

  // ---------------------------
  // Generate Trip Plan
  // ---------------------------
  const handleGeneratePlan = async () => {
    if (wayPoints.length < 2) {
      Alert.alert("Validation", "Please add at least 2 places to create a trip.");
      return;
    }

    const personCount = parseInt(members, 10);
    if (!personCount || personCount < 1) {
      Alert.alert("Validation", "Please enter a valid number of travelers.");
      return;
    }

    const capacity = getCurrentCapacity();
    if (personCount > capacity.max) {
      Alert.alert("Validation", `${TRANSPORT_MODES.find(m => m.id === transportMode)?.label} capacity is ${capacity.max} travelers.`);
      return;
    }

    const numDays = calculateDays();
    console.log("=== PLAN GENERATION DEBUG ===");
    console.log("Start Date:", startDate.toISOString());
    console.log("End Date:", endDate.toISOString());
    console.log("Calculated Days:", numDays);
    console.log("Transport Mode:", transportMode);
    console.log("Travelers:", personCount);
    console.log("Waypoints:", wayPoints.map(id => getPlaceName(id)));

    if (numDays < 1) {
      Alert.alert("Validation", "Trip must be at least 1 day.");
      return;
    }

    const token = await AsyncStorage.getItem("authToken");
    if (!token) {
      Alert.alert("Authentication Required", "Please login first.");
      return;
    }

    const fromPlace = wayPoints[0];
    const toPlace = wayPoints[wayPoints.length - 1];
    const middleWayPoints = wayPoints.slice(1, -1);

    const payload = {
      fromPlace,
      toPlace,
      wayPoints: middleWayPoints,
      personCount,
      transportMode,
      daysOfTrip: numDays,
      startTimestamp: startDate.toISOString(),
      endTimestamp: endDate.toISOString(),
    };

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/plan-trip`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to generate trip plan");
      const data: TripData = await res.json();

      console.log("API Response:", JSON.stringify(data, null, 2));

      if (!data.success) throw new Error("Trip generation failed");

      if (!data.days || data.days.length === 0) {
        throw new Error("No trip data returned from API");
      }

      console.log("Days returned from API:", data.days.length);
      console.log("Expected days:", numDays);

      setTripResults(data);
      await saveHistory(data);

      Alert.alert("Success", `${data.days.length}-day trip plan generated successfully!`);
    } catch (err) {
      console.error("Error generating plan:", err);
      Alert.alert("Error", err instanceof Error ? err.message : "Failed to generate plan");
    } finally {
      setLoading(false);
    }
  };

  const handleClearResults = () => {
    setTripResults(null);
    setWayPoints([]);
    setMembers("1");
    setTransportMode("bike");
    setStartDate(startOfDay(new Date()));
    setEndDate(startOfDay(new Date(Date.now() + 86400000)));
  };

  // ---------------------------
  // Date Pickers
  // ---------------------------
  const onChangeStart = (_: DateTimePickerEvent, selected?: Date) => {
    setShowStartPicker(false);
    if (selected) {
      const newStart = startOfDay(selected);
      setStartDate(newStart);
      if (startOfDay(endDate).getTime() <= newStart.getTime()) {
        setEndDate(new Date(newStart.getTime() + 86400000));
      }
    }
  };
  const onChangeEnd = (_: DateTimePickerEvent, selected?: Date) => {
    setShowEndPicker(false);
    if (selected) {
      const newEnd = startOfDay(selected);
      if (newEnd.getTime() <= startOfDay(startDate).getTime()) {
        Alert.alert("Validation", "End date must be after start date.");
        return;
      }
      setEndDate(newEnd);
    }
  };

  // ---------------------------
  // Render
  // ---------------------------
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#1a0a2e" }}>
      <LinearGradient colors={["#3A0751", "#7C3AED", "#3A0751"]} style={styles.container}>
        <ScrollView contentContainerStyle={{ paddingBottom: 80 + insets.bottom }}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Trip Planner</Text>
            <Text style={styles.headerSubtitle}>Search & add places to your journey</Text>

            <TouchableOpacity style={styles.historyIcon} onPress={() => setHistoryVisible(true)}>
              <FontAwesome5 name="history" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Trip Form */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Trip Details</Text>

            {/* Place Search */}
            <Text style={styles.label}>Search & Add Places *</Text>
            <View style={styles.searchContainer}>
              <FontAwesome5 name="search" size={16} color="#a78bfa" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={handleSearchChange}
                placeholder="Search places..."
                placeholderTextColor="#8b7aa8"
                onFocus={() => searchQuery && setShowSearchResults(true)}
              />
            </View>

            {/* Search Results Dropdown */}
            {showSearchResults && filteredPlaces.length > 0 && (
              <View style={styles.searchResults}>
                <ScrollView style={styles.searchResultsScroll} nestedScrollEnabled>
                  {filteredPlaces.slice(0, 10).map((place) => (
                    <TouchableOpacity
                      key={place._id}
                      style={styles.searchResultItem}
                      onPress={() => handleAddWaypoint(place._id)}
                    >
                      {place.image && (
                        <Image source={{ uri: place.image }} style={styles.searchResultImage} />
                      )}
                      <View style={styles.searchResultInfo}>
                        <Text style={styles.searchResultName}>{place.name}</Text>
                        {place.description && (
                          <Text style={styles.searchResultDesc} numberOfLines={2}>
                            {place.description}
                          </Text>
                        )}
                      </View>
                      <FontAwesome5 name="plus-circle" size={20} color="#a78bfa" />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Selected Waypoints */}
            {wayPoints.length > 0 && (
              <View style={styles.waypointsContainer}>
                <Text style={styles.waypointsTitle}>
                  Selected Places ({wayPoints.length})
                </Text>
                {wayPoints.map((placeId, index) => {
                  const place = getPlaceDetails(placeId);
                  return (
                    <View key={placeId} style={styles.waypointItem}>
                      <View style={styles.waypointNumber}>
                        <Text style={styles.waypointNumberText}>{index + 1}</Text>
                      </View>
                      {place?.image && (
                        <Image source={{ uri: place.image }} style={styles.waypointImage} />
                      )}
                      <View style={styles.waypointInfo}>
                        <Text style={styles.waypointName}>{getPlaceName(placeId)}</Text>
                        {index === 0 && <Text style={styles.waypointBadge}>Start</Text>}
                        {index === wayPoints.length - 1 && (
                          <Text style={styles.waypointBadge}>End</Text>
                        )}
                      </View>
                      <TouchableOpacity onPress={() => handleRemoveWaypoint(placeId)}>
                        <FontAwesome5 name="trash" size={16} color="#f87171" />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Number of Travelers - Now First */}
            <Text style={styles.label}>Number of Travelers *</Text>
            <View style={styles.inputHint}>
              <FontAwesome5 name="info-circle" size={12} color="#a78bfa" />
              <Text style={styles.inputHintText}>
                Enter travelers count - we'll suggest the best transport!
              </Text>
            </View>
            <TextInput
              style={styles.inputBox}
              keyboardType="numeric"
              value={members}
              onChangeText={handleMembersChange}
              placeholder="Enter number of travelers"
              placeholderTextColor="#8b7aa8"
            />

            {/* Transport Mode Selection - Now Second */}
            <Text style={styles.label}>Transportation Mode *</Text>
            <View style={styles.transportHint}>
              <FontAwesome5 name="lightbulb" size={12} color="#fbbf24" />
              <Text style={styles.transportHintText}>
                Auto-suggested based on traveler count (you can change it)
              </Text>
            </View>
            <View style={styles.transportContainer}>
              {TRANSPORT_MODES.map((mode) => (
                <TouchableOpacity
                  key={mode.id}
                  style={[
                    styles.transportOption,
                    transportMode === mode.id && styles.transportOptionActive,
                  ]}
                  onPress={() => handleTransportChange(mode.id)}
                >
                  <FontAwesome5
                    name={mode.icon}
                    size={20}
                    color={transportMode === mode.id ? "#fff" : "#a78bfa"}
                  />
                  <View style={styles.transportTextContainer}>
                    <Text
                      style={[
                        styles.transportLabel,
                        transportMode === mode.id && styles.transportLabelActive,
                      ]}
                    >
                      {mode.label}
                    </Text>
                    <Text style={styles.capacityText}>
                      {mode.capacity.max === 50 ? `${mode.capacity.min}+` : `${mode.capacity.min}-${mode.capacity.max}`} persons
                    </Text>
                  </View>
                  {transportMode === mode.id && (
                    <View style={styles.recommendedBadge}>
                      <Text style={styles.recommendedText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Dates */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
              <View style={{ flex: 0.48 }}>
                <Text style={[styles.label, { fontSize: 12 }]}>Start Date</Text>
                <TouchableOpacity style={styles.dateInputBox} onPress={() => setShowStartPicker(true)}>
                  <FontAwesome5 name="calendar" size={14} color="#a78bfa" style={{ marginRight: 8 }} />
                  <Text style={styles.dateText}>{startDate.toLocaleDateString()}</Text>
                </TouchableOpacity>
              </View>
              <View style={{ flex: 0.48 }}>
                <Text style={[styles.label, { fontSize: 12 }]}>End Date</Text>
                <TouchableOpacity style={styles.dateInputBox} onPress={() => setShowEndPicker(true)}>
                  <FontAwesome5 name="calendar" size={14} color="#a78bfa" style={{ marginRight: 8 }} />
                  <Text style={styles.dateText}>{endDate.toLocaleDateString()}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Trip Duration Display */}
            <View style={styles.durationBox}>
              <FontAwesome5 name="clock" size={14} color="#a78bfa" />
              <Text style={styles.durationText}>
                Trip Duration: {calculateDays()} {calculateDays() === 1 ? "day" : "days"}
              </Text>
            </View>

            {showStartPicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display="default"
                onChange={onChangeStart}
                minimumDate={new Date()}
              />
            )}
            {showEndPicker && (
              <DateTimePicker
                value={endDate}
                mode="date"
                display="default"
                onChange={onChangeEnd}
                minimumDate={startDate}
              />
            )}

            {/* Generate Button */}
            <TouchableOpacity
              style={styles.generateBtn}
              onPress={handleGeneratePlan}
              disabled={loading || placesLoading || wayPoints.length < 2}
            >
              <LinearGradient colors={["#a78bfa", "#8b5cf6", "#7c3aed"]} style={styles.gradientBtn}>
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Text style={styles.generateText}>Generate Travel Plan</Text>
                    <FontAwesome5 name="route" size={16} color="#fff" />
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {tripResults && (
              <TouchableOpacity style={styles.clearBtn} onPress={handleClearResults}>
                <Text style={styles.clearText}>Clear Results</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Trip Results */}
          {tripResults?.success && tripResults.days && tripResults.days.length > 0 && (
            <View>
              <Text style={styles.resultsTitle}>
                Your {tripResults.days.length}-Day Trip Plan
              </Text>
              <Text style={styles.resultsSubtitle}>
                {wayPoints.length} places • {members} travelers • {TRANSPORT_MODES.find(m => m.id === transportMode)?.label}
              </Text>

              {tripResults.days.map((day, idx) => (
                <View key={idx} style={styles.dayCard}>
                  <Text style={styles.dayTitle}>Day {day.day || idx + 1}</Text>

                  {/* Morning */}
                  {day.agenda.morning && (
                    <View style={styles.timeSlot}>
                      <Text style={styles.timeSlotTitle}>Morning</Text>
                      <View style={styles.placeCard}>
                        {day.agenda.morning.place.image && (
                          <Image
                            source={{ uri: day.agenda.morning.place.image }}
                            style={styles.placeImage}
                          />
                        )}
                        <View style={styles.placeInfo}>
                          <Text style={styles.placeName}>{day.agenda.morning.place.name}</Text>
                          <Text style={styles.placeDesc}>{day.agenda.morning.place.description}</Text>
                        </View>
                      </View>

                      {day.agenda.morning.events && day.agenda.morning.events.length > 0 && (
                        <View style={styles.subsection}>
                          <Text style={styles.subsectionTitle}>
                            <FontAwesome5 name="calendar-check" size={12} color="#a78bfa" /> Events
                          </Text>
                          {day.agenda.morning.events.map((event, ei) => (
                            <View key={ei} style={styles.subItem}>
                              {event.image && (
                                <Image source={{ uri: event.image }} style={styles.subImage} />
                              )}
                              <View style={{ flex: 1 }}>
                                <Text style={styles.subName}>{event.title}</Text>
                                {event.description && (
                                  <Text style={styles.subDesc}>{event.description}</Text>
                                )}
                              </View>
                            </View>
                          ))}
                        </View>
                      )}

                      {day.agenda.morning.hotel && (
                        <View style={styles.subsection}>
                          <Text style={styles.subsectionTitle}>
                            <FontAwesome5 name="hotel" size={12} color="#a78bfa" /> Accommodation
                          </Text>
                          <View style={styles.subItem}>
                            {day.agenda.morning.hotel.image && (
                              <Image
                                source={{ uri: day.agenda.morning.hotel.image }}
                                style={styles.subImage}
                              />
                            )}
                            <View style={{ flex: 1 }}>
                              <Text style={styles.subName}>{day.agenda.morning.hotel.name}</Text>
                              {day.agenda.morning.hotel.description && (
                                <Text style={styles.subDesc}>
                                  {day.agenda.morning.hotel.description}
                                </Text>
                              )}
                              {day.agenda.morning.hotel.priceRange && (
                                <Text style={styles.priceText}>
                                  {day.agenda.morning.hotel.priceRange}
                                </Text>
                              )}
                            </View>
                          </View>
                        </View>
                      )}
                    </View>
                  )}

                  {/* Afternoon */}
                  {day.agenda.afternoon && (
                    <View style={styles.timeSlot}>
                      <Text style={styles.timeSlotTitle}>Afternoon</Text>
                      <View style={styles.placeCard}>
                        {day.agenda.afternoon.place.image && (
                          <Image
                            source={{ uri: day.agenda.afternoon.place.image }}
                            style={styles.placeImage}
                          />
                        )}
                        <View style={styles.placeInfo}>
                          <Text style={styles.placeName}>{day.agenda.afternoon.place.name}</Text>
                          <Text style={styles.placeDesc}>
                            {day.agenda.afternoon.place.description}
                          </Text>
                        </View>
                      </View>

                      {day.agenda.afternoon.events && day.agenda.afternoon.events.length > 0 && (
                        <View style={styles.subsection}>
                          <Text style={styles.subsectionTitle}>
                            <FontAwesome5 name="calendar-check" size={12} color="#a78bfa" /> Events
                          </Text>
                          {day.agenda.afternoon.events.map((event, ei) => (
                            <View key={ei} style={styles.subItem}>
                              {event.image && (
                                <Image source={{ uri: event.image }} style={styles.subImage} />
                              )}
                              <View style={{ flex: 1 }}>
                                <Text style={styles.subName}>{event.title}</Text>
                                {event.description && (
                                  <Text style={styles.subDesc}>{event.description}</Text>
                                )}
                              </View>
                            </View>
                          ))}
                        </View>
                      )}

                      {day.agenda.afternoon.hotel && (
                        <View style={styles.subsection}>
                          <Text style={styles.subsectionTitle}>
                            <FontAwesome5 name="hotel" size={12} color="#a78bfa" /> Accommodation
                          </Text>
                          <View style={styles.subItem}>
                            {day.agenda.afternoon.hotel.image && (
                              <Image
                                source={{ uri: day.agenda.afternoon.hotel.image }}
                                style={styles.subImage}
                              />
                            )}
                            <View style={{ flex: 1 }}>
                              <Text style={styles.subName}>{day.agenda.afternoon.hotel.name}</Text>
                              {day.agenda.afternoon.hotel.description && (
                                <Text style={styles.subDesc}>
                                  {day.agenda.afternoon.hotel.description}
                                </Text>
                              )}
                              {day.agenda.afternoon.hotel.priceRange && (
                                <Text style={styles.priceText}>
                                  {day.agenda.afternoon.hotel.priceRange}
                                </Text>
                              )}
                            </View>
                          </View>
                        </View>
                      )}
                    </View>
                  )}

                  {/* Evening */}
                  {day.agenda.evening && (
                    <View style={styles.timeSlot}>
                      <Text style={styles.timeSlotTitle}>Evening</Text>
                      <View style={styles.placeCard}>
                        {day.agenda.evening.place.image && (
                          <Image
                            source={{ uri: day.agenda.evening.place.image }}
                            style={styles.placeImage}
                          />
                        )}
                        <View style={styles.placeInfo}>
                          <Text style={styles.placeName}>{day.agenda.evening.place.name}</Text>
                          <Text style={styles.placeDesc}>{day.agenda.evening.place.description}</Text>
                        </View>
                      </View>

                      {day.agenda.evening.events && day.agenda.evening.events.length > 0 && (
                        <View style={styles.subsection}>
                          <Text style={styles.subsectionTitle}>
                            <FontAwesome5 name="calendar-check" size={12} color="#a78bfa" /> Events
                          </Text>
                          {day.agenda.evening.events.map((event, ei) => (
                            <View key={ei} style={styles.subItem}>
                              {event.image && (
                                <Image source={{ uri: event.image }} style={styles.subImage} />
                              )}
                              <View style={{ flex: 1 }}>
                                <Text style={styles.subName}>{event.title}</Text>
                                {event.description && (
                                  <Text style={styles.subDesc}>{event.description}</Text>
                                )}
                              </View>
                            </View>
                          ))}
                        </View>
                      )}

                      {day.agenda.evening.hotel && (
                        <View style={styles.subsection}>
                          <Text style={styles.subsectionTitle}>
                            <FontAwesome5 name="hotel" size={12} color="#a78bfa" /> Accommodation
                          </Text>
                          <View style={styles.subItem}>
                            {day.agenda.evening.hotel.image && (
                              <Image
                                source={{ uri: day.agenda.evening.hotel.image }}
                                style={styles.subImage}
                              />
                            )}
                            <View style={{ flex: 1 }}>
                              <Text style={styles.subName}>{day.agenda.evening.hotel.name}</Text>
                              {day.agenda.evening.hotel.description && (
                                <Text style={styles.subDesc}>
                                  {day.agenda.evening.hotel.description}
                                </Text>
                              )}
                              {day.agenda.evening.hotel.priceRange && (
                                <Text style={styles.priceText}>
                                  {day.agenda.evening.hotel.priceRange}
                                </Text>
                              )}
                            </View>
                          </View>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {/* History Drawer */}
        <HistoryDrawer
          visible={historyVisible}
          onClose={() => setHistoryVisible(false)}
          onSelectTrip={(trip) => {
            console.log("Selected Trip from History:", JSON.stringify(trip, null, 2));

            if (trip.plan.inputs.wayPoints) {
              setWayPoints(trip.plan.inputs.wayPoints);
            }
            setMembers(String(trip.plan.inputs.personCount || 1));
            if (trip.plan.inputs.transportMode) {
              setTransportMode(trip.plan.inputs.transportMode);
            }
            setStartDate(new Date(trip.plan.inputs.startTimestamp));
            setEndDate(new Date(trip.plan.inputs.endTimestamp));

            if (trip.plan.result && trip.plan.result.days) {
              setTripResults({
                ...trip.plan.result,
                success: true,
              });
            }

            setHistoryVisible(false);
          }}
        />
      </LinearGradient>
    </SafeAreaView>
  );
}

// ---------------------------
// Styles
// ---------------------------
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { alignItems: "center", marginBottom: 30 },
  headerTitle: { color: "#fff", fontSize: 28, fontWeight: "700" },
  headerSubtitle: { color: "#a78bfa", fontSize: 16 },
  historyIcon: { position: "absolute", right: 0, top: 10, padding: 8 },

  card: {
    backgroundColor: "rgba(45,27,78,0.6)",
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#6d28d9",
  },
  sectionTitle: {
    color: "#fff",
    fontWeight: "700",
    marginBottom: 10,
    fontSize: 23,
    textAlign: "center",
  },
  label: {
    color: "#fff",
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 16,
    fontSize: 14,
  },
  inputBox: {
    borderWidth: 1,
    borderColor: "#6d28d9",
    borderRadius: 12,
    padding: 16,
    color: "#fff",
    backgroundColor: "rgba(26,10,46,0.8)",
    marginBottom: 8,
    fontSize: 14,
  },
  inputHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(167,139,250,0.1)",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  inputHintText: {
    color: "#a78bfa",
    fontSize: 12,
    flex: 1,
  },

  // Transport Mode Styles
  transportContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 8,
  },
  transportOption: {
    flex: 1,
    minWidth: "45%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 8,
    padding: 12,
    borderWidth: 2,
    borderColor: "#6d28d9",
    borderRadius: 12,
    backgroundColor: "rgba(26,10,46,0.6)",
    position: "relative",
  },
  transportOptionActive: {
    backgroundColor: "#7c3aed",
    borderColor: "#a78bfa",
  },
  transportTextContainer: {
    flex: 1,
  },
  transportLabel: {
    color: "#a78bfa",
    fontSize: 13,
    fontWeight: "600",
  },
  transportLabelActive: {
    color: "#fff",
  },
  capacityText: {
    color: "#8b7aa8",
    fontSize: 10,
    marginTop: 2,
  },
  transportHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(251,191,36,0.15)",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(251,191,36,0.3)",
  },
  transportHintText: {
    color: "#fbbf24",
    fontSize: 12,
    flex: 1,
    fontWeight: "600",
  },
  recommendedBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#10b981",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  recommendedText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },

  // Search styles
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#6d28d9",
    borderRadius: 12,
    backgroundColor: "rgba(26,10,46,0.8)",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    padding: 16,
    fontSize: 14,
  },
  searchResults: {
    maxHeight: 300,
    backgroundColor: "rgba(26,10,46,0.95)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#6d28d9",
    marginBottom: 16,
    overflow: "hidden",
  },
  searchResultsScroll: {
    maxHeight: 300,
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(109,40,217,0.3)",
  },
  searchResultImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  searchResultDesc: {
    color: "#a78bfa",
    fontSize: 11,
  },

  // Waypoints styles
  waypointsContainer: {
    backgroundColor: "rgba(167,139,250,0.1)",
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.3)",
  },
  waypointsTitle: {
    color: "#a78bfa",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  waypointItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(26,10,46,0.6)",
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#6d28d9",
  },
  waypointNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#7c3aed",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  waypointNumberText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  waypointImage: {
    width: 45,
    height: 45,
    borderRadius: 8,
    marginRight: 10,
  },
  waypointInfo: {
    flex: 1,
  },
  waypointName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  waypointBadge: {
    color: "#a78bfa",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },

  dateInputBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#6d28d9",
    borderRadius: 12,
    padding: 12,
    backgroundColor: "rgba(26,10,46,0.8)",
    justifyContent: "center",
  },
  dateText: { color: "#fff", fontSize: 12 },

  durationBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    padding: 10,
    backgroundColor: "rgba(167,139,250,0.1)",
    borderRadius: 8,
    gap: 8,
  },
  durationText: { color: "#a78bfa", fontSize: 13, fontWeight: "600" },

  generateBtn: { marginTop: 24 },
  gradientBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
  },
  generateText: { color: "#fff", fontWeight: "700" },

  clearBtn: { marginTop: 12, alignItems: "center" },
  clearText: { color: "#f87171", fontWeight: "600" },

  resultsTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
    marginTop: 24,
    textAlign: "center",
  },
  resultsSubtitle: {
    color: "#a78bfa",
    fontSize: 14,
    marginBottom: 16,
    textAlign: "center",
  },

  dayCard: {
    backgroundColor: "rgba(45,27,78,0.5)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#6d28d9",
  },
  dayTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#6d28d9",
    paddingBottom: 8,
  },

  placeCard: {
    flexDirection: "row",
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  placeImage: { width: 80, height: 80 },
  placeInfo: { flex: 1, padding: 8 },
  placeName: { color: "#fff", fontWeight: "700", fontSize: 14 },
  placeDesc: { color: "#d1d5db", fontSize: 12 },

  subsection: {
    marginTop: 8,
    marginBottom: 12,
    backgroundColor: "rgba(167,139,250,0.05)",
    borderRadius: 10,
    padding: 12,
  },
  subsectionTitle: { color: "#a78bfa", fontSize: 13, fontWeight: "700", marginBottom: 8 },
  subItem: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
  },
  subImage: { width: 50, height: 50, borderRadius: 6, marginRight: 8 },
  subName: { color: "#fff", fontWeight: "600", fontSize: 13 },
  subDesc: { color: "#d1d5db", fontSize: 11, marginTop: 2 },
  priceText: { color: "#a78bfa", fontSize: 12, fontWeight: "700", marginTop: 4 },

  timeSlot: {
    backgroundColor: "rgba(167,139,250,0.1)",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.3)",
  },
  timeSlotTitle: {
    color: "#a78bfa",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(167,139,250,0.3)",
    paddingBottom: 4,
  },
});