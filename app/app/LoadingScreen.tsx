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

  // Logo fade in animation
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (token) {
          setIsLoggedIn(true);
          setTimeout(() => {
            router.replace("/");
          }, 1000);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.log("Error checking login:", error);
        setIsLoggedIn(false);
      }
    };

    checkLogin();

    // Animate logo entrance
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

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

  // Show loader while checking
  if (isLoggedIn === null) {
    return (
      <SafeArea>
        <LinearGradient
          colors={["#1a0329", "#2E0740", "#5a2080", "#2E0740", "#1a0329"]}
          style={styles.container}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          locations={[0, 0.3, 0.5, 0.7, 1]}
        >
          <Animated.View
            style={{
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            }}
          >
            <Image
              source={require("../assets/Loading.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animated.View>
          
          <View style={styles.dotsContainer}>
            <Animated.View style={[styles.dot, { backgroundColor: "#c4a3c3", transform: [{ scale: dot1 }] }]} />
            <Animated.View style={[styles.dot, { backgroundColor: "#ffffff", transform: [{ scale: dot2 }] }]} />
            <Animated.View style={[styles.dot, { backgroundColor: "#c4a3c3", transform: [{ scale: dot3 }] }]} />
            <Animated.View style={[styles.dot, { backgroundColor: "#ffffff", transform: [{ scale: dot4 }] }]} />
          </View>
        </LinearGradient>
      </SafeArea>
    );
  }

  // If NOT logged in → show button
  if (!isLoggedIn) {
    return (
      <SafeArea>
        <LinearGradient
          colors={['#1a0329', '#2E0740', '#4a1570', '#6B21A8', '#4a1570', '#2E0740', '#1a0329']}
          style={styles.container}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          locations={[0, 0.2, 0.35, 0.5, 0.65, 0.8, 1]}
        >
          <Animated.View
            style={{
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
              shadowColor: "#fff",
              shadowOpacity: 0.3,
              shadowOffset: { width: 0, height: 0 },
              shadowRadius: 20,
            }}
          >
            <Image
              source={require("../assets/Loading.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animated.View>

          <View style={styles.dotsContainer}>
            <Animated.View style={[styles.dot, { backgroundColor: "#ffffff", transform: [{ scale: dot1 }] }]} />
            <Animated.View style={[styles.dot, { backgroundColor: "#e9d5ff", transform: [{ scale: dot2 }] }]} />
            <Animated.View style={[styles.dot, { backgroundColor: "#ffffff", transform: [{ scale: dot3 }] }]} />
            <Animated.View style={[styles.dot, { backgroundColor: "#e9d5ff", transform: [{ scale: dot4 }] }]} />
          </View>

          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={() => router.replace("/Login")}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#4a1570', '#6B21A8', '#8B5CF6', '#6B21A8', '#4a1570']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>Start Your Journey →</Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.tagline}>Begin your transformation today</Text>
        </LinearGradient>
     </SafeArea>
    );
  }

  // If logged in, return nothing → redirect happens in useEffect
  return null;
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    paddingBottom: 30,
  },
  logo: { 
    width: 130, 
    height: 130, 
    marginBottom: 30,
  },
  dotsContainer: { 
    flexDirection: "row", 
    marginTop: 40, 
    marginBottom: 50,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 7,
    shadowColor: "#fff",
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  getStartedButton: {
    width: "68%",
    borderRadius: 30,
    overflow: "hidden",
    shadowColor: "#8B5CF6",
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 10,
    borderColor: "#6e6a6aff",
    borderWidth: 0.5,
  },
  buttonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 30,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    color: "#e9d5ff",
    fontSize: 13,
    marginTop: 20,
    opacity: 0.8,
    letterSpacing: 0.5,
  },
});