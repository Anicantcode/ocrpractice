import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { parseWorkerSheet } from '@/lib/ocr';
import { getDatabase } from '@/lib/db';
import { storePrivateDocument } from '@/lib/privateDocuments';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ detail: 'No worker sheet provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = file.type || 'image/jpeg';
    const sheetId = `LDR-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

    // 100% In-memory OCR (No server disk writes, zero storage cost, Netlify serverless ready)
    const base64 = buffer.toString('base64');
    const ocrResult = await parseWorkerSheet(base64, mimeType);
    const metadata = ocrResult.metadata || {};
    const db = getDatabase();
    let imageUrl = '';
    const sourceFile = formData.get('source_file');
    if (db && sourceFile instanceof File) imageUrl = (await storePrivateDocument(sourceFile)).url;

    // Optional database write (safe across serverless environments)
    try {
      if (db) {
        db.prepare(`
          INSERT INTO worker_sheets (sheet_id, shift, date, supervisor, loader_name, image_url, image_rotation, row_count_expected, row_count_extracted, row_count_status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          sheetId,
          metadata.shift || '',
          metadata.date || '',
          metadata.supervisor || '',
          metadata.loader_name || '',
          imageUrl,
          Number(formData.get('rotation')) || 0,
          metadata.row_count_expected,
          metadata.row_count_extracted,
          metadata.row_count_status
        );

        const insertRow = db.prepare(`
          INSERT INTO worker_rows (
            sheet_id, working_detail, rate, vehicle_no, unit, pallets, qty, product_code, place, type, particulars, category, units_kg, amount, lookup_key,
            source_working_detail, source_place, source_type, source_particulars, source_remark, translation_needs_review, rate_matched, review_required, remark
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        ocrResult.rows.forEach(r => {
          insertRow.run(
            sheetId,
            r.working_detail,
            r.rate,
            r.vehicle_no,
            r.unit,
            r.pallets,
            r.qty,
            r.product_code,
            r.place || '',
            r.type || '',
            r.particulars || '',
            r.category || '',
            r.units_kg || '',
            r.amount ?? null,
            r.lookup_key || '',
            r.source_working_detail || '',
            r.source_place || '',
            r.source_type || '',
            r.source_particulars || '',
            r.source_remark || '',
            r.translation_needs_review ? 1 : 0,
            r.rate_matched ? 1 : 0,
            r.review_required ? 1 : 0,
            r.remark
          );
        });
      }
    } catch (dbErr) {
      console.warn('Database write bypassed (serverless mode):', dbErr);
    }

    return NextResponse.json({
      success: true,
      sheet_id: sheetId,
      metadata: metadata,
      rows: ocrResult.rows,
      image_url: imageUrl,
      image_rotation: Number(formData.get('rotation')) || 0
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message }, { status: 500 });
  }
}
