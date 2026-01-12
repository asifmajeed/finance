import SQLite from 'react-native-sqlite-storage';

// Enable promise mode for cleaner async/await syntax
SQLite.enablePromise(true);

const DATABASE_NAME = 'FinanceTracker.db';
export const DATABASE_VERSION = 1;

let db = null;

/**
 * Opens or creates the database
 * @returns {Promise<SQLite.SQLiteDatabase>} Database instance
 */
export const openDatabase = async () => {
  if (db) {
    return db;
  }

  try {
    db = await SQLite.openDatabase({
      name: DATABASE_NAME,
      location: 'default',
    });

    console.log('Database opened successfully');
    return db;
  } catch (error) {
    console.error('Error opening database:', error);
    throw error;
  }
};

/**
 * Closes the database connection
 * @returns {Promise<void>}
 */
export const closeDatabase = async () => {
  if (db) {
    try {
      await db.close();
      db = null;
      console.log('Database closed successfully');
    } catch (error) {
      console.error('Error closing database:', error);
      throw error;
    }
  }
};

/**
 * Gets the current database instance
 * @returns {SQLite.SQLiteDatabase|null} Database instance or null
 */
export const getDatabase = () => {
  return db;
};

/**
 * Executes a SQL query
 * @param {string} query - SQL query to execute
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>} Query results
 */
export const executeSql = async (query, params = []) => {
  try {
    const database = await openDatabase();
    const [results] = await database.executeSql(query, params);
    return results;
  } catch (error) {
    console.error('Error executing SQL:', error);
    throw error;
  }
};

/**
 * Deletes the database (useful for testing)
 * @returns {Promise<void>}
 */
export const deleteDatabase = async () => {
  try {
    await closeDatabase();
    await SQLite.deleteDatabase({
      name: DATABASE_NAME,
      location: 'default',
    });
    console.log('Database deleted successfully');
  } catch (error) {
    console.error('Error deleting database:', error);
    throw error;
  }
};

export default {
  openDatabase,
  closeDatabase,
  getDatabase,
  executeSql,
  deleteDatabase,
  DATABASE_VERSION,
};
