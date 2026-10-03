import { NextResponse } from 'next/server';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { parseQaSheet } from '@/lib/ocr';
import { getDatabase } from '@/lib/db';
import { QA_SHEET_SCHEMAS } from '@/lib/constants';

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
    const ext = path.extname(file.name) || '.jpg';

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const reportId = `RPT-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const filename = `${reportId}${ext}`;
    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, buffer);

    const base64 = buffer.toString('base64');
    const ocrResult = await parseQaSheet(base64, mimeType);

    const detectedSheetType = ocrResult.sheet_type || requestedSheetType;
    const schema = QA_SHEET_SCHEMAS[detectedSheetType] || QA_SHEET_SCHEMAS['in_process'];
    const title = ocrResult.sheet_title || schema.title;
    const imageUrl = `/uploads/${filename}`;

    const db = getDatabase();
    db.prepare(`
      INSERT INTO quality_reports (report_id, title, status, image_url)
      VALUES (?, ?, 'VERIFIED', ?)
    `).run(reportId, title, imageUrl);

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
        r.confidence,
        ocrResult.metadata?.lot_no || '',
        `CHAR-00${idx + 1}`
      );
    });

    return NextResponse.json({
      report_id: reportId,
      sheet_type: detectedSheetType,
      sheet_title: title,
      image_url: imageUrl,
      columns: schema.columns,
      rows: ocrResult.rows,
      metadata: ocrResult.metadata,
      paddle_engine_active: true
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message }, { status: 500 });
  }
}
