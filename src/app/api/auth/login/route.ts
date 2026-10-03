import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import crypto from 'node:crypto';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ detail: 'Username and password required' }, { status: 400 });
    }

    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    const user = stmt.get(username.trim()) as any;

    if (!user || user.password_hash !== password) {
      return NextResponse.json({ detail: 'Invalid username or password' }, { status: 401 });
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    db.prepare(`
      INSERT INTO sessions (token, username, expires_at)
      VALUES (?, ?, ?)
    `).run(token, user.username, expiresAt);

    return NextResponse.json({
      success: true,
      token,
      user: {
        username: user.username,
        full_name: user.full_name,
        role: user.role,
        department: user.department
      },
      message: `Welcome, ${user.full_name}!`
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message }, { status: 500 });
  }
}
