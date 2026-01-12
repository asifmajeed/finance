import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Text} from 'react-native-paper';

export default function AnalysisScreen() {
  return (
    <View style={styles.container} testID="analysis-screen">
      <Text variant="headlineMedium">Analysis</Text>
      <Text variant="bodyLarge">View your spending analysis</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
});
