import { ReactNode } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';

type Props = {
  children: ReactNode;
  backgroundColor?: string;
};

export default function SafeArea({ children, backgroundColor = '#fff' }: Props) {
  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor }]}>
      {children}
    </SafeAreaView>
  ); 
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height:'50%',
    flex: 1,
  },
});
