# Task: Project Setup & Testing Configuration

**Estimated Time**: Day 1-2 of Week 1
**Dependencies**: None (Initial task)
**Priority**: Critical (Blocking)

---

## Context

This is the foundation task for the Finance Tracker Mobile App MVP. You're setting up a React Native application with Material Design UI, navigation, and a complete testing infrastructure.

### Tech Stack to Configure
- **Framework**: React Native (latest stable)
- **UI Library**: React Native Paper (Material Design)
- **Navigation**: React Navigation (bottom tabs + stack)
- **Testing**: Jest + React Native Testing Library + Detox/Maestro
- **Code Quality**: ESLint + Prettier

---

## Tasks

### 1. Initialize React Native Project
- [ ] Create new React Native project using latest stable version
- [ ] Verify project runs on both iOS and Android emulators/simulators

### 2. Install & Configure Dependencies
- [ ] Install React Native Paper
- [ ] Configure React Native Paper theme provider
- [ ] Install React Navigation dependencies:
  - @react-navigation/native
  - @react-navigation/bottom-tabs
  - @react-navigation/stack
  - react-native-screens
  - react-native-safe-area-context
- [ ] Set up basic navigation structure (bottom tabs + stack)

### 3. Code Quality Setup
- [ ] Install and configure ESLint
- [ ] Install and configure Prettier
- [ ] Add npm scripts for linting and formatting
- [ ] Create .eslintrc and .prettierrc configuration files

### 4. Testing Infrastructure
- [ ] Configure Jest (should come with React Native)
- [ ] Install React Native Testing Library (@testing-library/react-native)
- [ ] Install and configure Detox OR Maestro for E2E tests
- [ ] Write and run a sample test to verify setup works
- [ ] Add test scripts to package.json

### 5. Project Structure
Create the following folder structure:
```
src/
  components/       # Reusable UI components
  screens/         # Screen components
  database/        # SQLite operations and schema
  utils/           # Helper functions
  navigation/      # Navigation configuration
  hooks/           # Custom React hooks
  constants/       # App constants (colors, default values, etc.)
  __tests__/       # Test files
```

---

## Deliverables

### Must Have
1. ✅ React Native app running on both platforms
2. ✅ Bottom tab navigation working (create placeholder screens: Home, Budgets, Analysis, Settings)
3. ✅ React Native Paper components rendering correctly
4. ✅ At least one passing unit test
5. ✅ At least one passing E2E test (can be basic app launch test)
6. ✅ ESLint and Prettier configured and working
7. ✅ Folder structure created with README in each folder

### Nice to Have
- GitHub Actions workflow file for CI (optional)
- VSCode settings for consistent development experience

---

## Verification Steps

1. Run `npm test` - should pass
2. Run `npm run lint` - should pass with no errors
3. Run E2E test suite - should pass
4. Navigate between tabs - should work smoothly
5. Hot reload should work during development

---

## Common Issues & Solutions

**Issue**: Metro bundler cache issues
**Solution**: Run `npm start -- --reset-cache`

**Issue**: Detox build fails
**Solution**: Make sure Xcode/Android Studio are properly configured; check Detox documentation for platform-specific setup

**Issue**: Navigation not working
**Solution**: Verify all navigation dependencies are installed and linked properly

---

## Testing Requirements

### Unit Tests (Example)
```javascript
// src/__tests__/App.test.js
import { render } from '@testing-library/react-native';
import App from '../App';

describe('App', () => {
  it('renders without crashing', () => {
    const { getByText } = render(<App />);
    expect(getByText).toBeDefined();
  });
});
```

### E2E Test (Example)
```javascript
// e2e/app.test.js - for Detox
describe('App Launch', () => {
  it('should launch app successfully', async () => {
    await device.launchApp();
    await expect(element(by.id('home-screen'))).toBeVisible();
  });
});
```

---

## References

- React Native Paper Docs: https://reactnativepaper.com/
- React Navigation Docs: https://reactnavigation.org/
- Detox Docs: https://wix.github.io/Detox/
- Maestro Docs: https://maestro.mobile.dev/

---

## Next Task

After completing this task, proceed to: **week1-task2-database-crud.md**
