/**
 * Database Interface - Platform-agnostic database operations
 * 
 * This interface defines the contract for database operations that will be
 * implemented differently on web (sql.js) and native (expo-sqlite).
 */

export interface Database {
  /**
   * Initialize the database connection and create tables if needed
   */
  init(): Promise<void>;

  /**
   * Execute a SQL query and return results
   * @param sql SQL query string
   * @param params Optional query parameters
   * @returns Array of result rows
   */
  query<T = any>(sql: string, params?: any[]): Promise<T[]>;

  /**
   * Execute a SQL statement (INSERT, UPDATE, DELETE)
   * @param sql SQL statement string
   * @param params Optional statement parameters
   */
  execute(sql: string, params?: any[]): Promise<void>;

  /**
   * Execute multiple SQL statements in a transaction
   * @param statements Array of SQL statements with optional parameters
   */
  transaction(statements: Array<{ sql: string; params?: any[] }>): Promise<void>;

  /**
   * Close the database connection
   */
  close(): Promise<void>;

  /**
   * Check if database is initialized
   */
  isInitialized(): boolean;
}

/**
 * Database table schemas
 */
export const DB_SCHEMA = {
  player: `
    CREATE TABLE IF NOT EXISTS player (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      level INTEGER NOT NULL DEFAULT 1,
      experience INTEGER NOT NULL DEFAULT 0,
      health INTEGER NOT NULL DEFAULT 100,
      max_health INTEGER NOT NULL DEFAULT 100,
      stamina INTEGER NOT NULL DEFAULT 100,
      max_stamina INTEGER NOT NULL DEFAULT 100,
      gold INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `,
  
  inventory: `
    CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id INTEGER NOT NULL,
      item_id TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      equipped BOOLEAN NOT NULL DEFAULT 0,
      slot TEXT,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (player_id) REFERENCES player(id)
    )
  `,
  
  quests: `
    CREATE TABLE IF NOT EXISTS quests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id INTEGER NOT NULL,
      quest_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      current_stage INTEGER NOT NULL DEFAULT 0,
      started_at INTEGER NOT NULL,
      completed_at INTEGER,
      FOREIGN KEY (player_id) REFERENCES player(id)
    )
  `,
  
  world_state: `
    CREATE TABLE IF NOT EXISTS world_state (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id INTEGER NOT NULL,
      location_id TEXT NOT NULL,
      world_id TEXT NOT NULL,
      position_x REAL NOT NULL,
      position_y REAL NOT NULL,
      position_z REAL NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (player_id) REFERENCES player(id)
    )
  `,
  
  game_saves: `
    CREATE TABLE IF NOT EXISTS game_saves (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slot INTEGER NOT NULL UNIQUE,
      player_id INTEGER NOT NULL,
      save_name TEXT NOT NULL,
      game_time INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (player_id) REFERENCES player(id)
    )
  `,
};
