import {executeSql} from './init';

/**
 * Validates budget data
 * @param {Object} data - Budget data to validate
 * @throws {Error} If validation fails
 */
const validateBudget = data => {
  if (!data.amount || typeof data.amount !== 'number' || data.amount <= 0) {
    throw new Error('Amount must be a number greater than 0');
  }

  if (!data.category_id || typeof data.category_id !== 'number') {
    throw new Error('Category ID is required and must be a number');
  }

  if (!data.period || !['monthly', 'weekly'].includes(data.period)) {
    throw new Error('Period must be either "monthly" or "weekly"');
  }

  if (!data.start_date || !/^\d{4}-\d{2}-\d{2}$/.test(data.start_date)) {
    throw new Error('Start date is required and must be in ISO 8601 format (YYYY-MM-DD)');
  }

  if (data.end_date && !/^\d{4}-\d{2}-\d{2}$/.test(data.end_date)) {
    throw new Error('End date must be in ISO 8601 format (YYYY-MM-DD)');
  }

  if (data.end_date && data.start_date > data.end_date) {
    throw new Error('End date must be after start date');
  }
};

/**
 * Creates a new budget
 * @param {Object} data - Budget data
 * @param {number} data.category_id - Category ID (must exist)
 * @param {number} data.amount - Budget amount (must be > 0)
 * @param {string} data.period - Budget period ('monthly' or 'weekly')
 * @param {string} data.start_date - Start date (ISO 8601)
 * @param {string} [data.end_date] - End date (ISO 8601, optional)
 * @returns {Promise<Object>} Created budget with id
 */
export const createBudget = async data => {
  try {
    validateBudget(data);

    // Verify category exists
    const categoryCheck = await executeSql(
      'SELECT id FROM categories WHERE id = ?',
      [data.category_id],
    );

    if (categoryCheck.rows.length === 0) {
      throw new Error(`Category with id ${data.category_id} does not exist`);
    }

    const now = new Date().toISOString();

    const result = await executeSql(
      `INSERT INTO budgets (category_id, amount, period, start_date, end_date, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        data.category_id,
        data.amount,
        data.period,
        data.start_date,
        data.end_date || null,
        now,
        now,
      ],
    );

    return {
      id: result.insertId,
      category_id: data.category_id,
      amount: data.amount,
      period: data.period,
      start_date: data.start_date,
      end_date: data.end_date || null,
      created_at: now,
      updated_at: now,
    };
  } catch (error) {
    console.error('Error creating budget:', error);
    throw error;
  }
};

/**
 * Gets a budget by ID
 * @param {number} id - Budget ID
 * @returns {Promise<Object|null>} Budget object or null if not found
 */
export const getBudgetById = async id => {
  try {
    const result = await executeSql(
      `SELECT b.*, c.name as category_name, c.icon as category_icon, c.color as category_color
       FROM budgets b
       JOIN categories c ON b.category_id = c.id
       WHERE b.id = ?`,
      [id],
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows.item(0);
  } catch (error) {
    console.error('Error getting budget by id:', error);
    throw error;
  }
};

/**
 * Gets all budgets
 * @returns {Promise<Array>} Array of all budgets
 */
export const getAllBudgets = async () => {
  try {
    const result = await executeSql(
      `SELECT b.*, c.name as category_name, c.icon as category_icon, c.color as category_color
       FROM budgets b
       JOIN categories c ON b.category_id = c.id
       ORDER BY b.created_at DESC`,
    );

    const budgets = [];
    for (let i = 0; i < result.rows.length; i++) {
      budgets.push(result.rows.item(i));
    }

    return budgets;
  } catch (error) {
    console.error('Error getting all budgets:', error);
    throw error;
  }
};

/**
 * Gets active budgets for a given date
 * @param {string} date - Date to check (ISO 8601, defaults to today)
 * @returns {Promise<Array>} Array of active budgets
 */
export const getActiveBudgets = async (date = null) => {
  try {
    const checkDate = date || new Date().toISOString().split('T')[0];

    const result = await executeSql(
      `SELECT b.*, c.name as category_name, c.icon as category_icon, c.color as category_color
       FROM budgets b
       JOIN categories c ON b.category_id = c.id
       WHERE b.start_date <= ?
         AND (b.end_date IS NULL OR b.end_date >= ?)
       ORDER BY b.created_at DESC`,
      [checkDate, checkDate],
    );

    const budgets = [];
    for (let i = 0; i < result.rows.length; i++) {
      budgets.push(result.rows.item(i));
    }

    return budgets;
  } catch (error) {
    console.error('Error getting active budgets:', error);
    throw error;
  }
};

/**
 * Updates a budget
 * @param {number} id - Budget ID
 * @param {Object} data - Updated budget data
 * @returns {Promise<Object>} Updated budget
 */
export const updateBudget = async (id, data) => {
  try {
    validateBudget(data);

    // Check if budget exists
    const existing = await getBudgetById(id);
    if (!existing) {
      throw new Error(`Budget with id ${id} not found`);
    }

    // Verify category exists
    const categoryCheck = await executeSql(
      'SELECT id FROM categories WHERE id = ?',
      [data.category_id],
    );

    if (categoryCheck.rows.length === 0) {
      throw new Error(`Category with id ${data.category_id} does not exist`);
    }

    const updatedAt = new Date().toISOString();

    await executeSql(
      `UPDATE budgets
       SET category_id = ?, amount = ?, period = ?, start_date = ?, end_date = ?, updated_at = ?
       WHERE id = ?`,
      [
        data.category_id,
        data.amount,
        data.period,
        data.start_date,
        data.end_date || null,
        updatedAt,
        id,
      ],
    );

    return await getBudgetById(id);
  } catch (error) {
    console.error('Error updating budget:', error);
    throw error;
  }
};

/**
 * Deletes a budget
 * @param {number} id - Budget ID
 * @returns {Promise<void>}
 */
export const deleteBudget = async id => {
  try {
    // Check if budget exists
    const existing = await getBudgetById(id);
    if (!existing) {
      throw new Error(`Budget with id ${id} not found`);
    }

    await executeSql('DELETE FROM budgets WHERE id = ?', [id]);
  } catch (error) {
    console.error('Error deleting budget:', error);
    throw error;
  }
};

/**
 * Gets budget progress for a specific budget
 * @param {number} budgetId - Budget ID
 * @param {string} [startDate] - Period start date (defaults to budget start_date)
 * @param {string} [endDate] - Period end date (defaults to today)
 * @returns {Promise<Object>} Budget progress with spent amount and percentage
 */
export const getBudgetProgress = async (budgetId, startDate = null, endDate = null) => {
  try {
    const budget = await getBudgetById(budgetId);
    if (!budget) {
      throw new Error(`Budget with id ${budgetId} not found`);
    }

    const periodStart = startDate || budget.start_date;
    const periodEnd = endDate || new Date().toISOString().split('T')[0];

    const result = await executeSql(
      `SELECT COALESCE(SUM(amount), 0) as spent
       FROM transactions
       WHERE category_id = ?
         AND type = 'expense'
         AND date >= ?
         AND date <= ?`,
      [budget.category_id, periodStart, periodEnd],
    );

    const spent = result.rows.item(0).spent;
    const remaining = budget.amount - spent;
    const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

    return {
      budget_id: budgetId,
      budget_amount: budget.amount,
      spent,
      remaining,
      percentage: Math.round(percentage * 100) / 100,
      is_exceeded: spent > budget.amount,
      period_start: periodStart,
      period_end: periodEnd,
    };
  } catch (error) {
    console.error('Error getting budget progress:', error);
    throw error;
  }
};

export default {
  createBudget,
  getBudgetById,
  getAllBudgets,
  getActiveBudgets,
  updateBudget,
  deleteBudget,
  getBudgetProgress,
};
