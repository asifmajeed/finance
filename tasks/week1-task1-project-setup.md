# Task: Project Setup & Testing Configuration

**Status**: ✅ COMPLETED
**Estimated Time**: Day 1-2 of Week 1
**Actual Time**: Completed
**Dependencies**: None (Initial task)
**Priority**: Critical (Blocking)

---

## Completion Summary

All deliverables completed successfully:
- ✅ React Native 0.83.1 app initialized and running
- ✅ React Native Paper UI library integrated
- ✅ Bottom tab navigation with 4 screens (Home, Budgets, Analysis, Settings)
- ✅ Jest unit testing configured and passing
- ✅ Detox E2E testing fully configured with native Android integration
- ✅ 5 E2E tests passing (app launch + navigation)
- ✅ ESLint and Prettier configured
- ✅ Project structure created with proper organization

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
- [x] Create new React Native project using latest stable version (React Native 0.83.1)
- [x] Verify project runs on both iOS and Android emulators/simulators

### 2. Install & Configure Dependencies
- [x] Install React Native Paper
- [x] Configure React Native Paper theme provider
- [x] Install React Navigation dependencies:
  - @react-navigation/native
  - @react-navigation/bottom-tabs
  - @react-navigation/stack
  - react-native-screens
  - react-native-safe-area-context
- [x] Set up basic navigation structure (bottom tabs + stack)

### 3. Code Quality Setup
- [x] Install and configure ESLint
- [x] Install and configure Prettier
- [x] Add npm scripts for linting and formatting
- [x] Create .eslintrc and .prettierrc configuration files

### 4. Testing Infrastructure
- [x] Configure Jest (comes with React Native)
- [x] Install React Native Testing Library (@testing-library/react-native)
- [x] Install and configure Detox for E2E tests (v20.46.3)
- [x] Configure Detox native Android integration
- [x] Write and run sample tests to verify setup works
- [x] Add test scripts to package.json

### 5. Project Structure
Created the following folder structure:
```
src/
  components/       # Reusable UI components
  screens/         # Screen components (Home, Budgets, Analysis, Settings)
  database/        # SQLite operations and schema
  utils/           # Helper functions
  navigation/      # Navigation configuration
  hooks/           # Custom React hooks
  constants/       # App constants (colors, default values, etc.)
  __tests__/       # Unit test files
e2e/               # E2E test files (Detox)
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

1. ✅ Run `npm test` - all unit tests pass
2. ✅ Run `npm run lint` - no errors
3. ✅ Run E2E test suite:
   - Terminal 1: `npm start` (start Metro bundler)
   - Terminal 2: `npm run e2e:build` (build APKs with Detox)
   - Terminal 2: `npm run e2e:test` (run E2E tests)
   - Result: 5 tests passed (app launch, navigation tests)
4. ✅ Navigate between tabs - works smoothly
5. ✅ Hot reload works during development

---

## Common Issues & Solutions

**Issue**: Metro bundler cache issues
**Solution**: Run `npm start -- --reset-cache`

**Issue**: Detox tests timeout with "waiting for ready message (over WebSocket)"
**Solution**: This means Detox native integration is missing. Required setup:
- Add Detox maven repository to `android/build.gradle`
- Add `androidTestImplementation('com.wix:detox:+')` to `android/app/build.gradle`
- Create `DetoxTest.java` in `android/app/src/androidTest/java/[package]/`
- Add `testBuildType` and `testInstrumentationRunner` to app `defaultConfig`
- Create network security config XML for Metro communication
- Build with `assembleAndroidTest` flag

**Issue**: E2E tests can't launch app
**Solution**: Metro bundler must be running before starting E2E tests in debug mode. Start Metro first (`npm start`), then run tests.

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

### E2E Test (Actual Implementation)
```javascript
// e2e/app.e2e.js - Detox tests
describe('Finance Tracker App', () => {
  beforeAll(async () => {
    await device.launchApp({newInstance: true});
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should launch app successfully', async () => {
    await expect(element(by.id('home-screen'))).toBeVisible();
  });

  it('should display welcome message on home screen', async () => {
    await expect(element(by.text('Welcome to Finance Tracker'))).toBeVisible();
  });

  it('should navigate to Budgets tab', async () => {
    await element(by.text('Budgets')).tap();
    await expect(element(by.id('budgets-screen'))).toBeVisible();
  });

  it('should navigate to Analysis tab', async () => {
    await element(by.text('Analysis')).tap();
    await expect(element(by.id('analysis-screen'))).toBeVisible();
  });

  it('should navigate to Settings tab', async () => {
    await element(by.text('Settings')).tap();
    await expect(element(by.id('settings-screen'))).toBeVisible();
  });
});
```

**Test Results**: All 5 tests passing ✅

---

## Detox E2E Setup Details

### Configuration Files Created
1. `.detoxrc.js` - Detox configuration with Android emulator setup
2. `e2e/config.json` - Jest configuration for E2E tests
3. `e2e/environment.js` - Custom Detox Jest environment
4. `e2e/app.e2e.js` - E2E test suite

### Android Native Integration
1. **android/build.gradle**: Added Detox maven repository
2. **android/app/build.gradle**:
   - Added Detox dependencies
   - Configured test build type and instrumentation runner
3. **android/app/src/androidTest/java/com/financetracker/DetoxTest.java**: Native test runner
4. **android/app/src/main/res/xml/network_security_config.xml**: Network config for Metro
5. **android/app/src/main/AndroidManifest.xml**: Added network security config reference

### Running E2E Tests
```bash
# Terminal 1 - Start Metro bundler (required for debug builds)
npm start

# Terminal 2 - Build and test
npm run e2e:build    # Builds debug APK with test APK
npm run e2e:test     # Runs all E2E tests
```

**Important**: Metro must be running before E2E tests for debug builds, as the JavaScript bundle is loaded from Metro, not bundled in the APK.

---

## References

- React Native Paper Docs: https://reactnativepaper.com/
- React Navigation Docs: https://reactnavigation.org/
- Detox Docs: https://wix.github.io/Detox/
- Maestro Docs: https://maestro.mobile.dev/

---

## Next Task

After completing this task, proceed to: **week1-task2-database-crud.md**
