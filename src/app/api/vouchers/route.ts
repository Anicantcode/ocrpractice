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

    return NextResponse.json(vouchers);
  } catch (err: any) {
    return NextResponse.json({ detail: err.message }, { status: 500 });
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
      body.date || new Date().toISOString().split('T')[0],
      body.debit_account || '',
      body.pay_to || '',
      body.gl_code || '410000',
      body.cost_center || 'FACTORY-01',
      body.particulars || '',
      typeof body.amount === 'number' ? body.amount : (parseFloat(body.amount) || 0.0),
      body.bank_name || '',
      body.cheque_no_cash || 'Cash',
      body.prepared_by || 'Staff',
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
