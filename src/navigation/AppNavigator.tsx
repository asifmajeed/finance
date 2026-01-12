import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import BudgetsScreen from '../screens/BudgetsScreen';
import AnalysisScreen from '../screens/AnalysisScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: true,
        }}>
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{title: 'Home'}}
        />
        <Tab.Screen
          name="Budgets"
          component={BudgetsScreen}
          options={{title: 'Budgets'}}
        />
        <Tab.Screen
          name="Analysis"
          component={AnalysisScreen}
          options={{title: 'Analysis'}}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{title: 'Settings'}}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
