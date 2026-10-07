import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs/promises';
import { parseQaSheet } from '@/lib/ocr';
import { getDatabase } from '@/lib/db';
import { QA_SHEET_SCHEMAS } from '@/lib/constants';
import { storePrivateDocument } from '@/lib/privateDocuments';

export async function POST() {
  try {
    const samplePath = path.join(process.cwd(), 'public', 'samples', 'sample_qa.jpg');
    try {
      await fs.access(samplePath);
    } catch {
      return NextResponse.json({ detail: 'Sample quality sheet not found on server' }, { status: 404 });
    }

    const buffer = await fs.readFile(samplePath);
    const base64 = buffer.toString('base64');

    const reportId = `RPT-SAMPLE-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const source = new File([buffer], 'sample_qa.jpg', { type: 'image/jpeg' });
    const { url: imageUrl } = await storePrivateDocument(source);

    const ocrResult = await parseQaSheet(base64, 'image/jpeg');
    const detectedSheetType = ocrResult.sheet_type || 'in_process';
    const schema = QA_SHEET_SCHEMAS[detectedSheetType] || QA_SHEET_SCHEMAS['in_process'];
    const title = 'In-Process Lab Quality Sheet (Real Physical Sample)';

    const db = getDatabase();
    db.prepare(`
      INSERT INTO quality_reports (report_id, title, status, image_url, row_count_expected, row_count_extracted, row_count_status)
      VALUES (?, ?, 'DRAFT', ?, ?, ?, ?)
    `).run(reportId, title, imageUrl, ocrResult.row_coverage.expected, ocrResult.row_coverage.extracted, ocrResult.row_coverage.status);

    const insertRow = db.prepare(`
      INSERT INTO quality_rows (
        report_id, row_index, parameter_name, standard_val, observed_val,
        status, remarks, confidence, sap_lot_no, sap_characteristic_code
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    ocrResult.rows.forEach((r, idx) => {
      insertRow.run(
        reportId,
        r.row_index || idx + 1,
        r.parameter_name,
        r.standard_val,
        r.observed_val,
        r.status,
        r.remarks,
        r.confidence ?? null,
        ocrResult.metadata?.lot_no || '',
        `CHAR-00${idx + 1}`
      );
    });

    return NextResponse.json({
      report_id: reportId,
      sheet_type: detectedSheetType,
      sheet_title: title,
      image_url: imageUrl,
      row_coverage: ocrResult.row_coverage,
      columns: schema.columns,
      rows: ocrResult.rows,
      metadata: ocrResult.metadata,
      paddle_engine_active: true
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message }, { status: 500 });
  }
}
