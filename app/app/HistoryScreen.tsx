import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome5 } from "@expo/vector-icons";

interface Place {
  _id: string;
  name: string;
}

interface HistoryScreenProps {
  onClose: () => void;
  onSelectTrip: (trip: any) => void;
}

export default function HistoryScreen({ onClose, onSelectTrip }: HistoryScreenProps) {
  const [loading, setLoading] = useState(false);
  const [trips, setTrips] = useState<any[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);

  useEffect(() => {
    fetchPlacesAndHistory();
  }, []);

  const fetchPlacesAndHistory = async () => {
    await fetchPlaces();
    await fetchHistory();
  };

  // ----------------------------
  // Fetch Places
  // ----------------------------
  const fetchPlaces = async () => {
    try {
      setLoadingPlaces(true);
      const token = await AsyncStorage.getItem("authToken");
      if (!token) return;

      const res = await fetch("https://trips-api.tselven.com/api/places", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch places");

      const data = await res.json();
      if (data.data && Array.isArray(data.data)) setPlaces(data.data);
    } catch (err) {
      console.error("Failed to load places", err);
    } finally {
      setLoadingPlaces(false);
    }
  };

  // ----------------------------
  // Fetch Trip History
  // ----------------------------
  const fetchHistory = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Login required", "Please login to view history.");
        setTrips([]);
        return;
      }

      const response = await fetch("https://trips-api.tselven.com/api/history", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch history");

      const data = await response.json();
      if (data.plans && Array.isArray(data.plans)) {
        // Sort by most recent first
        const sortedTrips = data.plans.sort((a: any, b: any) => {
          const dateA = new Date(a.createdAt || a.plan?.result?.createdAt || 0);
          const dateB = new Date(b.createdAt || b.plan?.result?.createdAt || 0);
          return dateB.getTime() - dateA.getTime();
        });
        setTrips(sortedTrips);
      } else {
        setTrips([]);
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to fetch history.");
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------
  // Helper: Get Place Name by ID
  // ----------------------------
  const getPlaceName = (id: string) => {
    const place = places.find((p) => p._id === id);
    return place ? place.name : id;
  };

  // ----------------------------
  // Helper: Format Date
  // ----------------------------
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", { 
        month: "short", 
        day: "numeric", 
        year: "numeric" 
      });
    } catch {
      return "";
    }
  };

  // ----------------------------
  // Helper: Calculate Duration
  // ----------------------------
  const calculateDuration = (start?: string, end?: string) => {
    if (!start || !end) return null;
    try {
      const startDate = new Date(start);
      const endDate = new Date(end);
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch {
      return null;
    }
  };

  // ----------------------------
  // Render
  // ----------------------------
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Trip History</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <FontAwesome5 name="times" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Loading State */}
      {loading || loadingPlaces ? (
        <View style={styles.loader}>
          <ActivityIndicator color="#a78bfa" size="large" />
          <Text style={styles.loadingText}>Loading your trips...</Text>
        </View>
      ) : trips.length === 0 ? (
        <View style={styles.empty}>
          <FontAwesome5 name="map-marked-alt" size={48} color="#6d28d9" />
          <Text style={styles.emptyText}>No trips found</Text>
          <Text style={styles.emptySubtext}>Start planning your first adventure!</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {trips.map((trip, idx) => {
            const from = trip.plan?.inputs?.fromPlace || "Unknown";
            const to = trip.plan?.inputs?.toPlace || "Unknown";
            const daysCount = trip.plan?.result?.days?.length || 0;
            const startDate = trip.plan?.inputs?.startTimestamp;
            const endDate = trip.plan?.inputs?.endTimestamp;
            const duration = calculateDuration(startDate, endDate);
            const personCount = trip.plan?.inputs?.personCount || 1;

            return (
              <TouchableOpacity
                key={trip._id || idx}
                style={styles.item}
                onPress={() => onSelectTrip(trip)}
                activeOpacity={0.7}
              >
                <View style={styles.itemHeader}>
                  <FontAwesome5 name="map-marker-alt" size={16} color="#a78bfa" />
                  <Text style={styles.itemTitle}>
                    {getPlaceName(from)} → {getPlaceName(to)}
                  </Text>
                </View>

                <View style={styles.itemDetails}>
                  <View style={styles.detailRow}>
                    <FontAwesome5 name="calendar" size={12} color="#8b7aa8" />
                    <Text style={styles.detailText}>
                      {formatDate(startDate)}
                      {endDate && ` - ${formatDate(endDate)}`}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <FontAwesome5 name="clock" size={12} color="#8b7aa8" />
                    <Text style={styles.detailText}>
                      {duration || daysCount} {(duration || daysCount) === 1 ? "day" : "days"}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <FontAwesome5 name="users" size={12} color="#8b7aa8" />
                    <Text style={styles.detailText}>
                      {personCount} {personCount === 1 ? "traveler" : "travelers"}
                    </Text>
                  </View>
                </View>

                <View style={styles.itemFooter}>
                  <Text style={styles.viewDetailsText}>View Details</Text>
                  <FontAwesome5 name="chevron-right" size={14} color="#a78bfa" />
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

// ----------------------------
// Styles
// ----------------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1a0a2e", padding: 20 },
  header: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#6d28d9",
  },
  title: { color: "#fff", fontSize: 24, fontWeight: "700" },
  closeBtn: { padding: 4 },

  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { color: "#a78bfa", fontSize: 14, marginTop: 12 },

  empty: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    marginTop: 50,
    gap: 12,
  },
  emptyText: { color: "#a78bfa", fontSize: 18, fontWeight: "600" },
  emptySubtext: { color: "#8b7aa8", fontSize: 14 },

  item: {
    backgroundColor: "rgba(45,27,78,0.6)",
    padding: 16,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#6d28d9",
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  itemTitle: { 
    color: "#fff", 
    fontWeight: "700", 
    fontSize: 16,
    flex: 1,
  },

  itemDetails: {
    gap: 8,
    marginBottom: 12,
    paddingLeft: 4,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: { 
    color: "#d1d5db", 
    fontSize: 13,
  },

  itemFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(109,40,217,0.3)",
  },
  viewDetailsText: {
    color: "#a78bfa",
    fontSize: 13,
    fontWeight: "600",
  },
});