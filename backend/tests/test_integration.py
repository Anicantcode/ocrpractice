import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_api_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "sap_mode" in data

def test_api_sap_status():
    res = client.get("/api/sap/status")
    assert res.status_code == 200
    data = res.json()
    assert data["mode"] == "MOCK"
    assert data["plant"] == "1000"

def test_api_ocr_sample_and_sync_pipeline():
    # 1. Generate & process sample handwritten sheet
    sample_res = client.post("/api/ocr/sample")
    assert sample_res.status_code == 200
    sample_data = sample_res.json()
    assert "report_id" in sample_data
    assert "rows" in sample_data
    assert len(sample_data["rows"]) > 0

    first_row = sample_data["rows"][0]
    expected_cols = [
        "sr no", "date", "Batch Number", "product code", "paper weight",
        "sample paper weight", "sample weight", "after drying weight",
        "fat %", "moisture %", "ph", "particle size"
    ]
    for col in expected_cols:
        assert col in first_row

    # 2. Modify one value (simulating user edit in editable grid)
    sample_data["rows"][0]["ph"] = 6.9
    sample_data["rows"][0]["fat %"] = 12.8

    # 3. Sync edited sheet to SAP
    sync_res = client.post("/api/sap/sync", json={
        "report_id": sample_data["report_id"],
        "plant": "1000",
        "rows": sample_data["rows"]
    })
    assert sync_res.status_code == 200
    sync_data = sync_res.json()
    assert sync_data["status"] == "COMPLETED"
    assert sync_data["processed_count"] == len(sample_data["rows"])
    assert sync_data["results"][0]["inspection_lot"].startswith("01")

    # 4. Verify saved report
    report_res = client.get(f"/api/reports/{sample_data['report_id']}")
    assert report_res.status_code == 200
    report_obj = report_res.json()
    assert report_obj["status"] == "SYNCED_TO_SAP"
    assert report_obj["sap_result"] is not None
