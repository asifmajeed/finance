import {
  createCategory,
  getCategoryById,
  getAllCategories,
  updateCategory,
  deleteCategory,
  seedDefaultCategories,
  DEFAULT_CATEGORIES,
} from '../categoryService';
import {openDatabase, deleteDatabase} from '../init';
import {runMigrations, dropAllTables} from '../migrations';

describe('CategoryService', () => {
  beforeEach(async () => {
    // Initialize test database
    await openDatabase();
    await runMigrations();
  });

  afterEach(async () => {
    // Clean up test database
    await dropAllTables();
    await deleteDatabase();
  });

  describe('createCategory', () => {
    it('should create a category successfully', async () => {
      const categoryData = {
        name: 'Test Category',
        icon: 'test-icon',
        color: '#FF0000',
      };

      const result = await createCategory(categoryData);

      expect(result.id).toBeDefined();
      expect(result.name).toBe('Test Category');
      expect(result.icon).toBe('test-icon');
      expect(result.color).toBe('#FF0000');
      expect(result.is_default).toBe(0);
      expect(result.created_at).toBeDefined();
    });

    it('should trim category name', async () => {
      const result = await createCategory({
        name: '  Test Category  ',
      });

      expect(result.name).toBe('Test Category');
    });

    it('should create category with default flag', async () => {
      const result = await createCategory({
        name: 'Default Category',
        is_default: true,
      });

      expect(result.is_default).toBe(1);
    });

    it('should reject category without name', async () => {
      await expect(createCategory({})).rejects.toThrow(
        'Category name is required',
      );
    });

    it('should reject category with empty name', async () => {
      await expect(createCategory({name: '   '})).rejects.toThrow(
        'Category name is required',
      );
    });

    it('should reject category with invalid color', async () => {
      await expect(
        createCategory({
          name: 'Test',
          color: 'invalid-color',
        }),
      ).rejects.toThrow('Color must be a valid hex color code');
    });

    it('should enforce unique category names', async () => {
      await createCategory({name: 'Unique Category'});
      await expect(
        createCategory({name: 'Unique Category'}),
      ).rejects.toThrow('already exists');
    });

    it('should allow null icon and color', async () => {
      const result = await createCategory({
        name: 'Simple Category',
      });

      expect(result.icon).toBeNull();
      expect(result.color).toBeNull();
    });
  });

  describe('getCategoryById', () => {
    it('should get category by id', async () => {
      const created = await createCategory({
        name: 'Test Category',
        icon: 'test',
        color: '#FF0000',
      });

      const result = await getCategoryById(created.id);

      expect(result).toBeDefined();
      expect(result.id).toBe(created.id);
      expect(result.name).toBe('Test Category');
    });

    it('should return null for non-existent category', async () => {
      const result = await getCategoryById(999);
      expect(result).toBeNull();
    });
  });

  describe('getAllCategories', () => {
    it('should return all categories', async () => {
      await createCategory({name: 'Category 1'});
      await createCategory({name: 'Category 2'});
      await createCategory({name: 'Category 3'});

      const result = await getAllCategories();

      expect(result.length).toBe(3);
      expect(result.map(c => c.name)).toContain('Category 1');
      expect(result.map(c => c.name)).toContain('Category 2');
      expect(result.map(c => c.name)).toContain('Category 3');
    });

    it('should return empty array when no categories exist', async () => {
      const result = await getAllCategories();
      expect(result).toEqual([]);
    });

    it('should sort default categories first', async () => {
      await createCategory({name: 'Custom Category', is_default: false});
      await createCategory({name: 'Default Category', is_default: true});

      const result = await getAllCategories();

      expect(result[0].is_default).toBe(1);
      expect(result[1].is_default).toBe(0);
    });
  });

  describe('updateCategory', () => {
    it('should update category successfully', async () => {
      const created = await createCategory({
        name: 'Original Name',
        icon: 'old-icon',
        color: '#FF0000',
      });

      const updated = await updateCategory(created.id, {
        name: 'Updated Name',
        icon: 'new-icon',
        color: '#00FF00',
      });

      expect(updated.name).toBe('Updated Name');
      expect(updated.icon).toBe('new-icon');
      expect(updated.color).toBe('#00FF00');
    });

    it('should reject update with invalid data', async () => {
      const created = await createCategory({name: 'Test'});

      await expect(
        updateCategory(created.id, {name: ''}),
      ).rejects.toThrow();
    });

    it('should reject update for non-existent category', async () => {
      await expect(
        updateCategory(999, {name: 'Test'}),
      ).rejects.toThrow('not found');
    });

    it('should reject duplicate names on update', async () => {
      await createCategory({name: 'Category 1'});
      const category2 = await createCategory({name: 'Category 2'});

      await expect(
        updateCategory(category2.id, {name: 'Category 1'}),
      ).rejects.toThrow('already exists');
    });
  });

  describe('deleteCategory', () => {
    it('should delete category successfully', async () => {
      const created = await createCategory({name: 'To Delete'});

      await deleteCategory(created.id);

      const result = await getCategoryById(created.id);
      expect(result).toBeNull();
    });

    it('should reject deletion of non-existent category', async () => {
      await expect(deleteCategory(999)).rejects.toThrow('not found');
    });

    it('should prevent deleting category with transactions', async () => {
      const category = await createCategory({name: 'With Transactions'});

      // Create a transaction with this category
      const {createTransaction} = require('../transactionService');
      await createTransaction({
        amount: 100,
        description: 'Test Transaction',
        type: 'expense',
        category_id: category.id,
      });

      await expect(deleteCategory(category.id)).rejects.toThrow(
        'associated transaction',
      );
    });
  });

  describe('seedDefaultCategories', () => {
    it('should seed all default categories', async () => {
      const result = await seedDefaultCategories();

      expect(result.length).toBe(DEFAULT_CATEGORIES.length);
    });

    it('should not duplicate categories on re-seed', async () => {
      await seedDefaultCategories();
      await seedDefaultCategories(); // Call again

      const categories = await getAllCategories();
      expect(categories.length).toBe(DEFAULT_CATEGORIES.length);
    });

    it('should mark seeded categories as default', async () => {
      await seedDefaultCategories();

      const categories = await getAllCategories();
      categories.forEach(category => {
        expect(category.is_default).toBe(1);
      });
    });

    it('should include all expected default categories', async () => {
      await seedDefaultCategories();

      const categories = await getAllCategories();
      const names = categories.map(c => c.name);

      expect(names).toContain('Food & Dining');
      expect(names).toContain('Transport');
      expect(names).toContain('Shopping');
      expect(names).toContain('Groceries');
      expect(names).toContain('Salary');
      expect(names).toContain('Uncategorized');
    });
  });
});
