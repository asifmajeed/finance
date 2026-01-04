# Task: Balance & Financial Calculations

**Estimated Time**: Week 2, Part 3
**Dependencies**: week1-task2-database-crud.md (database layer), week1-task3-ui-transaction-flow.md (UI)
**Priority**: Critical (Core feature)

---

## Context

Implement financial calculations for the app, including current balance, monthly summaries, income vs expense breakdowns, and category-wise spending. These calculations power the home screen dashboard and analysis screens.

### Tech Stack
- **Database**: SQLite (use existing transaction service)
- **Utilities**: Date manipulation (date-fns or dayjs)
- **Testing**: Jest

---

## Calculation Requirements

### 1. Balance Calculations
- **Total Balance**: Sum of all income - sum of all expenses (all time)
- **Current Month Balance**: Sum of income - expenses for current month
- **Available Balance**: Total balance (could add budget considerations later)

### 2. Period-Based Calculations
- **Today**: Income, expenses, net for today
- **This Week**: Income, expenses, net for current week
- **This Month**: Income, expenses, net for current month
- **Last 3 Months**: Income, expenses, net for last 3 months
- **Custom Range**: Any date range specified by user

### 3. Category Breakdown
- **By Category**: Total spent/earned per category
- **Top Categories**: Top 5 spending categories
- **Percentage Breakdown**: Each category as % of total

### 4. Trend Analysis
- **Monthly Trend**: Month-over-month spending/income
- **Daily Average**: Average daily spending for a period
- **Comparison**: This month vs last month

---

## Tasks

### 1. Install Date Library
- [ ] Install `date-fns` or `dayjs` for date manipulation
- [ ] Choose one based on bundle size preference (dayjs is smaller)

### 2. Create Calculation Service

Create `src/services/calculationService.js`:

#### Core Balance Functions
- [ ] `getTotalBalance()` - All-time balance
- [ ] `getCurrentMonthBalance()` - This month's balance
- [ ] `getBalanceForPeriod(startDate, endDate)` - Custom period balance
- [ ] `getBalanceByType(type, startDate, endDate)` - Income or expense total

#### Income/Expense Breakdown
- [ ] `getIncomeVsExpense(startDate, endDate)` - Returns { income, expense, net }
- [ ] `getDailyAverage(startDate, endDate)` - Average spending per day
- [ ] `getMonthlyTotals(monthCount)` - Last N months totals

#### Category Analysis
- [ ] `getSpendingByCategory(startDate, endDate)` - Group by category
- [ ] `getTopCategories(limit, startDate, endDate)` - Top N categories
- [ ] `getCategoryPercentage(categoryId, startDate, endDate)` - % of total

### 3. Database Queries

Add to `src/database/transactionService.js`:

```javascript
// Get sum of transactions by type
export const getSumByType = async (type, startDate, endDate) => {
  const query = `
    SELECT SUM(amount) as total
    FROM transactions
    WHERE type = ?
    AND date BETWEEN ? AND ?
  `;

  const result = await db.executeSql(query, [type, startDate, endDate]);
  return result[0].rows.item(0).total || 0;
};

// Get category-wise spending
export const getCategorySums = async (startDate, endDate) => {
  const query = `
    SELECT
      c.id,
      c.name,
      c.icon,
      c.color,
      SUM(t.amount) as total,
      COUNT(t.id) as transaction_count
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    WHERE t.date BETWEEN ? AND ?
    GROUP BY c.id
    ORDER BY total DESC
  `;

  const result = await db.executeSql(query, [startDate, endDate]);
  return result[0].rows.raw();
};

// Get monthly trend
export const getMonthlyTotals = async (monthCount = 6) => {
  const query = `
    SELECT
      strftime('%Y-%m', date) as month,
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
    FROM transactions
    WHERE date >= date('now', '-${monthCount} months')
    GROUP BY month
    ORDER BY month ASC
  `;

  const result = await db.executeSql(query);
  return result[0].rows.raw();
};
```

### 4. Date Utility Functions

Create `src/utils/dateUtils.js`:

- [ ] `getToday()` - Returns today's date in ISO format
- [ ] `getStartOfWeek()` - Start of current week
- [ ] `getStartOfMonth()` - Start of current month
- [ ] `getEndOfMonth()` - End of current month
- [ ] `getDateRange(period)` - Returns {start, end} for period like 'today', 'week', 'month'
- [ ] `formatDate(date, format)` - Format date for display
- [ ] `getMonthName(date)` - Get month name (e.g., "January")

```javascript
import { startOfWeek, startOfMonth, endOfMonth, format } from 'date-fns';

export const getDateRange = (period) => {
  const today = new Date();

  switch (period) {
    case 'today':
      return {
        start: format(today, 'yyyy-MM-dd'),
        end: format(today, 'yyyy-MM-dd')
      };

    case 'week':
      return {
        start: format(startOfWeek(today), 'yyyy-MM-dd'),
        end: format(today, 'yyyy-MM-dd')
      };

    case 'month':
      return {
        start: format(startOfMonth(today), 'yyyy-MM-dd'),
        end: format(endOfMonth(today), 'yyyy-MM-dd')
      };

    default:
      return { start: null, end: null };
  }
};
```

### 5. Balance Display Component

Update `src/components/BalanceCard.js`:

- [ ] Display total balance prominently
- [ ] Show this month's income (green)
- [ ] Show this month's expenses (red)
- [ ] Show net change (green if positive, red if negative)
- [ ] Add period selector (Today, Week, Month)
- [ ] Refresh on transaction changes

```javascript
import React, { useState, useEffect } from 'react';
import { Card, Text } from 'react-native-paper';
import { getTotalBalance, getIncomeVsExpense } from '../services/calculationService';
import { getDateRange } from '../utils/dateUtils';

export const BalanceCard = () => {
  const [balance, setBalance] = useState(0);
  const [periodData, setPeriodData] = useState({ income: 0, expense: 0, net: 0 });
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    const totalBalance = await getTotalBalance();
    const { start, end } = getDateRange(period);
    const data = await getIncomeVsExpense(start, end);

    setBalance(totalBalance);
    setPeriodData(data);
  };

  return (
    <Card>
      <Card.Content>
        <Text variant="titleLarge">Total Balance</Text>
        <Text variant="displaySmall" style={{ color: balance >= 0 ? 'green' : 'red' }}>
          ${balance.toFixed(2)}
        </Text>

        <Text variant="labelMedium">This {period}</Text>
        <Text style={{ color: 'green' }}>Income: +${periodData.income.toFixed(2)}</Text>
        <Text style={{ color: 'red' }}>Expenses: -${periodData.expense.toFixed(2)}</Text>
        <Text>Net: ${periodData.net.toFixed(2)}</Text>
      </Card.Content>
    </Card>
  );
};
```

### 6. Summary Statistics

Create `src/components/SummaryStats.js`:

Display key metrics:
- [ ] Total transactions count
- [ ] Average transaction amount
- [ ] Largest expense this month
- [ ] Most used category
- [ ] Days until month end (budget tracking)

---

## Deliverables

### Must Have
1. ✅ Total balance calculation accurate
2. ✅ Current month income/expense/net displayed
3. ✅ Balance card showing all key metrics
4. ✅ Period selector working (Today, Week, Month)
5. ✅ Category-wise breakdown calculated
6. ✅ Monthly trend data available
7. ✅ All calculations have unit tests (80%+ coverage)
8. ✅ Real-time updates when transactions change

### Nice to Have
- Projected month-end balance
- Spending rate ($/day)
- Comparison with previous period
- Goal progress (if spending goal set)

---

## Testing Requirements

### Unit Tests

```javascript
// src/services/__tests__/calculationService.test.js
import {
  getTotalBalance,
  getIncomeVsExpense,
  getSpendingByCategory
} from '../calculationService';
import * as transactionService from '../../database/transactionService';

jest.mock('../../database/transactionService');

describe('Calculation Service', () => {
  describe('getTotalBalance', () => {
    it('should calculate total balance correctly', async () => {
      transactionService.getSumByType.mockImplementation((type) => {
        if (type === 'income') return Promise.resolve(5000);
        if (type === 'expense') return Promise.resolve(3000);
      });

      const balance = await getTotalBalance();
      expect(balance).toBe(2000); // 5000 - 3000
    });

    it('should handle zero balance', async () => {
      transactionService.getSumByType.mockResolvedValue(0);

      const balance = await getTotalBalance();
      expect(balance).toBe(0);
    });

    it('should handle negative balance', async () => {
      transactionService.getSumByType.mockImplementation((type) => {
        if (type === 'income') return Promise.resolve(1000);
        if (type === 'expense') return Promise.resolve(2000);
      });

      const balance = await getTotalBalance();
      expect(balance).toBe(-1000);
    });
  });

  describe('getIncomeVsExpense', () => {
    it('should return income, expense, and net', async () => {
      transactionService.getSumByType.mockImplementation((type) => {
        if (type === 'income') return Promise.resolve(3000);
        if (type === 'expense') return Promise.resolve(1500);
      });

      const result = await getIncomeVsExpense('2026-01-01', '2026-01-31');

      expect(result).toEqual({
        income: 3000,
        expense: 1500,
        net: 1500
      });
    });
  });

  describe('getSpendingByCategory', () => {
    it('should group spending by category', async () => {
      transactionService.getCategorySums.mockResolvedValue([
        { id: 1, name: 'Food', total: 500, transaction_count: 10 },
        { id: 2, name: 'Transport', total: 200, transaction_count: 5 }
      ]);

      const result = await getSpendingByCategory('2026-01-01', '2026-01-31');

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Food');
      expect(result[0].total).toBe(500);
    });

    it('should calculate percentages correctly', async () => {
      transactionService.getCategorySums.mockResolvedValue([
        { id: 1, name: 'Food', total: 750, transaction_count: 10 },
        { id: 2, name: 'Transport', total: 250, transaction_count: 5 }
      ]);

      const result = await getSpendingByCategory('2026-01-01', '2026-01-31');

      // Total = 1000, Food = 75%, Transport = 25%
      expect(result[0].percentage).toBe(75);
      expect(result[1].percentage).toBe(25);
    });
  });
});
```

### Date Utils Tests
```javascript
// src/utils/__tests__/dateUtils.test.js
import { getDateRange, formatDate } from '../dateUtils';

describe('Date Utils', () => {
  it('should get today date range', () => {
    const { start, end } = getDateRange('today');
    expect(start).toBe(end);
    expect(start).toMatch(/\d{4}-\d{2}-\d{2}/);
  });

  it('should get month date range', () => {
    const { start, end } = getDateRange('month');
    expect(start).toMatch(/\d{4}-\d{2}-01/); // First of month
    expect(end).toMatch(/\d{4}-\d{2}-\d{2}/);
  });

  it('should format date correctly', () => {
    const formatted = formatDate('2026-01-04', 'MMM dd, yyyy');
    expect(formatted).toBe('Jan 04, 2026');
  });
});
```

---

## Performance Optimization

### Database Indexes
Ensure these indexes exist (from week1-task2):
```sql
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_category ON transactions(category_id);
```

### Caching
- Cache balance calculations for 5 minutes
- Invalidate cache on transaction create/update/delete
- Use React state/context for caching

### Query Optimization
- Use aggregate functions (SUM, COUNT) in SQL
- Avoid fetching all transactions for calculations
- Limit date ranges for better performance

---

## Display Formatting

### Currency Formatting
```javascript
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

// Usage: formatCurrency(1234.56) => "$1,234.56"
```

### Number Formatting
```javascript
export const formatNumber = (number) => {
  if (number >= 1000000) {
    return `${(number / 1000000).toFixed(1)}M`;
  }
  if (number >= 1000) {
    return `${(number / 1000).toFixed(1)}K`;
  }
  return number.toFixed(2);
};

// Usage: formatNumber(1500) => "1.5K"
```

---

## Error Handling

### Database Query Failures
- Return 0 for sum queries that fail
- Log errors for debugging
- Show error toast to user
- Provide retry option

### Invalid Date Ranges
- Validate start < end
- Default to current month if invalid
- Show clear error message

---

## Real-time Updates

### Update Triggers
Balance should recalculate when:
- New transaction added
- Transaction edited
- Transaction deleted
- Filter/period changed

### Implementation
Use React Context or Redux to notify all components:
```javascript
// In transaction form save handler
await createTransaction(data);
// Emit event or update context
eventEmitter.emit('transactionsChanged');
```

---

## References

- date-fns: https://date-fns.org/
- dayjs: https://day.js.org/
- SQLite Aggregate Functions: https://www.sqlite.org/lang_aggfunc.html

---

## Next Task

After completing this task, proceed to: **week3-task1-budget-management.md**
