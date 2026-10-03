import { NextResponse } from 'next/server';
import { getSapStatus } from '@/lib/sap';

export async function GET() {
  return NextResponse.json(getSapStatus());
}
