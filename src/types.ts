export type QaSheetType = 'finished_goods' | 'microbiological' | 'in_process';

export interface QualityRow {
  [key: string]: any;
  "sr no"?: number;
  "date"?: string;
  "Batch Number"?: string;
  "product code"?: string;
  "paper weight"?: number;
  "sample paper weight"?: number;
  "sample weight"?: number;
  "after drying weight"?: number;
  "fat %"?: number;
  "moisture %"?: number;
  "ph"?: number;
  "particle size"?: string;
  _confidence?: Record<string, number>;
  _crop_boxes?: Record<string, {
    bbox?: number[][];
    y_min?: number;
    x_min?: number;
    y_max?: number;
    x_max?: number;
  }>;
}

export type ColumnKey = string;

export interface SapStatus {
  mode: 'MOCK' | 'SANDBOX' | 'PROD_ODATA' | 'PROD_GUI';
  has_api_key: boolean;
  plant: string;
  sandbox_url: string;
  prod_url: string;
  status: string;
}

export interface SapSyncItemResult {
  sr_no: number;
  inspection_lot?: string;
  batch?: string;
  material?: string;
  status: string;
  usage_decision?: string;
  sap_document_number?: string;
  message: string;
}

export interface SapSyncResponse {
  status: 'COMPLETED' | 'PARTIAL' | 'FAILED' | 'ERROR';
  sap_mode: string;
  plant: string;
  processed_count: number;
  error_count?: number;
  results: SapSyncItemResult[];
  errors?: string[];
  warning?: string;
  timestamp: string;
}

export interface ReportData {
  report_id: string;
  image_url: string;
  columns: string[];
  rows: QualityRow[];
  raw_token_count?: number;
  paddle_engine_active?: boolean;
}

export interface SapLotRecord {
  inspection_lot: string;
  material: string;
  batch: string;
  plant: string;
  inspection_date: string;
  status: string;
  sync_timestamp: string;
  recorded_results?: Record<string, any>;
  sap_message?: string;
  usage_decision?: string;
}

export interface SapLogEntry {
  id: number;
  timestamp: string;
  report_id: string;
  sap_mode: string;
  processed_count: number;
  status: string;
  details: any;
}

// ----------------- Auth & Enterprise RBAC -----------------

export type ModuleId = 'qa' | 'workers' | 'vouchers';

export interface User {
  id: number;
  username: string;
  full_name: string;
  role: 'admin' | 'qa' | 'workers' | 'vouchers';
  department: string;
  allowed_modules: string[];
  default_module: ModuleId;
  avatar_color?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  message: string;
}

// ----------------- Floor Workers Module Types (Loader Daily Working Detail) -----------------

export interface WorkerItem {
  id: number;
  sheet_id: string;
  date: string;
  gang_leader_name: string;
  shift: string;
  sr_no: string;
  working_detail: string;
  rate: string;
  vehicle_no: string;
  unit: string;
  pallets: number;
  qty: string;
  product_code: string;
  remark: string;
  image_url?: string;
  created_at?: string;
}

export interface WorkerSheetMetadata {
  date: string;
  gang_leader_name: string;
  shift: string;
  sr_no: string;
}

// ----------------- Vouchers Module Types -----------------

export interface VoucherItem {
  id: number;
  voucher_no: string;
  date: string;
  debit_account: string;
  pay_to: string;
  gl_code: string;
  cost_center: string;
  particulars: string;
  amount: number;
  bank_name?: string;
  cheque_no_cash: string;
  prepared_by: string;
  accountant?: string | null;
  sanctioned_by?: string | null;
  status: 'Prepared' | 'Verified' | 'Sanctioned' | 'Settled' | string;
  created_at: string;
  updated_at: string;
}
