import initSqlJs from 'sql.js';

let SQL: any = null;

// ============================================================================
// SCHEMA CONSTANTS
// ============================================================================

const SCHEMA_SQL = `
-- Player State
CREATE TABLE IF NOT EXISTS player (
  id TEXT PRIMARY KEY,
  name TEXT,
  level INTEGER,
  xp INTEGER,
  xp_to_next INTEGER,
  health INTEGER,
  max_health INTEGER,
  stamina INTEGER,
  max_stamina INTEGER,
  gold INTEGER,
  reputation INTEGER,
  pos_x REAL,
  pos_y REAL,
  pos_z REAL,
  rotation REAL,
  last_updated INTEGER
);

-- Inventory
CREATE TABLE IF NOT EXISTS inventory (
  id TEXT PRIMARY KEY,
  item_id TEXT,
  name TEXT,
  rarity TEXT,
  quantity INTEGER,
  usable BOOLEAN,
  description TEXT
);

-- Quests
CREATE TABLE IF NOT EXISTS quests (
  id TEXT PRIMARY KEY,
  title TEXT,
  description TEXT,
  giver_npc_id TEXT,
  status TEXT,
  xp_reward INTEGER,
  gold_reward INTEGER
);

-- World Items
CREATE TABLE IF NOT EXISTS world_items (
  id TEXT PRIMARY KEY,
  item_id TEXT,
  pos_x REAL,
  pos_y REAL,
  pos_z REAL,
  quantity INTEGER,
  is_collected BOOLEAN
);

-- NPCs (Persistent State)
CREATE TABLE IF NOT EXISTS npcs (
  id TEXT PRIMARY KEY,
  name TEXT,
  role TEXT,
  disposition INTEGER,
  is_alive BOOLEAN,
  pos_x REAL,
  pos_y REAL,
  pos_z REAL,
  rotation REAL
);

-- Settings & Metadata
CREATE TABLE IF NOT EXISTS game_metadata (
  key TEXT PRIMARY KEY,
  value TEXT
);
`;

// ============================================================================
// DATABASE MANAGER
// ============================================================================

export class DatabaseManager {
  private db: any = null;

  /**
   * Initialize SQL.js and create/open the database
   */
  async init(binaryData?: Uint8Array): Promise<void> {
    // Close existing connection if any
    this.dispose();

    if (!SQL) {
      SQL = await initSqlJs({
        locateFile: (file: string) => `https://sql.js.org/dist/${file}`,
      });
    }

    if (binaryData) {
      this.db = new SQL.Database(binaryData);
    } else {
      this.db = new SQL.Database();
      this.db.run(SCHEMA_SQL);
    }
  }

  /**
   * Close the database connection
   */
  dispose(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  /**
   * Export the database to a binary Uint8Array
   */
  export(): Uint8Array | null {
    if (!this.db) return null;
    return this.db.export();
  }

  /**
   * Execute a raw SQL statement
   * Silently returns if database not yet initialized (save will happen later)
   */
  run(sql: string, params?: any[]): void {
    if (!this.db) return; // Silently skip if not initialized
    this.db.run(sql, params);
  }

  /**
   * Execute a query and return results
   */
  exec(sql: string, params?: any[]): any[] {
    if (!this.db) throw new Error('Database not initialized');
    const results = this.db.exec(sql, params);
    if (results.length === 0) return [];

    const { columns, values } = results[0];
    return values.map((row: unknown[]) => {
      const obj: Record<string, unknown> = {};
      columns.forEach((col: string, i: number) => {
        obj[col] = row[i];
      });
      return obj;
    });
  }

  /**
   * Helper to transactionally update the player state
   * Accepts the full game state and extracts player data from it
   */
  savePlayer(gameState: any): void {
    if (!this.db) return;

    const stats = gameState.playerStats || {};
    const pos = gameState.playerPosition || { x: 0, y: 0, z: 0 };

    this.run(
      `
      INSERT OR REPLACE INTO player (
        id, name, level, xp, xp_to_next, health, max_health,
        stamina, max_stamina, gold, reputation,
        pos_x, pos_y, pos_z, rotation, last_updated
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        1, // Single player, always id=1
        gameState.playerName || 'Unknown',
        stats.level || 1,
        stats.xp || 0,
        stats.xpToNext || 100,
        stats.health || 100,
        stats.maxHealth || 100,
        stats.stamina || 100,
        stats.maxStamina || 100,
        stats.gold || 0,
        stats.reputation || 0,
        pos.x,
        pos.y,
        pos.z,
        gameState.playerRotation || 0,
        Date.now(),
      ]
    );
  }

  /**
   * Helper to transactionally update inventory
   */
  saveInventory(items: any[]): void {
    if (!this.db) return;

    const transaction = this.db.exec('BEGIN TRANSACTION');
    try {
      this.db.run('DELETE FROM inventory');

      if (items.length > 0) {
        const stmt = this.db.prepare(`
          INSERT INTO inventory (id, item_id, name, rarity, quantity, usable, description)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        try {
          for (const item of items) {
            stmt.run([
              item.id,
              item.itemId,
              item.name,
              item.rarity,
              item.quantity,
              item.usable ? 1 : 0,
              item.description || '',
            ]);
          }
        } finally {
          stmt.free();
        }
      }

      this.db.exec('COMMIT');
    } catch (error) {
      try {
        this.run('ROLLBACK');
      } catch (rollbackError) {
        // Silently ignore rollback errors if the transaction was already closed
      }
      console.error('DatabaseManager.saveInventory failed:', error);
      throw error;
    }
  }

  /**
   * Load the full game state from the database
   */
  loadGameState(): any {
    const players = this.exec('SELECT * FROM player LIMIT 1');
    if (players.length === 0) return null;

    const p = players[0];
    const inventory = this.exec('SELECT * FROM inventory');

    return {
      playerName: p.name,
      playerId: p.id,
      playerStats: {
        level: p.level,
        xp: p.xp,
        xpToNext: p.xp_to_next,
        health: p.health,
        maxHealth: p.max_health,
        stamina: p.stamina,
        maxStamina: p.max_stamina,
        gold: p.gold,
        reputation: p.reputation,
      },
      playerPosition: { x: p.pos_x, y: p.pos_y, z: p.pos_z },
      playerRotation: p.rotation,
      inventory: inventory.map((i) => ({
        ...i,
        usable: !!i.usable,
      })),
    };
  }
}

export const dbManager = new DatabaseManager();
