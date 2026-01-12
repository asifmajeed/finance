import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Text} from 'react-native-paper';

export default function BudgetsScreen() {
  return (
    <View style={styles.container} testID="budgets-screen">
      <Text variant="headlineMedium">Budgets</Text>
      <Text variant="bodyLarge">Manage your budgets here</Text>
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
