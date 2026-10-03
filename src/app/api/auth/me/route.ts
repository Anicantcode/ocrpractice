import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

    if (!token) {
      return NextResponse.json({ detail: 'Missing authentication token' }, { status: 401 });
    }

    const db = getDatabase();
    const sessionStmt = db.prepare('SELECT * FROM sessions WHERE token = ? AND expires_at > ?');
    const session = sessionStmt.get(token, new Date().toISOString()) as any;

    if (!session) {
      return NextResponse.json({ detail: 'Session expired or invalid' }, { status: 401 });
    }

    const userStmt = db.prepare('SELECT username, full_name, role, department FROM users WHERE username = ?');
    const user = userStmt.get(session.username) as any;

    return NextResponse.json({ user, token });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message }, { status: 500 });
  }
}
