import { NextResponse } from 'next/server';
import { syncQualityRecordsToSap } from '@/lib/sap';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rows = body.rows || [];

    if (!rows.length) {
      return NextResponse.json({ detail: 'Cannot sync empty rows to SAP' }, { status: 400 });
    }

    const result = syncQualityRecordsToSap(rows);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ detail: err.message }, { status: 500 });
  }
}
