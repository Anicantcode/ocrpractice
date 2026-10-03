import { NextResponse } from 'next/server';
import { QA_SHEET_SCHEMAS } from '@/lib/constants';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sheetType = searchParams.get('sheet_type') || 'in_process';
  const schema = QA_SHEET_SCHEMAS[sheetType] || QA_SHEET_SCHEMAS['in_process'];

  return NextResponse.json({
    sheet_type: schema.id,
    title: schema.title,
    code: schema.code,
    columns: schema.columns,
    all_sheet_types: Object.values(QA_SHEET_SCHEMAS).map((s: any) => ({
      id: s.id,
      title: s.title,
      code: s.code
    }))
  });
}
