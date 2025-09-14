import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoadingScreen() {
  const router = useRouter();

  // Animated values for each dot
  const dot1 = useRef(new Animated.Value(1)).current;
  const dot2 = useRef(new Animated.Value(1)).current;
  const dot3 = useRef(new Animated.Value(1)).current;
  const dot4 = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animateDot = (dot: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(dot, {
            toValue: 1.5,
            duration: 400,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animateDot(dot1, 0);
    animateDot(dot2, 200);
    animateDot(dot3, 400);
    animateDot(dot4, 600);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={["#2E0740", "#3A0751"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <Image
          source={require("../assets/Loading.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* 🔵 Animated Dots */}
        <View style={styles.dotsContainer}>
          <Animated.View
            style={[styles.dot, { backgroundColor: "#b19797", transform: [{ scale: dot1 }] }]}
          />
          <Animated.View
            style={[styles.dot, { backgroundColor: "#ffffff", transform: [{ scale: dot2 }] }]}
          />
          <Animated.View
            style={[styles.dot, { backgroundColor: "#b19797", transform: [{ scale: dot3 }] }]}
          />
          <Animated.View
            style={[styles.dot, { backgroundColor: "#ffffff", transform: [{ scale: dot4 }] }]}
          />
        </View>

        {/* 🚀 Modern Glass Button */}
        <TouchableOpacity
          style={styles.getStartedButton}
          onPress={() => router.replace("/Login")}
        >
          <LinearGradient
            colors={["rgba(238, 229, 229, 0.3)", "rgba(236, 226, 226, 0.1)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>Start Your Journey →</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff", // ✅ Safe area top & bottom white
  },
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  logo: { width: 140, height: 140, marginBottom: 20 },
  dotsContainer: { flexDirection: "row", marginTop: 30, marginBottom: 40 },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 6,
    marginHorizontal: 6,
  },
  getStartedButton: {
    width: "75%",
    borderRadius: 30,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 5,
  },
  buttonGradient: {
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1,
  },
});
