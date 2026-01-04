# Task: App Store Preparation & Deployment

**Estimated Time**: Week 4, Part 3
**Dependencies**: week4-task2-testing-bugs.md (all testing complete)
**Priority**: Critical (Launch requirement)

---

## Context

Prepare the app for production release on Google Play Store (Android) and Apple App Store (iOS). This includes creating app assets, writing store listings, configuring app signing, building release versions, and submitting for review.

### Deliverables
- Production-ready APK/AAB (Android)
- Production-ready IPA (iOS)
- App store listings complete
- Privacy policy published
- App submitted for review

---

## Pre-Release Checklist

### 1. App Configuration
- [ ] Set correct app name in `app.json`
- [ ] Set version number (1.0.0)
- [ ] Set build number (1)
- [ ] Update bundle identifier (com.yourcompany.financetracker)
- [ ] Remove console.log statements (or use production build to strip them)
- [ ] Disable debug mode
- [ ] Configure production API endpoints (if any)

### 2. Legal Requirements
- [ ] Privacy policy drafted and published
- [ ] Terms of service drafted (if needed)
- [ ] Data collection disclosure accurate
- [ ] Permissions justified in privacy policy

---

## App Assets Creation

### 1. App Icon

Create app icon in multiple sizes:

**Required Sizes:**
- **Master**: 1024x1024 (for store listing)
- **Android**: 512x512, 192x192, 144x144, 96x96, 72x72, 48x48
- **iOS**: 1024x1024, 180x180, 167x167, 152x152, 120x120, 87x87, 80x80, 76x76, 60x60, 58x58, 40x40, 29x29, 20x20

**Icon Guidelines:**
- Simple, recognizable design
- No text (icon should work at small sizes)
- Related to finance/money (e.g., wallet, coin, chart)
- Professional appearance
- Works on both light and dark backgrounds

**Tools:**
- Use icon generator: https://www.appicon.co/
- Or use React Native Asset Generator

```bash
# Generate icons from 1024x1024 master
npx react-native generate-bootsplash path/to/logo.png \
  --background-color=FFFFFF \
  --logo-width=200
```

### 2. Splash Screen

Create splash screen:
- Background color matching brand
- App logo centered
- Simple and fast-loading
- No text or complex graphics

```bash
# Generate splash screen
npx react-native generate-bootsplash path/to/logo.png \
  --platforms=android,ios \
  --background-color=673AB7
```

### 3. Screenshots

Capture 5-8 screenshots per platform:

**Required Screenshots:**
1. **Home screen** - Transaction list with balance
2. **Add transaction** - Form filled out
3. **Budget screen** - Budgets with progress bars
4. **Analysis screen** - Charts and insights
5. **Settings screen** - All options visible
6. (Optional) SMS import feature (Android)
7. (Optional) AI insights result

**Screenshot Sizes:**

**Android:**
- Phone: 1080 x 1920 (or actual device resolution)
- Tablet: 1200 x 1920

**iOS:**
- 6.7" (iPhone 14 Pro Max): 1290 x 2796
- 6.5" (iPhone 11 Pro Max): 1242 x 2688
- 5.5" (iPhone 8 Plus): 1242 x 2208
- iPad Pro 12.9": 2048 x 2732

**Tips:**
- Use emulator/simulator with demo data
- Ensure data is realistic (no test values)
- Highlight key features
- Use framing/device mockups (optional)

### 4. Feature Graphic (Android)

Create feature graphic for Google Play:
- Size: 1024 x 500 pixels
- Shows key app features
- No important elements near edges
- Include app name and tagline

---

## Store Listing Content

### 1. App Name
**Primary**: "Finance Tracker" or "Personal Finance Manager"
**Subtitle** (iOS): "Budget & Expense Tracking"

Keep it:
- Under 30 characters
- Searchable (include keywords if possible)
- Professional and clear

### 2. Short Description (Google Play, 80 chars)
```
Track expenses, manage budgets, and gain insights into your spending habits.
```

### 3. Full Description (4000 chars max)

```markdown
# Personal Finance Tracker

Take control of your finances with our intuitive, local-first expense tracking app. Manage your money, set budgets, and make smarter financial decisions - all from your phone.

## Key Features

📊 **Expense Tracking**
- Quick transaction entry
- Auto-import from SMS (Android)
- Category-based organization
- Smart search and filters

💰 **Budget Management**
- Set monthly or weekly budgets
- Real-time progress tracking
- Alerts when approaching limits
- Visual progress indicators

📈 **Spending Analysis**
- Beautiful charts and graphs
- Category breakdowns
- Income vs expense trends
- Monthly spending patterns

🤖 **AI-Powered Insights** (Optional)
- Use your own OpenAI/Anthropic/Gemini API key
- Get personalized spending advice
- Identify saving opportunities
- Understand spending patterns

🔒 **Privacy First**
- 100% local data storage
- No cloud sync (your data stays on your device)
- No account required
- No ads or tracking

📤 **Export & Backup**
- Export to CSV
- Share transaction data
- Keep your records safe

## Why Choose Finance Tracker?

✓ Simple and intuitive interface
✓ Fast and responsive
✓ Works completely offline
✓ No subscription fees
✓ Open source (optional: if you plan to open source)

## Perfect For

- Budget-conscious individuals
- Expense tracking beginners
- Privacy-focused users
- Anyone wanting to save money

## Permissions

- SMS (Android only): Auto-import transaction from bank messages
- Storage: Export and import data
- Notifications: Budget alerts

Download now and start your journey to financial wellness!
```

### 4. Keywords (iOS, 100 chars)
```
budget,expense,finance,money,tracker,spending,savings,wallet,bills,income
```

**Tips:**
- Research popular keywords in category
- Avoid repeating words from app name
- Use comma-separated list

### 5. Category
- **Primary**: Finance
- **Secondary**: Productivity

### 6. Content Rating
- **Android**: Everyone
- **iOS**: 4+ (No objectionable content)

### 7. Contact Information
- Support email: support@yourapp.com
- Website: https://yourapp.com (optional)
- Privacy policy URL: https://yourapp.com/privacy

---

## Privacy Policy

### Privacy Policy Template

```markdown
# Privacy Policy for Finance Tracker

Last updated: [Date]

## Overview
Finance Tracker is committed to protecting your privacy. This policy explains how we handle your data.

## Data Collection
We DO NOT collect, store, or transmit your financial data to any servers.

### What We Don't Collect:
- We don't collect transaction data
- We don't collect personal information
- We don't use analytics or tracking
- We don't share data with third parties

### Local Storage Only:
All your data is stored locally on your device using SQLite. Your transaction data, budgets, and settings never leave your device.

## Permissions

### SMS Permission (Android Only)
- Used to: Automatically import transaction from bank SMS
- Your SMS data: Only banking SMS are read, stored locally
- We never transmit SMS data to any server

### Storage Permission
- Used to: Save and restore your data, export to CSV
- Your files: Stored only on your device

### Notification Permission
- Used to: Send budget alerts and summaries
- Opt-in: You can disable notifications in settings

## Third-Party Services (Optional)

### AI Insights (Optional Feature)
If you choose to use AI insights:
- You provide your own API key (OpenAI, Anthropic, or Gemini)
- Your transaction summary is sent to your chosen provider's API
- We don't store or access your API key or data
- Review your AI provider's privacy policy for their data handling

## Data Security
- All data encrypted at rest (platform-provided encryption)
- API keys stored in secure keychain
- No network transmission of financial data

## Your Rights
- You can delete all data anytime from app settings
- You can export your data to CSV
- You can request app deletion removes all local data

## Children's Privacy
This app is not directed at children under 13. We don't knowingly collect data from children.

## Changes to This Policy
We may update this policy. Changes will be posted in the app and on our website.

## Contact Us
Questions? Contact us at: support@yourapp.com
```

**Publish at**: yourapp.com/privacy or use GitHub Pages

---

## Android Release Build

### 1. Generate Signing Key

```bash
# Generate release keystore
keytool -genkeypair -v -storetype PKCS12 -keystore finance-tracker-release.keystore \
  -alias finance-tracker -keyalg RSA -keysize 2048 -validity 10000

# Note: Save the passwords securely!
```

### 2. Configure Gradle

Edit `android/gradle.properties`:
```properties
MYAPP_RELEASE_STORE_FILE=finance-tracker-release.keystore
MYAPP_RELEASE_KEY_ALIAS=finance-tracker
MYAPP_RELEASE_STORE_PASSWORD=***
MYAPP_RELEASE_KEY_PASSWORD=***
```

Edit `android/app/build.gradle`:
```gradle
android {
    ...
    signingConfigs {
        release {
            if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
                storeFile file(MYAPP_RELEASE_STORE_FILE)
                storePassword MYAPP_RELEASE_STORE_PASSWORD
                keyAlias MYAPP_RELEASE_KEY_ALIAS
                keyPassword MYAPP_RELEASE_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        release {
            ...
            signingConfig signingConfigs.release
        }
    }
}
```

### 3. Build AAB (Android App Bundle)

```bash
# Navigate to android directory
cd android

# Build release AAB
./gradlew bundleRelease

# Output: android/app/build/outputs/bundle/release/app-release.aab
```

### 4. Test Release Build

```bash
# Install on device
npx react-native run-android --variant=release

# Test thoroughly:
# - App launches
# - All features work
# - No debug logs
# - Performance is good
```

### 5. Upload to Google Play Console

**Steps:**
1. Go to https://play.google.com/console
2. Create app (one-time $25 fee)
3. Complete store listing:
   - Upload screenshots
   - Add description
   - Set category
4. Upload AAB to internal testing track
5. Complete content rating questionnaire
6. Add privacy policy URL
7. Set up app pricing (free)
8. Submit for review

**Timeline:** 1-3 days for review

---

## iOS Release Build

### 1. Configure Xcode Project

1. Open `ios/FinanceTracker.xcworkspace` in Xcode
2. Select project → General tab
3. Set:
   - Display Name: Finance Tracker
   - Bundle Identifier: com.yourcompany.financetracker
   - Version: 1.0.0
   - Build: 1

### 2. App Signing

1. In Xcode, select Signing & Capabilities
2. Enable "Automatically manage signing"
3. Select your Apple Developer team
4. Xcode will generate provisioning profile

**Requirements:**
- Apple Developer account ($99/year)
- Valid payment method

### 3. Build Archive

```bash
# Build from command line (or use Xcode)
cd ios
xcodebuild -workspace FinanceTracker.xcworkspace \
  -scheme FinanceTracker \
  -configuration Release \
  -archivePath FinanceTracker.xcarchive \
  archive
```

Or in Xcode:
1. Product → Scheme → Edit Scheme → Set to Release
2. Product → Archive
3. Wait for build to complete

### 4. Upload to App Store Connect

1. In Xcode Organizer (Window → Organizer)
2. Select archive
3. Click "Distribute App"
4. Choose "App Store Connect"
5. Follow wizard to upload

### 5. Complete App Store Listing

**In App Store Connect:**
1. Create new app
2. Fill in metadata:
   - Name, subtitle, description
   - Keywords
   - Screenshots
   - Category
3. Set pricing (free)
4. Add privacy policy URL
5. Complete App Privacy questionnaire:
   - Data types collected: None (or specify if using analytics)
   - SMS: Used for app functionality (not collected)
6. Submit for review

**Timeline:** 1-3 days for review (sometimes longer)

---

## Post-Submission Checklist

- [ ] AAB uploaded to Google Play
- [ ] IPA uploaded to App Store Connect
- [ ] Store listings complete on both platforms
- [ ] Screenshots uploaded (all required sizes)
- [ ] Privacy policy URL added
- [ ] Content rating completed
- [ ] Pricing set (free)
- [ ] Support email configured
- [ ] Apps submitted for review
- [ ] Release notes prepared
- [ ] Monitoring set up (crash reporting)

---

## Common Rejection Reasons & Fixes

### Google Play

**Issue**: Missing privacy policy
**Fix**: Add privacy policy URL in store listing

**Issue**: Permissions not justified
**Fix**: Explain each permission in description

**Issue**: Content rating incomplete
**Fix**: Complete questionnaire accurately

### App Store

**Issue**: Missing App Privacy details
**Fix**: Complete privacy questionnaire in App Store Connect

**Issue**: Screenshots don't match app
**Fix**: Ensure screenshots are from actual app, not mockups

**Issue**: Incomplete metadata
**Fix**: Fill in all required fields (description, keywords, etc.)

**Issue**: Guideline 4.3 (spam/duplicate)
**Fix**: Ensure app is unique and provides value

---

## Monitoring & Analytics (Optional)

Consider adding (post-launch):
- Crash reporting: Sentry, Bugsnag
- Analytics: Google Analytics, Mixpanel (with user consent)
- Performance monitoring: Firebase Performance

**Important**: Update privacy policy if adding any tracking!

---

## Deliverables

### Must Have
1. ✅ App icon created (all sizes)
2. ✅ Splash screen created
3. ✅ Screenshots captured (5+ per platform)
4. ✅ Store listings written (name, description, keywords)
5. ✅ Privacy policy published
6. ✅ Signed release builds (AAB + IPA)
7. ✅ Apps uploaded to stores
8. ✅ Submitted for review

### Post-Launch
- Monitor reviews and ratings
- Respond to user feedback
- Fix critical bugs quickly (hotfix releases)
- Plan v1.1 features based on feedback

---

## References

- Google Play Console: https://play.google.com/console
- App Store Connect: https://appstoreconnect.apple.com
- Android App Bundle: https://developer.android.com/guide/app-bundle
- iOS App Distribution: https://developer.apple.com/app-store/review/guidelines/

---

## Congratulations!

You've completed the MVP! The app is now live on app stores. Next steps:
- Monitor user feedback
- Track key metrics (downloads, retention, ratings)
- Plan v1.1 with ML categorization and OCR features
- Iterate based on user needs

**Well done! 🎉**
