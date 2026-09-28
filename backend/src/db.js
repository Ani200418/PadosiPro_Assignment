const Database = require('better-sqlite3');
const db = new Database(process.env.DB_PATH || 'padosipro.db');
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  email_verified INTEGER NOT NULL DEFAULT 0,
  name TEXT,
  mobile TEXT,
  address TEXT,
  business_name TEXT,
  selected_task_id INTEGER REFERENCES tasks(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS email_otps (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  otp_hash TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0
);
`);

const seed = [
  ['Groceries & essentials', 'Weekly groceries, household supplies and daily needs.'],
  ['Home cleaning', 'Regular or one-time cleaning for your home or shop.'],
  ['Bill payments', 'Electricity, water, internet and other recurring bills.'],
  ['Repairs & maintenance', 'Plumbing, electrical, appliance and general repairs.'],
  ['Errands & pickups', 'Parcels, documents, laundry and other local errands.'],
  ['Appointments & bookings', 'Doctor visits, service slots and reservations.'],
];
const insert = db.prepare('INSERT OR IGNORE INTO tasks (title, description) VALUES (?, ?)');
db.transaction(() => seed.forEach((t) => insert.run(...t)))();

module.exports = db;
