import { migrate } from 'drizzle-orm/bun-sqlite/migrator';
import { db } from './index';
import { logger } from '../utils/logger';

// This is a simple migration script for SQLite
async function runMigrations() {
  try {
    logger.info('Running SQLite database migrations...');

    // Create tables manually for SQLite
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER DEFAULT (strftime('%s', 'now'))
      );

      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        owner_id TEXT NOT NULL,
        settings TEXT DEFAULT '{}',
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS workflows (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        definition TEXT NOT NULL,
        version INTEGER DEFAULT 1,
        is_active INTEGER DEFAULT 0,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS agents (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        config TEXT NOT NULL,
        capabilities TEXT DEFAULT '[]',
        is_template INTEGER DEFAULT 0,
        created_by TEXT NOT NULL,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (created_by) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS executions (
        id TEXT PRIMARY KEY,
        workflow_id TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        started_at INTEGER,
        completed_at INTEGER,
        result TEXT,
        error_message TEXT,
        triggered_by TEXT NOT NULL,
        context TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE,
        FOREIGN KEY (triggered_by) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS execution_steps (
        id TEXT PRIMARY KEY,
        execution_id TEXT NOT NULL,
        agent_id TEXT,
        step_name TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        input_data TEXT,
        output_data TEXT,
        started_at INTEGER,
        completed_at INTEGER,
        error_message TEXT,
        order_index INTEGER NOT NULL,
        duration INTEGER,
        FOREIGN KEY (execution_id) REFERENCES executions(id) ON DELETE CASCADE,
        FOREIGN KEY (agent_id) REFERENCES agents(id)
      );
    `);

    logger.info('SQLite database migrations completed successfully');
    process.exit(0);

  } catch (error) {
    logger.error('Migration failed', { error });
    process.exit(1);
  }
}

// Run migrations if this file is executed directly
if (import.meta.main) {
  runMigrations();
}