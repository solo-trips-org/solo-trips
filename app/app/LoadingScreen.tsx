import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
//import { SafeAreaView } from "react-native-safe-area-context";
import SafeArea from "@/components/SafeArea";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoadingScreen() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  // Animated dots
  const dot1 = useRef(new Animated.Value(1)).current;
  const dot2 = useRef(new Animated.Value(1)).current;
  const dot3 = useRef(new Animated.Value(1)).current;
  const dot4 = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken"); // 👈 make sure this is the right key
        if (token) {
          setIsLoggedIn(true);
          setTimeout(() => {
            router.replace("/"); // go home
          }, 1000); // small delay for smoother transition
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.log("Error checking login:", error);
        setIsLoggedIn(false);
      }
    };

    checkLogin();

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

  // 🔵 Show only loader while checking
  if (isLoggedIn === null) {
    return (
      <SafeArea>
        <LinearGradient
          colors={["#2E0740", "#3A0751"]}
          style={styles.container}
        >
          <Image
            source={require("../assets/Loading.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.dotsContainer}>
            <Animated.View style={[styles.dot, { backgroundColor: "#b19797", transform: [{ scale: dot1 }] }]} />
            <Animated.View style={[styles.dot, { backgroundColor: "#ffffff", transform: [{ scale: dot2 }] }]} />
            <Animated.View style={[styles.dot, { backgroundColor: "#b19797", transform: [{ scale: dot3 }] }]} />
            <Animated.View style={[styles.dot, { backgroundColor: "#ffffff", transform: [{ scale: dot4 }] }]} />
          </View>
        </LinearGradient>
      </SafeArea>
    );
  }

  // 🔴 If NOT logged in → show button
  if (!isLoggedIn) {
    return (
      <SafeArea>
        <LinearGradient
          colors={["#2E0740", "#3A0751"]}
          //background: linear-gradient(135deg, #3c005a, #5d0089);
          style={styles.container}
        >
          <Image
            source={require("../assets/Loading.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <View style={styles.dotsContainer}>
            <Animated.View style={[styles.dot, { backgroundColor: "#b19797", transform: [{ scale: dot1 }] }]} />
            <Animated.View style={[styles.dot, { backgroundColor: "#ffffff", transform: [{ scale: dot2 }] }]} />
            <Animated.View style={[styles.dot, { backgroundColor: "#b19797", transform: [{ scale: dot3 }] }]} />
            <Animated.View style={[styles.dot, { backgroundColor: "#ffffff", transform: [{ scale: dot4 }] }]} />
          </View>

          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={() => router.replace("/Login")}
          >
            <LinearGradient
              colors={["rgba(238, 229, 229, 0.3)", "rgba(236, 226, 226, 0.1)"]}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Start Your Journey →</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
     </SafeArea>
    );
  }

  // ✅ If logged in, return nothing → redirect happens in useEffect
  return null;
}

const styles = StyleSheet.create({
  // safeArea: {
  //   flex: 1,
  //   backgroundColor: "#fff",
  // },
  container: { flex: 1, justifyContent: "center", alignItems: "center" ,marginBottom: 40},
  logo: { width: 140, height: 140, marginBottom: 20 },
  dotsContainer: { flexDirection: "row", marginTop: 30, marginBottom: 40 },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 6,
    marginHorizontal: 6,
  },
  getStartedButton: {
    width: "60%",
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
    fontSize: 13,
    fontWeight: "bold",
    letterSpacing: 1,
  },
});
