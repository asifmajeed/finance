import {
  getSetting,
  setSetting,
  getAllSettings,
  deleteSetting,
  initializeDefaultSettings,
  getSettingWithDefault,
  getMultipleSettings,
  setMultipleSettings,
  DEFAULT_SETTINGS,
} from '../settingsService';
import {openDatabase, deleteDatabase} from '../init';
import {runMigrations, dropAllTables} from '../migrations';

describe('SettingsService', () => {
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

  describe('setSetting', () => {
    it('should set a setting successfully', async () => {
      const result = await setSetting('test_key', 'test_value');

      expect(result.key).toBe('test_key');
      expect(result.value).toBe('test_value');
      expect(result.updated_at).toBeDefined();
    });

    it('should convert value to string', async () => {
      const result = await setSetting('number_key', 123);

      expect(result.value).toBe('123');
    });

    it('should update existing setting', async () => {
      await setSetting('key', 'value1');
      const updated = await setSetting('key', 'value2');

      expect(updated.value).toBe('value2');

      const retrieved = await getSetting('key');
      expect(retrieved).toBe('value2');
    });

    it('should reject setting without key', async () => {
      await expect(setSetting('', 'value')).rejects.toThrow(
        'Setting key is required',
      );
    });

    it('should reject setting with null value', async () => {
      await expect(setSetting('key', null)).rejects.toThrow(
        'value cannot be null or undefined',
      );
    });

    it('should reject setting with undefined value', async () => {
      await expect(setSetting('key', undefined)).rejects.toThrow(
        'value cannot be null or undefined',
      );
    });
  });

  describe('getSetting', () => {
    it('should get setting by key', async () => {
      await setSetting('test_key', 'test_value');

      const result = await getSetting('test_key');

      expect(result).toBe('test_value');
    });

    it('should return null for non-existent setting', async () => {
      const result = await getSetting('non_existent_key');

      expect(result).toBeNull();
    });
  });

  describe('getAllSettings', () => {
    it('should get all settings as object', async () => {
      await setSetting('key1', 'value1');
      await setSetting('key2', 'value2');
      await setSetting('key3', 'value3');

      const result = await getAllSettings();

      expect(result.key1).toBe('value1');
      expect(result.key2).toBe('value2');
      expect(result.key3).toBe('value3');
      expect(result.db_version).toBeDefined(); // Set by migrations
    });

    it('should return empty object when no settings exist', async () => {
      // Note: db_version will be set by migrations, so we check for that
      const result = await getAllSettings();

      // Only db_version should exist (set by migrations)
      expect(Object.keys(result).length).toBe(1);
      expect(result.db_version).toBe('1');
    });
  });

  describe('deleteSetting', () => {
    it('should delete setting successfully', async () => {
      await setSetting('to_delete', 'value');

      await deleteSetting('to_delete');

      const result = await getSetting('to_delete');
      expect(result).toBeNull();
    });

    it('should not throw error when deleting non-existent setting', async () => {
      await expect(deleteSetting('non_existent')).resolves.not.toThrow();
    });
  });

  describe('initializeDefaultSettings', () => {
    it('should initialize all default settings', async () => {
      await initializeDefaultSettings();

      const currency = await getSetting('currency');
      const theme = await getSetting('theme');
      const notifications = await getSetting('notifications_enabled');
      const budgetAlerts = await getSetting('budget_alerts_enabled');

      expect(currency).toBe('USD');
      expect(theme).toBe('light');
      expect(notifications).toBe('true');
      expect(budgetAlerts).toBe('true');
    });

    it('should not overwrite existing settings', async () => {
      await setSetting('currency', 'EUR');

      await initializeDefaultSettings();

      const currency = await getSetting('currency');
      expect(currency).toBe('EUR');
    });

    it('should only add missing default settings', async () => {
      await setSetting('currency', 'EUR');

      await initializeDefaultSettings();

      const currency = await getSetting('currency');
      const theme = await getSetting('theme');

      expect(currency).toBe('EUR');
      expect(theme).toBe('light');
    });
  });

  describe('getSettingWithDefault', () => {
    it('should get setting value when it exists', async () => {
      await setSetting('existing_key', 'existing_value');

      const result = await getSettingWithDefault('existing_key', 'default_value');

      expect(result).toBe('existing_value');
    });

    it('should return default value when setting does not exist', async () => {
      const result = await getSettingWithDefault('non_existent_key', 'default_value');

      expect(result).toBe('default_value');
    });

    it('should handle errors gracefully', async () => {
      // Close database to cause error
      await dropAllTables();
      await deleteDatabase();

      const result = await getSettingWithDefault('key', 'default');

      expect(result).toBe('default');
    });
  });

  describe('getMultipleSettings', () => {
    it('should get multiple settings at once', async () => {
      await setSetting('key1', 'value1');
      await setSetting('key2', 'value2');
      await setSetting('key3', 'value3');

      const result = await getMultipleSettings(['key1', 'key3']);

      expect(result).toEqual({
        key1: 'value1',
        key3: 'value3',
      });
    });

    it('should return empty object for empty array', async () => {
      const result = await getMultipleSettings([]);

      expect(result).toEqual({});
    });

    it('should return only existing settings', async () => {
      await setSetting('key1', 'value1');

      const result = await getMultipleSettings(['key1', 'non_existent']);

      expect(result).toEqual({
        key1: 'value1',
      });
    });
  });

  describe('setMultipleSettings', () => {
    it('should set multiple settings at once', async () => {
      await setMultipleSettings({
        key1: 'value1',
        key2: 'value2',
        key3: 'value3',
      });

      const key1 = await getSetting('key1');
      const key2 = await getSetting('key2');
      const key3 = await getSetting('key3');

      expect(key1).toBe('value1');
      expect(key2).toBe('value2');
      expect(key3).toBe('value3');
    });

    it('should reject non-object input', async () => {
      await expect(setMultipleSettings('not an object')).rejects.toThrow(
        'Settings must be provided as an object',
      );
    });

    it('should reject null input', async () => {
      await expect(setMultipleSettings(null)).rejects.toThrow(
        'Settings must be provided as an object',
      );
    });

    it('should handle empty object', async () => {
      await expect(setMultipleSettings({})).resolves.not.toThrow();
    });
  });

  describe('DEFAULT_SETTINGS', () => {
    it('should have all expected default settings', () => {
      expect(DEFAULT_SETTINGS).toHaveProperty('currency');
      expect(DEFAULT_SETTINGS).toHaveProperty('theme');
      expect(DEFAULT_SETTINGS).toHaveProperty('notifications_enabled');
      expect(DEFAULT_SETTINGS).toHaveProperty('budget_alerts_enabled');
    });

    it('should have correct default values', () => {
      expect(DEFAULT_SETTINGS.currency).toBe('USD');
      expect(DEFAULT_SETTINGS.theme).toBe('light');
      expect(DEFAULT_SETTINGS.notifications_enabled).toBe('true');
      expect(DEFAULT_SETTINGS.budget_alerts_enabled).toBe('true');
    });
  });
});
