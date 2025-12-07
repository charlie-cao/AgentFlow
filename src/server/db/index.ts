import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';
import * as schema from './schema';

// SQLite 数据库连接
const sqlite = new Database(process.env.DATABASE_URL || './agentflow.db');
export const db = drizzle(sqlite, { schema });

// 自动创建表
export async function initializeDatabase() {
  try {
    // 启用外键约束
    sqlite.exec('PRAGMA foreign_keys = ON');

    // 创建表（使用原生 sqlite 而不是 drizzle）
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER DEFAULT (strftime('%s', 'now'))
      )
    `);

    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        owner_id TEXT NOT NULL,
        settings TEXT DEFAULT '{}',
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER DEFAULT (strftime('%s', 'now'))
      )
    `);

    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS workflows (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        definition TEXT NOT NULL,
        version INTEGER DEFAULT 1,
        is_active INTEGER DEFAULT 0,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER DEFAULT (strftime('%s', 'now'))
      )
    `);

    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS agents (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        config TEXT NOT NULL,
        capabilities TEXT DEFAULT '[]',
        is_template INTEGER DEFAULT 0,
        created_by TEXT NOT NULL,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER DEFAULT (strftime('%s', 'now'))
      )
    `);

    sqlite.exec(`
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
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
      )
    `);

    sqlite.exec(`
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
        duration INTEGER
      )
    `);

    console.log('✅ SQLite database initialized');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  }
}

// 导出 schema
export * from './schema';

// 导出数据库实例
export type Database = typeof db;