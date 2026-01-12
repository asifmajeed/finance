import {
  createTransaction,
  getTransactionById,
  getAllTransactions,
  getTransactionsByDateRange,
  getTransactionsByCategory,
  updateTransaction,
  deleteTransaction,
  getTransactionSummary,
  getSpendingByCategory,
} from '../transactionService';
import {createCategory} from '../categoryService';
import {openDatabase, deleteDatabase} from '../init';
import {runMigrations, dropAllTables} from '../migrations';

describe('TransactionService', () => {
  let testCategory;

  beforeEach(async () => {
    // Initialize test database
    await openDatabase();
    await runMigrations();

    // Create a test category
    testCategory = await createCategory({
      name: 'Test Category',
      icon: 'test',
      color: '#FF0000',
    });
  });

  afterEach(async () => {
    // Clean up test database
    await dropAllTables();
    await deleteDatabase();
  });

  describe('createTransaction', () => {
    it('should create a transaction successfully', async () => {
      const transactionData = {
        amount: 100.5,
        description: 'Test Transaction',
        type: 'expense',
        date: '2026-01-10',
        category_id: testCategory.id,
      };

      const result = await createTransaction(transactionData);

      expect(result.id).toBeDefined();
      expect(result.amount).toBe(100.5);
      expect(result.description).toBe('Test Transaction');
      expect(result.type).toBe('expense');
      expect(result.date).toBe('2026-01-10');
      expect(result.category_id).toBe(testCategory.id);
      expect(result.source).toBe('manual');
      expect(result.created_at).toBeDefined();
      expect(result.updated_at).toBeDefined();
    });

    it('should use today as default date', async () => {
      const today = new Date().toISOString().split('T')[0];

      const result = await createTransaction({
        amount: 50,
        description: 'Test',
        type: 'income',
      });

      expect(result.date).toBe(today);
    });

    it('should trim description', async () => {
      const result = await createTransaction({
        amount: 50,
        description: '  Test Description  ',
        type: 'expense',
      });

      expect(result.description).toBe('Test Description');
    });

    it('should reject transaction with negative amount', async () => {
      await expect(
        createTransaction({
          amount: -50,
          description: 'Test',
          type: 'expense',
        }),
      ).rejects.toThrow('Amount must be a number greater than 0');
    });

    it('should reject transaction with zero amount', async () => {
      await expect(
        createTransaction({
          amount: 0,
          description: 'Test',
          type: 'expense',
        }),
      ).rejects.toThrow('Amount must be a number greater than 0');
    });

    it('should reject transaction without description', async () => {
      await expect(
        createTransaction({
          amount: 100,
          description: '',
          type: 'expense',
        }),
      ).rejects.toThrow('Description is required');
    });

    it('should reject transaction with invalid type', async () => {
      await expect(
        createTransaction({
          amount: 100,
          description: 'Test',
          type: 'invalid',
        }),
      ).rejects.toThrow('Type must be either "income" or "expense"');
    });

    it('should reject transaction with invalid date format', async () => {
      await expect(
        createTransaction({
          amount: 100,
          description: 'Test',
          type: 'expense',
          date: '2026/01/10',
        }),
      ).rejects.toThrow('Date must be in ISO 8601 format');
    });

    it('should reject transaction with invalid source', async () => {
      await expect(
        createTransaction({
          amount: 100,
          description: 'Test',
          type: 'expense',
          source: 'invalid',
        }),
      ).rejects.toThrow('Source must be');
    });

    it('should create transaction with SMS source', async () => {
      const result = await createTransaction({
        amount: 100,
        description: 'SMS Transaction',
        type: 'expense',
        source: 'sms',
        raw_data: 'SMS: Spent Rs.100',
      });

      expect(result.source).toBe('sms');
      expect(result.raw_data).toBe('SMS: Spent Rs.100');
    });
  });

  describe('getTransactionById', () => {
    it('should get transaction by id with category details', async () => {
      const created = await createTransaction({
        amount: 100,
        description: 'Test',
        type: 'expense',
        category_id: testCategory.id,
      });

      const result = await getTransactionById(created.id);

      expect(result).toBeDefined();
      expect(result.id).toBe(created.id);
      expect(result.category_name).toBe('Test Category');
      expect(result.category_icon).toBe('test');
      expect(result.category_color).toBe('#FF0000');
    });

    it('should return null for non-existent transaction', async () => {
      const result = await getTransactionById(999);
      expect(result).toBeNull();
    });

    it('should handle transaction without category', async () => {
      const created = await createTransaction({
        amount: 100,
        description: 'Test',
        type: 'expense',
      });

      const result = await getTransactionById(created.id);

      expect(result.category_id).toBeNull();
      expect(result.category_name).toBeNull();
    });
  });

  describe('getAllTransactions', () => {
    beforeEach(async () => {
      // Create test transactions
      await createTransaction({
        amount: 100,
        description: 'Transaction 1',
        type: 'expense',
        date: '2026-01-05',
        category_id: testCategory.id,
      });

      await createTransaction({
        amount: 200,
        description: 'Transaction 2',
        type: 'income',
        date: '2026-01-10',
      });

      await createTransaction({
        amount: 150,
        description: 'Transaction 3',
        type: 'expense',
        date: '2026-01-15',
        category_id: testCategory.id,
      });
    });

    it('should get all transactions', async () => {
      const result = await getAllTransactions();
      expect(result.length).toBe(3);
    });

    it('should filter by date range', async () => {
      const result = await getAllTransactions({
        startDate: '2026-01-01',
        endDate: '2026-01-10',
      });

      expect(result.length).toBe(2);
    });

    it('should filter by category', async () => {
      const result = await getAllTransactions({
        category_id: testCategory.id,
      });

      expect(result.length).toBe(2);
      result.forEach(t => {
        expect(t.category_id).toBe(testCategory.id);
      });
    });

    it('should filter by type', async () => {
      const result = await getAllTransactions({
        type: 'expense',
      });

      expect(result.length).toBe(2);
      result.forEach(t => {
        expect(t.type).toBe('expense');
      });
    });

    it('should support multiple filters', async () => {
      const result = await getAllTransactions({
        startDate: '2026-01-01',
        endDate: '2026-01-10',
        type: 'expense',
        category_id: testCategory.id,
      });

      expect(result.length).toBe(1);
      expect(result[0].description).toBe('Transaction 1');
    });

    it('should support limit', async () => {
      const result = await getAllTransactions({
        limit: 2,
      });

      expect(result.length).toBe(2);
    });

    it('should support offset', async () => {
      const result = await getAllTransactions({
        limit: 2,
        offset: 1,
      });

      expect(result.length).toBe(2);
    });

    it('should order by date descending', async () => {
      const result = await getAllTransactions();

      expect(result[0].date).toBe('2026-01-15');
      expect(result[1].date).toBe('2026-01-10');
      expect(result[2].date).toBe('2026-01-05');
    });
  });

  describe('getTransactionsByDateRange', () => {
    it('should get transactions within date range', async () => {
      await createTransaction({
        amount: 100,
        description: 'Old',
        type: 'expense',
        date: '2025-12-01',
      });

      await createTransaction({
        amount: 200,
        description: 'Recent',
        type: 'expense',
        date: '2026-01-10',
      });

      const result = await getTransactionsByDateRange(
        '2026-01-01',
        '2026-01-31',
      );

      expect(result.length).toBe(1);
      expect(result[0].description).toBe('Recent');
    });
  });

  describe('getTransactionsByCategory', () => {
    it('should get transactions for specific category', async () => {
      const category2 = await createCategory({
        name: 'Category 2',
      });

      await createTransaction({
        amount: 100,
        description: 'Cat 1',
        type: 'expense',
        category_id: testCategory.id,
      });

      await createTransaction({
        amount: 200,
        description: 'Cat 2',
        type: 'expense',
        category_id: category2.id,
      });

      const result = await getTransactionsByCategory(testCategory.id);

      expect(result.length).toBe(1);
      expect(result[0].description).toBe('Cat 1');
    });
  });

  describe('updateTransaction', () => {
    it('should update transaction successfully', async () => {
      const created = await createTransaction({
        amount: 100,
        description: 'Original',
        type: 'expense',
      });

      const updated = await updateTransaction(created.id, {
        amount: 200,
        description: 'Updated',
        type: 'income',
      });

      expect(updated.amount).toBe(200);
      expect(updated.description).toBe('Updated');
      expect(updated.type).toBe('income');
    });

    it('should reject update with invalid data', async () => {
      const created = await createTransaction({
        amount: 100,
        description: 'Test',
        type: 'expense',
      });

      await expect(
        updateTransaction(created.id, {
          amount: -50,
          description: 'Test',
          type: 'expense',
        }),
      ).rejects.toThrow();
    });

    it('should reject update for non-existent transaction', async () => {
      await expect(
        updateTransaction(999, {
          amount: 100,
          description: 'Test',
          type: 'expense',
        }),
      ).rejects.toThrow('not found');
    });
  });

  describe('deleteTransaction', () => {
    it('should delete transaction successfully', async () => {
      const created = await createTransaction({
        amount: 100,
        description: 'To Delete',
        type: 'expense',
      });

      await deleteTransaction(created.id);

      const result = await getTransactionById(created.id);
      expect(result).toBeNull();
    });

    it('should reject deletion of non-existent transaction', async () => {
      await expect(deleteTransaction(999)).rejects.toThrow('not found');
    });
  });

  describe('getTransactionSummary', () => {
    it('should calculate summary correctly', async () => {
      await createTransaction({
        amount: 100,
        description: 'Income 1',
        type: 'income',
        date: '2026-01-10',
      });

      await createTransaction({
        amount: 200,
        description: 'Income 2',
        type: 'income',
        date: '2026-01-15',
      });

      await createTransaction({
        amount: 150,
        description: 'Expense 1',
        type: 'expense',
        date: '2026-01-12',
      });

      const result = await getTransactionSummary('2026-01-01', '2026-01-31');

      expect(result.total_income).toBe(300);
      expect(result.total_expense).toBe(150);
      expect(result.balance).toBe(150);
      expect(result.total_count).toBe(3);
    });

    it('should handle empty date range', async () => {
      const result = await getTransactionSummary('2025-01-01', '2025-01-31');

      expect(result.total_income).toBe(0);
      expect(result.total_expense).toBe(0);
      expect(result.balance).toBe(0);
      expect(result.total_count).toBe(0);
    });
  });

  describe('getSpendingByCategory', () => {
    it('should calculate spending by category', async () => {
      const category2 = await createCategory({
        name: 'Category 2',
        icon: 'test2',
        color: '#00FF00',
      });

      await createTransaction({
        amount: 100,
        description: 'Expense 1',
        type: 'expense',
        date: '2026-01-10',
        category_id: testCategory.id,
      });

      await createTransaction({
        amount: 150,
        description: 'Expense 2',
        type: 'expense',
        date: '2026-01-12',
        category_id: testCategory.id,
      });

      await createTransaction({
        amount: 200,
        description: 'Expense 3',
        type: 'expense',
        date: '2026-01-15',
        category_id: category2.id,
      });

      const result = await getSpendingByCategory('2026-01-01', '2026-01-31');

      expect(result.length).toBe(2);
      expect(result[0].total_amount).toBe(250);
      expect(result[0].transaction_count).toBe(2);
      expect(result[1].total_amount).toBe(200);
      expect(result[1].transaction_count).toBe(1);
    });

    it('should only include expenses', async () => {
      await createTransaction({
        amount: 100,
        description: 'Income',
        type: 'income',
        date: '2026-01-10',
        category_id: testCategory.id,
      });

      await createTransaction({
        amount: 50,
        description: 'Expense',
        type: 'expense',
        date: '2026-01-10',
        category_id: testCategory.id,
      });

      const result = await getSpendingByCategory('2026-01-01', '2026-01-31');

      expect(result.length).toBe(1);
      expect(result[0].total_amount).toBe(50);
    });
  });
});
