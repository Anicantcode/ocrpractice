import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const reportId = params.id;
    const db = getDatabase();

    const report = db.prepare('SELECT * FROM quality_reports WHERE report_id = ?').get(reportId) as any;
    if (!report) {
      return NextResponse.json({ detail: 'Report not found' }, { status: 404 });
    }

    const rows = db.prepare('SELECT * FROM quality_rows WHERE report_id = ? ORDER BY row_index ASC').all(reportId);

    return NextResponse.json({
      ...report,
      rows
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message }, { status: 500 });
  }
}
