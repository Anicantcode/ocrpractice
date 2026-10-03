import { NextResponse } from 'next/server';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { parseWorkerSheet } from '@/lib/ocr';
import { getDatabase } from '@/lib/db';

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
    const ext = path.extname(file.name) || '.jpg';

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const sheetId = `LDR-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
    const filename = `${sheetId}${ext}`;
    fs.writeFileSync(path.join(uploadsDir, filename), buffer);

    const base64 = buffer.toString('base64');
    const ocrResult = await parseWorkerSheet(base64, mimeType);

    const metadata = ocrResult.metadata || {};
    const imageUrl = `/uploads/${filename}`;

    const db = getDatabase();
    db.prepare(`
      INSERT INTO worker_sheets (sheet_id, shift, date, supervisor, loader_name, image_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      sheetId,
      metadata.shift || '',
      metadata.date || new Date().toISOString().split('T')[0],
      metadata.supervisor || '',
      metadata.loader_name || '',
      imageUrl
    );

    const insertRow = db.prepare(`
      INSERT INTO worker_rows (
        sheet_id, working_detail, rate, vehicle_no, unit, pallets, qty, product_code, remark
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        r.remark
      );
    });

    return NextResponse.json({
      success: true,
      sheet_id: sheetId,
      metadata: metadata,
      rows: ocrResult.rows,
      image_url: imageUrl
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message }, { status: 500 });
  }
}
