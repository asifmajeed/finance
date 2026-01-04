# Task: SMS Auto-Import (Android Only)

**Estimated Time**: Week 2, Part 1
**Dependencies**: week1-task2-database-crud.md (database layer)
**Priority**: High (Core feature for Android)

---

## Context

Implement automatic transaction detection from SMS messages on Android devices. This feature reads bank SMS notifications and automatically creates transaction entries. **This feature is Android-only** due to iOS platform restrictions.

### Tech Stack
- **Permissions**: react-native-permissions
- **SMS Reading**: @react-native-community/sms or custom native module
- **Parsing**: Regular expressions (regex)
- **Background Processing**: React Native background tasks (optional)

---

## Platform Handling

### Android
- Request SMS READ permission
- Listen for incoming SMS
- Parse banking SMS messages
- Auto-create transactions

### iOS
- Show informational message: "SMS auto-import is not available on iOS due to platform restrictions"
- Guide users to manual entry
- Optionally suggest file upload (future feature)

---

## SMS Parser Requirements

### Common Bank SMS Formats to Support

```
Examples to detect:
1. "Debited Rs 500 from A/C XX1234 on 01-Jan-24 at SWIGGY"
2. "Credited Rs 10000 to A/C XX1234 on 01-Jan-24 SALARY"
3. "Spent Rs 250 via UPI to ZOMATO on 01-Jan-24"
4. "Rs 1500 debited from A/C XX9876 for AMAZON on 02-Jan-24"
5. "Your A/C XX1234 credited with Rs 5000 on 03-Jan-24"
6. "UPI payment of Rs 350 to Swiggy completed on 04-Jan-24"
```

### Parsing Strategy
1. **Amount Detection**: Look for currency (Rs, INR, $, USD) followed by number
2. **Type Detection**: Keywords: "debited", "spent", "paid" = expense; "credited", "received" = income
3. **Merchant Detection**: Common patterns after amount or keywords
4. **Date Detection**: Various date formats (DD-MMM-YY, DD/MM/YYYY, etc.)

---

## Tasks

### 1. Install Dependencies
- [ ] Install `react-native-permissions` for permission handling
- [ ] Install SMS reading library (e.g., `react-native-sms-retriever` or `@react-native-community/sms`)
- [ ] Link native modules if required

### 2. Permission Management

Create `src/utils/smsPermissions.js`:

- [ ] Check if platform is Android
- [ ] Request SMS READ permission
- [ ] Handle permission denial gracefully
- [ ] Show rationale before requesting permission
- [ ] Store permission status in app state

```javascript
import { PermissionsAndroid, Platform } from 'react-native';

export const requestSMSPermission = async () => {
  if (Platform.OS !== 'android') {
    return false;
  }

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_SMS,
      {
        title: 'SMS Permission',
        message: 'This app needs access to read banking SMS to auto-import transactions',
        buttonPositive: 'OK',
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.error('Error requesting SMS permission:', err);
    return false;
  }
};
```

### 3. SMS Listener

Create `src/services/smsListener.js`:

- [ ] Set up SMS listener for incoming messages
- [ ] Filter only banking SMS (from known senders)
- [ ] Pass SMS to parser
- [ ] Handle listener lifecycle (start/stop)

### 4. SMS Parser

Create `src/utils/smsParser.js`:

#### Core Parsing Functions
- [ ] `isBankingSMS(sms)` - Detect if SMS is from bank
- [ ] `parseAmount(text)` - Extract amount
- [ ] `parseType(text)` - Determine income vs expense
- [ ] `parseMerchant(text)` - Extract merchant/description
- [ ] `parseDate(text)` - Extract transaction date
- [ ] `parseSMS(smsBody)` - Main parser that combines all

#### Regex Patterns
```javascript
const PATTERNS = {
  amount: /(?:rs\.?|inr|₹)\s*([0-9,]+(?:\.[0-9]{2})?)/i,
  debit: /debited|spent|paid|payment|deducted/i,
  credit: /credited|received|deposited/i,
  merchant: /(?:at|to|from)\s+([A-Z0-9\s]+)/i,
  date: /(\d{1,2}[-\/]\w{3}[-\/]\d{2,4})|(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
  account: /A\/C\s*(?:XX)?(\d+)/i
};
```

#### Parser Implementation
- [ ] Extract all components using regex
- [ ] Handle missing or ambiguous data
- [ ] Return structured transaction object
- [ ] Log unparseable SMS for improvement

```javascript
export const parseSMS = (smsBody) => {
  try {
    // Check if banking SMS
    if (!isBankingSMS(smsBody)) {
      return null;
    }

    const amount = parseAmount(smsBody);
    const type = parseType(smsBody);
    const description = parseMerchant(smsBody) || 'Transaction';
    const date = parseDate(smsBody) || new Date().toISOString().split('T')[0];

    if (!amount || !type) {
      console.warn('Could not parse SMS:', smsBody);
      return null;
    }

    return {
      amount,
      type,
      description,
      date,
      source: 'sms',
      raw_data: smsBody,
      category_id: null, // Uncategorized by default
      is_manually_set: 0
    };
  } catch (error) {
    console.error('Error parsing SMS:', error);
    return null;
  }
};
```

### 5. Auto-Transaction Creation

Create `src/services/autoTransactionService.js`:

- [ ] Receive parsed transaction from SMS listener
- [ ] Check for duplicates (same amount, date, description within 1 hour)
- [ ] Create transaction in database
- [ ] Show notification (optional): "Transaction auto-imported: $X at Merchant"
- [ ] Update transaction list in UI

#### Duplicate Detection
```javascript
export const isDuplicate = async (transaction) => {
  const existingTransactions = await getTransactionsByDateRange(
    transaction.date,
    transaction.date
  );

  return existingTransactions.some(
    (t) =>
      Math.abs(t.amount - transaction.amount) < 0.01 &&
      t.description.toLowerCase() === transaction.description.toLowerCase()
  );
};
```

### 6. Onboarding Flow

Update first launch onboarding:

- [ ] Show explanation screen for SMS permission
- [ ] Explain what data is accessed and why
- [ ] Request permission
- [ ] Handle permission denial gracefully
- [ ] Allow user to skip (can enable later in settings)

### 7. Settings Integration

Add to Settings screen:

- [ ] Toggle to enable/disable SMS auto-import
- [ ] Button to re-request permission if denied
- [ ] Display permission status (granted/denied)
- [ ] On iOS: Show message that feature is unavailable

---

## Deliverables

### Must Have
1. ✅ SMS permission request working on Android
2. ✅ SMS listener active and filtering banking SMS
3. ✅ Parser correctly extracts: amount, type, merchant, date
4. ✅ Transactions auto-created from SMS
5. ✅ Duplicate detection prevents double entries
6. ✅ Raw SMS data stored in `raw_data` field
7. ✅ iOS shows appropriate message about unavailability
8. ✅ Unit tests for parser (80%+ coverage)

### Nice to Have
- Background SMS processing (even when app closed)
- Notification when transaction auto-imported
- Support for multiple banks/formats
- Learning mode: user corrects parser errors to improve patterns

---

## Testing Requirements

### Unit Tests for Parser

```javascript
// src/utils/__tests__/smsParser.test.js
describe('SMS Parser', () => {
  describe('parseAmount', () => {
    it('should extract amount with Rs prefix', () => {
      const result = parseAmount('Debited Rs 500 from A/C');
      expect(result).toBe(500);
    });

    it('should handle comma separators', () => {
      const result = parseAmount('Credited Rs 1,500.50 to A/C');
      expect(result).toBe(1500.50);
    });

    it('should return null for no amount', () => {
      const result = parseAmount('Hello world');
      expect(result).toBeNull();
    });
  });

  describe('parseType', () => {
    it('should detect expense from debited', () => {
      const result = parseType('Debited Rs 500 from A/C');
      expect(result).toBe('expense');
    });

    it('should detect income from credited', () => {
      const result = parseType('Credited Rs 500 to A/C');
      expect(result).toBe('income');
    });

    it('should detect expense from spent', () => {
      const result = parseType('Spent Rs 250 via UPI');
      expect(result).toBe('expense');
    });
  });

  describe('parseSMS', () => {
    it('should parse complete debit SMS', () => {
      const sms = 'Debited Rs 500 from A/C XX1234 on 01-Jan-24 at SWIGGY';
      const result = parseSMS(sms);

      expect(result).toEqual({
        amount: 500,
        type: 'expense',
        description: 'SWIGGY',
        date: expect.any(String),
        source: 'sms',
        raw_data: sms,
        category_id: null,
        is_manually_set: 0
      });
    });

    it('should parse complete credit SMS', () => {
      const sms = 'Credited Rs 10000 to A/C XX1234 on 01-Jan-24 SALARY';
      const result = parseSMS(sms);

      expect(result).toEqual({
        amount: 10000,
        type: 'income',
        description: expect.stringContaining('SALARY'),
        date: expect.any(String),
        source: 'sms',
        raw_data: sms,
        category_id: null,
        is_manually_set: 0
      });
    });

    it('should return null for non-banking SMS', () => {
      const sms = 'Hey, how are you?';
      const result = parseSMS(sms);
      expect(result).toBeNull();
    });
  });
});
```

### Integration Tests
```javascript
// src/services/__tests__/autoTransactionService.test.js
describe('Auto Transaction Service', () => {
  it('should create transaction from valid SMS', async () => {
    const parsedTransaction = {
      amount: 100,
      type: 'expense',
      description: 'Test',
      date: '2026-01-04',
      source: 'sms'
    };

    await createAutoTransaction(parsedTransaction);

    const transactions = await getAllTransactions();
    expect(transactions).toContainEqual(
      expect.objectContaining({ description: 'Test', amount: 100 })
    );
  });

  it('should not create duplicate transaction', async () => {
    const transaction = {
      amount: 100,
      description: 'Test',
      date: '2026-01-04'
    };

    await createTransaction(transaction);

    const isDupe = await isDuplicate(transaction);
    expect(isDupe).toBe(true);
  });
});
```

---

## Known Limitations

### SMS Format Variations
- Parser may not recognize all bank formats
- User can manually edit auto-imported transactions
- Consider adding a feedback mechanism to improve patterns

### iOS Restrictions
- iOS does not allow SMS reading due to privacy policies
- No workaround available
- Manual entry is the only option

### Duplicate Detection
- Simple duplicate detection may miss some duplicates
- May flag legitimate duplicate transactions (e.g., two $5 coffees same day)
- User can delete false duplicates

---

## Error Handling

### Permission Denied
- Show clear message explaining impact
- Provide manual entry alternative
- Allow re-request from settings

### Parsing Failures
- Log SMS body for debugging
- Create partial transaction if possible
- Notify user to review auto-imported transaction

### Database Errors
- Retry once on failure
- Log error and SMS for manual processing
- Notify user if critical failure

---

## Security & Privacy

### Data Handling
- Only read SMS, never send or modify
- Store only banking SMS (filter others)
- Raw SMS stored locally, never transmitted
- Clear privacy policy required

### Permission Rationale
Show users:
- "We read banking SMS to automatically track expenses"
- "Your SMS data stays on your device"
- "We never share or transmit your messages"

---

## References

- react-native-permissions: https://github.com/zoontek/react-native-permissions
- Android SMS Permissions: https://developer.android.com/reference/android/Manifest.permission#READ_SMS

---

## Next Task

After completing this task, proceed to: **week2-task2-file-upload.md**
