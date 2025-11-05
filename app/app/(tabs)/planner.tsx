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
import { Picker } from "@react-native-picker/picker";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";

import HistoryDrawer from "@/app/HistoryDrawer";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const API_BASE_URL = "https://trips-api.tselven.com/api";

// ---------------------------
// Types
// ---------------------------
interface PlaceOption {
  _id: string;
  name: string;
}

interface Event {
  _id: string;
  name: string;
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
}

interface DayItem {
  place: { name: string; description: string; image?: string };
  events?: Event[];
  hotels?: Hotel[];
}

interface DayAgenda {
  day: number;
  agenda: DayItem[];
}

interface TripData {
  success: boolean;
  days: DayAgenda[];
  fromPlace?: string;
  toPlace?: string;
  createdAt?: string;
}

// ---------------------------
// PlannerScreen
// ---------------------------
export default function PlannerScreen() {
  const [startPlaceId, setStartPlaceId] = useState("");
  const [endPlaceId, setEndPlaceId] = useState("");
  const [members, setMembers] = useState("1");
  const [places, setPlaces] = useState<PlaceOption[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [tripResults, setTripResults] = useState<TripData | null>(null);
  const [loading, setLoading] = useState(false);

  const [startDate, setStartDate] = useState(startOfDay(new Date()));
  const [endDate, setEndDate] = useState(startOfDay(new Date(Date.now() + 2 * 86400000)));

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

  const calculateDays = () => {
    const start = startOfDay(startDate);
    const end = startOfDay(endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays);
  };

  // ---------------------------
  // Fetch Data
  // ---------------------------
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    await Promise.all([fetchPlaces(), fetchEvents(), fetchHotels()]);
  };

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
      setPlaces(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to load places.");
      setPlaces([]);
    } finally {
      setPlacesLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/events`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch events");

      const data = await res.json();
      setEvents(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.error("Failed to load events", err);
      setEvents([]);
    }
  };

  const fetchHotels = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/hotels`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch hotels");

      const data = await res.json();
      console.log("Hotels API Response:", data);
      setHotels(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.error("Failed to load hotels", err);
      setHotels([]);
    }
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
              fromPlace: startPlaceId,
              toPlace: endPlaceId,
              personCount: parseInt(members, 10),
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
    if (!startPlaceId || !endPlaceId) {
      Alert.alert("Validation", "Please select both start and end places.");
      return;
    }
    if (startPlaceId === endPlaceId) {
      Alert.alert("Validation", "Start and end place cannot be the same.");
      return;
    }

    const personCount = parseInt(members, 10);
    if (!personCount || personCount < 1) {
      Alert.alert("Validation", "Please enter a valid number of travelers.");
      return;
    }

    const numDays = calculateDays();
    console.log("=== PLAN GENERATION DEBUG ===");
    console.log("Start Date:", startDate.toISOString());
    console.log("End Date:", endDate.toISOString());
    console.log("Calculated Days:", numDays);
    console.log("Start Place:", startPlaceId, getPlaceName(startPlaceId));
    console.log("End Place:", endPlaceId, getPlaceName(endPlaceId));
    
    if (numDays < 1) {
      Alert.alert("Validation", "Trip must be at least 1 day.");
      return;
    }

    const token = await AsyncStorage.getItem("authToken");
    if (!token) {
      Alert.alert("Authentication Required", "Please login first.");
      return;
    }

    const payload = {
      fromPlace: startPlaceId,
      toPlace: endPlaceId,
      personCount,
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
      console.log("Events available:", events.length);
      console.log("Hotels available:", hotels.length);
      
      if (!data.success) throw new Error("Trip generation failed");

      // Check if API returned correct number of days
      if (!data.days || data.days.length === 0) {
        throw new Error("No trip data returned from API");
      }

      console.log("Days returned from API:", data.days.length);
      console.log("Expected days:", numDays);

      // Enhance trip data with events and hotels for each day
      const enhancedDays = data.days.map((day, idx) => {
        const dayEvents = events.slice(idx * 2, Math.min((idx * 2) + 2, events.length));
        const dayHotels = hotels.slice(idx, Math.min(idx + 1, hotels.length));
        
        console.log(`Day ${idx + 1}: Adding ${dayEvents.length} events and ${dayHotels.length} hotels`);
        
        return {
          ...day,
          day: day.day || idx + 1,
          agenda: day.agenda.map((item) => ({
            ...item,
            events: dayEvents,
            hotels: dayHotels,
          })),
        };
      });

      const tripWithNames = {
        ...data,
        days: enhancedDays,
        fromPlace: getPlaceName(startPlaceId),
        toPlace: getPlaceName(endPlaceId),
      };

      console.log("Enhanced Trip Data:", JSON.stringify(tripWithNames, null, 2));
      
      setTripResults(tripWithNames);

      // Save to history
      await saveHistory(tripWithNames);
      
      Alert.alert("Success", `${enhancedDays.length}-day trip plan generated successfully!`);
    } catch (err) {
      console.error("Error generating plan:", err);
      Alert.alert("Error", err instanceof Error ? err.message : "Failed to generate plan");
    } finally {
      setLoading(false);
    }
  };

  const handleClearResults = () => {
    setTripResults(null);
    setStartPlaceId("");
    setEndPlaceId("");
    setMembers("1");
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
        <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Trip Planner</Text>
            <Text style={styles.headerSubtitle}>Plan your perfect journey</Text>

            <TouchableOpacity style={styles.historyIcon} onPress={() => setHistoryVisible(true)}>
              <FontAwesome5 name="history" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Trip Form */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Trip Details</Text>

            <Text style={styles.label}>Start Place *</Text>
            {placesLoading ? (
              <ActivityIndicator color="#a78bfa" />
            ) : (
              <View style={styles.pickerBox}>
                <Picker selectedValue={startPlaceId} onValueChange={setStartPlaceId} style={styles.picker}>
                  <Picker.Item label="-- Select Start Place --" value="" color="#8b7aa8" />
                  {places.map((p) => (
                    <Picker.Item key={p._id} label={p.name} value={p._id} />
                  ))}
                </Picker>
              </View>
            )}

            <Text style={styles.label}>End Place *</Text>
            {placesLoading ? (
              <ActivityIndicator color="#a78bfa" />
            ) : (
              <View style={styles.pickerBox}>
                <Picker selectedValue={endPlaceId} onValueChange={setEndPlaceId} style={styles.picker}>
                  <Picker.Item label="-- Select End Place --" value="" color="#8b7aa8" />
                  {places.map((p) => (
                    <Picker.Item key={p._id} label={p.name} value={p._id} />
                  ))}
                </Picker>
              </View>
            )}

            <Text style={styles.label}>Number of Travelers *</Text>
            <TextInput
              style={styles.inputBox}
              keyboardType="numeric"
              value={members}
              onChangeText={(t) => setMembers(t.replace(/[^0-9]/g, ""))}
              placeholder="Enter number of travelers"
              placeholderTextColor="#8b7aa8"
            />

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

            {showStartPicker && <DateTimePicker value={startDate} mode="date" display="default" onChange={onChangeStart} minimumDate={new Date()} />}
            {showEndPicker && <DateTimePicker value={endDate} mode="date" display="default" onChange={onChangeEnd} minimumDate={startDate} />}

            {/* Generate Button */}
            <TouchableOpacity style={styles.generateBtn} onPress={handleGeneratePlan} disabled={loading || placesLoading}>
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
                {tripResults.fromPlace} → {tripResults.toPlace}
              </Text>

              {tripResults.days.map((day, idx) => (
                <View key={idx} style={styles.dayCard}>
                  <Text style={styles.dayTitle}>Day {day.day || idx + 1}</Text>
                  
                  {/* Places */}
                  {day.agenda && day.agenda.length > 0 ? (
                    day.agenda.map((item, i) => (
                      <View key={i}>
                        <View style={styles.placeCard}>
                          {item.place.image && <Image source={{ uri: item.place.image }} style={styles.placeImage} />}
                          <View style={styles.placeInfo}>
                            <Text style={styles.placeName}>{item.place.name}</Text>
                            <Text style={styles.placeDesc}>{item.place.description}</Text>
                          </View>
                        </View>

                        {/* Events for this day */}
                        {item.events && item.events.length > 0 && (
                          <View style={styles.subsection}>
                            <Text style={styles.subsectionTitle}>
                              <FontAwesome5 name="calendar-check" size={12} color="#a78bfa" /> Events
                            </Text>
                            {item.events.map((event, ei) => (
                              <View key={ei} style={styles.subItem}>
                                {event.image && <Image source={{ uri: event.image }} style={styles.subImage} />}
                                <View style={{ flex: 1 }}>
                                  <Text style={styles.subName}>{event.name}</Text>
                                  {event.description && <Text style={styles.subDesc}>{event.description}</Text>}
                                </View>
                              </View>
                            ))}
                          </View>
                        )}

                        {/* Hotels for this day */}
                        {item.hotels && item.hotels.length > 0 && (
                          <View style={styles.subsection}>
                            <Text style={styles.subsectionTitle}>
                              <FontAwesome5 name="hotel" size={12} color="#a78bfa" /> Accommodation
                            </Text>
                            {item.hotels.map((hotel, hi) => (
                              <View key={hi} style={styles.subItem}>
                                {hotel.image && (
                                  <Image 
                                    source={{ uri: hotel.image }} 
                                    style={styles.subImage}
                                    onError={(e) => console.log("Hotel image load error:", e.nativeEvent.error)}
                                  />
                                )}
                                <View style={{ flex: 1 }}>
                                  <Text style={styles.subName}>{hotel.name || "Hotel"}</Text>
                                  {hotel.description && <Text style={styles.subDesc}>{hotel.description}</Text>}
                                  {hotel.price && hotel.price > 0 && (
                                    <Text style={styles.priceText}>₹{hotel.price}/night</Text>
                                  )}
                                </View>
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                    ))
                  ) : (
                    <Text style={styles.placeDesc}>No places planned for this day</Text>
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
            
            // Populate Planner with saved trip inputs
            setStartPlaceId(trip.plan.inputs.fromPlace);
            setEndPlaceId(trip.plan.inputs.toPlace);
            setMembers(String(trip.plan.inputs.personCount || 1));
            setStartDate(new Date(trip.plan.inputs.startTimestamp));
            setEndDate(new Date(trip.plan.inputs.endTimestamp));

            // Set saved trip results for display - CRITICAL FIX
            if (trip.plan.result && trip.plan.result.days) {
              setTripResults({
                ...trip.plan.result,
                success: true,
                fromPlace: getPlaceName(trip.plan.inputs.fromPlace),
                toPlace: getPlaceName(trip.plan.inputs.toPlace),
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

  card: { backgroundColor: "rgba(45,27,78,0.6)", borderRadius: 20, padding: 24, marginBottom: 24, borderWidth: 1, borderColor: "#6d28d9" },
  sectionTitle: { color: "#fff", fontWeight: "700", marginBottom: 10, fontSize: 23, textAlign: "center" },
  label: { color: "#fff", fontWeight: "600", marginBottom: 8, marginTop: 16, fontSize: 14 },
  inputBox: { borderWidth: 1, borderColor: "#6d28d9", borderRadius: 12, padding: 16, color: "#fff", backgroundColor: "rgba(26,10,46,0.8)", marginBottom: 8, fontSize: 14 },

  pickerBox: { borderWidth: 1, borderColor: "#6d28d9", borderRadius: 12, marginBottom: 8, backgroundColor: "rgba(26,10,46,0.8)", overflow: "hidden" },
  picker: { color: "#fff", height: 53 },

  dateInputBox: { flex: 1, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#6d28d9", borderRadius: 12, padding: 12, backgroundColor: "rgba(26,10,46,0.8)", justifyContent: "center" },
  dateText: { color: "#fff", fontSize: 12 },

  durationBox: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 12, padding: 10, backgroundColor: "rgba(167,139,250,0.1)", borderRadius: 8, gap: 8 },
  durationText: { color: "#a78bfa", fontSize: 13, fontWeight: "600" },

  generateBtn: { marginTop: 24 },
  gradientBtn: { flexDirection: "row", justifyContent: "center", alignItems: "center", padding: 16, borderRadius: 12 },
  generateText: { color: "#fff", fontWeight: "700" },

  clearBtn: { marginTop: 12, alignItems: "center" },
  clearText: { color: "#f87171", fontWeight: "600" },

  resultsTitle: { color: "#fff", fontSize: 22, fontWeight: "700", marginBottom: 4, marginTop: 24, textAlign: "center" },
  resultsSubtitle: { color: "#a78bfa", fontSize: 14, marginBottom: 16, textAlign: "center" },
  
  dayCard: { backgroundColor: "rgba(45,27,78,0.5)", borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#6d28d9" },
  dayTitle: { color: "#fff", fontSize: 18, fontWeight: "700", marginBottom: 12, borderBottomWidth: 1, borderBottomColor: "#6d28d9", paddingBottom: 8 },
  
  placeCard: { flexDirection: "row", marginBottom: 12, borderRadius: 12, overflow: "hidden", backgroundColor: "rgba(0,0,0,0.3)" },
  placeImage: { width: 80, height: 80 },
  placeInfo: { flex: 1, padding: 8 },
  placeName: { color: "#fff", fontWeight: "700", fontSize: 14 },
  placeDesc: { color: "#d1d5db", fontSize: 12 },

  subsection: { marginTop: 8, marginBottom: 12, backgroundColor: "rgba(167,139,250,0.05)", borderRadius: 10, padding: 12 },
  subsectionTitle: { color: "#a78bfa", fontSize: 13, fontWeight: "700", marginBottom: 8 },
  subItem: { flexDirection: "row", backgroundColor: "rgba(0,0,0,0.2)", borderRadius: 8, padding: 8, marginBottom: 6 },
  subImage: { width: 50, height: 50, borderRadius: 6, marginRight: 8 },
  subName: { color: "#fff", fontWeight: "600", fontSize: 13 },
  subDesc: { color: "#d1d5db", fontSize: 11, marginTop: 2 },
  priceText: { color: "#a78bfa", fontSize: 12, fontWeight: "700", marginTop: 4 },
});