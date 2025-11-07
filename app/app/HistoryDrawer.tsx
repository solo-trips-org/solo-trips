import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  TouchableOpacity,
  View,
  StyleSheet,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import HistoryScreen from "./HistoryScreen";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface HistoryDrawerProps {
  visible: boolean;
  onClose: () => void;
  onSelectTrip: (trip: any) => void;
}

export default function HistoryDrawer({
  visible,
  onClose,
  onSelectTrip,
}: HistoryDrawerProps) {
  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Slide in / out animation
  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_WIDTH,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      onRequestClose={onClose}
    >
      {/* Background overlay */}
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View
          style={[
            styles.overlayBackground,
            { opacity: fadeAnim },
          ]}
        />
      </TouchableOpacity>

      {/* Drawer Content */}
      <Animated.View
        style={[
          styles.drawerContainer,
          { transform: [{ translateX: slideAnim }] },
        ]}
      >
        <LinearGradient
          colors={["#3b0764", "#1a0b2e"]}
          style={styles.gradient}
        >
          <HistoryScreen onClose={onClose} onSelectTrip={onSelectTrip} />
        </LinearGradient>
      </Animated.View>
    </Modal>
  );
}

// ----------------------------
// Styles
// ----------------------------
const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlayBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  drawerContainer: {
    position: "absolute",
    top: 0,
    right: 0,
    width: SCREEN_WIDTH * 0.85,
    height: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 8,
    shadowOffset: { width: -2, height: 0 },
    elevation: 8,
  },
  gradient: {
    flex: 1,
    paddingTop: 50,
  },
});