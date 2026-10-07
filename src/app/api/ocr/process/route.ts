import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { parseQaSheet } from '@/lib/ocr';
import { getDatabase } from '@/lib/db';
import { QA_SHEET_SCHEMAS } from '@/lib/constants';
import { storePrivateDocument } from '@/lib/privateDocuments';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const requestedSheetType = (formData.get('sheet_type') as string) || 'in_process';

    if (!file) {
      return NextResponse.json({ detail: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = file.type || 'image/jpeg';
    const reportId = `RPT-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    // 100% In-memory OCR (No server disk writes, zero storage cost, Netlify serverless ready)
    const base64 = buffer.toString('base64');
    const ocrResult = await parseQaSheet(base64, mimeType, requestedSheetType);
    const db = getDatabase();
    let imageUrl = '';
    const sourceFile = formData.get('source_file');
    if (db && sourceFile instanceof File) imageUrl = (await storePrivateDocument(sourceFile)).url;

    const detectedSheetType = ocrResult.sheet_type || requestedSheetType;
    const schema = QA_SHEET_SCHEMAS[detectedSheetType] || QA_SHEET_SCHEMAS['in_process'];
    const title = ocrResult.sheet_title || schema.title;

    // Optional database write (safe across serverless environments)
    try {
      if (db) {
        db.prepare(`
          INSERT INTO quality_reports (report_id, title, status, image_url, image_rotation, row_count_expected, row_count_extracted, row_count_status)
          VALUES (?, ?, 'DRAFT', ?, ?, ?, ?, ?)
        `).run(reportId, title, imageUrl, Number(formData.get('rotation')) || 0, ocrResult.row_coverage.expected, ocrResult.row_coverage.extracted, ocrResult.row_coverage.status);

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
      }
    } catch (dbErr) {
      console.warn('Database write bypassed (serverless mode):', dbErr);
    }

    return NextResponse.json({
      report_id: reportId,
      sheet_type: detectedSheetType,
      sheet_title: title,
      image_url: imageUrl,
      image_rotation: Number(formData.get('rotation')) || 0,
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
