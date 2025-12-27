import Database from 'better-sqlite3';
import fs from 'fs-extra';
import path from 'path';

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'data', 'sessions.db');

// Ensure data directory exists
fs.ensureDirSync(path.dirname(DB_PATH));

const db = new Database(DB_PATH);

// Initialize Schema
const initSchema = () => {
    db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      github_issue_uid TEXT PRIMARY KEY,
      opencode_session_id TEXT,
      local_path TEXT,
      last_state TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

initSchema();

export default db;
export { DB_PATH };
