import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

    if (token) {
      const db = getDatabase();
      db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
    }

    return NextResponse.json({ success: true, message: 'Logged out successfully' });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message }, { status: 500 });
  }
}
