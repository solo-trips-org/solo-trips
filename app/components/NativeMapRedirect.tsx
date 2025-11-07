import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';

interface NativeMapRedirectProps {
  latitude?: number;
  longitude?: number;
  placeName?: string;
  address?: string;
}

const NativeMapRedirect: React.FC<NativeMapRedirectProps> = ({ 
  latitude = 37.7749, 
  longitude = -122.4194,
  placeName = '',
  address = ''
}) => {
  const openInGoogleMaps = () => {
    const label = placeName || address || 'Location';
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}&query_place_id=${encodeURIComponent(label)}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Unable to open Google Maps');
    });
  };

  const openInAppleMaps = () => {
    const label = placeName || address || 'Location';
    const url = `http://maps.apple.com/?ll=${latitude},${longitude}&q=${encodeURIComponent(label)}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Unable to open Apple Maps');
    });
  };

  const openInNativeMap = () => {
    const label = placeName || address || 'Location';
    
    if (Platform.OS === 'ios') {
      openInAppleMaps();
    } else {
      openInGoogleMaps();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="location-outline" size={20} color="#667eea" />
        <Text style={styles.title}>Location</Text>
      </View>
      
      <View style={styles.mapPlaceholder}>
        <Ionicons name="map-outline" size={60} color="#667eea" />
        <Text style={styles.placeholderText}>Map View</Text>
        <Text style={styles.coordinatesText}>
          {latitude.toFixed(4)}, {longitude.toFixed(4)}
        </Text>
        
        <TouchableOpacity style={styles.openMapButton} onPress={openInNativeMap}>
          <Ionicons 
            name={Platform.OS === 'ios' ? 'logo-apple' : 'logo-google'} 
            size={20} 
            color="#fff" 
            style={styles.buttonIcon} 
          />
          <Text style={styles.buttonText}>
            Open in {Platform.OS === 'ios' ? 'Apple Maps' : 'Google Maps'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {(placeName || address) ? (
        <View style={styles.infoCard}>
          {placeName ? (
            <Text style={styles.placeName}>{placeName}</Text>
          ) : null}
          {address ? (
            <View style={styles.addressContainer}>
              <Ionicons name="location-sharp" size={16} color="#667eea" />
              <Text style={styles.addressText} numberOfLines={2}>
                {address}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d3436',
    marginLeft: 8,
  },
  mapPlaceholder: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 15,
    backgroundColor: '#f0f0f0',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d3436',
    marginTop: 10,
    marginBottom: 5,
  },
  coordinatesText: {
    fontSize: 14,
    color: '#636e72',
    marginBottom: 20,
  },
  openMapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#667eea',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 16,
  },
  placeName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d3436',
    marginBottom: 8,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressText: {
    flex: 1,
    fontSize: 16,
    color: '#2d3436',
    fontWeight: '500',
    marginLeft: 8,
  },
});

export default NativeMapRedirect;