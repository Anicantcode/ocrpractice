"""
High-Fidelity SAP Quality Management (QM) Mock Simulator
Simulates SAP S/4HANA OData API (API_QUALITYINSPECTION_RESULT_SRV) and SAP ECC BAPIs (BAPI_INSPOPER_RECORDRESULTS).
"""
import uuid
import datetime
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field, ConfigDict

class QualityRecord(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    sr_no: Optional[int] = Field(None, alias="sr no")
    date: str
    batch_number: str = Field(..., alias="Batch Number")
    product_code: str = Field(..., alias="product code")
    paper_weight: float = Field(0.0, alias="paper weight")
    sample_paper_weight: float = Field(0.0, alias="sample paper weight")
    sample_weight: float = Field(0.0, alias="sample weight")
    after_drying_weight: float = Field(0.0, alias="after drying weight")
    fat_pct: float = Field(0.0, alias="fat %")
    moisture_pct: float = Field(0.0, alias="moisture %")
    ph: float = Field(7.0, alias="ph")
    particle_size: str = Field("Standard", alias="particle size")
    confidence: Optional[Dict[str, float]] = None


class InspectionLotRecord(BaseModel):
    inspection_lot: str
    material: str
    batch: str
    plant: str
    inspection_date: str
    status: str
    sync_timestamp: str
    recorded_results: Dict[str, Any]
    sap_message: str
    usage_decision: str


class SapMockSimulator:
    def __init__(self):
        self._counter = 1000004920
        self._lots: Dict[str, InspectionLotRecord] = {}

    def generate_lot_id(self) -> str:
        self._counter += 1
        return f"01{self._counter:08d}"

    def record_inspection_batch(self, records: List[Dict[str, Any]], plant: str = "1000") -> Dict[str, Any]:
        """
        Simulates SAP S/4HANA Inspection Lot Result Recording (QE51N / BAPI_INSPOPER_RECORDRESULTS)
        """
        results = []
        errors = []

        for idx, item in enumerate(records):
            try:
                # Normalize keys
                batch_no = item.get("Batch Number") or item.get("batch_number") or f"BATCH-{uuid.uuid4().hex[:6].upper()}"
                mat_code = item.get("product code") or item.get("product_code") or "MAT-DEFAULT"
                insp_date = item.get("date") or datetime.date.today().isoformat()
                
                # Characteristic validations
                fat = float(item.get("fat %") or item.get("fat_pct") or 0.0)
                moist = float(item.get("moisture %") or item.get("moisture_pct") or 0.0)
                ph_val = float(item.get("ph") or 7.0)
                particle = str(item.get("particle size") or item.get("particle_size") or "Standard")
                
                # Check for out-of-spec warnings or errors
                char_evaluations = {}
                is_within_spec = True

                # pH spec: 5.5 to 8.5
                if not (0.0 <= ph_val <= 14.0):
                    errors.append(f"Row {idx+1}: pH {ph_val} is physically impossible (valid: 0-14)")
                    continue
                if ph_val < 5.5 or ph_val > 8.5:
                    char_evaluations["PH"] = {"value": ph_val, "status": "Rejected/Out-of-Spec", "spec": "5.5 - 8.5"}
                    is_within_spec = False
                else:
                    char_evaluations["PH"] = {"value": ph_val, "status": "Accepted", "spec": "5.5 - 8.5"}

                # Moisture spec: <= 8.0%
                if moist > 8.0:
                    char_evaluations["MOISTURE"] = {"value": moist, "status": "Warning/High", "spec": "<= 8.0%"}
                else:
                    char_evaluations["MOISTURE"] = {"value": moist, "status": "Accepted", "spec": "<= 8.0%"}

                char_evaluations["FAT"] = {"value": fat, "status": "Accepted", "spec": "Standard Range"}
                char_evaluations["PARTICLE_SIZE"] = {"value": particle, "status": "Accepted"}
                char_evaluations["WEIGHTS"] = {
                    "paper_weight": float(item.get("paper weight") or item.get("paper_weight") or 0.0),
                    "sample_paper_weight": float(item.get("sample paper weight") or item.get("sample_paper_weight") or 0.0),
                    "sample_weight": float(item.get("sample weight") or item.get("sample_weight") or 0.0),
                    "after_drying_weight": float(item.get("after drying weight") or item.get("after_drying_weight") or 0.0)
                }

                lot_id = self.generate_lot_id()
                usage_decision = "A - Accepted" if is_within_spec else "R - Requires QA Review"

                lot_record = InspectionLotRecord(
                    inspection_lot=lot_id,
                    material=mat_code,
                    batch=batch_no,
                    plant=plant,
                    inspection_date=insp_date,
                    status="RREC" if is_within_spec else "INSP",
                    sync_timestamp=datetime.datetime.utcnow().isoformat() + "Z",
                    recorded_results=char_evaluations,
                    sap_message=f"Results recorded successfully under Inspection Lot {lot_id}",
                    usage_decision=usage_decision
                )
                self._lots[lot_id] = lot_record

                results.append({
                    "sr_no": item.get("sr no") or item.get("sr_no") or idx + 1,
                    "inspection_lot": lot_id,
                    "batch": batch_no,
                    "material": mat_code,
                    "status": "SUCCESS",
                    "usage_decision": usage_decision,
                    "sap_document_number": f"5000{self._counter % 10000:04d}",
                    "message": f"SAP QM Result Record confirmed. Material Doc 5000{self._counter % 10000:04d} posted."
                })
            except Exception as e:
                errors.append(f"Row {idx+1}: {str(e)}")

        return {
            "status": "COMPLETED" if not errors else ("PARTIAL" if results else "FAILED"),
            "sap_mode": "SAP_MOCK_ENGINE",
            "system_id": "MOCK-S4HANA-QM",
            "plant": plant,
            "processed_count": len(results),
            "error_count": len(errors),
            "results": results,
            "errors": errors,
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
        }

    def get_lot(self, lot_id: str) -> Optional[Dict[str, Any]]:
        record = self._lots.get(lot_id)
        if record:
            return record.dict()
        return None

    def list_lots(self) -> List[Dict[str, Any]]:
        return [record.dict() for record in self._lots.values()]

# Global singleton
sap_mock_simulator = SapMockSimulator()
