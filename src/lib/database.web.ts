/**
 * Web Database Implementation using sql.js (WASM SQLite)
 * 
 * This implementation uses sql.js to provide SQLite functionality in the browser.
 * Data is persisted to localStorage as a binary blob.
 */

import initSqlJs from 'sql.js';
import type { Database } from './database';
import { DB_SCHEMA } from './database';

// Type for sql.js Database
type SqlJsDatabase = any; // sql.js doesn't export types properly

const STORAGE_KEY = 'iron-frontier-db';
const SQL_WASM_URL = 'https://sql.js.org/dist/sql-wasm.wasm';

export class WebDatabase implements Database {
  private db: SqlJsDatabase | null = null;
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Initialize sql.js
      const SQL = await initSqlJs({
        locateFile: (file: string) => SQL_WASM_URL,
      });

      // Try to load existing database from localStorage
      const savedDb = localStorage.getItem(STORAGE_KEY);
      if (savedDb) {
        try {
          const buffer = new Uint8Array(JSON.parse(savedDb));
          this.db = new SQL.Database(buffer);
          console.log('[WebDatabase] Loaded existing database from localStorage');
        } catch (error) {
          console.warn('[WebDatabase] Failed to load saved database, creating new one:', error);
          this.db = new SQL.Database();
        }
      } else {
        this.db = new SQL.Database();
        console.log('[WebDatabase] Created new database');
      }

      // Create tables
      await this.createTables();
      
      // Save to localStorage
      this.save();
      
      this.initialized = true;
      console.log('[WebDatabase] Initialization complete');
    } catch (error) {
      console.error('[WebDatabase] Initialization failed:', error);
      throw new Error(`Failed to initialize web database: ${error}`);
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    // Create all tables
    for (const [tableName, schema] of Object.entries(DB_SCHEMA)) {
      try {
        this.db.run(schema);
        console.log(`[WebDatabase] Created table: ${tableName}`);
      } catch (error) {
        console.error(`[WebDatabase] Failed to create table ${tableName}:`, error);
        throw error;
      }
    }
  }

  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      const results = this.db.exec(sql, params);
      
      if (results.length === 0) {
        return [];
      }

      // Convert sql.js result format to array of objects
      const { columns, values } = results[0];
      return values.map((row: any[]) => {
        const obj: any = {};
        columns.forEach((col: string, index: number) => {
          obj[col] = row[index];
        });
        return obj as T;
      });
    } catch (error) {
      console.error('[WebDatabase] Query failed:', error, { sql, params });
      throw error;
    }
  }

  async execute(sql: string, params: any[] = []): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      this.db.run(sql, params);
      this.save();
    } catch (error) {
      console.error('[WebDatabase] Execute failed:', error, { sql, params });
      throw error;
    }
  }

  async transaction(statements: Array<{ sql: string; params?: any[] }>): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      this.db.run('BEGIN TRANSACTION');
      
      for (const { sql, params = [] } of statements) {
        this.db.run(sql, params);
      }
      
      this.db.run('COMMIT');
      this.save();
    } catch (error) {
      this.db.run('ROLLBACK');
      console.error('[WebDatabase] Transaction failed:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    if (this.db) {
      this.save();
      this.db.close();
      this.db = null;
      this.initialized = false;
      console.log('[WebDatabase] Database closed');
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Save database to localStorage
   */
  private save(): void {
    if (!this.db) {
      return;
    }

    try {
      const data = this.db.export();
      const dataStr = JSON.stringify(Array.from(data));
      localStorage.setItem(STORAGE_KEY, dataStr);
    } catch (error) {
      console.error('[WebDatabase] Failed to save to localStorage:', error);
    }
  }

  /**
   * Clear all data and reset database
   */
  async reset(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY);
    await this.close();
    await this.init();
  }
}

// Export singleton instance
export const database = new WebDatabase();
