import { NextResponse } from 'next/server';
import { updateSapConfig } from '@/lib/sap';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const status = updateSapConfig({
      mode: body.mode,
      apiKey: body.api_key,
      prodUrl: body.prod_url,
      plant: body.plant
    });

    return NextResponse.json({
      success: true,
      message: `SAP mode updated to ${status.mode}`,
      config: status
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message }, { status: 500 });
  }
}
