import pytest
from backend.sap.simulator import sap_mock_simulator
from backend.sap.client import sap_client

def test_sap_mock_simulation_batch():
    test_records = [
        {
            "sr no": 1,
            "date": "2026-09-29",
            "Batch Number": "B260901",
            "product code": "PRD-CHOC-10",
            "paper weight": 1.24,
            "sample paper weight": 5.34,
            "sample weight": 4.10,
            "after drying weight": 2.85,
            "fat %": 12.5,
            "moisture %": 4.2,
            "ph": 6.8,
            "particle size": "75um"
        },
        {
            "sr no": 2,
            "date": "2026-09-29",
            "Batch Number": "B260902",
            "product code": "PRD-MILK-20",
            "paper weight": 1.22,
            "sample paper weight": 5.18,
            "sample weight": 3.96,
            "after drying weight": 2.71,
            "fat %": 14.2,
            "moisture %": 4.6,
            "ph": 6.5,
            "particle size": "80um"
        }
    ]

    res = sap_mock_simulator.record_inspection_batch(test_records, plant="1000")
    assert res["status"] == "COMPLETED"
    assert res["processed_count"] == 2
    assert len(res["results"]) == 2
    assert res["results"][0]["inspection_lot"].startswith("01")
    assert res["results"][0]["usage_decision"] == "A - Accepted"

def test_sap_client_mock_mode():
    sap_client.configure(mode="MOCK")
    status = sap_client.get_status()
    assert status["mode"] == "MOCK"

    conn = sap_client.test_connection()
    assert conn["success"] is True

    res = sap_client.sync_quality_records([{
        "sr no": 1,
        "date": "2026-09-29",
        "Batch Number": "TEST-B01",
        "product code": "MAT-01",
        "paper weight": 1.0,
        "sample paper weight": 4.0,
        "sample weight": 3.0,
        "after drying weight": 2.5,
        "fat %": 10.0,
        "moisture %": 3.5,
        "ph": 7.0,
        "particle size": "Fine"
    }])
    assert res["status"] == "COMPLETED"
    assert res["processed_count"] == 1
