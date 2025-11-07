import { ReactNode } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';

type Props = {
  children: ReactNode;
  backgroundColor?: string;
};

export default function SafeArea({ children, backgroundColor = '#2E0740' }: Props) {
  return (
    <SafeAreaView style={[styles.containerSafe, { backgroundColor }]}>
      {children}
    </SafeAreaView>
  ); 
}

const styles = StyleSheet.create({
  containerSafe: {
    flex: 1,
    // Apply safe area insets to all edges to prevent overlap with device UI
    // This will ensure content doesn't go under notches, status bars, or navigation buttons
  },
});