# Morde Multi-Department Enterprise Portal & Automation System (PWA)

A role-based factory operations platform for **Morde Foods**, featuring centralized authentication, dynamic departmental redirection, and initial operational modules:
1. **Quality Assurance (QA)**: Handwritten laboratory inspection sheet digitization with **PaddleOCR PP-OCRv4**, interactive verification spreadsheet, and **SAP QM** (`QE51N` / OData) sync.
2. **Workers Management**: Shift rosters (Shift A/B/C), line allocations (Cocoa Roasting, Conching, Packaging), and real-time floor attendance.
3. **Petty Cash & Vouchers**: Factory operational expense register, emergency spare parts procurement, and manager authorization workflow.

Treated as an installable **Progressive Web App (PWA)** for workstations and mobile devices.

---

## 🔑 Pre-Configured Demo Accounts (Ready to Test)

| Username | Password | Role / Department | Default Redirection | Permitted Sections |
| :--- | :--- | :--- | :--- | :--- |
| **`admin`** | `admin123` | Enterprise Admin | **Portal Hub (`/hub`)** | QA, Workers, Vouchers (All) |
| **`qa_user`** | `qa123` | QA Lab Analyst | **QA Module (`/qa`)** | QA Only |
| **`worker_lead`** | `worker123` | Floor Supervisor | **Workers Module (`/workers`)** | Workers Only |
| **`voucher_user`** | `voucher123` | Accounts Desk | **Vouchers Module (`/vouchers`)** | Vouchers Only |

---

## 🌟 Key Features

1. **On-Device Handwritten OCR (PaddleOCR PP-OCRv4)**:
   - Recognizes handwritten laboratory measurements, stamps, dates, and tables.
   - Generates confidence scores for every extracted cell.
   - Highlights low-confidence values in amber so the QC technician can quickly spot and verify handwriting.

2. **12 Mandatory Quality Columns**:
   The editable sheet strictly conforms to your laboratory parameters:
   - `sr no` (Serial Number)
   - `date` (Inspection Date)
   - `Batch Number` (e.g. `B260901` - SAP `CHARG`)
   - `product code` (e.g. `PRD-CHOC-10` - SAP `MATNR`)
   - `paper weight` (Tare weight in grams)
   - `sample paper weight` (Gross wet weight in grams)
   - `sample weight` (Net sample weight in grams)
   - `after drying weight` (Dry sample weight in grams)
   - `fat %` (Quantitative Fat Characteristic)
   - `moisture %` (Quantitative Moisture Characteristic)
   - `ph` (pH value, validated 0.0 - 14.0, target 5.5 - 8.5)
   - `particle size` (e.g. `75µm`, `Fine`)

3. **Human-in-the-Loop Verification & Calculation Assistant**:
   - Every cell is directly editable with keyboard navigation (Tab, Enter, arrows).
   - **Original Handwriting Snippet Viewer**: Click any cell to inspect the original physical document crop.
   - **Gravimetric Formula Cross-Check**: Automatic verification that `sample weight = sample paper weight - paper weight` and gravimetric `moisture %` formula.

4. **Installable Mobile Progressive Web App (PWA)**:
   - Installable on mobile phones (Android Chrome / iPhone Safari) and desktop Chrome / Edge.
   - Native camera capture support: operators can photograph lab sheets directly on the factory floor.
   - Offline-capable shell with service worker caching.

5. **Multi-Target SAP Integration**:
   - **Local SAP QM Simulator (Default / Free)**: High-fidelity simulation of SAP S/4HANA OData and ECC BAPIs. Generates authentic `01`-series Inspection Lots, Usage Decisions (`A - Accepted` or `R - Review`), and Material Document numbers.
   - **SAP Business Accelerator Hub Sandbox (Free)**: Test against live cloud SAP S/4HANA sandbox endpoints using a free API key from [api.sap.com](https://api.sap.com).
   - **SAP S/4HANA OData (Enterprise)**: Connect to production cloud SAP instances.
   - **SAP WinGUI Desktop Scripting (On-Premise)**: Uses Python `win32com` to automate SAP GUI desktop client transactions (`QE51N` / `QA32`) on Windows workstations.

---

## 🚀 Quick Start Guide

### 1. Start the Server
Run the single launcher script:
```powershell
python start_server.py
```

The launcher will display:
```
=================================================================
  SAP QUALITY REPORT OCR & AUTOMATION SERVER (PWA READY)
=================================================================
  * Desktop Access:   http://localhost:8000
  * Mobile Phone:     http://<YOUR_LOCAL_IP>:8000
-----------------------------------------------------------------
  MOBILE INSTALL INSTRUCTIONS:
  1. Connect your phone to the same Wi-Fi network as this PC.
  2. Open Chrome/Safari on your phone and go to: http://<YOUR_LOCAL_IP>:8000
  3. Tap 'Install App' or browser menu -> 'Add to Home screen'.
  4. You now have a full-screen mobile app with camera scanning!
=================================================================
```

### 2. Testing Without Paper (One-Click Demo)
- Open `http://localhost:8000` in your browser or phone.
- Click **"Load Sample"** in the top bar.
- The system generates an authentic handwritten laboratory test sheet, runs OCR, extracts all 12 columns, and displays the editable sheet with confidence flags!

### 3. Testing with Real Sheets
- Click **"Capture / Upload"**.
- Take a photo using your phone camera or upload a scan.
- PaddleOCR will parse the table and populate the spreadsheet.
- Review and edit any values.
- Click **"Sync to SAP QM"** to post inspection lots and usage decisions!

---

## 💡 How to Use SAP Without an Enterprise License

If you don't have access to an enterprise SAP system yet:

1. **Option 1: Built-in Local SAP Simulator (Ready Now)**:
   - Enabled by default (`SAP_MODE=MOCK`).
   - Generates authentic Inspection Lots (`0100000xxxxx`), checks tolerances, saves audit trails in SQLite, and returns standard SAP JSON receipts.
   - No external accounts, VPNs, or internet connection required.

2. **Option 2: SAP Business Accelerator Hub Sandbox (Official & Free)**:
   - Go to [api.sap.com](https://api.sap.com) and create a free SAP Community account.
   - Find the **Inspection Lot - Read, Record Results** API (`API_QUALITYINSPECTION_RESULT_SRV`).
   - Copy your **API Key**.
   - Open the **SAP Settings** modal in our app, select **SAP Accelerator Hub**, paste your key, and click **Test Connection**!

3. **Option 3: SAP GUI Automation on Windows**:
   - If your plant uses SAP GUI on Windows desktops without cloud OData services, set mode to **SAP WinGUI Scripting**.
   - The app will drive the active SAP GUI session (`QE51N`) via COM scripting.

---

## 📁 Project Architecture

```
morde/
├── backend/
│   ├── main.py              # FastAPI REST API & static PWA server
│   ├── requirements.txt     # Python backend dependencies
│   ├── start_server.py      # Local IP network launcher
│   ├── ocr/
│   │   ├── engine.py        # PaddleOCR wrapper & synthetic sheet generator
│   │   └── parser.py        # 12-column table parsing & regex heuristics
│   ├── sap/
│   │   ├── simulator.py     # High-fidelity SAP QM Mock Simulator
│   │   ├── client.py        # Multi-target SAP client (Mock, Sandbox, Prod)
│   │   └── gui_script.py    # SAP GUI Win32 COM automation template
│   ├── db/
│   │   └── storage.py       # SQLite database for reports and audit logs
│   └── tests/
│       ├── test_parser.py   # Unit tests for OCR table parsing
│       ├── test_sap.py      # Unit tests for SAP simulator & client
│       └── test_integration.py # Full integration tests
├── frontend/
│   ├── src/
│   │   ├── components/      # React components (Grid, Upload, CropViewer, etc.)
│   │   ├── types.ts         # TypeScript data contracts
│   │   └── App.tsx          # Main PWA state & coordination
│   ├── public/
│   │   ├── manifest.webmanifest # PWA mobile manifest
│   │   └── sw.js            # Service worker for offline caching
│   └── package.json
└── README.md
```
