"""
SQLite persistence for Users, Sessions, Quality Reports, Workers, and Vouchers.
"""
import sqlite3
import json
import os
import datetime
import hashlib
import secrets
from typing import Dict, Any, List, Optional

DB_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "quality_reports.db")

def hash_password(password: str, salt: str = "morde_secure_salt_2026") -> str:
    return hashlib.sha256((salt + password).encode("utf-8")).hexdigest()

def verify_password(password: str, password_hash: str) -> bool:
    return hash_password(password) == password_hash

def init_db():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()

    # 1. Reports table (QA Module)
    c.execute("""
    CREATE TABLE IF NOT EXISTS reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        report_id TEXT UNIQUE NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        title TEXT,
        image_url TEXT,
        status TEXT NOT NULL,
        rows_data TEXT NOT NULL,
        sap_result TEXT
    )
    """)

    # 2. SAP Logs table
    c.execute("""
    CREATE TABLE IF NOT EXISTS sap_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        report_id TEXT,
        sap_mode TEXT NOT NULL,
        processed_count INTEGER NOT NULL,
        status TEXT NOT NULL,
        details TEXT NOT NULL
    )
    """)

    # 3. Users table for RBAC
    c.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        role TEXT NOT NULL,
        department TEXT NOT NULL,
        allowed_modules TEXT NOT NULL,
        default_module TEXT NOT NULL,
        avatar_color TEXT,
        is_active INTEGER DEFAULT 1
    )
    """)

    # 4. Sessions table
    c.execute("""
    CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        username TEXT NOT NULL,
        created_at TEXT NOT NULL,
        expires_at TEXT NOT NULL
    )
    """)

    # 5. Workers table (Morde Loader Daily Working Detail)
    c.execute("PRAGMA table_info(workers)")
    worker_cols = [col[1] for col in c.fetchall()]
    if worker_cols and "sheet_id" not in worker_cols:
        c.execute("DROP TABLE workers")

    c.execute("""
    CREATE TABLE IF NOT EXISTS workers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sheet_id TEXT NOT NULL,
        date TEXT NOT NULL,
        gang_leader_name TEXT NOT NULL,
        shift TEXT NOT NULL,
        sr_no TEXT,
        working_detail TEXT NOT NULL,
        rate TEXT NOT NULL,
        vehicle_no TEXT NOT NULL,
        unit TEXT NOT NULL,
        pallets INTEGER NOT NULL,
        qty TEXT NOT NULL,
        product_code TEXT NOT NULL,
        remark TEXT NOT NULL,
        image_url TEXT,
        created_at TEXT NOT NULL
    )
    """)

    # 6. Vouchers table (Morde Foods Official Voucher Format)
    c.execute("""
    CREATE TABLE IF NOT EXISTS vouchers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        voucher_no TEXT UNIQUE NOT NULL,
        date TEXT NOT NULL,
        debit_account TEXT NOT NULL,
        pay_to TEXT NOT NULL,
        gl_code TEXT NOT NULL,
        cost_center TEXT NOT NULL,
        particulars TEXT NOT NULL,
        amount REAL NOT NULL,
        bank_name TEXT,
        cheque_no_cash TEXT NOT NULL,
        prepared_by TEXT NOT NULL,
        accountant TEXT,
        sanctioned_by TEXT,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    )
    """)

    # Seed Users if table is empty
    c.execute("SELECT COUNT(*) FROM users")
    if c.fetchone()[0] == 0:
        seed_users = [
            ("admin", hash_password("admin123"), "System Administrator", "admin", "Operations & Admin", json.dumps(["qa", "workers", "vouchers"]), "qa", "emerald"),
            ("qa_user", hash_password("qa123"), "Pooja Sharma", "qa", "Quality Assurance", json.dumps(["qa"]), "qa", "blue"),
            ("worker_lead", hash_password("worker123"), "Rajesh Patil", "workers", "Floor Operations", json.dumps(["workers"]), "workers", "amber"),
            ("voucher_user", hash_password("voucher123"), "Amit Deshmukh", "vouchers", "Accounts & Finance", json.dumps(["vouchers"]), "vouchers", "purple"),
        ]
        c.executemany("""
        INSERT INTO users (username, password_hash, full_name, role, department, allowed_modules, default_module, avatar_color, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
        """, seed_users)

    conn.commit()
    conn.close()

# ----------------- Auth Functions -----------------

def authenticate_user(username: str, password: str) -> Optional[Dict[str, Any]]:
    init_db()
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("""
    SELECT id, username, password_hash, full_name, role, department, allowed_modules, default_module, avatar_color, is_active
    FROM users WHERE username = ?
    """, (username,))
    row = c.fetchone()
    conn.close()

    if not row:
        return None

    if not bool(row[9]):  # is_active
        return None

    if verify_password(password, row[2]):
        return {
            "id": row[0],
            "username": row[1],
            "full_name": row[3],
            "role": row[4],
            "department": row[5],
            "allowed_modules": json.loads(row[6]),
            "default_module": row[7],
            "avatar_color": row[8],
        }
    return None

def create_session(username: str) -> str:
    init_db()
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    token = f"sess_{secrets.token_hex(24)}"
    now = datetime.datetime.utcnow()
    expires_at = (now + datetime.timedelta(days=7)).isoformat() + "Z"
    c.execute("INSERT INTO sessions (token, username, created_at, expires_at) VALUES (?, ?, ?, ?)",
              (token, username, now.isoformat() + "Z", expires_at))
    conn.commit()
    conn.close()
    return token

def get_user_by_token(token: str) -> Optional[Dict[str, Any]]:
    if not token:
        return None
    init_db()
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("SELECT username, expires_at FROM sessions WHERE token = ?", (token,))
    sess = c.fetchone()
    if not sess:
        conn.close()
        return None

    # Check expiration
    expires_at = sess[1]
    if datetime.datetime.utcnow().isoformat() + "Z" > expires_at:
        c.execute("DELETE FROM sessions WHERE token = ?", (token,))
        conn.commit()
        conn.close()
        return None

    username = sess[0]
    c.execute("""
    SELECT id, username, full_name, role, department, allowed_modules, default_module, avatar_color
    FROM users WHERE username = ? AND is_active = 1
    """, (username,))
    u = c.fetchone()
    conn.close()

    if not u:
        return None

    return {
        "id": u[0],
        "username": u[1],
        "full_name": u[2],
        "role": u[3],
        "department": u[4],
        "allowed_modules": json.loads(u[5]),
        "default_module": u[6],
        "avatar_color": u[7],
    }

def delete_session(token: str) -> None:
    init_db()
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("DELETE FROM sessions WHERE token = ?", (token,))
    conn.commit()
    conn.close()

# ----------------- QA Report Functions -----------------

def save_report(report_id: str, rows: List[Dict[str, Any]], title: str = "Quality Lab Sheet", image_url: Optional[str] = None, status: str = "DRAFT") -> Dict[str, Any]:
    init_db()
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    now = datetime.datetime.utcnow().isoformat() + "Z"
    rows_json = json.dumps(rows)

    c.execute("""
    INSERT INTO reports (report_id, created_at, updated_at, title, image_url, status, rows_data)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(report_id) DO UPDATE SET
        updated_at = excluded.updated_at,
        title = excluded.title,
        status = excluded.status,
        rows_data = excluded.rows_data
    """, (report_id, now, now, title, image_url or "", status, rows_json))

    conn.commit()
    conn.close()
    return {"report_id": report_id, "updated_at": now, "status": status}

def update_report_sap_sync(report_id: str, sap_result: Dict[str, Any]) -> None:
    init_db()
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    now = datetime.datetime.utcnow().isoformat() + "Z"
    
    c.execute("""
    UPDATE reports 
    SET updated_at = ?, status = 'SYNCED_TO_SAP', sap_result = ?
    WHERE report_id = ?
    """, (now, json.dumps(sap_result), report_id))

    c.execute("""
    INSERT INTO sap_logs (timestamp, report_id, sap_mode, processed_count, status, details)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (
        now, 
        report_id, 
        sap_result.get("sap_mode", "UNKNOWN"), 
        sap_result.get("processed_count", 0),
        sap_result.get("status", "SUCCESS"),
        json.dumps(sap_result)
    ))

    conn.commit()
    conn.close()

def get_report(report_id: str) -> Optional[Dict[str, Any]]:
    init_db()
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("SELECT report_id, created_at, updated_at, title, image_url, status, rows_data, sap_result FROM reports WHERE report_id = ?", (report_id,))
    row = c.fetchone()
    conn.close()
    if not row:
        return None
    return {
        "report_id": row[0],
        "created_at": row[1],
        "updated_at": row[2],
        "title": row[3],
        "image_url": row[4],
        "status": row[5],
        "rows": json.loads(row[6]),
        "sap_result": json.loads(row[7]) if row[7] else None
    }

def list_reports(limit: int = 50) -> List[Dict[str, Any]]:
    init_db()
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("SELECT report_id, created_at, updated_at, title, image_url, status, rows_data, sap_result FROM reports ORDER BY id DESC LIMIT ?", (limit,))
    rows = c.fetchall()
    conn.close()
    results = []
    for r in rows:
        results.append({
            "report_id": r[0],
            "created_at": r[1],
            "updated_at": r[2],
            "title": r[3],
            "image_url": r[4],
            "status": r[5],
            "rows_count": len(json.loads(r[6])),
            "has_sap_sync": bool(r[7])
        })
    return results

def get_sap_sync_logs(limit: int = 50) -> List[Dict[str, Any]]:
    init_db()
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("SELECT id, timestamp, report_id, sap_mode, processed_count, status, details FROM sap_logs ORDER BY id DESC LIMIT ?", (limit,))
    rows = c.fetchall()
    conn.close()
    results = []
    for r in rows:
        results.append({
            "id": r[0],
            "timestamp": r[1],
            "report_id": r[2],
            "sap_mode": r[3],
            "processed_count": r[4],
            "status": r[5],
            "details": json.loads(r[6]) if r[6] else {}
        })
    return results

# ----------------- Workers Functions (Morde Loader Daily Working Detail) -----------------

def list_workers(sheet_id: Optional[str] = None) -> List[Dict[str, Any]]:
    init_db()
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    query = """
    SELECT id, sheet_id, date, gang_leader_name, shift, sr_no, working_detail, rate, vehicle_no, unit, pallets, qty, product_code, remark, image_url, created_at
    FROM workers
    """
    params = []
    if sheet_id:
        query += " WHERE sheet_id = ?"
        params.append(sheet_id)
    query += " ORDER BY id ASC"

    c.execute(query, params)
    rows = c.fetchall()
    conn.close()
    results = []
    for r in rows:
        results.append({
            "id": r[0],
            "sheet_id": r[1],
            "date": r[2],
            "gang_leader_name": r[3],
            "shift": r[4],
            "sr_no": r[5] or "001",
            "working_detail": r[6],
            "rate": r[7],
            "vehicle_no": r[8],
            "unit": r[9],
            "pallets": r[10],
            "qty": r[11],
            "product_code": r[12],
            "remark": r[13],
            "image_url": r[14] or "",
            "created_at": r[15]
        })
    return results

def save_worker_sheet(sheet_id: str, metadata: Dict[str, Any], rows: List[Dict[str, Any]], image_url: Optional[str] = None) -> List[Dict[str, Any]]:
    init_db()
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    now = datetime.datetime.now().isoformat()

    date_val = metadata.get("date", datetime.date.today().strftime("%d/%m/%Y"))
    leader_val = metadata.get("gang_leader_name", "Santosh Popatkar")
    shift_val = metadata.get("shift", "Shift-I")
    sr_no_val = metadata.get("sr_no", "001")

    saved_rows = []
    for row in rows:
        c.execute("""
        INSERT INTO workers (sheet_id, date, gang_leader_name, shift, sr_no, working_detail, rate, vehicle_no, unit, pallets, qty, product_code, remark, image_url, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            sheet_id,
            date_val,
            leader_val,
            shift_val,
            sr_no_val,
            row.get("working_detail", "Internal Transfer"),
            str(row.get("rate", "-")),
            str(row.get("vehicle_no", "-")),
            str(row.get("unit", "✓")),
            int(row.get("pallets", 1)),
            str(row.get("qty", "-")),
            str(row.get("product_code", "-")),
            str(row.get("remark", "-")),
            image_url or "",
            now
        ))
        new_id = c.lastrowid
        saved_rows.append({
            "id": new_id,
            "sheet_id": sheet_id,
            "date": date_val,
            "gang_leader_name": leader_val,
            "shift": shift_val,
            "sr_no": sr_no_val,
            "working_detail": row.get("working_detail", "Internal Transfer"),
            "rate": str(row.get("rate", "-")),
            "vehicle_no": str(row.get("vehicle_no", "-")),
            "unit": str(row.get("unit", "✓")),
            "pallets": int(row.get("pallets", 1)),
            "qty": str(row.get("qty", "-")),
            "product_code": str(row.get("product_code", "-")),
            "remark": str(row.get("remark", "-")),
            "image_url": image_url or "",
            "created_at": now
        })

    conn.commit()
    conn.close()
    return saved_rows

def clear_workers() -> bool:
    init_db()
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("DELETE FROM workers")
    conn.commit()
    conn.close()
    return True

# ----------------- Vouchers Functions -----------------

def list_vouchers(status: Optional[str] = None) -> List[Dict[str, Any]]:
    init_db()
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    query = """
    SELECT id, voucher_no, date, debit_account, pay_to, gl_code, cost_center, particulars, amount, bank_name, cheque_no_cash, prepared_by, accountant, sanctioned_by, status, created_at, updated_at
    FROM vouchers
    """
    params = []
    if status:
        query += " WHERE status = ?"
        params.append(status)
    query += " ORDER BY id DESC"

    c.execute(query, params)
    rows = c.fetchall()
    conn.close()
    results = []
    for r in rows:
        results.append({
            "id": r[0],
            "voucher_no": r[1],
            "date": r[2],
            "debit_account": r[3],
            "pay_to": r[4],
            "gl_code": r[5],
            "cost_center": r[6],
            "particulars": r[7],
            "amount": r[8],
            "bank_name": r[9] or "",
            "cheque_no_cash": r[10] or "Cash",
            "prepared_by": r[11] or "",
            "accountant": r[12] or "",
            "sanctioned_by": r[13] or "",
            "status": r[14],
            "created_at": r[15],
            "updated_at": r[16]
        })
    return results

def create_voucher(data: Dict[str, Any]) -> Dict[str, Any]:
    init_db()
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    now_str = datetime.datetime.utcnow().isoformat() + "Z"
    
    # Auto-generate voucher_no if not present
    c.execute("SELECT COUNT(*) FROM vouchers")
    count = c.fetchone()[0] + 1
    voucher_no = str(data.get("voucher_no") or (1040 + count))

    c.execute("""
    INSERT INTO vouchers (voucher_no, date, debit_account, pay_to, gl_code, cost_center, particulars, amount, bank_name, cheque_no_cash, prepared_by, accountant, sanctioned_by, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(voucher_no) DO UPDATE SET
        date = excluded.date,
        debit_account = excluded.debit_account,
        pay_to = excluded.pay_to,
        gl_code = excluded.gl_code,
        cost_center = excluded.cost_center,
        particulars = excluded.particulars,
        amount = excluded.amount,
        bank_name = excluded.bank_name,
        cheque_no_cash = excluded.cheque_no_cash,
        prepared_by = excluded.prepared_by,
        accountant = excluded.accountant,
        sanctioned_by = excluded.sanctioned_by,
        status = excluded.status,
        updated_at = excluded.updated_at
    """, (
        voucher_no,
        data.get("date") or datetime.date.today().strftime("%d/%m/%Y"),
        data.get("debit_account", "General Factory Expenses A/c"),
        data.get("pay_to", ""),
        data.get("gl_code", "410000"),
        data.get("cost_center", "FACTORY-01"),
        data.get("particulars", ""),
        float(data.get("amount", 0.0)),
        data.get("bank_name", ""),
        data.get("cheque_no_cash", "Cash"),
        data.get("prepared_by", "Staff"),
        data.get("accountant"),
        data.get("sanctioned_by"),
        data.get("status", "Prepared"),
        now_str,
        now_str
    ))
    conn.commit()
    conn.close()
    data["voucher_no"] = voucher_no
    return data

def update_voucher_status(voucher_no: str, status: str, sanctioned_by: Optional[str] = None, accountant: Optional[str] = None) -> bool:
    init_db()
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    now_str = datetime.datetime.utcnow().isoformat() + "Z"
    if sanctioned_by:
        c.execute("""
        UPDATE vouchers SET status = ?, sanctioned_by = ?, updated_at = ? WHERE voucher_no = ?
        """, (status, sanctioned_by, now_str, voucher_no))
    elif accountant:
        c.execute("""
        UPDATE vouchers SET status = ?, accountant = ?, updated_at = ? WHERE voucher_no = ?
        """, (status, accountant, now_str, voucher_no))
    else:
        c.execute("""
        UPDATE vouchers SET status = ?, updated_at = ? WHERE voucher_no = ?
        """, (status, now_str, voucher_no))
    updated = c.rowcount > 0
    conn.commit()
    conn.close()
    return updated
