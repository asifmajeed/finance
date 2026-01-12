import {executeSql} from './init';

/**
 * Default settings to initialize on first launch
 */
export const DEFAULT_SETTINGS = {
  currency: 'USD',
  theme: 'light',
  notifications_enabled: 'true',
  budget_alerts_enabled: 'true',
};

/**
 * Gets a setting by key
 * @param {string} key - Setting key
 * @returns {Promise<string|null>} Setting value or null if not found
 */
export const getSetting = async key => {
  try {
    const result = await executeSql(
      'SELECT value FROM settings WHERE key = ?',
      [key],
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows.item(0).value;
  } catch (error) {
    console.error('Error getting setting:', error);
    throw error;
  }
};

/**
 * Sets or updates a setting
 * @param {string} key - Setting key
 * @param {string} value - Setting value
 * @returns {Promise<Object>} Updated setting
 */
export const setSetting = async (key, value) => {
  try {
    if (!key || typeof key !== 'string' || key.trim() === '') {
      throw new Error('Setting key is required and must be a non-empty string');
    }

    if (value === null || value === undefined) {
      throw new Error('Setting value cannot be null or undefined');
    }

    const updatedAt = new Date().toISOString();
    const valueStr = String(value);

    await executeSql(
      `INSERT OR REPLACE INTO settings (key, value, updated_at)
       VALUES (?, ?, ?)`,
      [key, valueStr, updatedAt],
    );

    return {
      key,
      value: valueStr,
      updated_at: updatedAt,
    };
  } catch (error) {
    console.error('Error setting setting:', error);
    throw error;
  }
};

/**
 * Gets all settings
 * @returns {Promise<Object>} Object with all settings as key-value pairs
 */
export const getAllSettings = async () => {
  try {
    const result = await executeSql('SELECT key, value FROM settings');

    const settings = {};
    for (let i = 0; i < result.rows.length; i++) {
      const row = result.rows.item(i);
      settings[row.key] = row.value;
    }

    return settings;
  } catch (error) {
    console.error('Error getting all settings:', error);
    throw error;
  }
};

/**
 * Deletes a setting
 * @param {string} key - Setting key to delete
 * @returns {Promise<void>}
 */
export const deleteSetting = async key => {
  try {
    await executeSql('DELETE FROM settings WHERE key = ?', [key]);
  } catch (error) {
    console.error('Error deleting setting:', error);
    throw error;
  }
};

/**
 * Initializes default settings on first launch
 * @returns {Promise<void>}
 */
export const initializeDefaultSettings = async () => {
  try {
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
      const existing = await getSetting(key);
      if (existing === null) {
        await setSetting(key, value);
      }
    }

    console.log('Default settings initialized successfully');
  } catch (error) {
    console.error('Error initializing default settings:', error);
    throw error;
  }
};

/**
 * Gets a setting with a default value if not found
 * @param {string} key - Setting key
 * @param {string} defaultValue - Default value to return if setting not found
 * @returns {Promise<string>} Setting value or default value
 */
export const getSettingWithDefault = async (key, defaultValue) => {
  try {
    const value = await getSetting(key);
    return value !== null ? value : defaultValue;
  } catch (error) {
    console.error('Error getting setting with default:', error);
    return defaultValue;
  }
};

/**
 * Gets multiple settings at once
 * @param {Array<string>} keys - Array of setting keys
 * @returns {Promise<Object>} Object with requested settings
 */
export const getMultipleSettings = async keys => {
  try {
    if (!Array.isArray(keys) || keys.length === 0) {
      return {};
    }

    const placeholders = keys.map(() => '?').join(',');
    const result = await executeSql(
      `SELECT key, value FROM settings WHERE key IN (${placeholders})`,
      keys,
    );

    const settings = {};
    for (let i = 0; i < result.rows.length; i++) {
      const row = result.rows.item(i);
      settings[row.key] = row.value;
    }

    return settings;
  } catch (error) {
    console.error('Error getting multiple settings:', error);
    throw error;
  }
};

/**
 * Sets multiple settings at once
 * @param {Object} settingsObj - Object with key-value pairs to set
 * @returns {Promise<void>}
 */
export const setMultipleSettings = async settingsObj => {
  try {
    if (typeof settingsObj !== 'object' || settingsObj === null) {
      throw new Error('Settings must be provided as an object');
    }

    for (const [key, value] of Object.entries(settingsObj)) {
      await setSetting(key, value);
    }
  } catch (error) {
    console.error('Error setting multiple settings:', error);
    throw error;
  }
};

export default {
  getSetting,
  setSetting,
  getAllSettings,
  deleteSetting,
  initializeDefaultSettings,
  getSettingWithDefault,
  getMultipleSettings,
  setMultipleSettings,
  DEFAULT_SETTINGS,
};
