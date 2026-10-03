import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

const DB_PATH = path.join(process.cwd(), 'morde_enterprise.db');

let dbInstance: DatabaseSync | null = null;

export function getDatabase(): DatabaseSync {
  if (!dbInstance) {
    dbInstance = new DatabaseSync(DB_PATH);
    initSchema(dbInstance);
  }
  return dbInstance;
}

function initSchema(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL,
      department TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      username TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME NOT NULL
    );

    CREATE TABLE IF NOT EXISTS quality_reports (
      report_id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'DRAFT',
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS quality_rows (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_id TEXT NOT NULL,
      row_index INTEGER NOT NULL,
      parameter_name TEXT NOT NULL,
      standard_val TEXT DEFAULT '',
      observed_val TEXT DEFAULT '',
      status TEXT DEFAULT 'PENDING',
      remarks TEXT DEFAULT '',
      confidence REAL DEFAULT 1.0,
      sap_lot_no TEXT DEFAULT '',
      sap_characteristic_code TEXT DEFAULT '',
      FOREIGN KEY(report_id) REFERENCES quality_reports(report_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS worker_sheets (
      sheet_id TEXT PRIMARY KEY,
      shift TEXT,
      date TEXT,
      supervisor TEXT,
      loader_name TEXT,
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS worker_rows (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sheet_id TEXT NOT NULL,
      working_detail TEXT NOT NULL,
      rate TEXT DEFAULT '',
      vehicle_no TEXT DEFAULT '',
      unit TEXT DEFAULT '',
      pallets TEXT DEFAULT '',
      qty TEXT DEFAULT '',
      product_code TEXT DEFAULT '',
      remark TEXT DEFAULT '',
      FOREIGN KEY(sheet_id) REFERENCES worker_sheets(sheet_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS vouchers (
      voucher_no TEXT PRIMARY KEY,
      date TEXT,
      debit_account TEXT,
      pay_to TEXT,
      gl_code TEXT DEFAULT '410000',
      cost_center TEXT DEFAULT 'FACTORY-01',
      particulars TEXT,
      amount REAL DEFAULT 0.0,
      bank_name TEXT DEFAULT '',
      cheque_no_cash TEXT DEFAULT 'Cash',
      prepared_by TEXT DEFAULT 'Staff',
      accountant TEXT DEFAULT '',
      sanctioned_by TEXT DEFAULT '',
      status TEXT DEFAULT 'Prepared',
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sap_sync_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_id TEXT,
      synced_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT NOT NULL,
      details_json TEXT,
      error_message TEXT
    );
  `);

  // Seed default admin and operator
  const checkUser = db.prepare('SELECT count(*) as count FROM users WHERE username = ?');
  const adminRow = checkUser.get('admin') as { count: number };
  if (!adminRow || adminRow.count === 0) {
    const insertUser = db.prepare(`
      INSERT INTO users (username, password_hash, full_name, role, department)
      VALUES (?, ?, ?, ?, ?)
    `);
    insertUser.run('admin', 'admin123', 'Administrator', 'admin', 'Quality Assurance');
    insertUser.run('operator', 'morde123', 'Lab Technician', 'operator', 'Quality Assurance');
  }
}
