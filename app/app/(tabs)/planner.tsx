import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

export default function PlannerScreen() {
  const [children, setChildren] = useState(0);
  const [adults, setAdults] = useState(0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#2E0740' }}>
      <LinearGradient colors={['#3A0751', '#2E0740']} style={styles.container}>
        <ScrollView contentContainerStyle={{ paddingBottom: 50 }} showsVerticalScrollIndicator={false}>
          
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.addPlace}>
              <Ionicons name="add-circle" size={20} color="#fff" />
              <Text style={styles.headerText}> Add Place</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.history}>
              <Ionicons name="time-outline" size={20} color="#00BFFF" />
              <Text style={styles.historyText}> History</Text>
            </TouchableOpacity>
          </View>

          {/* Glassmorphism Card */}
          <View style={styles.card}>
            
            {/* Places */}
            <Text style={styles.sectionTitle}>Places</Text>
            <View style={styles.row}>
              <View style={styles.inputWrapper}>
                <Ionicons name="location-outline" size={18} color="#aaa" style={styles.icon} />
                <TextInput style={styles.input} placeholder="Start place" placeholderTextColor="#aaa" />
              </View>
              <View style={styles.inputWrapper}>
                <Ionicons name="location-outline" size={18} color="#aaa" style={styles.icon} />
                <TextInput style={styles.input} placeholder="End place" placeholderTextColor="#aaa" />
              </View>
            </View>

            {/* Members */}
            <Text style={styles.sectionTitle}>How many members?</Text>
            <View style={styles.inputWrapperFull}>
              <Ionicons name="people-outline" size={18} color="#aaa" style={styles.icon} />
              <TextInput style={styles.input} placeholder="Selected members (family, friends...)" placeholderTextColor="#aaa" />
            </View>
            
            <View style={styles.row}>
              {/* Children Counter */}
              <View style={styles.counterBox}>
                <Text style={styles.counterLabel}>Children</Text>
                <View style={styles.counterRow}>
                  <TouchableOpacity onPress={() => setChildren(Math.max(0, children - 1))} style={styles.counterBtn}>
                    <Text style={styles.counterBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.counterValue}>{children}</Text>
                  <TouchableOpacity onPress={() => setChildren(children + 1)} style={styles.counterBtn}>
                    <Text style={styles.counterBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Adults Counter */}
              <View style={styles.counterBox}>
                <Text style={styles.counterLabel}>Adults</Text>
                <View style={styles.counterRow}>
                  <TouchableOpacity onPress={() => setAdults(Math.max(0, adults - 1))} style={styles.counterBtn}>
                    <Text style={styles.counterBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.counterValue}>{adults}</Text>
                  <TouchableOpacity onPress={() => setAdults(adults + 1)} style={styles.counterBtn}>
                    <Text style={styles.counterBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Dates */}
            <Text style={styles.sectionTitle}>Dates</Text>
            <View style={styles.row}>
              <View style={styles.inputWrapper}>
                <Ionicons name="calendar-outline" size={18} color="#aaa" style={styles.icon} />
                <TextInput style={styles.input} placeholder="Start Date" placeholderTextColor="#aaa" />
              </View>
              <View style={styles.inputWrapper}>
                <Ionicons name="calendar-outline" size={18} color="#aaa" style={styles.icon} />
                <TextInput style={styles.input} placeholder="End Date" placeholderTextColor="#aaa" />
              </View>
            </View>

            {/* Budget */}
            <Text style={styles.sectionTitle}>Budgets</Text>
            <View style={styles.row}>
              <TouchableOpacity style={styles.budgetBtn}><Text style={styles.budgetText}>Low</Text></TouchableOpacity>
              <TouchableOpacity style={styles.budgetBtn}><Text style={styles.budgetText}>Medium</Text></TouchableOpacity>
              <TouchableOpacity style={styles.budgetBtn}><Text style={styles.budgetText}>High</Text></TouchableOpacity>
            </View>
            <View style={styles.row}>
              <TextInput style={styles.inputBox} placeholder="Min budget (LKR)" placeholderTextColor="#aaa" />
              <TextInput style={styles.inputBox} placeholder="Max budget (LKR)" placeholderTextColor="#aaa" />
            </View>

            {/* Food Categories */}
            <Text style={styles.sectionTitle}>Food categories</Text>
            <View style={styles.row}>
              <TouchableOpacity style={styles.foodBtn}><Text style={styles.foodText}>Non-veg</Text></TouchableOpacity>
              <TouchableOpacity style={styles.foodBtn}><Text style={styles.foodText}>Veg</Text></TouchableOpacity>
            </View>

            {/* Generate Button */}
            <TouchableOpacity style={styles.generateBtn}>
              <LinearGradient colors={['#ff9a9e', '#fad0c4']} style={styles.gradientBtn}>
                <Text style={styles.generateText}>Generate Plan</Text>
                <FontAwesome5 name="lightbulb" size={16} color="#000" style={{ marginLeft: 8 }} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  addPlace: { flexDirection: 'row', alignItems: 'center' },
  headerText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  history: { flexDirection: 'row', alignItems: 'center' },
  historyText: { color: '#00BFFF', fontSize: 15, fontWeight: '600' },

  // Card with glass effect
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },

  sectionTitle: { color: '#fff', fontWeight: '700', marginTop: 15, marginBottom: 8, fontSize: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },

  // Input with icon
  inputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', marginHorizontal: 5, backgroundColor: '#2E0740', borderRadius: 10, paddingHorizontal: 10, borderWidth: 1, borderColor: '#555' },
  inputWrapperFull: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, backgroundColor: '#2E0740', borderRadius: 10, paddingHorizontal: 10, borderWidth: 1, borderColor: '#555' },
  input: { flex: 1, color: '#fff', paddingVertical: 10 },
  icon: { marginRight: 6 },
  inputBox: { flex: 1, marginHorizontal: 5, borderWidth: 1, borderColor: '#555', borderRadius: 10, padding: 12, color: '#fff', backgroundColor: '#2E0740' },

  // Counter
  counterBox: { flex: 1, marginHorizontal: 5 },
  counterLabel: { color: '#fff', marginBottom: 6, fontWeight: '600' },
  counterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#2E0740', padding: 8, borderRadius: 10 },
  counterBtn: { backgroundColor: '#c000ff', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  counterBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  counterValue: { color: '#fff', fontSize: 16, fontWeight: '600' },

  // Budget & Food
  budgetBtn: { flex: 1, marginHorizontal: 4, backgroundColor: '#520075', padding: 12, borderRadius: 25, alignItems: 'center' },
  budgetText: { color: '#fff', fontWeight: '600' },
  foodBtn: { flex: 1, marginHorizontal: 4, backgroundColor: '#520075', padding: 12, borderRadius: 25, alignItems: 'center' },
  foodText: { color: '#fff', fontWeight: '600' },

  // Button
  generateBtn: { marginTop: 20 },
  gradientBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 15, borderRadius: 30, shadowColor: '#000', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 }, shadowRadius: 6 },
  generateText: { fontWeight: '700', fontSize: 16, color: '#000' },
});
