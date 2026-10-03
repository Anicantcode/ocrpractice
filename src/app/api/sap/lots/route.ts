import { NextResponse } from 'next/server';
import { listSapLots } from '@/lib/sap';

export async function GET() {
  return NextResponse.json(listSapLots());
}
