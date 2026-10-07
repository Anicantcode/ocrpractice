import { NextResponse } from 'next/server';
import { getSapStatus } from '@/lib/sap';

export async function GET() {
  const hasGeminiKey = !!process.env.GEMINI_API_KEY;
  const hasOpenRouterKey = !!(process.env.OPENROUTER_API_KEY || process.env.OCR_API_KEY);

  const preferred = process.env.OCR_PROVIDER || (hasOpenRouterKey ? 'openrouter' : (hasGeminiKey ? 'gemini' : 'none'));

  let activeProvider = 'No key set (Set OPENROUTER_API_KEY in .env.local)';
  if (preferred === 'openrouter' && hasOpenRouterKey) {
    activeProvider = `OpenRouter (${process.env.OCR_MODEL_NAME || 'openrouter/free'})`;
  } else if (hasGeminiKey) {
    activeProvider = `Google AI Studio (${process.env.GEMINI_MODEL || 'gemini-3.8-flash'})`;
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
