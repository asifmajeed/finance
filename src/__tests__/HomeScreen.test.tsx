import React from 'react';
import {render, screen} from '@testing-library/react-native';
import HomeScreen from '../screens/HomeScreen';

describe('HomeScreen', () => {
  it('renders correctly', () => {
    render(<HomeScreen />);
    expect(screen.getByTestId('home-screen')).toBeTruthy();
  });

  it('displays the welcome message', () => {
    render(<HomeScreen />);
    expect(screen.getByText('Welcome to Finance Tracker')).toBeTruthy();
  });

  it('displays the title', () => {
    render(<HomeScreen />);
    expect(screen.getByText('Home')).toBeTruthy();
  });
});
