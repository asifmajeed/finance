import {executeSql} from './init';

/**
 * Default categories to seed on first launch
 */
export const DEFAULT_CATEGORIES = [
  {name: 'Food & Dining', icon: 'food', color: '#FF6B6B'},
  {name: 'Transport', icon: 'car', color: '#4ECDC4'},
  {name: 'Shopping', icon: 'shopping', color: '#45B7D1'},
  {name: 'Bills & Utilities', icon: 'receipt', color: '#FFA07A'},
  {name: 'Entertainment', icon: 'movie', color: '#98D8C8'},
  {name: 'Health & Fitness', icon: 'heart', color: '#F7B731'},
  {name: 'Education', icon: 'school', color: '#5F27CD'},
  {name: 'Groceries', icon: 'cart', color: '#00D2D3'},
  {name: 'Salary', icon: 'cash', color: '#1DD1A1'},
  {name: 'Other Income', icon: 'cash-multiple', color: '#10AC84'},
  {name: 'Uncategorized', icon: 'help-circle', color: '#95A5A6'},
];

/**
 * Validates category data
 * @param {Object} data - Category data to validate
 * @throws {Error} If validation fails
 */
const validateCategory = data => {
  if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
    throw new Error('Category name is required and must be a non-empty string');
  }

  if (data.color && !/^#[0-9A-F]{6}$/i.test(data.color)) {
    throw new Error('Color must be a valid hex color code (e.g., #FF6B6B)');
  }
};

/**
 * Creates a new category
 * @param {Object} data - Category data
 * @param {string} data.name - Category name (required, unique)
 * @param {string} [data.icon] - Icon name
 * @param {string} [data.color] - Hex color code
 * @param {boolean} [data.is_default] - Whether this is a default category
 * @returns {Promise<Object>} Created category with id
 */
export const createCategory = async data => {
  try {
    validateCategory(data);

    const createdAt = new Date().toISOString();

    const result = await executeSql(
      `INSERT INTO categories (name, icon, color, is_default, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [
        data.name.trim(),
        data.icon || null,
        data.color || null,
        data.is_default ? 1 : 0,
        createdAt,
      ],
    );

    return {
      id: result.insertId,
      name: data.name.trim(),
      icon: data.icon || null,
      color: data.color || null,
      is_default: data.is_default ? 1 : 0,
      created_at: createdAt,
    };
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      throw new Error(`Category with name "${data.name}" already exists`);
    }
    console.error('Error creating category:', error);
    throw error;
  }
};

/**
 * Gets a category by ID
 * @param {number} id - Category ID
 * @returns {Promise<Object|null>} Category object or null if not found
 */
export const getCategoryById = async id => {
  try {
    const result = await executeSql(
      'SELECT * FROM categories WHERE id = ?',
      [id],
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows.item(0);
  } catch (error) {
    console.error('Error getting category by id:', error);
    throw error;
  }
};

/**
 * Gets all categories
 * @returns {Promise<Array>} Array of all categories
 */
export const getAllCategories = async () => {
  try {
    const result = await executeSql(
      'SELECT * FROM categories ORDER BY is_default DESC, name ASC',
    );

    const categories = [];
    for (let i = 0; i < result.rows.length; i++) {
      categories.push(result.rows.item(i));
    }

    return categories;
  } catch (error) {
    console.error('Error getting all categories:', error);
    throw error;
  }
};

/**
 * Updates a category
 * @param {number} id - Category ID
 * @param {Object} data - Updated category data
 * @returns {Promise<Object>} Updated category
 */
export const updateCategory = async (id, data) => {
  try {
    validateCategory(data);

    // Check if category exists
    const existing = await getCategoryById(id);
    if (!existing) {
      throw new Error(`Category with id ${id} not found`);
    }

    await executeSql(
      `UPDATE categories
       SET name = ?, icon = ?, color = ?
       WHERE id = ?`,
      [data.name.trim(), data.icon || null, data.color || null, id],
    );

    return await getCategoryById(id);
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      throw new Error(`Category with name "${data.name}" already exists`);
    }
    console.error('Error updating category:', error);
    throw error;
  }
};

/**
 * Deletes a category
 * @param {number} id - Category ID
 * @returns {Promise<void>}
 * @throws {Error} If category has associated transactions
 */
export const deleteCategory = async id => {
  try {
    // Check if category exists
    const existing = await getCategoryById(id);
    if (!existing) {
      throw new Error(`Category with id ${id} not found`);
    }

    // Check if category has transactions
    const transactionCheck = await executeSql(
      'SELECT COUNT(*) as count FROM transactions WHERE category_id = ?',
      [id],
    );

    const transactionCount = transactionCheck.rows.item(0).count;
    if (transactionCount > 0) {
      throw new Error(
        `Cannot delete category with ${transactionCount} associated transaction(s)`,
      );
    }

    // Check if category has budgets
    const budgetCheck = await executeSql(
      'SELECT COUNT(*) as count FROM budgets WHERE category_id = ?',
      [id],
    );

    const budgetCount = budgetCheck.rows.item(0).count;
    if (budgetCount > 0) {
      throw new Error(
        `Cannot delete category with ${budgetCount} associated budget(s)`,
      );
    }

    await executeSql('DELETE FROM categories WHERE id = ?', [id]);
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

/**
 * Seeds default categories on first launch
 * @returns {Promise<Array>} Array of created categories
 */
export const seedDefaultCategories = async () => {
  try {
    const createdCategories = [];

    for (const category of DEFAULT_CATEGORIES) {
      try {
        const created = await createCategory({
          ...category,
          is_default: true,
        });
        createdCategories.push(created);
      } catch (error) {
        // Skip if category already exists
        if (!error.message.includes('already exists')) {
          throw error;
        }
      }
    }

    console.log(
      `Seeded ${createdCategories.length} default categories successfully`,
    );
    return createdCategories;
  } catch (error) {
    console.error('Error seeding default categories:', error);
    throw error;
  }
};

export default {
  createCategory,
  getCategoryById,
  getAllCategories,
  updateCategory,
  deleteCategory,
  seedDefaultCategories,
  DEFAULT_CATEGORIES,
};
