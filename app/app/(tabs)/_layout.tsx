import { Tabs } from 'expo-router';
import React from 'react';
import { View, Animated, Platform, Dimensions } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { HapticTab } from '@/components/HapticTab';

const { width } = Dimensions.get('window');

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 78,
          borderRadius: 0,
          backgroundColor: '#fff',
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.1,
          shadowRadius: 0,
          elevation: 5,
        },
        tabBarActiveTintColor: '#F9930B',
        tabBarInactiveTintColor: '#A0A0A0',
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 0,
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

      {/* Planner / Center Floating Button */}
      <Tabs.Screen
        name="planner"
        options={{
          tabBarLabel: '',
          tabBarIcon: () => (
            <Animated.View
              style={{
                width: 70,
                height: 70,
                borderRadius: 35,
                backgroundColor: '#F9930B',
                justifyContent: 'center',
                alignItems: 'center',
                top: -30,
                shadowColor: '#F9930B',
                shadowOffset: { width: 0, height: 5 },
                shadowOpacity: 0.4,
                shadowRadius: 25,
                elevation: 8,
              }}
            >
              <MaterialIcons name="event-note" size={30} color="white" />
            </Animated.View>
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
          tabBarIcon: ({ color }) => <Ionicons name="person-circle-outline" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
