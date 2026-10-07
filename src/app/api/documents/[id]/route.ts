import { NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import { getDatabase } from '@/lib/db';
import { privateDocumentPath } from '@/lib/privateDocuments';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    const db = getDatabase();
    if (!db) return NextResponse.json({ detail: 'Document store unavailable' }, { status: 503 });
    if (!token || !db.prepare('SELECT 1 FROM sessions WHERE token = ? AND expires_at > ?').get(token, new Date().toISOString())) {
      return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });
    }
    const { id } = params;
    const filePath = privateDocumentPath(id);
    if (!filePath) return NextResponse.json({ detail: 'Not found' }, { status: 404 });
    const url = `/api/documents/${id}`;
    const referenced = db.prepare(`SELECT 1 FROM quality_reports WHERE image_url = ? UNION ALL SELECT 1 FROM worker_sheets WHERE image_url = ? UNION ALL SELECT 1 FROM vouchers WHERE image_url = ? LIMIT 1`).get(url, url, url);
    if (!referenced) return NextResponse.json({ detail: 'Not found' }, { status: 404 });
    const bytes = await fs.readFile(filePath);
    const type = id.endsWith('.pdf') ? 'application/pdf' : id.endsWith('.png') ? 'image/png' : id.endsWith('.webp') ? 'image/webp' : 'image/jpeg';
    return new Response(bytes, { headers: { 'Content-Type': type, 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "default-src 'none'; sandbox" } });
  } catch {
    return NextResponse.json({ detail: 'Document not found' }, { status: 404 });
  }
}
