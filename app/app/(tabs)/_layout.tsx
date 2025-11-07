import { Tabs } from 'expo-router';
import React from 'react';
import { View, StyleSheet, Platform, Dimensions } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { HapticTab } from '@/components/HapticTab';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height } = Dimensions.get('window');
const TAB_HEIGHT = Math.max(height * 0.05, 60); // min 60

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarHideOnKeyboard: true, // Hide tab bar when keyboard is visible
        tabBarStyle: {
          height: TAB_HEIGHT + insets.bottom,
          backgroundColor: '#fff',
          borderTopWidth: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 8,
          position: 'absolute',
          bottom: 0,
          paddingBottom: insets.bottom,
          paddingHorizontal: Platform.OS === 'ios' ? 0 : 0,
        },
        tabBarActiveTintColor: '#F9930B',
        tabBarInactiveTintColor: '#A0A0A0',
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: Platform.OS === 'ios' ? 0 : 4,
        },
      }}
    >
      {/* Home */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={24} color={color} />,
        }}
      />

      {/* Search */}
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => <Ionicons name="search-outline" size={24} color={color} />,
        }}
      />

      {/* Floating Planner */}
      <Tabs.Screen
        name="planner"
        options={{
          tabBarLabel: '',
          tabBarIcon: () => (
            <View style={styles.floatingButton}>
              <MaterialIcons name="event-note" size={32} color="#fff" />
            </View>
          ),
        }}
      />

      {/* Event */}
      <Tabs.Screen
        name="event"
        options={{
          title: 'Event',
          tabBarIcon: ({ color }) => <Ionicons name="calendar-outline" size={24} color={color} />,
        }}
      />

      {/* Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-circle-outline" size={26} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    alignSelf: 'center',
    width: 65,
    height: 65,
    borderRadius: 35,
    backgroundColor: '#F9930B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F9930B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 0.3,
    elevation: 10,
    bottom: -25, // Position it centered on the tab bar
  },
});