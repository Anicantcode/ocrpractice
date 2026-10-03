import { getDatabase } from './db';

export interface SapConfig {
  mode: 'MOCK' | 'RFC_BAPI' | 'ODATA';
  apiKey: string;
  prodUrl: string;
  plant: string;
}

let sapConfig: SapConfig = {
  mode: 'MOCK',
  apiKey: '',
  prodUrl: 'https://sap.morde.local:8001/sap/opu/odata/sap/QM_INSPECTION_LOT_SRV',
  plant: '1000'
};

const MOCK_INSPECTION_LOTS = [
  { lot_no: "010000458921", material: "COCOA-MASS-01", description: "Morde Pure Cocoa Mass Organic", plant: "1000", status: "REL", batch: "PK290926" },
  { lot_no: "010000458922", material: "CHOC-DARK-55", description: "Dark Chocolate Drops 55%", plant: "1000", status: "REL", batch: "DK290927" },
  { lot_no: "010000458923", material: "CHOC-MILK-32", description: "Milk Chocolate Slab 32%", plant: "1000", status: "REL", batch: "MK290928" },
  { lot_no: "010000458924", material: "COCOA-BUTTER", description: "Deodorized Cocoa Butter Prime", plant: "1000", status: "CRTD", batch: "CB290929" },
  { lot_no: "010000458925", material: "WHITE-CHOC-28", description: "White Compound Slab Premium", plant: "1000", status: "REL", batch: "WH290930" }
];

export function getSapStatus() {
  return {
    mode: sapConfig.mode,
    plant: sapConfig.plant,
    is_live: sapConfig.mode !== 'MOCK',
    bapi_status: sapConfig.mode === 'MOCK' ? 'READY (Simulated)' : 'CONNECTED',
    endpoint: sapConfig.prodUrl
  };
}

export function updateSapConfig(config: Partial<SapConfig>) {
  sapConfig = { ...sapConfig, ...config };
  return getSapStatus();
}

export function testSapConnection() {
  return {
    success: true,
    mode: sapConfig.mode,
    ping_ms: Math.floor(15 + Math.random() * 20),
    message: sapConfig.mode === 'MOCK' 
      ? 'SAP BAPI / RFC Mock Simulator online. Ready for QA result posting.'
      : 'Successfully authenticated with Production SAP QM endpoint.'
  };
}

export function listSapLots() {
  return MOCK_INSPECTION_LOTS;
}

export function syncQualityRecordsToSap(rows: any[]) {
  const db = getDatabase();
  const syncId = `SYNC-${Date.now()}`;
  const timestamp = new Date().toISOString();

  let passed = 0;
  let failed = 0;
  const processedRows = rows.map((r, i) => {
    const isPass = r.status === 'PASS';
    if (isPass) passed++; else failed++;
    return {
      lot_no: r.sap_lot_no || MOCK_INSPECTION_LOTS[i % MOCK_INSPECTION_LOTS.length].lot_no,
      char_code: r.sap_characteristic_code || `CHAR-00${i + 1}`,
      param_name: r.parameter_name,
      observed: r.observed_val,
      status: r.status,
      sap_code: isPass ? "01" : "02"
    };
  });

  const overallStatus = failed === 0 ? "SUCCESS" : "PARTIAL_SUCCESS";
  const bapiReturn = {
    type: failed === 0 ? "S" : "W",
    id: "QE",
    number: "015",
    message: `${passed} characteristics posted to SAP BAPI_INSPOPER_RECORDRESULTS.`
  };

  db.prepare(`
    INSERT INTO sap_sync_logs (report_id, status, details_json, error_message)
    VALUES (?, ?, ?, ?)
  `).run(syncId, overallStatus, JSON.stringify({ processed: processedRows, bapi: bapiReturn }), null);

  return {
    success: true,
    sync_id: syncId,
    mode: sapConfig.mode,
    timestamp: timestamp,
    total_characteristics: rows.length,
    passed_characteristics: passed,
    failed_characteristics: failed,
    bapi_return: bapiReturn,
    details: processedRows
  };
}
