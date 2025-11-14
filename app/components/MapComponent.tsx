import React from 'react';
import { View, StyleSheet } from 'react-native';
import NativeMapRedirect from './NativeMapRedirect';

interface MapComponentProps {
  latitude?: number;
  longitude?: number;
  address?: string;
  placeName?: string;
}

const MapComponent: React.FC<MapComponentProps> = ({ 
  latitude = 37.7749, 
  longitude = -122.4194,
  address = '',
  placeName = '' 
}) => {
  return (
    <View style={styles.container}>
      <NativeMapRedirect 
        latitude={latitude}
        longitude={longitude}
        address={address}
        placeName={placeName}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
});

export default MapComponent;