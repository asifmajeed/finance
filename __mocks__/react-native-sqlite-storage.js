// Mock for react-native-sqlite-storage using sqlite3 for Node.js tests
const sqlite3 = require('sqlite3');

class MockDatabase {
  constructor(dbPath) {
    this.db = new sqlite3.Database(dbPath || ':memory:');
    this.isOpen = true;
  }

  executeSql(query, params = []) {
    return new Promise((resolve, reject) => {
      if (!this.isOpen || !this.db) {
        reject(new Error('Database is not open'));
        return;
      }

      const normalizedQuery = query.trim();

      // Check if it's a SELECT or other query that returns rows
      if (normalizedQuery.toUpperCase().startsWith('SELECT') ||
          normalizedQuery.toUpperCase().includes('RETURNING')) {
        this.db.all(normalizedQuery, params, (err, rows) => {
          if (err) {
            reject(err);
          } else {
            const result = {
              rows: {
                length: rows.length,
                item: (index) => rows[index],
                raw: () => rows,
              },
              insertId: undefined,
              rowsAffected: 0,
            };
            resolve([result]);
          }
        });
      } else {
        // INSERT, UPDATE, DELETE, CREATE, etc.
        this.db.run(normalizedQuery, params, function(err) {
          if (err) {
            reject(err);
          } else {
            const result = {
              rows: {
                length: 0,
                item: () => null,
                raw: () => [],
              },
              insertId: this.lastID,
              rowsAffected: this.changes,
            };
            resolve([result]);
          }
        });
      }
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      if (this.db && this.isOpen) {
        this.db.close((err) => {
          if (err && err.message !== 'SQLITE_MISUSE: Database is closed') {
            reject(err);
          } else {
            this.isOpen = false;
            this.db = null;
            resolve();
          }
        });
      } else {
        this.isOpen = false;
        resolve();
      }
    });
  }
}

let currentDb = null;

const SQLite = {
  enablePromise: jest.fn(),

  openDatabase: jest.fn((config) => {
    if (!currentDb || !currentDb.isOpen) {
      currentDb = new MockDatabase(':memory:');
    }
    return Promise.resolve(currentDb);
  }),

  deleteDatabase: jest.fn(() => {
    if (currentDb) {
      return currentDb.close().then(() => {
        currentDb = null;
      }).catch(() => {
        // Ignore errors, just reset
        currentDb = null;
      });
    }
    return Promise.resolve();
  }),
};

module.exports = SQLite;
