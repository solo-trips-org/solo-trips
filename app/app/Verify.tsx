import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function Verify() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email: string }>();
  const email = params.email;

  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const inputs = useRef<Array<TextInput | null>>([]);

  const [counter, setCounter] = useState(180); // 3 minutes = 180 seconds
  const [resendDisabled, setResendDisabled] = useState(true);
  const [loading, setLoading] = useState(false);

  // Start OTP countdown and send OTP on mount
  useEffect(() => {
    sendOtp();
    startTimer();
  }, []);

  // Timer function
  const startTimer = () => {
    setResendDisabled(true);
    const timer = setInterval(() => {
      setCounter((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setResendDisabled(false);
          return 180;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Send OTP
  const sendOtp = async () => {
    try {
      const response = await fetch(
        "https://trips-api.tselven.com/api/new-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );
      const data = await response.json();
      console.log("OTP sent:", data);
      if (!response.ok) {
        Alert.alert("Error", data.message || "Failed to send OTP");
      }
    } catch (error) {
      console.log("OTP send error:", error);
      Alert.alert("Error", "Network issue while sending OTP");
    }
  };

  // Handle OTP input change
  const handleChange = (text: string, index: number) => {
    if (/^\d$/.test(text)) {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);
      if (index < 5) inputs.current[index + 1]?.focus();
    } else if (text === "") {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      if (index > 0) inputs.current[index - 1]?.focus();
    }
  };

  // Verify OTP and register user
  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      Alert.alert("Error", "Please enter all 6 digits.");
      return;
    }

    setLoading(true);

    try {
      const signupDataStr = await AsyncStorage.getItem("signupData");
      if (!signupDataStr) {
        setLoading(false);
        Alert.alert("Error", "No signup data found.");
        return;
      }

      const signupData = JSON.parse(signupDataStr);

      const finalData = {
        ...signupData,
        otp: code,
        type: "signup",
      };

      const response = await fetch(
        "https://trips-api.tselven.com/api/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(finalData),
        }
      );

      const result = await response.json();
      console.log("Register response:", result);

      if (response.ok) {
        Alert.alert("Success", "Account created successfully!");
        await AsyncStorage.removeItem("signupData");
        router.replace("/Login");
      } else {
        Alert.alert("Registration Failed", result.message || "Try again");
      }
    } catch (error) {
      console.log("Verification error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    setCounter(180); // reset 3 minutes
    startTimer();
    await sendOtp();
  };

  // Format counter as MM:SS
  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const sec = (seconds % 60).toString().padStart(2, "0");
    return `${min}:${sec}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Enter the 6-digit code sent to {email}
      </Text>

      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref: TextInput | null) => {
              inputs.current[index] = ref;
            }}
            style={styles.input}
            keyboardType="numeric"
            maxLength={1}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
          />
        ))}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleVerify}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Verify</Text>
        )}
      </TouchableOpacity>

      <View style={styles.resendRow}>
        <Text style={{ color: "#fff", marginRight: 5 }}>
          Didn't receive OTP?
        </Text>
        <TouchableOpacity disabled={resendDisabled} onPress={handleResend}>
          <Text style={{ color: resendDisabled ? "#555" : "#4d9fff" }}>
            {resendDisabled ? `Resend in ${formatTime(counter)}` : "Resend OTP"}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.button, styles.cancelButton]}
        onPress={() => router.replace("/Login")}
      >
        <Text style={styles.buttonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2b0040",
    padding: 20,
  },
  text: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    lineHeight: 22,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    width: "80%",
  },
  input: {
    flex: 1,
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: "#fff",
    borderRadius: 10,
    height: 50,
    textAlign: "center",
    fontSize: 20,
    color: "#fff",
    backgroundColor: "#3d0066",
  },
  button: {
    width: "100%",
    backgroundColor: "#c000ff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 5,
  },
  cancelButton: {
    backgroundColor: "#3A0751",
    borderColor: "#c000ff",
    borderWidth: 1,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  resendRow: {
    flexDirection: "row",
    marginVertical: 15,
    alignItems: "center",
  },
});
