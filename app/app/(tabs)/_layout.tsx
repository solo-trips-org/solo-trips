import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  // Decide icon color based on theme
  const defaultIconColor = colorScheme === 'dark' ? 'white' : 'gray';
  // Decide label color based on theme
  const defaultLabelColor = colorScheme === 'dark' ? 'white' : 'gray';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: { position: 'absolute' },
          default: {},
        }),
      }}
    >
      {/* Home Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarLabelStyle: { color: defaultLabelColor },
          tabBarIcon: ({ size }) => (
            <Ionicons name="home" size={size} color={defaultIconColor} />
          ),
        }}
      />

      {/* Search Tab */}
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarLabelStyle: { color: defaultLabelColor },
          tabBarIcon: ({ size }) => (
            <Ionicons name="search" size={size} color={defaultIconColor} />
          ),
        }}
      />

      {/* Planner / Center Tab */}
      <Tabs.Screen
        name="planner"
        options={{
          title: 'Planner',
          tabBarLabel: 'Planner',
          tabBarLabelStyle: {
            color: colorScheme === 'dark' ? 'black' : 'white', // Special case
          },
          tabBarIcon: () => (
            <View
              style={{
                width: 73,
                height: 73,
                borderRadius: 50,
                backgroundColor: colorScheme === 'dark' ? 'white' : '#3A0751',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <MaterialIcons
                name="event-note"
                size={32}
                color={colorScheme === 'dark' ? 'black' : 'white'}
              />
            </View>
          ),
        }}
      />

      {/* Event Tab */}
      <Tabs.Screen
        name="event"
        options={{
          title: 'Event',
          tabBarLabelStyle: { color: defaultLabelColor },
          tabBarIcon: ({ size }) => (
            <Ionicons name="calendar" size={size} color={defaultIconColor} />
          ),
        }}
      />

      {/* Profile Tab */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarLabelStyle: { color: defaultLabelColor },
          tabBarIcon: ({ size }) => (
            <Ionicons
              name="person-circle"
              size={size}
              color={defaultIconColor}
            />
          ),
        }}
      />
    </Tabs>
  );
}
