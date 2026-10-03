import { NextResponse } from 'next/server';
import { testSapConnection } from '@/lib/sap';

export async function POST() {
  return NextResponse.json(testSapConnection());
}
