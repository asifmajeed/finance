import {executeSql, openDatabase, DATABASE_VERSION} from './init';

/**
 * Creates all database tables
 * @returns {Promise<void>}
 */
const createTables = async () => {
  try {
    // Create categories table
    await executeSql(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        icon TEXT,
        color TEXT,
        is_default INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
      )
    `);

    // Create transactions table
    await executeSql(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount REAL NOT NULL,
        description TEXT NOT NULL,
        date TEXT NOT NULL,
        type TEXT NOT NULL,
        category_id INTEGER,
        is_manually_set INTEGER DEFAULT 0,
        source TEXT,
        raw_data TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (category_id) REFERENCES categories(id)
      )
    `);

    // Create budgets table
    await executeSql(`
      CREATE TABLE IF NOT EXISTS budgets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        period TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (category_id) REFERENCES categories(id)
      )
    `);

    // Create settings table
    await executeSql(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    console.log('All tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
};

/**
 * Creates database indexes for performance optimization
 * @returns {Promise<void>}
 */
const createIndexes = async () => {
  try {
    await executeSql(
      'CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date)',
    );
    await executeSql(
      'CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id)',
    );
    await executeSql(
      'CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type)',
    );
    await executeSql(
      'CREATE INDEX IF NOT EXISTS idx_budgets_category ON budgets(category_id)',
    );

    console.log('All indexes created successfully');
  } catch (error) {
    console.error('Error creating indexes:', error);
    throw error;
  }
};

/**
 * Gets the current database version from settings
 * @returns {Promise<number>} Current database version
 */
const getDatabaseVersion = async () => {
  try {
    const result = await executeSql(
      'SELECT value FROM settings WHERE key = ?',
      ['db_version'],
    );

    if (result.rows.length > 0) {
      return parseInt(result.rows.item(0).value, 10);
    }

    return 0;
  } catch (error) {
    // Table might not exist yet
    return 0;
  }
};

/**
 * Sets the database version in settings
 * @param {number} version - Version number to set
 * @returns {Promise<void>}
 */
const setDatabaseVersion = async version => {
  try {
    await executeSql(
      `INSERT OR REPLACE INTO settings (key, value, updated_at)
       VALUES (?, ?, ?)`,
      ['db_version', version.toString(), new Date().toISOString()],
    );
  } catch (error) {
    console.error('Error setting database version:', error);
    throw error;
  }
};

/**
 * Checks if this is the first launch (database not initialized)
 * @returns {Promise<boolean>} True if first launch
 */
export const isFirstLaunch = async () => {
  try {
    const version = await getDatabaseVersion();
    return version === 0;
  } catch (error) {
    return true;
  }
};

/**
 * Runs all database migrations
 * @returns {Promise<void>}
 */
export const runMigrations = async () => {
  try {
    await openDatabase();

    const currentVersion = await getDatabaseVersion();
    console.log('Current database version:', currentVersion);

    if (currentVersion === 0) {
      console.log('First launch detected, initializing database...');
      await createTables();
      await createIndexes();
      await setDatabaseVersion(DATABASE_VERSION);
      console.log('Database initialized successfully');
    } else if (currentVersion < DATABASE_VERSION) {
      console.log(
        `Migrating database from version ${currentVersion} to ${DATABASE_VERSION}`,
      );
      // Future migrations will go here
      // For now, we only have version 1
      await setDatabaseVersion(DATABASE_VERSION);
      console.log('Database migration completed');
    } else {
      console.log('Database is up to date');
    }
  } catch (error) {
    console.error('Error running migrations:', error);
    throw error;
  }
};

/**
 * Drops all tables (use with caution, mainly for testing)
 * @returns {Promise<void>}
 */
export const dropAllTables = async () => {
  try {
    await executeSql('DROP TABLE IF EXISTS transactions');
    await executeSql('DROP TABLE IF EXISTS budgets');
    await executeSql('DROP TABLE IF EXISTS categories');
    await executeSql('DROP TABLE IF EXISTS settings');
    console.log('All tables dropped successfully');
  } catch (error) {
    console.error('Error dropping tables:', error);
    throw error;
  }
};

export default {
  runMigrations,
  isFirstLaunch,
  dropAllTables,
};
