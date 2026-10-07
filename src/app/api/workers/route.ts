import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sheetId = searchParams.get('sheet_id');
    const db = getDatabase();

    if (sheetId) {
      const rows = db.prepare('SELECT * FROM worker_rows WHERE sheet_id = ? ORDER BY id ASC').all(sheetId);
      return NextResponse.json(rows);
    }

    // Return all worker rows across recent sheets
    const rows = db.prepare(`
      SELECT 
        w.*,
        s.date,
        s.shift,
        s.loader_name,
        s.supervisor,
        s.image_url,
        s.image_rotation,
        s.row_count_expected,
        s.row_count_extracted,
        s.row_count_status
      FROM worker_rows w
      JOIN worker_sheets s ON w.sheet_id = s.sheet_id
      ORDER BY s.created_at DESC, w.id ASC
      LIMIT 100
    `).all();

    return NextResponse.json(rows);
  } catch (err: any) {
    return NextResponse.json({ detail: err.message }, { status: 500 });
  }
}
