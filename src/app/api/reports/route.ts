import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';

export async function GET() {
  try {
    const db = getDatabase();
    const reports = db.prepare(`
      SELECT 
        r.report_id,
        r.title,
        r.status,
        r.image_url,
        r.image_rotation,
        r.row_count_expected,
        r.row_count_extracted,
        r.row_count_status,
        r.created_at,
        count(w.id) as row_count
      FROM quality_reports r
      LEFT JOIN quality_rows w ON r.report_id = w.report_id
      GROUP BY r.report_id
      ORDER BY r.created_at DESC
    `).all();

    return NextResponse.json(reports);
  } catch (err: any) {
    return NextResponse.json({ detail: err.message }, { status: 500 });
  }
}
