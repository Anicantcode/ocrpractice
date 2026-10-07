import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import crypto from 'node:crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const reportId = body.report_id || `RPT-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const title = body.title || 'Quality Lab Sheet';
    const status = body.status || 'DRAFT';
    const imageUrl = body.image_url || null;
    const rows = body.rows || [];

    const db = getDatabase();
    
    // Check if report exists
    const existing = db.prepare('SELECT report_id FROM quality_reports WHERE report_id = ?').get(reportId);
    if (existing) {
      db.prepare(`
        UPDATE quality_reports 
        SET title = ?, status = ?, image_url = COALESCE(?, image_url), updated_at = CURRENT_TIMESTAMP
        WHERE report_id = ?
      `).run(title, status, imageUrl, reportId);

      db.prepare('DELETE FROM quality_rows WHERE report_id = ?').run(reportId);
    } else {
      db.prepare(`
        INSERT INTO quality_reports (report_id, title, status, image_url)
        VALUES (?, ?, ?, ?)
      `).run(reportId, title, status, imageUrl);
    }

    const insertRow = db.prepare(`
      INSERT INTO quality_rows (
        report_id, row_index, parameter_name, standard_val, observed_val,
        status, remarks, confidence, sap_lot_no, sap_characteristic_code
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    rows.forEach((r: any, idx: number) => {
      insertRow.run(
        reportId,
        r.row_index || idx + 1,
        r.parameter_name || '',
        r.standard_val || '',
        r.observed_val || '',
        r.status || 'PENDING',
        r.remarks || '',
        typeof r.confidence === 'number' ? r.confidence : null,
        r.sap_lot_no || '',
        r.sap_characteristic_code || `CHAR-00${idx + 1}`
      );
    });

    return NextResponse.json({
      success: true,
      report_id: reportId,
      message: 'Quality report saved successfully'
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message }, { status: 500 });
  }
}
