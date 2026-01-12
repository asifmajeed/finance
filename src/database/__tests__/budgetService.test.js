import {
  createBudget,
  getBudgetById,
  getAllBudgets,
  getActiveBudgets,
  updateBudget,
  deleteBudget,
  getBudgetProgress,
} from '../budgetService';
import {createCategory} from '../categoryService';
import {createTransaction} from '../transactionService';
import {openDatabase, deleteDatabase} from '../init';
import {runMigrations, dropAllTables} from '../migrations';

describe('BudgetService', () => {
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

  describe('createBudget', () => {
    it('should create a budget successfully', async () => {
      const budgetData = {
        category_id: testCategory.id,
        amount: 1000,
        period: 'monthly',
        start_date: '2026-01-01',
      };

      const result = await createBudget(budgetData);

      expect(result.id).toBeDefined();
      expect(result.category_id).toBe(testCategory.id);
      expect(result.amount).toBe(1000);
      expect(result.period).toBe('monthly');
      expect(result.start_date).toBe('2026-01-01');
      expect(result.end_date).toBeNull();
      expect(result.created_at).toBeDefined();
      expect(result.updated_at).toBeDefined();
    });

    it('should create budget with end date', async () => {
      const result = await createBudget({
        category_id: testCategory.id,
        amount: 500,
        period: 'weekly',
        start_date: '2026-01-01',
        end_date: '2026-12-31',
      });

      expect(result.end_date).toBe('2026-12-31');
    });

    it('should reject budget without category_id', async () => {
      await expect(
        createBudget({
          amount: 1000,
          period: 'monthly',
          start_date: '2026-01-01',
        }),
      ).rejects.toThrow('Category ID is required');
    });

    it('should reject budget with invalid category_id', async () => {
      await expect(
        createBudget({
          category_id: 999,
          amount: 1000,
          period: 'monthly',
          start_date: '2026-01-01',
        }),
      ).rejects.toThrow('does not exist');
    });

    it('should reject budget with zero amount', async () => {
      await expect(
        createBudget({
          category_id: testCategory.id,
          amount: 0,
          period: 'monthly',
          start_date: '2026-01-01',
        }),
      ).rejects.toThrow('Amount must be a number greater than 0');
    });

    it('should reject budget with negative amount', async () => {
      await expect(
        createBudget({
          category_id: testCategory.id,
          amount: -100,
          period: 'monthly',
          start_date: '2026-01-01',
        }),
      ).rejects.toThrow('Amount must be a number greater than 0');
    });

    it('should reject budget with invalid period', async () => {
      await expect(
        createBudget({
          category_id: testCategory.id,
          amount: 1000,
          period: 'yearly',
          start_date: '2026-01-01',
        }),
      ).rejects.toThrow('Period must be either "monthly" or "weekly"');
    });

    it('should reject budget without start_date', async () => {
      await expect(
        createBudget({
          category_id: testCategory.id,
          amount: 1000,
          period: 'monthly',
        }),
      ).rejects.toThrow('Start date is required');
    });

    it('should reject budget with invalid date format', async () => {
      await expect(
        createBudget({
          category_id: testCategory.id,
          amount: 1000,
          period: 'monthly',
          start_date: '2026/01/01',
        }),
      ).rejects.toThrow('ISO 8601 format');
    });

    it('should reject budget with end_date before start_date', async () => {
      await expect(
        createBudget({
          category_id: testCategory.id,
          amount: 1000,
          period: 'monthly',
          start_date: '2026-12-01',
          end_date: '2026-01-01',
        }),
      ).rejects.toThrow('End date must be after start date');
    });
  });

  describe('getBudgetById', () => {
    it('should get budget by id with category details', async () => {
      const created = await createBudget({
        category_id: testCategory.id,
        amount: 1000,
        period: 'monthly',
        start_date: '2026-01-01',
      });

      const result = await getBudgetById(created.id);

      expect(result).toBeDefined();
      expect(result.id).toBe(created.id);
      expect(result.category_name).toBe('Test Category');
      expect(result.category_icon).toBe('test');
      expect(result.category_color).toBe('#FF0000');
    });

    it('should return null for non-existent budget', async () => {
      const result = await getBudgetById(999);
      expect(result).toBeNull();
    });
  });

  describe('getAllBudgets', () => {
    it('should get all budgets', async () => {
      await createBudget({
        category_id: testCategory.id,
        amount: 1000,
        period: 'monthly',
        start_date: '2026-01-01',
      });

      const category2 = await createCategory({
        name: 'Category 2',
      });

      await createBudget({
        category_id: category2.id,
        amount: 500,
        period: 'weekly',
        start_date: '2026-01-01',
      });

      const result = await getAllBudgets();

      expect(result.length).toBe(2);
    });

    it('should return empty array when no budgets exist', async () => {
      const result = await getAllBudgets();
      expect(result).toEqual([]);
    });
  });

  describe('getActiveBudgets', () => {
    it('should get active budgets for today', async () => {
      const today = new Date().toISOString().split('T')[0];

      await createBudget({
        category_id: testCategory.id,
        amount: 1000,
        period: 'monthly',
        start_date: '2026-01-01',
      });

      const result = await getActiveBudgets(today);

      expect(result.length).toBe(1);
    });

    it('should not include expired budgets', async () => {
      await createBudget({
        category_id: testCategory.id,
        amount: 1000,
        period: 'monthly',
        start_date: '2025-01-01',
        end_date: '2025-12-31',
      });

      const result = await getActiveBudgets('2026-01-15');

      expect(result.length).toBe(0);
    });

    it('should not include future budgets', async () => {
      await createBudget({
        category_id: testCategory.id,
        amount: 1000,
        period: 'monthly',
        start_date: '2027-01-01',
      });

      const result = await getActiveBudgets('2026-01-15');

      expect(result.length).toBe(0);
    });

    it('should include budgets without end_date', async () => {
      await createBudget({
        category_id: testCategory.id,
        amount: 1000,
        period: 'monthly',
        start_date: '2026-01-01',
      });

      const result = await getActiveBudgets('2026-06-15');

      expect(result.length).toBe(1);
    });

    it('should use today as default date', async () => {
      const today = new Date().toISOString().split('T')[0];

      await createBudget({
        category_id: testCategory.id,
        amount: 1000,
        period: 'monthly',
        start_date: today,
      });

      const result = await getActiveBudgets();

      expect(result.length).toBe(1);
    });
  });

  describe('updateBudget', () => {
    it('should update budget successfully', async () => {
      const created = await createBudget({
        category_id: testCategory.id,
        amount: 1000,
        period: 'monthly',
        start_date: '2026-01-01',
      });

      const updated = await updateBudget(created.id, {
        category_id: testCategory.id,
        amount: 2000,
        period: 'weekly',
        start_date: '2026-02-01',
        end_date: '2026-12-31',
      });

      expect(updated.amount).toBe(2000);
      expect(updated.period).toBe('weekly');
      expect(updated.start_date).toBe('2026-02-01');
      expect(updated.end_date).toBe('2026-12-31');
    });

    it('should reject update with invalid data', async () => {
      const created = await createBudget({
        category_id: testCategory.id,
        amount: 1000,
        period: 'monthly',
        start_date: '2026-01-01',
      });

      await expect(
        updateBudget(created.id, {
          category_id: testCategory.id,
          amount: -100,
          period: 'monthly',
          start_date: '2026-01-01',
        }),
      ).rejects.toThrow();
    });

    it('should reject update for non-existent budget', async () => {
      await expect(
        updateBudget(999, {
          category_id: testCategory.id,
          amount: 1000,
          period: 'monthly',
          start_date: '2026-01-01',
        }),
      ).rejects.toThrow('not found');
    });
  });

  describe('deleteBudget', () => {
    it('should delete budget successfully', async () => {
      const created = await createBudget({
        category_id: testCategory.id,
        amount: 1000,
        period: 'monthly',
        start_date: '2026-01-01',
      });

      await deleteBudget(created.id);

      const result = await getBudgetById(created.id);
      expect(result).toBeNull();
    });

    it('should reject deletion of non-existent budget', async () => {
      await expect(deleteBudget(999)).rejects.toThrow('not found');
    });
  });

  describe('getBudgetProgress', () => {
    it('should calculate budget progress correctly', async () => {
      const budget = await createBudget({
        category_id: testCategory.id,
        amount: 1000,
        period: 'monthly',
        start_date: '2026-01-01',
      });

      await createTransaction({
        amount: 300,
        description: 'Expense 1',
        type: 'expense',
        date: '2026-01-05',
        category_id: testCategory.id,
      });

      await createTransaction({
        amount: 200,
        description: 'Expense 2',
        type: 'expense',
        date: '2026-01-10',
        category_id: testCategory.id,
      });

      const progress = await getBudgetProgress(
        budget.id,
        '2026-01-01',
        '2026-01-31',
      );

      expect(progress.budget_amount).toBe(1000);
      expect(progress.spent).toBe(500);
      expect(progress.remaining).toBe(500);
      expect(progress.percentage).toBe(50);
      expect(progress.is_exceeded).toBe(false);
    });

    it('should detect exceeded budget', async () => {
      const budget = await createBudget({
        category_id: testCategory.id,
        amount: 1000,
        period: 'monthly',
        start_date: '2026-01-01',
      });

      await createTransaction({
        amount: 1200,
        description: 'Big Expense',
        type: 'expense',
        date: '2026-01-05',
        category_id: testCategory.id,
      });

      const progress = await getBudgetProgress(
        budget.id,
        '2026-01-01',
        '2026-01-31',
      );

      expect(progress.spent).toBe(1200);
      expect(progress.remaining).toBe(-200);
      expect(progress.is_exceeded).toBe(true);
    });

    it('should only count expenses in category', async () => {
      const budget = await createBudget({
        category_id: testCategory.id,
        amount: 1000,
        period: 'monthly',
        start_date: '2026-01-01',
      });

      await createTransaction({
        amount: 300,
        description: 'Expense',
        type: 'expense',
        date: '2026-01-05',
        category_id: testCategory.id,
      });

      await createTransaction({
        amount: 500,
        description: 'Income',
        type: 'income',
        date: '2026-01-10',
        category_id: testCategory.id,
      });

      const progress = await getBudgetProgress(
        budget.id,
        '2026-01-01',
        '2026-01-31',
      );

      expect(progress.spent).toBe(300);
    });

    it('should handle zero spending', async () => {
      const budget = await createBudget({
        category_id: testCategory.id,
        amount: 1000,
        period: 'monthly',
        start_date: '2026-01-01',
      });

      const progress = await getBudgetProgress(
        budget.id,
        '2026-01-01',
        '2026-01-31',
      );

      expect(progress.spent).toBe(0);
      expect(progress.remaining).toBe(1000);
      expect(progress.percentage).toBe(0);
    });

    it('should reject progress for non-existent budget', async () => {
      await expect(
        getBudgetProgress(999, '2026-01-01', '2026-01-31'),
      ).rejects.toThrow('not found');
    });
  });
});
