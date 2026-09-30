import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Database path
const dbDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'mana_angadi.db');
const sqliteDb = new Database(dbPath);

// Enable foreign keys and WAL mode for high performance
sqliteDb.pragma('journal_mode = WAL');
sqliteDb.pragma('foreign_keys = ON');

export const db = {
  // Execute a query and return array of rows
  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    try {
      const stmt = sqliteDb.prepare(sql);
      return stmt.all(...params) as T[];
    } catch (err) {
      console.error('Database query error:', err, 'SQL:', sql, 'Params:', params);
      throw err;
    }
  },

  // Execute a query and return single row
  async getOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    try {
      const stmt = sqliteDb.prepare(sql);
      const row = stmt.get(...params);
      return (row as T) || null;
    } catch (err) {
      console.error('Database getOne error:', err, 'SQL:', sql, 'Params:', params);
      throw err;
    }
  },

  // Execute an insert/update/delete query
  async run(sql: string, params: any[] = []): Promise<{ lastInsertRowid: number | bigint; changes: number }> {
    try {
      const stmt = sqliteDb.prepare(sql);
      const info = stmt.run(...params);
      return { lastInsertRowid: info.lastInsertRowid, changes: info.changes };
    } catch (err) {
      console.error('Database run error:', err, 'SQL:', sql, 'Params:', params);
      throw err;
    }
  },

  // Execute multiple DDL statements
  async exec(sql: string): Promise<void> {
    try {
      sqliteDb.exec(sql);
    } catch (err) {
      console.error('Database exec error:', err);
      throw err;
    }
  },

  // Transaction helper
  transaction<T>(fn: () => T): T {
    const trx = sqliteDb.transaction(fn);
    return trx();
  }
};

export default db;
