import { NextResponse } from 'next/server';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { parseVoucherSheet } from '@/lib/ocr';
import { getDatabase } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ detail: 'No voucher file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = file.type || 'image/jpeg';
    const ext = path.extname(file.name) || '.jpg';

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const voucherId = `VCR-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
    const filename = `${voucherId}${ext}`;
    fs.writeFileSync(path.join(uploadsDir, filename), buffer);

    const base64 = buffer.toString('base64');
    const ocrResult = await parseVoucherSheet(base64, mimeType);

    const imageUrl = `/uploads/${filename}`;
    const finalVoucherNo = ocrResult.voucher_no || voucherId;

    const db = getDatabase();
    db.prepare(`
      INSERT INTO vouchers (
        voucher_no, date, debit_account, pay_to, gl_code, cost_center,
        particulars, amount, bank_name, cheque_no_cash, prepared_by,
        accountant, sanctioned_by, status, image_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      finalVoucherNo,
      ocrResult.date || new Date().toISOString().split('T')[0],
      ocrResult.debit_account || '',
      ocrResult.pay_to || '',
      ocrResult.gl_code || '410000',
      ocrResult.cost_center || 'FACTORY-01',
      ocrResult.particulars || '',
      ocrResult.amount || 0.0,
      ocrResult.bank_name || '',
      ocrResult.cheque_no_cash || 'Cash',
      ocrResult.prepared_by || 'Staff',
      ocrResult.accountant || '',
      ocrResult.sanctioned_by || '',
      ocrResult.status || 'Prepared',
      imageUrl
    );

    const saved = db.prepare('SELECT * FROM vouchers WHERE voucher_no = ?').get(finalVoucherNo);

    return NextResponse.json({
      success: true,
      voucher: saved,
      image_url: imageUrl
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message }, { status: 500 });
  }
}
