const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, 'monitor.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    lat REAL,
    lon REAL,
    layer TEXT,
    severity TEXT,
    detail TEXT,
    ts INTEGER
  );

  CREATE TABLE IF NOT EXISTS news_cache (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    headline TEXT UNIQUE,
    source TEXT,
    url TEXT,
    category TEXT,
    published_at TEXT,
    fetched_at INTEGER
  );
`);

module.exports = db;
