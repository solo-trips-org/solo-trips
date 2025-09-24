import { ReactNode } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';

type Props = {
  children: ReactNode;
  backgroundColor?: string;
};

export default function SafeArea({ children, backgroundColor = '#2E0740"' }: Props) {
  return (
    <SafeAreaView edges={['top']} style={[styles.containerSafe, { backgroundColor }]}>
      {children}
    </SafeAreaView>
  ); 
}

const styles = StyleSheet.create({
  containerSafe: {
    width: '100%',
    height:'auto',
    backgroundColor: '#fff',
    marginTop   : 2,
    marginBottom: 2,
     color: '#999a9533',
    paddingBottom:0,
    paddingHorizontal: 0,  
    flex: 1,
  },
});
