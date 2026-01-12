import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Text} from 'react-native-paper';

export default function HomeScreen() {
  return (
    <View style={styles.container} testID="home-screen">
      <Text variant="headlineMedium">Home</Text>
      <Text variant="bodyLarge">Welcome to Finance Tracker</Text>
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
