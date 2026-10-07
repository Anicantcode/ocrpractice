import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const db = getDatabase();

    let vouchers;
    if (status) {
      vouchers = db.prepare('SELECT * FROM vouchers WHERE status = ? ORDER BY created_at DESC').all(status);
    } else {
      vouchers = db.prepare('SELECT * FROM vouchers ORDER BY created_at DESC').all();
    }

    return NextResponse.json(vouchers.map((voucher: any) => ({
      ...voucher,
      coverage_missing_fields: parseStoredFieldList(voucher.coverage_missing_fields),
      coverage_extra_fields: parseStoredFieldList(voucher.coverage_extra_fields),
      voucher_form_detected: voucher.voucher_form_detected === null || voucher.voucher_form_detected === undefined ? null : Boolean(voucher.voucher_form_detected),
      review_required: voucher.coverage_status !== 'MATCH' || voucher.amount === null || !voucher.date || !voucher.pay_to || !voucher.gl_code || !voucher.cost_center
    })));
  } catch (err: any) {
    return NextResponse.json({ detail: err.message }, { status: 500 });
  }
}

function parseStoredFieldList(value: unknown): string[] {
  try {
    const parsed = JSON.parse(String(value || '[]'));
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = getDatabase();

    const voucherNo = body.voucher_no || `VCR-${Date.now().toString().slice(-6)}`;
    
    db.prepare(`
      INSERT INTO vouchers (
        voucher_no, date, debit_account, pay_to, gl_code, cost_center,
        particulars, amount, bank_name, cheque_no_cash, prepared_by,
        accountant, sanctioned_by, status, image_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      voucherNo,
      body.date || '',
      body.debit_account || '',
      body.pay_to || '',
      body.gl_code || '',
      body.cost_center || '',
      body.particulars || '',
      typeof body.amount === 'number' && Number.isFinite(body.amount) ? body.amount : null,
      body.bank_name || '',
      body.cheque_no_cash || '',
      body.prepared_by || '',
      body.accountant || '',
      body.sanctioned_by || '',
      body.status || 'Prepared',
      body.image_url || null
    );

    const saved = db.prepare('SELECT * FROM vouchers WHERE voucher_no = ?').get(voucherNo);
    return NextResponse.json({ success: true, voucher: saved });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message }, { status: 500 });
  }
}
