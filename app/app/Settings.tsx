import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function Settings() {
  const router = useRouter();

  // Distance options
  const distances = [5, 10, 15, 20, 50, 100];
  const [selectedDistance, setSelectedDistance] = useState<number | null>(null);

  // Guide language options
  const languages = ['Tamil', 'English', 'Sinhala'];
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

  // Load saved settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      const savedDistance = await AsyncStorage.getItem('distanceFilter');
      if (savedDistance) setSelectedDistance(Number(savedDistance));

      const savedLanguage = await AsyncStorage.getItem('guideLanguage');
      if (savedLanguage) setSelectedLanguage(savedLanguage);
    };
    loadSettings();
  }, []);

  // Save distance
  const selectDistance = async (km: number) => {
    try {
      setSelectedDistance(km);
      await AsyncStorage.setItem('distanceFilter', km.toString());
      Alert.alert('Distance Selected', `Places within ${km} KM will be shown.`);
    } catch (error) {
      console.error('Error saving distance:', error);
    }
  };

  // Save guide language
  const selectLanguage = async (lang: string) => {
    try {
      setSelectedLanguage(lang);
      await AsyncStorage.setItem('guideLanguage', lang);
      Alert.alert('Language Selected', `${lang} guides will be shown.`);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}>
        {/* Distance Filter */}
        <Text style={styles.title}>Select Distance Filter</Text>
        <View style={styles.optionsContainer}>
          {distances.map((km) => (
            <TouchableOpacity
              key={km}
              style={[styles.optionButton, selectedDistance === km && styles.optionSelected]}
              onPress={() => selectDistance(km)}
              activeOpacity={0.8}
            >
              <Text style={[styles.optionText, selectedDistance === km && styles.optionTextSelected]}>{km} KM</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Language Filter */}
        <Text style={[styles.title, { marginTop: 40 }]}>Select Guide Language</Text>
        <View style={styles.optionsContainer}>
          {languages.map((lang) => (
            <TouchableOpacity
              key={lang}
              style={[styles.optionButton, selectedLanguage === lang && styles.optionSelected]}
              onPress={() => selectLanguage(lang)}
              activeOpacity={0.8}
            >
              <Text style={[styles.optionText, selectedLanguage === lang && styles.optionTextSelected]}>{lang}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A0033',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 15,
  },
  optionButton: {
    paddingVertical: 18,
    paddingHorizontal: 25,
    borderRadius: 25,
    backgroundColor: '#3a0a5a',
    margin: 5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    minWidth: 90,
  },
  optionSelected: {
    backgroundColor: '#c000ff',
    shadowColor: '#c000ff',
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
  },
  optionText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  optionTextSelected: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
});
