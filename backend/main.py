"""
FastAPI Backend for Morde Multi-Department Enterprise Portal & Automation System
Supports QA (OCR + SAP QM), Workers Management, and Vouchers (Petty Cash/Expenses).
"""
import os
import uuid
import shutil
import datetime
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Body, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel

from .ocr import (
    ocr_manager,
    qa_parser,
    worker_parser,
    voucher_parser,
    generate_sample_quality_sheet,
    QA_SHEET_SCHEMAS,
    IN_PROCESS_COLUMNS
)
from .sap.client import sap_client
from .sap.simulator import sap_mock_simulator
from .db.storage import (
    init_db,
    save_report,
    update_report_sap_sync,
    get_report,
    list_reports,
    get_sap_sync_logs,
    authenticate_user,
    create_session,
    get_user_by_token,
    delete_session,
    list_workers,
    save_worker_sheet,
    clear_workers,
    list_vouchers,
    create_voucher,
    update_voucher_status
)

app = FastAPI(
    title="Morde Multi-Department Enterprise Portal API",
    description="Role-based operations portal: QA OCR, Workers management, and Vouchers.",
    version="2.0.0"
)

# Enable CORS for local dev and mobile PWA clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Initialize database and tables
init_db()

# ----------------- Request Models -----------------

class LoginRequest(BaseModel):
    username: str
    password: str

class LogoutRequest(BaseModel):
    token: Optional[str] = None

class SapConfigRequest(BaseModel):
    mode: str
    api_key: Optional[str] = None
    prod_url: Optional[str] = None
    plant: Optional[str] = "1000"

class SyncSapRequest(BaseModel):
    report_id: Optional[str] = None
    plant: Optional[str] = "1000"
    rows: List[Dict[str, Any]]

class SaveReportRequest(BaseModel):
    report_id: Optional[str] = None
    title: Optional[str] = "Lab Quality Sheet"
    rows: List[Dict[str, Any]]
    image_url: Optional[str] = None
    status: Optional[str] = "VERIFIED"

class WorkerStatusUpdateRequest(BaseModel):
    status: str
    shift: Optional[str] = None

class WorkerCreateRequest(BaseModel):
    worker_code: str
    name: str
    department: str
    role_title: str
    shift: str
    status: Optional[str] = "On Duty"
    skills: Optional[str] = ""
    phone: Optional[str] = ""

class VoucherCreateRequest(BaseModel):
    voucher_no: Optional[str] = None
    date: Optional[str] = None
    debit_account: str
    pay_to: str
    gl_code: Optional[str] = "410000"
    cost_center: Optional[str] = "FACTORY-01"
    particulars: str
    amount: float
    bank_name: Optional[str] = ""
    cheque_no_cash: Optional[str] = "Cash"
    prepared_by: Optional[str] = "Staff"
    accountant: Optional[str] = None
    sanctioned_by: Optional[str] = None
    status: Optional[str] = "Prepared"

class VoucherStatusUpdateRequest(BaseModel):
    status: str
    sanctioned_by: Optional[str] = None
    accountant: Optional[str] = None

# Helper to extract token from request
def extract_token(authorization: Optional[str], token_param: Optional[str] = None) -> Optional[str]:
    if authorization and authorization.startswith("Bearer "):
        return authorization.split("Bearer ", 1)[1].strip()
    return token_param

# ----------------- System & Health -----------------

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "paddle_ready": ocr_manager.is_paddle_ready,
        "active_provider": ocr_manager.active_provider_name,
        "api_ready": ocr_manager.is_api_ready,
        "sap_mode": sap_client.mode,
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
    }

# ----------------- Authentication Routes -----------------

@app.post("/api/auth/login")
def login(req: LoginRequest):
    user = authenticate_user(req.username.strip(), req.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    token = create_session(user["username"])
    return {
        "success": True,
        "token": token,
        "user": user,
        "message": f"Welcome, {user['full_name']}!"
    }

@app.get("/api/auth/me")
def get_current_user(authorization: Optional[str] = Header(None), token: Optional[str] = None):
    auth_token = extract_token(authorization, token)
    if not auth_token:
        raise HTTPException(status_code=401, detail="Missing authentication token")
    
    user = get_user_by_token(auth_token)
    if not user:
        raise HTTPException(status_code=401, detail="Session expired or invalid")
    
    return {"user": user, "token": auth_token}

@app.post("/api/auth/logout")
def logout(req: LogoutRequest = Body(...), authorization: Optional[str] = Header(None)):
    auth_token = extract_token(authorization, req.token)
    if auth_token:
        delete_session(auth_token)
    return {"success": True, "message": "Logged out successfully"}

# ----------------- QA & OCR Routes -----------------

@app.get("/api/sap/status")
def get_sap_status():
    return sap_client.get_status()

@app.post("/api/sap/config")
def set_sap_config(config: SapConfigRequest):
    sap_client.configure(
        mode=config.mode,
        api_key=config.api_key,
        prod_url=config.prod_url,
        plant=config.plant
    )
    return {
        "success": True,
        "message": f"SAP mode updated to {sap_client.mode}",
        "config": sap_client.get_status()
    }

@app.post("/api/sap/test-connection")
def test_sap_connection():
    return sap_client.test_connection()

@app.get("/api/ocr/columns")
def get_expected_columns(sheet_type: Optional[str] = "in_process"):
    schema = QA_SHEET_SCHEMAS.get(sheet_type, QA_SHEET_SCHEMAS["in_process"])
    return {
        "sheet_type": schema["id"],
        "title": schema["title"],
        "code": schema["code"],
        "columns": schema["columns"],
        "all_sheet_types": [
            {"id": k, "title": v["title"], "code": v["code"]}
            for k, v in QA_SHEET_SCHEMAS.items()
        ]
    }

@app.post("/api/ocr/sample")
def generate_and_process_sample():
    sample_filename = f"SAMPLE_{uuid.uuid4().hex[:6].upper()}.jpg"
    dest_path = os.path.join(UPLOAD_DIR, sample_filename)
    generate_sample_quality_sheet(dest_path)

    detected_sheet_type, cols, rows, oriented_path, meta = qa_parser.process_image(
        dest_path,
        manual_rotation=0,
        requested_sheet_type="in_process"
    )
    report_id = f"RPT-SAMPLE-{uuid.uuid4().hex[:6].upper()}"
    image_url = f"/uploads/{os.path.basename(oriented_path)}"
    title = "In-Process Lab Quality Sheet (Sample)"
    save_report(report_id, rows, title=title, image_url=image_url)

    return {
        "report_id": report_id,
        "sheet_type": detected_sheet_type,
        "sheet_title": title,
        "image_url": image_url,
        "columns": cols,
        "rows": rows,
        "metadata": meta,
        "paddle_engine_active": True
    }

@app.post("/api/ocr/process")
async def process_quality_sheet(
    file: UploadFile = File(...),
    rotation: Optional[int] = Form(None),
    sheet_type: Optional[str] = Form(None)
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    file_ext = os.path.splitext(file.filename)[1].lower() or ".jpg"
    report_id = f"RPT-{datetime.date.today().strftime('%y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
    save_filename = f"{report_id}{file_ext}"
    dest_path = os.path.join(UPLOAD_DIR, save_filename)

    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    detected_sheet_type, cols, rows, oriented_path, meta = qa_parser.process_image(
        dest_path,
        manual_rotation=rotation,
        requested_sheet_type=sheet_type
    )

    image_url = f"/uploads/{os.path.basename(oriented_path)}"
    title = meta.get("title", QA_SHEET_SCHEMAS.get(detected_sheet_type, {}).get("title", "QC Report"))
    save_report(report_id, rows, title=title, image_url=image_url)

    return {
        "report_id": report_id,
        "sheet_type": detected_sheet_type,
        "sheet_title": title,
        "image_url": image_url,
        "columns": cols,
        "rows": rows,
        "metadata": meta,
        "paddle_engine_active": True
    }

@app.post("/api/reports/save")
def save_user_report(req: SaveReportRequest):
    report_id = req.report_id or f"RPT-{datetime.date.today().strftime('%y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
    res = save_report(
        report_id=report_id,
        rows=req.rows,
        title=req.title or "Quality Lab Sheet",
        image_url=req.image_url,
        status=req.status or "VERIFIED"
    )
    return res

@app.get("/api/reports")
def get_reports_list():
    return list_reports()

@app.get("/api/reports/{report_id}")
def get_single_report(report_id: str):
    rpt = get_report(report_id)
    if not rpt:
        raise HTTPException(status_code=404, detail="Report not found")
    return rpt

@app.post("/api/sap/sync")
def sync_to_sap(req: SyncSapRequest):
    if not req.rows:
        raise HTTPException(status_code=400, detail="Cannot sync empty rows to SAP")

    if req.plant:
        sap_client.plant = req.plant

    sap_result = sap_client.sync_quality_records(req.rows)

    if req.report_id:
        update_report_sap_sync(req.report_id, sap_result)

    return sap_result

@app.get("/api/sap/lots")
def get_sap_lots():
    return sap_mock_simulator.list_lots()

@app.get("/api/sap/history")
def get_sap_history(limit: int = 50):
    return get_sap_sync_logs(limit)

# ----------------- Floor Workers Routes (Loader Daily Working Detail) -----------------

@app.get("/api/workers")
def get_all_workers(sheet_id: Optional[str] = None):
    return list_workers(sheet_id=sheet_id)

@app.post("/api/workers/scan")
async def scan_worker_document(file: UploadFile = File(...), rotation: Optional[int] = Form(None)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No worker sheet provided")

    file_ext = os.path.splitext(file.filename)[1].lower() or ".jpg"
    sheet_id = f"LDR-{datetime.date.today().strftime('%y%m%d')}-{uuid.uuid4().hex[:4].upper()}"
    save_filename = f"{sheet_id}{file_ext}"
    dest_path = os.path.join(UPLOAD_DIR, save_filename)

    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    parsed_data, oriented_path = worker_parser.process_image(dest_path, manual_rotation=rotation)
    metadata = parsed_data.get("metadata", {})
    rows = parsed_data.get("rows", [])

    image_url = f"/uploads/{os.path.basename(oriented_path)}"
    saved_rows = save_worker_sheet(
        sheet_id=sheet_id,
        metadata=metadata,
        rows=rows,
        image_url=image_url
    )

    return {
        "success": True,
        "sheet_id": sheet_id,
        "metadata": metadata,
        "rows": saved_rows,
        "image_url": image_url
    }

# ----------------- Vouchers Routes (Petty Cash & Expenses) -----------------

@app.get("/api/vouchers")
def get_all_vouchers(status: Optional[str] = None):
    return list_vouchers(status=status)

@app.post("/api/vouchers")
def create_new_voucher(req: VoucherCreateRequest):
    data = req.dict()
    res = create_voucher(data)
    return {"success": True, "voucher": res}

@app.post("/api/vouchers/scan")
async def scan_voucher_document(file: UploadFile = File(...), rotation: Optional[int] = Form(None)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No voucher file provided")

    file_ext = os.path.splitext(file.filename)[1].lower() or ".jpg"
    voucher_id = f"VCR-{datetime.date.today().strftime('%y%m%d')}-{uuid.uuid4().hex[:4].upper()}"
    save_filename = f"{voucher_id}{file_ext}"
    dest_path = os.path.join(UPLOAD_DIR, save_filename)

    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    parsed_data, oriented_path = voucher_parser.process_voucher_image(dest_path, manual_rotation=rotation)
    saved_voucher = create_voucher(parsed_data)
    image_url = f"/uploads/{os.path.basename(oriented_path)}"

    return {
        "success": True,
        "voucher": saved_voucher,
        "image_url": image_url
    }

# Mount frontend build if it exists
frontend_dist = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")
if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="frontend")
