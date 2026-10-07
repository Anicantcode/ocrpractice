import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

function getDbPath(): string {
  if (process.env.NETLIFY || process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return path.join('/tmp', 'morde_enterprise.db');
  }
  return path.join(process.cwd(), 'morde_enterprise.db');
}

let dbInstance: DatabaseSync | null = null;

export function getDatabase(): DatabaseSync | null {
  if (!dbInstance) {
    try {
      dbInstance = new DatabaseSync(getDbPath());
      initSchema(dbInstance);
    } catch (err) {
      console.warn('SQLite DB initialization notice (serverless or restricted environment):', err);
      return null;
    }
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
      image_rotation INTEGER DEFAULT 0,
      row_count_expected INTEGER,
      row_count_extracted INTEGER,
      row_count_status TEXT,
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
      image_rotation INTEGER DEFAULT 0,
      row_count_expected INTEGER,
      row_count_extracted INTEGER,
      row_count_status TEXT,
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
      place TEXT DEFAULT '',
      type TEXT DEFAULT '',
      particulars TEXT DEFAULT '',
      category TEXT DEFAULT 'FG',
      units_kg TEXT DEFAULT '',
      amount REAL DEFAULT 0.0,
      rate_matched INTEGER DEFAULT 0,
      review_required INTEGER DEFAULT 1,
      lookup_key TEXT DEFAULT '',
      source_working_detail TEXT DEFAULT '',
      source_place TEXT DEFAULT '',
      source_type TEXT DEFAULT '',
      source_particulars TEXT DEFAULT '',
      source_remark TEXT DEFAULT '',
      translation_needs_review INTEGER DEFAULT 0,
      remark TEXT DEFAULT '',
      FOREIGN KEY(sheet_id) REFERENCES worker_sheets(sheet_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS vouchers (
      voucher_no TEXT PRIMARY KEY,
      voucher_no_generated INTEGER DEFAULT 0,
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
      image_rotation INTEGER DEFAULT 0,
      coverage_status TEXT,
      coverage_missing_fields TEXT DEFAULT '[]',
      coverage_extra_fields TEXT DEFAULT '[]',
      voucher_form_detected INTEGER,
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

  for (const table of ['quality_reports', 'worker_sheets', 'vouchers']) {
    try { db.exec(`ALTER TABLE ${table} ADD COLUMN image_rotation INTEGER DEFAULT 0`); } catch (_) {}
  }
  try { db.exec('ALTER TABLE vouchers ADD COLUMN voucher_no_generated INTEGER DEFAULT 0'); } catch (_) {}
  for (const [table, column, declaration] of [
    ['quality_reports', 'row_count_expected', 'INTEGER'],
    ['quality_reports', 'row_count_extracted', 'INTEGER'],
    ['quality_reports', 'row_count_status', 'TEXT'],
    ['vouchers', 'coverage_status', 'TEXT'],
    ['vouchers', 'coverage_missing_fields', "TEXT DEFAULT '[]'"],
    ['vouchers', 'coverage_extra_fields', "TEXT DEFAULT '[]'"],
    ['vouchers', 'voucher_form_detected', 'INTEGER']
  ] as const) {
    try { db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${declaration}`); } catch (_) {}
  }
  for (const [column, declaration] of [
    ['row_count_expected', 'INTEGER'],
    ['row_count_extracted', 'INTEGER'],
    ['row_count_status', 'TEXT']
  ] as const) {
    try { db.exec(`ALTER TABLE worker_sheets ADD COLUMN ${column} ${declaration}`); } catch (_) {}
  }

  // Safe dynamic column additions for existing SQLite databases
  const workerRowCols = ['place', 'type', 'particulars', 'category', 'units_kg', 'amount', 'lookup_key'];
  workerRowCols.forEach(col => {
    try {
      db.exec(`ALTER TABLE worker_rows ADD COLUMN ${col} TEXT DEFAULT ''`);
    } catch (_) {}
  });
  const workerSourceCols: [string, string][] = [
    ['rate_matched', 'INTEGER DEFAULT 0'],
    ['review_required', 'INTEGER DEFAULT 1'],
    ['source_working_detail', 'TEXT DEFAULT \'\''],
    ['source_place', 'TEXT DEFAULT \'\''],
    ['source_type', 'TEXT DEFAULT \'\''],
    ['source_particulars', 'TEXT DEFAULT \'\''],
    ['source_remark', 'TEXT DEFAULT \'\''],
    ['translation_needs_review', 'INTEGER DEFAULT 0']
  ];
  workerSourceCols.forEach(([col, declaration]) => {
    try {
      db.exec(`ALTER TABLE worker_rows ADD COLUMN ${col} ${declaration}`);
    } catch (_) {}
  });

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
