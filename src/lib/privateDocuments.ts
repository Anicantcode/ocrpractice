import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

const MIME_EXT: Record<string, string> = {
  'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'application/pdf': '.pdf'
};

export async function storePrivateDocument(file: File): Promise<{ id: string; url: string }> {
  const ext = MIME_EXT[file.type];
  if (!ext) throw new Error('Unsupported source document type');
  if (file.size <= 0 || file.size > 20 * 1024 * 1024) throw new Error('Source document must be under 20 MB');
  const bytes = Buffer.from(await file.arrayBuffer());
  const valid = file.type === 'image/jpeg' ? bytes[0] === 0xff && bytes[1] === 0xd8
    : file.type === 'image/png' ? bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
    : file.type === 'image/webp' ? bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP'
    : bytes.toString('ascii', 0, 5) === '%PDF-';
  if (!valid) throw new Error('Source document content does not match its file type');
  const id = `${crypto.randomUUID()}${ext}`;
  const base = process.env.MORDE_PRIVATE_UPLOAD_DIR || path.join(process.cwd(), 'private_uploads');
  await fs.mkdir(base, { recursive: true, mode: 0o700 });
  await fs.writeFile(path.join(base, id), bytes, { flag: 'wx', mode: 0o600 });
  return { id, url: `/api/documents/${id}` };
}

export function privateDocumentPath(id: string): string | null {
  if (!/^[0-9a-f-]{36}\.(?:jpg|png|webp|pdf)$/i.test(id)) return null;
  const base = process.env.MORDE_PRIVATE_UPLOAD_DIR || path.join(process.cwd(), 'private_uploads');
  return path.join(base, id);
}
