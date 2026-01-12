import {executeSql} from './init';

/**
 * Validates transaction data
 * @param {Object} data - Transaction data to validate
 * @throws {Error} If validation fails
 */
const validateTransaction = data => {
  if (!data.amount || typeof data.amount !== 'number' || data.amount <= 0) {
    throw new Error('Amount must be a number greater than 0');
  }

  if (
    !data.description ||
    typeof data.description !== 'string' ||
    data.description.trim() === ''
  ) {
    throw new Error('Description is required and must be a non-empty string');
  }

  if (!data.type || !['income', 'expense'].includes(data.type)) {
    throw new Error('Type must be either "income" or "expense"');
  }

  if (data.date && !/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
    throw new Error('Date must be in ISO 8601 format (YYYY-MM-DD)');
  }

  if (
    data.source &&
    !['manual', 'sms', 'upload'].includes(data.source)
  ) {
    throw new Error('Source must be "manual", "sms", or "upload"');
  }
};

/**
 * Creates a new transaction
 * @param {Object} data - Transaction data
 * @param {number} data.amount - Transaction amount (must be > 0)
 * @param {string} data.description - Transaction description
 * @param {string} data.type - Transaction type ('income' or 'expense')
 * @param {string} [data.date] - Transaction date (ISO 8601, defaults to today)
 * @param {number} [data.category_id] - Category ID
 * @param {boolean} [data.is_manually_set] - Whether category was manually set
 * @param {string} [data.source] - Source of transaction ('manual', 'sms', 'upload')
 * @param {string} [data.raw_data] - Original SMS or file data
 * @returns {Promise<Object>} Created transaction with id
 */
export const createTransaction = async data => {
  try {
    validateTransaction(data);

    const now = new Date().toISOString();
    const date = data.date || new Date().toISOString().split('T')[0];

    const result = await executeSql(
      `INSERT INTO transactions (amount, description, date, type, category_id, is_manually_set, source, raw_data, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.amount,
        data.description.trim(),
        date,
        data.type,
        data.category_id || null,
        data.is_manually_set ? 1 : 0,
        data.source || 'manual',
        data.raw_data || null,
        now,
        now,
      ],
    );

    return {
      id: result.insertId,
      amount: data.amount,
      description: data.description.trim(),
      date,
      type: data.type,
      category_id: data.category_id || null,
      is_manually_set: data.is_manually_set ? 1 : 0,
      source: data.source || 'manual',
      raw_data: data.raw_data || null,
      created_at: now,
      updated_at: now,
    };
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
};

/**
 * Gets a transaction by ID
 * @param {number} id - Transaction ID
 * @returns {Promise<Object|null>} Transaction object or null if not found
 */
export const getTransactionById = async id => {
  try {
    const result = await executeSql(
      `SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.id = ?`,
      [id],
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows.item(0);
  } catch (error) {
    console.error('Error getting transaction by id:', error);
    throw error;
  }
};

/**
 * Gets all transactions with optional filters
 * @param {Object} [filters] - Filter options
 * @param {string} [filters.startDate] - Start date (ISO 8601)
 * @param {string} [filters.endDate] - End date (ISO 8601)
 * @param {number} [filters.category_id] - Category ID
 * @param {string} [filters.type] - Transaction type ('income' or 'expense')
 * @param {number} [filters.limit] - Maximum number of results
 * @param {number} [filters.offset] - Number of results to skip
 * @returns {Promise<Array>} Array of transactions
 */
export const getAllTransactions = async (filters = {}) => {
  try {
    let query = `
      SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.startDate) {
      query += ' AND t.date >= ?';
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      query += ' AND t.date <= ?';
      params.push(filters.endDate);
    }

    if (filters.category_id) {
      query += ' AND t.category_id = ?';
      params.push(filters.category_id);
    }

    if (filters.type) {
      query += ' AND t.type = ?';
      params.push(filters.type);
    }

    query += ' ORDER BY t.date DESC, t.created_at DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }

    if (filters.offset) {
      query += ' OFFSET ?';
      params.push(filters.offset);
    }

    const result = await executeSql(query, params);

    const transactions = [];
    for (let i = 0; i < result.rows.length; i++) {
      transactions.push(result.rows.item(i));
    }

    return transactions;
  } catch (error) {
    console.error('Error getting all transactions:', error);
    throw error;
  }
};

/**
 * Gets transactions by date range
 * @param {string} startDate - Start date (ISO 8601)
 * @param {string} endDate - End date (ISO 8601)
 * @returns {Promise<Array>} Array of transactions
 */
export const getTransactionsByDateRange = async (startDate, endDate) => {
  return getAllTransactions({startDate, endDate});
};

/**
 * Gets transactions by category
 * @param {number} categoryId - Category ID
 * @returns {Promise<Array>} Array of transactions
 */
export const getTransactionsByCategory = async categoryId => {
  return getAllTransactions({category_id: categoryId});
};

/**
 * Updates a transaction
 * @param {number} id - Transaction ID
 * @param {Object} data - Updated transaction data
 * @returns {Promise<Object>} Updated transaction
 */
export const updateTransaction = async (id, data) => {
  try {
    validateTransaction(data);

    // Check if transaction exists
    const existing = await getTransactionById(id);
    if (!existing) {
      throw new Error(`Transaction with id ${id} not found`);
    }

    const updatedAt = new Date().toISOString();

    await executeSql(
      `UPDATE transactions
       SET amount = ?, description = ?, date = ?, type = ?, category_id = ?, is_manually_set = ?, source = ?, raw_data = ?, updated_at = ?
       WHERE id = ?`,
      [
        data.amount,
        data.description.trim(),
        data.date || existing.date,
        data.type,
        data.category_id || null,
        data.is_manually_set ? 1 : 0,
        data.source || existing.source,
        data.raw_data || existing.raw_data,
        updatedAt,
        id,
      ],
    );

    return await getTransactionById(id);
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }
};

/**
 * Deletes a transaction
 * @param {number} id - Transaction ID
 * @returns {Promise<void>}
 */
export const deleteTransaction = async id => {
  try {
    // Check if transaction exists
    const existing = await getTransactionById(id);
    if (!existing) {
      throw new Error(`Transaction with id ${id} not found`);
    }

    await executeSql('DELETE FROM transactions WHERE id = ?', [id]);
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
};

/**
 * Gets transaction summary for a date range
 * @param {string} startDate - Start date (ISO 8601)
 * @param {string} endDate - End date (ISO 8601)
 * @returns {Promise<Object>} Summary with total income, expenses, and balance
 */
export const getTransactionSummary = async (startDate, endDate) => {
  try {
    const result = await executeSql(
      `SELECT
         SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
         SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense,
         COUNT(*) as total_count
       FROM transactions
       WHERE date >= ? AND date <= ?`,
      [startDate, endDate],
    );

    const row = result.rows.item(0);
    const totalIncome = row.total_income || 0;
    const totalExpense = row.total_expense || 0;

    return {
      total_income: totalIncome,
      total_expense: totalExpense,
      balance: totalIncome - totalExpense,
      total_count: row.total_count,
    };
  } catch (error) {
    console.error('Error getting transaction summary:', error);
    throw error;
  }
};

/**
 * Gets spending by category for a date range
 * @param {string} startDate - Start date (ISO 8601)
 * @param {string} endDate - End date (ISO 8601)
 * @returns {Promise<Array>} Array of category spending summaries
 */
export const getSpendingByCategory = async (startDate, endDate) => {
  try {
    const result = await executeSql(
      `SELECT
         c.id,
         c.name,
         c.icon,
         c.color,
         SUM(t.amount) as total_amount,
         COUNT(t.id) as transaction_count
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       WHERE t.date >= ? AND t.date <= ? AND t.type = 'expense'
       GROUP BY c.id, c.name, c.icon, c.color
       ORDER BY total_amount DESC`,
      [startDate, endDate],
    );

    const categories = [];
    for (let i = 0; i < result.rows.length; i++) {
      categories.push(result.rows.item(i));
    }

    return categories;
  } catch (error) {
    console.error('Error getting spending by category:', error);
    throw error;
  }
};

export default {
  createTransaction,
  getTransactionById,
  getAllTransactions,
  getTransactionsByDateRange,
  getTransactionsByCategory,
  updateTransaction,
  deleteTransaction,
  getTransactionSummary,
  getSpendingByCategory,
};
