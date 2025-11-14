import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Signup() {
  const router = useRouter();

  const [email, setEmail] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirm, setConfirm] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);

  useEffect(() => {
    console.log("Signup component rendered");
  }, []);

  const handleEmailChange = (text: string) => setEmail(text);
  const handleUsernameChange = (text: string) => setUsername(text);
  const handlePasswordChange = (text: string) => setPassword(text);
  const handleConfirmChange = (text: string) => setConfirm(text);

  const handleSignup = async () => {
    if (!email || !username || !password || !confirm) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    if (password !== confirm) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    const signupData = { email, username, password };

    try {
      // Save signup data in AsyncStorage
      await AsyncStorage.setItem("signupData", JSON.stringify(signupData));
      console.log("Signup data saved locally:", signupData);

      // Navigate to OTP Verification page
      router.push({ pathname: "/Verify", params: { email } });
    } catch (error) {
      console.log("AsyncStorage error:", error);
      Alert.alert("Error", "Unable to save data locally");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.backgroundCircle1} />
      <View style={styles.backgroundCircle2} />
      <View style={styles.backgroundCircle3} />

      <View style={styles.container}>
        <Text style={styles.label}>Email address</Text>
        <TextInput
          style={styles.input}
          placeholder="abc@gmail.com"
          placeholderTextColor="#999"
          value={email}
          onChangeText={handleEmailChange}
        />

        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter username"
          placeholderTextColor="#999"
          value={username}
          onChangeText={handleUsernameChange}
        />

        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View style={{ flex: 1, marginRight: 5 }}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                secureTextEntry={!showPassword}
                placeholder="••••"
                placeholderTextColor="#999"
                value={password}
                onChangeText={handlePasswordChange}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color="#ccc"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ flex: 1, marginLeft: 5 }}>
            <Text style={styles.label}>ConfirmPassword</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                secureTextEntry={!showConfirm}
                placeholder="••••"
                placeholderTextColor="#999"
                value={confirm}
                onChangeText={handleConfirmChange}
              />
              <TouchableOpacity
                onPress={() => setShowConfirm(!showConfirm)}
              >
                <Ionicons
                  name={showConfirm ? "eye-off" : "eye"}
                  size={20}
                  color="#ccc"
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSignup}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        <Text style={styles.orText}>or</Text>

        <TouchableOpacity
          style={styles.googleBtn}
          onPress={() => console.log("Google button pressed")}
        >
          <View style={styles.googleContent}>
            <Image
              source={require("../assets/google.png")}
              style={styles.googleIcon}
            />
            <Text style={styles.googleText}>Continue with Google</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.termsText}>
          By continuing, you agree to our{" "}
          <Text style={styles.link}>Terms</Text> &{" "}
          <Text style={styles.link}>Privacy</Text>.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#2b0040"},
  container: { flex: 1, padding: 20, justifyContent: "center" },
  backgroundCircle1: { position: "absolute", width: 80, height: 80, borderRadius: 125, backgroundColor: "#3a0751", top: 10, left: -50, opacity: 0.6 },
  backgroundCircle2: { position: "absolute", width: 100, height: 100, borderRadius: 75, backgroundColor: "#520075", bottom: 20, right: 30, opacity: 0.7 },
  backgroundCircle3: { position: "absolute", width: 60, height: 60, borderRadius: 125, backgroundColor: "#3a0751", top: 600, left: 20, opacity: 0.6, bottom: 100, right: 30 },
  label: { color: "#fff", marginBottom: 5, fontWeight: "600" },
  input: { borderWidth: 1, borderColor: "#555", borderRadius: 8, padding: 12, color: "#fff", marginBottom: 15, backgroundColor: "rgba(255,255,255,0.05)" },
  button: { backgroundColor: "#c000ff", padding: 15, borderRadius: 8, alignItems: "center", marginTop: 10 },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  orText: { textAlign: "center", color: "#aaa", marginVertical: 10 },
  googleBtn: { backgroundColor: "#3A0751", borderColor: "#c000ff", borderWidth: 1, padding: 15, borderRadius: 8, alignItems: "center" },
  googleContent: { flexDirection: "row", alignItems: "center" },
  googleIcon: { width: 20, height: 20, marginRight: 10 },
  googleText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  termsText: { textAlign: "center", marginTop: 10, color: "#aaa", fontSize: 12 },
  link: { color: "#4d9fff", textDecorationLine: "underline" },
  passwordContainer: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#555", borderRadius: 8, paddingHorizontal: 10, backgroundColor: "rgba(255,255,255,0.05)" },
  passwordInput: { flex: 1, padding: 12, color: "#fff" },
});
