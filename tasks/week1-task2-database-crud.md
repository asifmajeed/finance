# Task: Database Layer & CRUD Operations

**Estimated Time**: Day 3-4 of Week 1
**Dependencies**: week1-task1-project-setup.md (project must be initialized)
**Priority**: Critical (Blocking)

---

## Context

Implement the local SQLite database layer for the Finance Tracker app. This is a local-first app, so all data is stored on-device using SQLite. You need to create the database schema, implement CRUD operations, and write comprehensive tests.

### Tech Stack
- **Database**: SQLite via react-native-sqlite-storage
- **Testing**: Jest + React Native Testing Library

---

## Database Schema

### Table: `transactions`
```sql
CREATE TABLE transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  amount REAL NOT NULL,
  description TEXT NOT NULL,
  date TEXT NOT NULL, -- ISO 8601 format (YYYY-MM-DD)
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

### Table: `categories`
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

### Table: `budgets`
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

### Table: `settings`
```sql
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

### Default Categories to Seed
```javascript
const DEFAULT_CATEGORIES = [
  { name: 'Food & Dining', icon: 'food', color: '#FF6B6B' },
  { name: 'Transport', icon: 'car', color: '#4ECDC4' },
  { name: 'Shopping', icon: 'shopping', color: '#45B7D1' },
  { name: 'Bills & Utilities', icon: 'receipt', color: '#FFA07A' },
  { name: 'Entertainment', icon: 'movie', color: '#98D8C8' },
  { name: 'Health & Fitness', icon: 'heart', color: '#F7B731' },
  { name: 'Education', icon: 'school', color: '#5F27CD' },
  { name: 'Groceries', icon: 'cart', color: '#00D2D3' },
  { name: 'Salary', icon: 'cash', color: '#1DD1A1', type: 'income' },
  { name: 'Other Income', icon: 'cash-multiple', color: '#10AC84', type: 'income' },
  { name: 'Uncategorized', icon: 'help-circle', color: '#95A5A6' }
];
```

---

## Tasks

### 1. Install SQLite Package
- [ ] Install `react-native-sqlite-storage`
- [ ] Link native dependencies (if needed for older React Native versions)
- [ ] Test database opens successfully

### 2. Database Initialization
- [ ] Create `src/database/init.js` - database initialization and connection
- [ ] Create `src/database/migrations.js` - migration system for schema versioning
- [ ] Implement database open/close functions
- [ ] Create all tables on first launch
- [ ] Add database version tracking in settings table

### 3. Transaction CRUD Operations
Create `src/database/transactionService.js` with:
- [ ] `createTransaction(data)` - Insert new transaction
- [ ] `getTransactionById(id)` - Fetch single transaction
- [ ] `getAllTransactions(filters)` - Fetch all with optional filters (date range, category, type)
- [ ] `updateTransaction(id, data)` - Update existing transaction
- [ ] `deleteTransaction(id)` - Delete transaction
- [ ] `getTransactionsByDateRange(startDate, endDate)` - For analysis
- [ ] `getTransactionsByCategory(categoryId)` - For category analysis

### 4. Category CRUD Operations
Create `src/database/categoryService.js` with:
- [ ] `createCategory(data)` - Insert new category
- [ ] `getCategoryById(id)` - Fetch single category
- [ ] `getAllCategories()` - Fetch all categories
- [ ] `updateCategory(id, data)` - Update existing category
- [ ] `deleteCategory(id)` - Delete category (with validation: can't delete if has transactions)
- [ ] `seedDefaultCategories()` - Insert default categories on first launch

### 5. Budget CRUD Operations
Create `src/database/budgetService.js` with:
- [ ] `createBudget(data)` - Insert new budget
- [ ] `getBudgetById(id)` - Fetch single budget
- [ ] `getAllBudgets()` - Fetch all budgets
- [ ] `getActiveBudgets(date)` - Fetch budgets active for a given date
- [ ] `updateBudget(id, data)` - Update existing budget
- [ ] `deleteBudget(id)` - Delete budget

### 6. Settings CRUD Operations
Create `src/database/settingsService.js` with:
- [ ] `getSetting(key)` - Get single setting
- [ ] `setSetting(key, value)` - Set/update setting
- [ ] `getAllSettings()` - Get all settings

### 7. First Launch Detection & Seeding
- [ ] Check if database is initialized (check for version in settings)
- [ ] Seed default categories on first launch
- [ ] Set initial settings (currency: USD, theme: light, etc.)

### 8. Database Indexes for Performance
Add indexes in migration:
```sql
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_budgets_category ON budgets(category_id);
```

---

## Deliverables

### Must Have
1. ✅ All 4 tables created successfully
2. ✅ All CRUD operations implemented and working
3. ✅ Default categories seeded on first launch
4. ✅ Database migration system in place (version tracking)
5. ✅ 80%+ test coverage on all database operations
6. ✅ Input validation for all operations (e.g., amount > 0, required fields)
7. ✅ Proper error handling with descriptive messages

### Performance Targets
- All queries should execute in < 50ms for typical datasets (< 1000 transactions)
- Indexes created on frequently queried columns

---

## Testing Requirements

### Unit Tests Required

#### Transaction Service Tests
```javascript
// src/database/__tests__/transactionService.test.js
describe('TransactionService', () => {
  beforeEach(async () => {
    // Initialize test database
  });

  afterEach(async () => {
    // Clean up test database
  });

  describe('createTransaction', () => {
    it('should create a transaction successfully', async () => {
      const transaction = {
        amount: 100.50,
        description: 'Groceries',
        date: '2026-01-04',
        type: 'expense',
        category_id: 1,
        source: 'manual'
      };
      const result = await createTransaction(transaction);
      expect(result.id).toBeDefined();
    });

    it('should reject transaction with negative amount', async () => {
      const transaction = { amount: -50, description: 'Test' };
      await expect(createTransaction(transaction)).rejects.toThrow();
    });

    it('should reject transaction without required fields', async () => {
      await expect(createTransaction({})).rejects.toThrow();
    });
  });

  describe('getAllTransactions', () => {
    it('should filter by date range', async () => {
      // Test implementation
    });

    it('should filter by category', async () => {
      // Test implementation
    });

    it('should filter by type (income/expense)', async () => {
      // Test implementation
    });
  });

  // Add similar tests for update, delete, etc.
});
```

#### Category Service Tests
```javascript
// src/database/__tests__/categoryService.test.js
describe('CategoryService', () => {
  it('should seed default categories', async () => {
    await seedDefaultCategories();
    const categories = await getAllCategories();
    expect(categories.length).toBeGreaterThanOrEqual(11);
  });

  it('should prevent deleting category with transactions', async () => {
    // Create transaction with category
    // Attempt to delete category
    // Should fail
  });

  it('should enforce unique category names', async () => {
    await createCategory({ name: 'Test' });
    await expect(createCategory({ name: 'Test' })).rejects.toThrow();
  });
});
```

### Test Coverage Target
- Aim for 80%+ coverage on all database services
- All CRUD operations must have tests
- Edge cases must be tested (null values, invalid data, constraints)

---

## Validation Rules

### Transactions
- `amount` must be > 0
- `description` must be non-empty string
- `date` must be valid ISO 8601 format
- `type` must be 'income' or 'expense'
- `source` must be 'manual', 'sms', or 'upload' (if provided)

### Categories
- `name` must be non-empty and unique
- `color` must be valid hex color (if provided)

### Budgets
- `amount` must be > 0
- `period` must be 'monthly' or 'weekly'
- `start_date` must be valid date
- `category_id` must reference existing category

---

## Error Handling Examples

```javascript
// Example error handling in transaction service
export const createTransaction = async (data) => {
  try {
    // Validation
    if (!data.amount || data.amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }
    if (!data.description || data.description.trim() === '') {
      throw new Error('Description is required');
    }
    if (!data.type || !['income', 'expense'].includes(data.type)) {
      throw new Error('Type must be income or expense');
    }

    // Database operation
    const result = await db.executeSql(
      `INSERT INTO transactions (amount, description, date, type, category_id, source, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.amount,
        data.description,
        data.date || new Date().toISOString().split('T')[0],
        data.type,
        data.category_id || null,
        data.source || 'manual',
        new Date().toISOString(),
        new Date().toISOString()
      ]
    );

    return { id: result.insertId, ...data };
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
};
```

---

## References

- react-native-sqlite-storage: https://github.com/andpor/react-native-sqlite-storage
- SQLite Documentation: https://www.sqlite.org/docs.html
- ISO 8601 Date Format: https://en.wikipedia.org/wiki/ISO_8601

---

## Next Task

After completing this task, proceed to: **week1-task3-ui-transaction-flow.md**
