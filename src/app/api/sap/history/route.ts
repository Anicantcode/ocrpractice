import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const db = getDatabase();

    const logs = db.prepare(`
      SELECT * FROM sap_sync_logs 
      ORDER BY synced_at DESC 
      LIMIT ?
    `).all(limit);

    return NextResponse.json(logs);
  } catch (err: any) {
    return NextResponse.json({ detail: err.message }, { status: 500 });
  }
}
