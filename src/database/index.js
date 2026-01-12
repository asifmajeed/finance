import {openDatabase, closeDatabase} from './init';
import {runMigrations, isFirstLaunch} from './migrations';
import {seedDefaultCategories} from './categoryService';
import {initializeDefaultSettings} from './settingsService';

// Export all services
export * from './init';
export * from './migrations';
export * from './transactionService';
export * from './categoryService';
export * from './budgetService';
export * from './settingsService';

/**
 * Initializes the database on app startup
 * This function should be called once when the app starts
 * @returns {Promise<void>}
 */
export const initializeDatabase = async () => {
  try {
    console.log('Initializing database...');

    // Open database connection
    await openDatabase();

    // Run migrations (creates tables if needed)
    await runMigrations();

    // Check if this is first launch
    const firstLaunch = await isFirstLaunch();

    if (firstLaunch) {
      console.log('First launch detected, seeding initial data...');

      // Seed default categories
      await seedDefaultCategories();

      // Initialize default settings
      await initializeDefaultSettings();

      console.log('Initial data seeded successfully');
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

/**
 * Closes the database connection
 * Call this when the app is shutting down
 * @returns {Promise<void>}
 */
export const shutdownDatabase = async () => {
  try {
    await closeDatabase();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error closing database:', error);
    throw error;
  }
};

export default {
  initializeDatabase,
  shutdownDatabase,
};
