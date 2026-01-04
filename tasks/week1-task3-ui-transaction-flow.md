# Task: UI Components & Transaction Flow

**Estimated Time**: Day 5-7 of Week 1
**Dependencies**: week1-task2-database-crud.md (database layer must be complete)
**Priority**: Critical (Blocking)

---

## Context

Build the core user interface for transaction management using React Native Paper components. This includes the transaction list screen, add/edit transaction forms, category picker, and filtering capabilities. All UI should follow Material Design principles.

### Tech Stack
- **UI Library**: React Native Paper
- **Navigation**: React Navigation (already set up)
- **Database**: Use services from task 2
- **Testing**: Jest + React Native Testing Library + E2E (Detox/Maestro)

---

## UI/UX Guidelines

### Design Principles
- Follow Material Design via React Native Paper
- Support both light and dark themes (Paper handles this)
- Ensure accessibility (screen reader support, color contrast)
- Provide clear feedback for all user actions (toasts, loading states)

### Color Coding
- **Income**: Green tones (#1DD1A1)
- **Expense**: Red tones (#FF6B6B)
- **Budget warnings**: Yellow (#F7B731) at 80%, Red at 100%

---

## Tasks

### 1. Transaction List Screen (Home Screen)

Create `src/screens/TransactionListScreen.js`:

#### Components to Build
- [ ] Balance summary card at top showing:
  - Current total balance
  - This month's income
  - This month's expenses
- [ ] Filter chips (All, Income, Expense, Date range)
- [ ] Transaction list grouped by date
- [ ] Each transaction item shows:
  - Amount (colored by type)
  - Description
  - Category icon and name
  - Date (if not in current group)
- [ ] Floating Action Button (FAB) for "Add Transaction"
- [ ] Empty state when no transactions
- [ ] Pull-to-refresh functionality

#### Features
- [ ] Tapping a transaction navigates to edit screen
- [ ] Swipe actions (optional): swipe left to delete
- [ ] Infinite scroll / pagination (load 50 items at a time)

### 2. Add/Edit Transaction Screen

Create `src/screens/TransactionFormScreen.js`:

#### Form Fields
- [ ] Amount input (numeric keyboard, required)
  - Validate: must be > 0
  - Show clear error message if invalid
- [ ] Description input (required)
  - Validate: must not be empty
- [ ] Date picker (default: today)
  - Use React Native Paper's DatePickerModal
- [ ] Type selector (Income/Expense)
  - Use SegmentedButtons or toggle chips
- [ ] Category dropdown
  - Show category icon and name
  - Link to "Add Custom Category"
- [ ] Source (auto-set, not editable by user in form)

#### Buttons
- [ ] Save button (primary action)
  - Validate all fields
  - Show loading state while saving
  - Show success toast on save
  - Navigate back to list
- [ ] Cancel button (secondary action)
  - Confirm if data has changed
  - Navigate back without saving

### 3. Category Picker Component

Create `src/components/CategoryPicker.js`:

- [ ] Display all categories from database
- [ ] Show category icon and name
- [ ] Color-coded by category color
- [ ] Selected category highlighted
- [ ] "Add Custom Category" button at bottom
- [ ] Search/filter categories (if > 15 categories)

### 4. Custom Category Creation

Create `src/components/AddCategoryDialog.js`:

- [ ] Category name input (required, unique)
- [ ] Icon picker (select from Material Design Icons)
- [ ] Color picker (predefined palette or custom hex)
- [ ] Save button (validates uniqueness)
- [ ] Cancel button

### 5. Filter Implementation

Create `src/components/TransactionFilters.js`:

#### Filter Options
- [ ] Type filter: All / Income / Expense
- [ ] Date range filter:
  - Today
  - This Week
  - This Month
  - Last 3 Months
  - Custom range (date picker)
- [ ] Category filter (multi-select)

#### UI
- [ ] Filter chips at top of list
- [ ] Active filters clearly indicated
- [ ] "Clear All Filters" option when filters active

### 6. Reusable Components

Create these shared components in `src/components/`:

#### TransactionItem
- [ ] `src/components/TransactionItem.js`
  - Props: transaction object, onPress, onDelete
  - Shows amount, description, category, date
  - Styled based on income/expense type

#### BalanceCard
- [ ] `src/components/BalanceCard.js`
  - Props: balance, income, expenses
  - Displays summary with icons
  - Color-coded values

#### EmptyState
- [ ] `src/components/EmptyState.js`
  - Props: icon, title, subtitle, action button
  - Reusable for empty transaction list, budgets, etc.

---

## Deliverables

### Must Have
1. ✅ Transaction list screen with all features working
2. ✅ Add transaction form with full validation
3. ✅ Edit transaction form (reuse add form)
4. ✅ Category picker with custom category creation
5. ✅ All filter options working (type, date, category)
6. ✅ Balance calculations accurate and displayed
7. ✅ Component tests for all UI components
8. ✅ Integration tests for add transaction flow
9. ✅ Basic E2E test: add transaction → see in list

---

## Testing Requirements

### Component Tests

```javascript
// src/screens/__tests__/TransactionListScreen.test.js
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import TransactionListScreen from '../TransactionListScreen';
import * as transactionService from '../../database/transactionService';

jest.mock('../../database/transactionService');

describe('TransactionListScreen', () => {
  it('should display transactions', async () => {
    transactionService.getAllTransactions.mockResolvedValue([
      { id: 1, amount: 100, description: 'Test', type: 'expense' }
    ]);

    const { getByText } = render(<TransactionListScreen />);

    await waitFor(() => {
      expect(getByText('Test')).toBeDefined();
    });
  });

  it('should filter by income when income chip pressed', async () => {
    const { getByText } = render(<TransactionListScreen />);
    fireEvent.press(getByText('Income'));

    await waitFor(() => {
      expect(transactionService.getAllTransactions).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'income' })
      );
    });
  });
});
```

### Integration Test
```javascript
// src/__tests__/integration/addTransaction.test.js
describe('Add Transaction Flow', () => {
  it('should add transaction and display in list', async () => {
    const { getByText, getByPlaceholderText } = render(<App />);

    fireEvent.press(getByTestId('add-transaction-fab'));
    fireEvent.changeText(getByPlaceholderText('Amount'), '50');
    fireEvent.changeText(getByPlaceholderText('Description'), 'Coffee');
    fireEvent.press(getByText('Save'));

    await waitFor(() => {
      expect(getByText('Coffee')).toBeDefined();
    });
  });
});
```

---

## References

- React Native Paper: https://reactnativepaper.com/
- React Navigation: https://reactnavigation.org/

---

## Next Task

After completing this task, proceed to: **week2-task1-sms-import.md**
