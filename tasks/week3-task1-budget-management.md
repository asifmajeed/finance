# Task: Budget Management

**Estimated Time**: Week 3, Part 1
**Dependencies**: week1-task2-database-crud.md (database), week2-task3-balance-calculations.md (calculations)
**Priority**: High (Core feature)

---

## Context

Implement budget creation, tracking, and monitoring features. Users can set budgets per category for different periods (monthly/weekly), track progress, and receive alerts when approaching or exceeding limits.

### Tech Stack
- **Database**: SQLite (budgets table already defined)
- **UI**: React Native Paper
- **Calculations**: Reuse calculation service from week2-task3
- **Testing**: Jest + React Native Testing Library

---

## Budget Features

### Budget Types
- **Category-based**: Budget per category (e.g., $500/month for Food)
- **Period-based**: Monthly or Weekly budgets
- **Recurring**: Budgets automatically reset each period

### Budget States
- **On Track**: Spent < 80% of budget (Green)
- **Warning**: Spent 80-100% of budget (Yellow)
- **Exceeded**: Spent > 100% of budget (Red)

---

## Database Schema (Reference)

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

---

## Tasks

### 1. Budget Service

Update `src/database/budgetService.js` (created in week1-task2):

#### Additional Functions Needed
- [ ] `getBudgetProgress(budgetId)` - Calculate spent vs budget amount
- [ ] `getActiveBudgetsWithProgress()` - Get all active budgets with spending data
- [ ] `getBudgetStatus(budgetId)` - Return 'on-track', 'warning', or 'exceeded'
- [ ] `autoRenewBudgets()` - Renew monthly/weekly budgets when period ends

```javascript
export const getBudgetProgress = async (budgetId) => {
  const budget = await getBudgetById(budgetId);
  if (!budget) return null;

  const { start_date, end_date, amount, category_id } = budget;
  const spent = await getCategorySpending(category_id, start_date, end_date);

  return {
    budgetId,
    budgetAmount: amount,
    spent,
    remaining: amount - spent,
    percentage: (spent / amount) * 100,
    status: getStatus(spent, amount)
  };
};

const getStatus = (spent, budget) => {
  const percentage = (spent / budget) * 100;
  if (percentage < 80) return 'on-track';
  if (percentage < 100) return 'warning';
  return 'exceeded';
};
```

### 2. Budget Calculation Functions

Create `src/services/budgetCalculationService.js`:

- [ ] `getCategorySpending(categoryId, startDate, endDate)` - Total spent in category
- [ ] `calculateDailyAverage(categoryId, startDate, endDate)` - Daily spending rate
- [ ] `estimateMonthEnd(budgetId)` - Projected spending by month end
- [ ] `getDaysRemaining(endDate)` - Days left in budget period

```javascript
export const estimateMonthEnd = async (budgetId) => {
  const budget = await getBudgetById(budgetId);
  const spent = await getCategorySpending(
    budget.category_id,
    budget.start_date,
    new Date().toISOString().split('T')[0]
  );

  const daysElapsed = getDaysBetween(budget.start_date, new Date());
  const totalDays = getDaysBetween(budget.start_date, budget.end_date);
  const dailyRate = spent / daysElapsed;
  const projected = dailyRate * totalDays;

  return {
    projected,
    willExceed: projected > budget.amount,
    excessAmount: Math.max(0, projected - budget.amount)
  };
};
```

### 3. Budget Creation Screen

Create `src/screens/BudgetFormScreen.js`:

#### Form Fields
- [ ] Category selector (required)
  - Exclude categories that already have active budgets
- [ ] Budget amount input (required, > 0)
- [ ] Period selector: Monthly or Weekly
- [ ] Start date (default: today)
- [ ] Auto-calculate end date based on period
- [ ] Save button with validation
- [ ] Cancel button

#### Validation
- Amount must be > 0
- Category required
- Cannot create duplicate budget (same category + overlapping period)
- Start date cannot be in the past (or allow but warn)

### 4. Budget List Screen

Create `src/screens/BudgetListScreen.js`:

#### Display Elements
- [ ] List of all active budgets
- [ ] Each budget card shows:
  - Category name and icon
  - Budget amount
  - Amount spent
  - Remaining amount
  - Progress bar (colored by status)
  - Period (monthly/weekly)
  - Days remaining
- [ ] Empty state: "No budgets set. Create one to track spending!"
- [ ] FAB: "Add Budget"

#### Budget Card Component

Create `src/components/BudgetCard.js`:

```javascript
import { Card, ProgressBar, Text, Icon } from 'react-native-paper';

export const BudgetCard = ({ budget, progress, onPress }) => {
  const getColor = (status) => {
    switch (status) {
      case 'on-track': return '#1DD1A1';
      case 'warning': return '#F7B731';
      case 'exceeded': return '#FF6B6B';
      default: return '#95A5A6';
    }
  };

  return (
    <Card onPress={onPress}>
      <Card.Content>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon source={budget.category.icon} size={24} color={budget.category.color} />
            <Text variant="titleMedium">{budget.category.name}</Text>
          </View>
          <Text variant="titleSmall">{budget.period}</Text>
        </View>

        <ProgressBar
          progress={Math.min(progress.percentage / 100, 1)}
          color={getColor(progress.status)}
        />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text>Spent: ${progress.spent.toFixed(2)}</Text>
          <Text>Budget: ${budget.amount.toFixed(2)}</Text>
        </View>

        <Text style={{ color: getColor(progress.status) }}>
          {progress.remaining >= 0
            ? `$${progress.remaining.toFixed(2)} remaining`
            : `$${Math.abs(progress.remaining).toFixed(2)} over budget`}
        </Text>

        <Text variant="bodySmall">{getDaysRemaining(budget.end_date)} days left</Text>
      </Card.Content>
    </Card>
  );
};
```

### 5. Budget Detail Screen

Create `src/screens/BudgetDetailScreen.js`:

Show detailed budget information:
- [ ] Full budget info (category, amount, period)
- [ ] Progress visualization (progress bar + pie chart)
- [ ] Spending breakdown by day/week
- [ ] List of transactions in this category for this period
- [ ] Edit budget button
- [ ] Delete budget button (with confirmation)
- [ ] Projected month-end spending

### 6. Budget Auto-Renewal

Create `src/services/budgetRenewalService.js`:

- [ ] Check for expired budgets daily
- [ ] Auto-renew monthly budgets (create new budget for next month)
- [ ] Auto-renew weekly budgets (create new budget for next week)
- [ ] Keep old budgets for historical tracking (mark as inactive)
- [ ] Run on app launch and daily

```javascript
export const renewExpiredBudgets = async () => {
  const today = new Date().toISOString().split('T')[0];
  const expiredBudgets = await getExpiredBudgets(today);

  for (const budget of expiredBudgets) {
    // Create new budget for next period
    const newBudget = {
      category_id: budget.category_id,
      amount: budget.amount,
      period: budget.period,
      start_date: budget.period === 'monthly'
        ? getNextMonthStart(budget.end_date)
        : getNextWeekStart(budget.end_date),
      end_date: budget.period === 'monthly'
        ? getNextMonthEnd(budget.end_date)
        : getNextWeekEnd(budget.end_date)
    };

    await createBudget(newBudget);
  }
};
```

### 7. Navigation Integration

- [ ] Add "Budgets" tab to bottom navigation
- [ ] Badge showing count of exceeded budgets (red)
- [ ] Link from budget card to detail screen
- [ ] Link from budget card to category transactions

---

## Deliverables

### Must Have
1. ✅ Budget creation form with validation
2. ✅ Budget list with progress bars
3. ✅ Budget cards color-coded by status
4. ✅ Budget edit and delete functionality
5. ✅ Progress calculation accurate
6. ✅ Monthly and weekly budgets supported
7. ✅ Auto-renewal for recurring budgets
8. ✅ Unit tests for budget calculations (80%+ coverage)

### Nice to Have
- Budget templates (common budget amounts)
- Copy budget from previous month
- Budget history view
- Spending trends per category

---

## Testing Requirements

### Unit Tests

```javascript
// src/services/__tests__/budgetCalculationService.test.js
import { getBudgetProgress, estimateMonthEnd } from '../budgetCalculationService';

describe('Budget Calculation Service', () => {
  it('should calculate budget progress correctly', async () => {
    const progress = await getBudgetProgress(1);

    expect(progress).toEqual({
      budgetId: 1,
      budgetAmount: 500,
      spent: 300,
      remaining: 200,
      percentage: 60,
      status: 'on-track'
    });
  });

  it('should mark budget as warning at 80%', async () => {
    // Mock: spent 400 of 500 budget
    const progress = await getBudgetProgress(1);
    expect(progress.status).toBe('warning');
    expect(progress.percentage).toBe(80);
  });

  it('should mark budget as exceeded over 100%', async () => {
    // Mock: spent 600 of 500 budget
    const progress = await getBudgetProgress(1);
    expect(progress.status).toBe('exceeded');
    expect(progress.remaining).toBe(-100);
  });

  it('should estimate month-end spending', async () => {
    const estimate = await estimateMonthEnd(1);

    expect(estimate).toEqual({
      projected: expect.any(Number),
      willExceed: expect.any(Boolean),
      excessAmount: expect.any(Number)
    });
  });
});
```

### Component Tests

```javascript
// src/screens/__tests__/BudgetListScreen.test.js
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import BudgetListScreen from '../BudgetListScreen';
import * as budgetService from '../../database/budgetService';

jest.mock('../../database/budgetService');

describe('BudgetListScreen', () => {
  it('should display budgets with progress', async () => {
    budgetService.getActiveBudgetsWithProgress.mockResolvedValue([
      {
        id: 1,
        category: { name: 'Food', icon: 'food' },
        amount: 500,
        spent: 300,
        status: 'on-track'
      }
    ]);

    const { getByText } = render(<BudgetListScreen />);

    await waitFor(() => {
      expect(getByText('Food')).toBeDefined();
      expect(getByText(/\$500/)).toBeDefined();
    });
  });

  it('should show empty state when no budgets', async () => {
    budgetService.getActiveBudgetsWithProgress.mockResolvedValue([]);

    const { getByText } = render(<BudgetListScreen />);

    await waitFor(() => {
      expect(getByText(/no budgets set/i)).toBeDefined();
    });
  });
});
```

### Integration Tests

```javascript
// src/__tests__/integration/budgetFlow.test.js
describe('Budget Creation Flow', () => {
  it('should create budget and show in list', async () => {
    const { getByText, getByPlaceholderText } = render(<App />);

    // Navigate to budgets
    fireEvent.press(getByText('Budgets'));

    // Create budget
    fireEvent.press(getByTestId('add-budget-fab'));
    fireEvent.press(getByText('Food & Dining'));
    fireEvent.changeText(getByPlaceholderText('Amount'), '500');
    fireEvent.press(getByText('Monthly'));
    fireEvent.press(getByText('Save'));

    // Verify in list
    await waitFor(() => {
      expect(getByText('Food & Dining')).toBeDefined();
      expect(getByText('$500.00')).toBeDefined();
    });
  });
});
```

---

## UI Design

### Budget List Layout
```
┌─────────────────────────────┐
│ Budgets                      │
├─────────────────────────────┤
│                              │
│ ┌──────────────────────────┐│
│ │🍔 Food & Dining  Monthly ││
│ │━━━━━━━━━━░░░░░ 60%      ││
│ │Spent: $300  Budget: $500 ││
│ │$200 remaining • 15 days  ││
│ └──────────────────────────┘│
│                              │
│ ┌──────────────────────────┐│
│ │🚗 Transport     Monthly  ││
│ │━━━━━━━━━━━━━━░ 85% ⚠️   ││
│ │Spent: $170  Budget: $200 ││
│ │$30 remaining • 15 days   ││
│ └──────────────────────────┘│
│                              │
│ ┌──────────────────────────┐│
│ │🎬 Entertainment Monthly  ││
│ │━━━━━━━━━━━━━━━━ 105% 🔴││
│ │Spent: $210  Budget: $200 ││
│ │$10 over budget • 15 days ││
│ └──────────────────────────┘│
│                              │
│                    [+] FAB   │
└─────────────────────────────┘
```

---

## Validation Rules

### Budget Creation
- Amount must be > 0
- Category required (must exist in database)
- Cannot create overlapping budgets for same category
- Period must be 'monthly' or 'weekly'

### Budget Editing
- Cannot change category (must delete and recreate)
- Can change amount
- Can extend end date (but not shrink)

---

## Error Handling

### Duplicate Budget
- Error: "Budget already exists for this category and period"
- Suggest editing existing budget instead

### Invalid Amount
- Error: "Budget amount must be greater than zero"
- Clear inline error message

### Category Deletion
- Prevent deleting category with active budgets
- Error: "Cannot delete category with active budgets"

---

## Performance Considerations

### Budget Progress Calculation
- Cache progress calculations for 5 minutes
- Invalidate on transaction create/update/delete
- Batch calculate for all budgets at once

### Database Queries
- Use JOINs to fetch budget + category + spending in one query
- Index on budget start_date and end_date

---

## References

- React Native Paper Progress Bar: https://reactnativepaper.com/docs/components/ProgressBar

---

## Next Task

After completing this task, proceed to: **week3-task2-spending-analysis.md**
