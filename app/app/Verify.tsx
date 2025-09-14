import { useState, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Verify() {
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  // Refs for focusing next/previous input
  const inputs = useRef<(TextInput | null)[]>([]);

  const handleChange = (text: string, index: number) => {
    if (/^\d$/.test(text)) {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);

      // Move to next input if available
      if (index < 5 && inputs.current[index + 1]) {
        inputs.current[index + 1]?.focus();
      }
    } else if (text === "") {
      // Handle backspace
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
    }
  };

  const handleVerify = () => {
    const code = otp.join("");
    if (code.length === 6) {
      // ✅ Verify account API call
      alert("Account Verified Successfully!");
      router.replace("/Login");
    } else {
      alert("Please enter all 6 digits.");
    }
  };

  return (
     <SafeAreaView style={styles.safeArea}>
    <View style={styles.container}>

      <Text style={styles.text}>📧 Enter the 6-digit code sent to your email.</Text>

      {/* OTP Input Row */}
      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              inputs.current[index] = ref; // ✅ assign only
            }}
            style={styles.input}
            keyboardType="numeric"
            maxLength={1}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
          />
        ))}
      </View>

      {/* Buttons in one row */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={handleVerify}>
          <Text style={styles.buttonText}>Verify</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => router.replace("/Login")}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    safeArea: {
    flex: 1,
    backgroundColor: '#fff', // ✅ Safe area bg white
  },
  container: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: "#2b0040", 
    padding: 20 
  },
  text: { 
    color: "#fff", 
    fontSize: 15, 
    marginBottom: 20, 
    textAlign: "center" 
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: "#fff",
    borderRadius: 8,
    width: 45,
    height: 45,
    textAlign: "center",
    fontSize: 17,
    color: "#fff",
    marginHorizontal: 5,
    backgroundColor: "#3d0066",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "70%",
    marginTop: 10,
  },
  button: { 
    flex: 1,
    backgroundColor: "#c000ff", 
    padding: 15, 
    borderRadius: 8, 
    alignItems: "center", 
    marginHorizontal: 5,
  },
  cancelButton: { 
    backgroundColor: "#3A0751" ,
    borderColor: "#c000ff",
  },
  buttonText: { 
    color: "#fff", 
    fontSize: 16, 
    fontWeight: "bold" 
  },
});
