/**
 * Native Database Implementation using expo-sqlite
 * 
 * This implementation uses expo-sqlite to provide native SQLite functionality
 * on iOS and Android.
 */

import * as SQLite from 'expo-sqlite';
import type { Database } from './database';
import { DB_SCHEMA } from './database';

const DB_NAME = 'iron-frontier.db';

export class NativeDatabase implements Database {
  private db: SQLite.SQLiteDatabase | null = null;
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Open database
      this.db = await SQLite.openDatabaseAsync(DB_NAME);
      console.log('[NativeDatabase] Database opened');

      // Create tables
      await this.createTables();
      
      this.initialized = true;
      console.log('[NativeDatabase] Initialization complete');
    } catch (error) {
      console.error('[NativeDatabase] Initialization failed:', error);
      throw new Error(`Failed to initialize native database: ${error}`);
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    // Create all tables
    for (const [tableName, schema] of Object.entries(DB_SCHEMA)) {
      try {
        await this.db.execAsync(schema);
        console.log(`[NativeDatabase] Created table: ${tableName}`);
      } catch (error) {
        console.error(`[NativeDatabase] Failed to create table ${tableName}:`, error);
        throw error;
      }
    }
  }

  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      const result = await this.db.getAllAsync<T>(sql, params);
      return result;
    } catch (error) {
      console.error('[NativeDatabase] Query failed:', error, { sql, params });
      throw error;
    }
  }

  async execute(sql: string, params: any[] = []): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      await this.db.runAsync(sql, params);
    } catch (error) {
      console.error('[NativeDatabase] Execute failed:', error, { sql, params });
      throw error;
    }
  }

  async transaction(statements: Array<{ sql: string; params?: any[] }>): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      await this.db.withTransactionAsync(async () => {
        for (const { sql, params = [] } of statements) {
          await this.db!.runAsync(sql, params);
        }
      });
    } catch (error) {
      console.error('[NativeDatabase] Transaction failed:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
      this.initialized = false;
      console.log('[NativeDatabase] Database closed');
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Delete database file and reset
   */
  async reset(): Promise<void> {
    await this.close();
    await SQLite.deleteDatabaseAsync(DB_NAME);
    await this.init();
  }
}

// Export singleton instance
export const database = new NativeDatabase();
