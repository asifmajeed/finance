# Finance Tracker Mobile App - MVP Documentation

## Project Overview
A local-first mobile finance tracking app for Android and iOS that helps users manage their personal finances with SMS auto-import, budget tracking, and spending analysis.

**Timeline**: 4 weeks (1 month)
**Target Platforms**: Android & iOS

---

## Tech Stack

### Core Technologies
- **Framework**: React Native
- **UI Library**: React Native Paper (Material Design)
- **Database**: SQLite (react-native-sqlite-storage)
- **Navigation**: React Navigation
- **Charts**: react-native-chart-kit
- **State Management**: React Context API / Redux (team decision)

### Testing
- **Unit/Component Tests**: Jest + React Native Testing Library
- **E2E Tests**: Detox or Maestro
- **CI/CD**: GitHub Actions (optional)

### Future (v1.1+)
- **ML Framework**: TensorFlow Lite
- **LLM Integration**: User-provided API keys (OpenAI, Anthropic, etc.)

---

## Database Schema

### Tables

#### `transactions`
```sql
CREATE TABLE transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  amount REAL NOT NULL,
  description TEXT NOT NULL,
  date TEXT NOT NULL, -- ISO 8601 format
  type TEXT NOT NULL, -- 'income' or 'expense'
  category_id INTEGER,
  is_manually_set INTEGER DEFAULT 0, -- 0 or 1, for ML training later
  source TEXT, -- 'manual', 'sms', 'upload'
  raw_data TEXT, -- original SMS or file data
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);
```

#### `categories`
```sql
CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  icon TEXT, -- icon name from React Native Paper
  color TEXT, -- hex color code
  is_default INTEGER DEFAULT 0, -- 0 or 1
  created_at TEXT NOT NULL
);
```

#### `budgets`
```sql
CREATE TABLE budgets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  period TEXT NOT NULL, -- 'monthly', 'weekly'
  start_date TEXT NOT NULL,
  end_date TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);
```

#### `settings`
```sql
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

### Default Categories
Pre-populate on first launch:
- Food & Dining
- Transport
- Shopping
- Bills & Utilities
- Entertainment
- Health & Fitness
- Education
- Groceries
- Salary
- Other Income
- Uncategorized (default)

---

## Week 1: Foundation + Testing

### Day 1-2: Project Setup
**Tasks:**
- Initialize React Native project (latest stable version)
- Install and configure React Native Paper
- Set up React Navigation (bottom tabs + stack navigation)
- Configure ESLint + Prettier
- Set up Jest + React Native Testing Library
- Set up Detox/Maestro for E2E tests
- Create basic folder structure:
  ```
  src/
    components/
    screens/
    database/
    utils/
    navigation/
    hooks/
    constants/
    __tests__/
  ```

**Deliverables:**
- Running app with navigation skeleton
- Test setup verified (sample test passing)

### Day 3-4: Database & CRUD
**Tasks:**
- Implement SQLite database setup
- Create database migration system
- Implement transaction CRUD operations
- Implement category CRUD operations
- Write unit tests for all database operations
- Seed default categories on first launch

**Deliverables:**
- Database layer with full CRUD
- 80%+ test coverage on database layer

### Day 5-7: UI Components & Transaction Flow
**Tasks:**
- Create transaction list screen (with Paper List component)
- Create add/edit transaction form (with Paper TextInput, Button)
- Implement category picker (with Paper Menu/Dropdown)
- Add transaction filtering (date range, category, type)
- Create custom category addition flow
- Write component tests for all UI components
- Write integration tests for add transaction flow

**Deliverables:**
- Working transaction entry and listing
- Component + integration tests passing
- Basic E2E test (add transaction → see in list)

---

## Week 2: Data Import & Core Ledger

### Android SMS Import
**Tasks:**
- Request SMS read permission (Android only)
- Implement SMS listener for transaction messages
- Create SMS parser with regex patterns for common banks:
  - Pattern matching for amount, merchant, date
  - Detect debit vs credit
- Auto-create transactions from SMS
- Handle duplicate detection (same amount + date + description)

**SMS Parser Examples:**
```javascript
// Example patterns to detect
// "Debited Rs 500 from A/C XX1234 on 01-Jan-24 at SWIGGY"
// "Credited Rs 10000 to A/C XX1234 on 01-Jan-24 SALARY"
// "Spent Rs 250 via UPI to ZOMATO on 01-Jan-24"
```

**iOS Handling:**
- Show info message: "SMS auto-import not available on iOS"
- Provide manual entry as primary method

### File Upload
**Tasks:**
- Create file picker UI (PDF/images)
- Store uploaded files reference in database
- Show placeholder message: "Statement processing coming soon"
- Allow manual entry from uploaded statements

### Balance & Calculations
**Tasks:**
- Calculate current balance (sum of all transactions)
- Calculate monthly balance (current month)
- Show income vs expense breakdown
- Add balance display on home screen

**Deliverables:**
- SMS auto-import working (Android)
- File upload UI ready
- Balance calculations accurate

---

## Week 3: Budget & Analysis

### Budget Management
**Tasks:**
- Create budget creation screen
- Set budget amount per category
- Choose budget period (monthly/weekly)
- Edit/delete budgets
- Show budget vs actual spend progress bars

### Spending Analysis
**Tasks:**
- Implement chart components:
  - Monthly spending trend (line chart)
  - Category breakdown (pie/donut chart)
  - Income vs expense (bar chart)
- Create summary cards:
  - This month's spending
  - Biggest expense category
  - Budget adherence percentage
- Add date range filters (this week, this month, last 3 months)

### Alerts & Notifications
**Tasks:**
- Show warning when budget is 80% used
- Show alert when budget exceeded
- Daily/weekly summary notifications (optional)

**Deliverables:**
- Budget management fully functional
- 3+ chart types showing insights
- Budget alerts working

---

## Week 4: Polish & Deploy

### Settings & API Integration
**Tasks:**
- Create settings screen:
  - API key input (OpenAI, Anthropic, Gemini)
  - Theme selection (light/dark)
  - Currency selection
  - Notification preferences
- Implement optional LLM insights:
  - "Analyze my spending" button
  - Send transaction summary to LLM API
  - Display insights in readable format
  - Handle API errors gracefully

### Testing & Bug Fixes
**Tasks:**
- Run full test suite
- Fix failing tests
- Manual QA testing:
  - Test all user flows
  - Test on different screen sizes
  - Test permission flows
  - Test edge cases (no data, large datasets)
- Performance testing:
  - Test with 1000+ transactions
  - Optimize slow queries
  - Add pagination if needed

### App Store Preparation
**Tasks:**
- Create app icon (1024x1024)
- Create splash screen
- Generate screenshots (5-8 per platform)
- Write app description
- Prepare privacy policy (SMS, storage permissions)
- Set up app signing (Android & iOS)
- Build release APK/IPA
- Test release builds

**Deliverables:**
- Production-ready app
- App store assets ready
- Release builds tested

---

## Feature Requirements

### Must Have (v1)
- ✅ Manual transaction entry with validation
- ✅ Transaction list with search/filter
- ✅ Category assignment (manual)
- ✅ Custom category creation
- ✅ SMS auto-import (Android only)
- ✅ Budget creation and tracking
- ✅ Spending charts and summaries
- ✅ Balance calculations
- ✅ API-based insights (optional, user's keys)
- ✅ Automated test suite (80%+ coverage)

### Nice to Have (if time permits)
- Export data to CSV
- Dark mode support
- Multi-currency support
- Recurring transaction templates

### Deferred to v1.1
- On-device ML categorization (TensorFlow Lite)
- OCR for statement processing
- On-device LLM
- Advanced forecasting
- Anomaly detection
- Cloud backup/sync

---

## User Flows

### 1. First Launch
1. User opens app
2. Show onboarding (SMS permission explanation for Android)
3. Request SMS permission (Android)
4. Seed default categories
5. Show empty state with "Add Transaction" CTA

### 2. Add Transaction (Manual)
1. Tap "Add Transaction" FAB
2. Fill form:
   - Amount (required)
   - Description (required)
   - Date (default: today)
   - Type: Income/Expense (required)
   - Category (default: Uncategorized)
3. Tap "Save"
4. Transaction appears in list
5. Success toast shown

### 3. Auto-Import from SMS (Android)
1. Bank sends SMS
2. App detects transaction SMS in background
3. Parse amount, merchant, date
4. Create transaction with category "Uncategorized"
5. Show notification (optional)
6. User can edit category later

### 4. Set Budget
1. Navigate to Budgets tab
2. Tap "Add Budget"
3. Select category
4. Enter amount
5. Choose period (monthly/weekly)
6. Save budget
7. View progress on Budgets screen

### 5. View Insights
1. Navigate to Analysis tab
2. See charts for current month
3. Change date range filter
4. Optionally: tap "AI Insights" (if API key configured)
5. View LLM-generated spending analysis

---

## UI/UX Guidelines

### Design Principles
- **Material Design**: Follow React Native Paper guidelines
- **Local-first**: Emphasize offline capability
- **Privacy**: Clear messaging about on-device data storage
- **Accessibility**: Support screen readers, sufficient color contrast

### Key Screens

#### Home Screen (Transaction List)
- Top: Current balance card
- Filter chips (All, Income, Expense, Date range)
- Transaction list (grouped by date)
- FAB: Add transaction
- Bottom navigation

#### Add/Edit Transaction
- Form with Paper TextInput components
- Amount input (numeric keyboard)
- Description input
- Date picker
- Type selector (Income/Expense chips)
- Category dropdown
- Save/Cancel buttons

#### Budgets Screen
- List of budgets with progress bars
- Each budget shows: category, amount, spent, remaining
- Color coding (green → yellow → red)
- FAB: Add budget

#### Analysis Screen
- Summary cards at top
- Chart section (scrollable)
- Date range picker
- Optional: "AI Insights" button

#### Settings Screen
- API Keys section (collapsed by default)
- Appearance (theme)
- Notifications toggle
- About/Version info
- Export data option

---

## Testing Strategy

### Unit Tests (60% coverage target)
- Database operations
- Utility functions (parsers, calculators)
- Business logic

### Component Tests (20% coverage target)
- Form validation
- Button interactions
- List rendering
- Navigation

### Integration Tests (15% coverage target)
- Add transaction flow
- Edit category flow
- Budget creation flow

### E2E Tests (5% - critical paths)
- First launch → add transaction → view in list
- Create budget → add expense → see progress update
- SMS import → transaction created (Android only, mock SMS)

### Manual Testing Checklist
- [ ] All CRUD operations work
- [ ] SMS import detects common formats
- [ ] Charts render correctly
- [ ] Budget alerts trigger appropriately
- [ ] API insights work with valid keys
- [ ] App works offline
- [ ] Handles edge cases (empty states, errors)
- [ ] Performance with 1000+ transactions
- [ ] Both light and dark themes

---

## Performance Considerations

### Database
- Index on `transactions.date` for fast filtering
- Index on `transactions.category_id` for grouping
- Implement pagination for transaction list (50 items per page)

### SMS Parsing
- Run parser in background thread
- Batch process multiple SMS
- Debounce duplicate checks

### Charts
- Cache chart data
- Limit data points (aggregate if needed)
- Lazy load charts on scroll

---

## Security & Privacy

### Data Storage
- All data stored locally in SQLite
- No cloud storage in v1
- Clear privacy policy: "Your data never leaves your device"

### Permissions
- SMS read (Android): Explain clearly in onboarding
- Storage: For file uploads
- Notifications: For budget alerts

### API Keys
- Store encrypted in secure storage (react-native-keychain)
- Never log or transmit except to chosen API
- Clear warning: "Your API key is used directly, not stored on our servers"

---

## Known Limitations (v1)

### iOS
- No SMS auto-import (OS restriction)
- Manual entry only

### SMS Parsing
- May not detect all bank formats
- User can manually edit if miscategorized

### File Processing
- Upload UI exists but no OCR in v1
- Placeholder for future feature

### LLM Features
- Requires user's own API key
- Network dependent
- Optional feature

---

## Error Handling

### Common Scenarios
1. **SMS permission denied**: Show manual entry option
2. **Database error**: Show error toast, log to console
3. **API key invalid**: Clear error message, link to docs
4. **Network failure**: Graceful fallback, queue for retry
5. **Invalid transaction data**: Form validation with helpful messages

---

## Deployment Checklist

### Pre-Release
- [ ] All tests passing
- [ ] No console warnings/errors
- [ ] App icons generated (all sizes)
- [ ] Splash screen added
- [ ] Privacy policy drafted
- [ ] App description written
- [ ] Screenshots captured (5+ per platform)
- [ ] Version numbers set
- [ ] Release notes prepared

### Android
- [ ] Signing key generated
- [ ] Build signed APK
- [ ] Test on real device
- [ ] Upload to Play Console (internal testing track)

### iOS
- [ ] App ID created
- [ ] Certificates configured
- [ ] Build IPA
- [ ] Test on real device
- [ ] Upload to TestFlight

---

## Success Metrics (Post-Launch)

### Adoption
- 100+ downloads in first month
- 60% retention after 7 days

### Engagement
- Average 3+ transactions added per user per week
- 50% users set at least one budget

### Quality
- <5% crash rate
- <3 critical bugs reported

---

## Support & Documentation

### User Documentation
- In-app help tooltips
- FAQ section in settings
- Video tutorial (optional)

### Developer Documentation
- README with setup instructions
- API documentation (JSDoc)
- Database schema documentation
- Contributing guidelines

---

## Next Steps (v1.1 Planning)

### High Priority
1. On-device transaction categorization (TensorFlow Lite)
2. OCR for statement processing
3. Cloud backup option

### Medium Priority
4. Recurring transactions
5. Multi-currency support
6. Export to CSV/PDF

### Low Priority
7. On-device LLM
8. Advanced forecasting
9. Bill reminders

---

## Team Contacts & Resources

### Documentation
- React Native Paper: https://reactnativepaper.com/
- React Navigation: https://reactnavigation.org/
- SQLite: https://github.com/andpor/react-native-sqlite-storage

### Design Assets
- Material Icons: https://materialdesignicons.com/
- Color Palette: (TBD - use Paper theme defaults)

### API Documentation (for LLM integration)
- OpenAI: https://platform.openai.com/docs
- Anthropic: https://docs.anthropic.com/

---

## Revision History
- v1.0 - Initial MVP specification (2026-01-04)

---

**Questions or clarifications needed? Contact project lead before starting development.**
