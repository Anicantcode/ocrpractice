import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { parseVoucherSheet } from '@/lib/ocr';
import { getDatabase } from '@/lib/db';
import { storePrivateDocument } from '@/lib/privateDocuments';

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
    const voucherId = `VCR-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

    // 100% In-memory OCR (No server disk writes, zero storage cost, Netlify serverless ready)
    const base64 = buffer.toString('base64');
    const ocrResult = await parseVoucherSheet(base64, mimeType);
    const db = getDatabase();
    let imageUrl = '';
    const sourceFile = formData.get('source_file');
    if (db && sourceFile instanceof File) imageUrl = (await storePrivateDocument(sourceFile)).url;
    const finalVoucherNo = ocrResult.voucher_no || voucherId;

    const voucherData = {
      voucher_no: finalVoucherNo,
      voucher_no_generated: ocrResult.voucher_no ? 0 : 1,
      date: ocrResult.date,
      debit_account: ocrResult.debit_account || '',
      pay_to: ocrResult.pay_to || '',
      gl_code: ocrResult.gl_code,
      cost_center: ocrResult.cost_center,
      particulars: ocrResult.particulars || '',
      amount: ocrResult.amount,
      bank_name: ocrResult.bank_name || '',
      cheque_no_cash: ocrResult.cheque_no_cash,
      prepared_by: ocrResult.prepared_by,
      accountant: ocrResult.accountant || '',
      sanctioned_by: ocrResult.sanctioned_by || '',
      status: ocrResult.status,
      image_url: imageUrl,
      image_rotation: Number(formData.get('rotation')) || 0,
      coverage_status: ocrResult.coverage_status,
      coverage_missing_fields: ocrResult.coverage_missing_fields,
      coverage_extra_fields: ocrResult.coverage_extra_fields,
      voucher_form_detected: ocrResult.voucher_form_detected,
      review_required: ocrResult.coverage_status !== 'MATCH' || ocrResult.amount === null || !ocrResult.date || !ocrResult.pay_to || !ocrResult.gl_code || !ocrResult.cost_center
    };

    // Optional database write (safe across serverless environments)
    try {
      if (db) {
        db.prepare(`
          INSERT INTO vouchers (
            voucher_no, voucher_no_generated, date, debit_account, pay_to, gl_code, cost_center,
            particulars, amount, bank_name, cheque_no_cash, prepared_by,
            accountant, sanctioned_by, status, image_url, image_rotation,
            coverage_status, coverage_missing_fields, coverage_extra_fields, voucher_form_detected
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          voucherData.voucher_no,
          voucherData.voucher_no_generated,
          voucherData.date,
          voucherData.debit_account,
          voucherData.pay_to,
          voucherData.gl_code,
          voucherData.cost_center,
          voucherData.particulars,
          voucherData.amount,
          voucherData.bank_name,
          voucherData.cheque_no_cash,
          voucherData.prepared_by,
          voucherData.accountant,
          voucherData.sanctioned_by,
          voucherData.status,
          voucherData.image_url,
          voucherData.image_rotation,
          voucherData.coverage_status,
          JSON.stringify(voucherData.coverage_missing_fields),
          JSON.stringify(voucherData.coverage_extra_fields),
          voucherData.voucher_form_detected === null ? null : voucherData.voucher_form_detected ? 1 : 0
        );
      }
    } catch (dbErr) {
      console.warn('Database write bypassed (serverless mode):', dbErr);
    }

    return NextResponse.json({
      success: true,
      voucher: voucherData,
      image_url: imageUrl,
      image_rotation: voucherData.image_rotation
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message }, { status: 500 });
  }
}
