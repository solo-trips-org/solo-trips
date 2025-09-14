import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Animated } from 'react-native';

import { HapticTab } from '@/components/HapticTab';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        // ✅ Always fixed background (no dark mode change)
        tabBarStyle: {
          backgroundColor: '#F5F5F5', // light gray like your screenshot
          borderTopWidth:0,
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 4,
        },
        // ✅ Always fixed colors
        tabBarActiveTintColor: '#F9930B', // Red
        tabBarInactiveTintColor: '#808080', // Gray
      }}
    >
      {/* Home */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={22} color={color} />
          ),
        }}
      />

      {/* Search */}
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => (
            <Ionicons name="search" size={22} color={color} />
          ),
        }}
      />

      {/* Planner Center Tab */}
      <Tabs.Screen
        name="planner"
        options={{
          title: 'Planner',
          tabBarLabel: '',
          tabBarIcon: () => (
            <Animated.View
              style={{
                width: 55,
                height: 55,
                borderRadius: 28,
                backgroundColor: '#F9930B', // fixed red
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: '#E60000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
                elevation: 6,
              }}
            >
              <MaterialIcons name="event-note" size={28} color="white" />
            </Animated.View>
          ),
        }}
      />

      {/* Event */}
      <Tabs.Screen
        name="event"
        options={{
          title: 'Event',
          tabBarIcon: ({ color }) => (
            <Ionicons name="calendar" size={22} color={color} />
          ),
        }}
      />

      {/* Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-circle" size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
