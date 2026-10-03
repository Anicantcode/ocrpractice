import { NextResponse } from 'next/server';
import { getSapStatus } from '@/lib/sap';

export async function GET() {
  const hasGeminiKey = !!process.env.GEMINI_API_KEY;
  const hasOpenRouterKey = !!(process.env.OPENROUTER_API_KEY || process.env.OCR_API_KEY);

  let activeProvider = 'No key set (Set GEMINI_API_KEY or OPENROUTER_API_KEY in .env.local)';
  if (hasGeminiKey) {
    activeProvider = `Google AI Studio Free Tier (${process.env.GEMINI_MODEL || 'gemini-2.0-flash'})`;
  } else if (hasOpenRouterKey) {
    activeProvider = `OpenRouter Free Tier (${process.env.OCR_MODEL_NAME || 'openrouter/free'})`;
  }

  return NextResponse.json({
    status: 'healthy',
    active_provider: activeProvider,
    api_ready: hasGeminiKey || hasOpenRouterKey,
    gemini_configured: hasGeminiKey,
    openrouter_configured: hasOpenRouterKey,
    sap_mode: getSapStatus().mode,
    timestamp: new Date().toISOString()
  });
}
