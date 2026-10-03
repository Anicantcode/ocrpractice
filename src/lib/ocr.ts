import path from 'node:path';
import fs from 'node:fs';

export interface QaExtractedRow {
  row_index: number;
  parameter_name: string;
  standard_val: string;
  observed_val: string;
  status: 'PASS' | 'FAIL' | 'PENDING';
  remarks: string;
  confidence: number;
}

export interface WorkerExtractedRow {
  id: number;
  working_detail: string;
  rate: string;
  vehicle_no: string;
  unit: string;
  pallets: string;
  qty: string;
  product_code: string;
  remark: string;
}

export interface VoucherExtractedData {
  voucher_no: string;
  date: string;
  debit_account: string;
  pay_to: string;
  gl_code: string;
  cost_center: string;
  particulars: string;
  amount: number;
  bank_name: string;
  cheque_no_cash: string;
  prepared_by: string;
  accountant: string;
  sanctioned_by: string;
  status: string;
}

const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_OPENROUTER_MODEL = 'openrouter/free';
const DEFAULT_GEMINI_MODEL = 'gemini-3.8-flash';

/**
 * Resilient JSON extraction ignoring markdown fences and model preambles (e.g. "User Safety: safe")
 */
function extractJson(rawContent: string): any {
  if (!rawContent || typeof rawContent !== 'string') return {};
  try {
    return JSON.parse(rawContent);
  } catch (err) {
    let cleaned = rawContent.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '').trim();
    try {
      return JSON.parse(cleaned);
    } catch (e2) {
      const firstBrace = cleaned.indexOf('{');
      const lastBrace = cleaned.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        const jsonSubstr = cleaned.slice(firstBrace, lastBrace + 1);
        return JSON.parse(jsonSubstr);
      }
      throw new Error(`Failed to parse JSON from vision model output: ${rawContent.slice(0, 150)}...`);
    }
  }
}

/**
 * Call Google AI Studio Gemini Free Tier (1,500 requests/day, 15 RPM free)
 */
async function callGeminiFreeTier(
  imageBase64: string,
  mimeType: string,
  systemPrompt: string,
  userInstruction: string,
  apiKey: string
): Promise<any> {
  const model = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `${systemPrompt}\n\nUSER INSTRUCTION: ${userInstruction}`
            },
            {
              inline_data: {
                mime_type: mimeType,
                data: imageBase64
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        response_mime_type: 'application/json'
      }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Google AI Studio Gemini API error (${response.status}): ${errText}`);
  }

  const result = await response.json();
  const rawContent = result.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  return extractJson(rawContent);
}

/**
 * Call OpenRouter Free Tier (openrouter/free, qwen:free, llama:free)
 */
async function callOpenRouterFree(
  imageBase64: string,
  mimeType: string,
  systemPrompt: string,
  userInstruction: string,
  apiKey: string
): Promise<any> {
  const model = process.env.OCR_MODEL_NAME || process.env.OPENROUTER_MODEL || DEFAULT_OPENROUTER_MODEL;
  const dataUrl = `data:${mimeType};base64,${imageBase64}`;

  const response = await fetch(OPENROUTER_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://github.com/Anicantcode/ocrpractice',
      'X-Title': 'Morde Enterprise OCR Portal'
    },
    body: JSON.stringify({
      model: model,
      temperature: 0.1,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: userInstruction
            },
            {
              type: 'image_url',
              image_url: {
                url: dataUrl
              }
            }
          ]
        }
      ]
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenRouter Free API error (${response.status}): ${errText}`);
  }

  const result = await response.json();
  const rawContent = result.choices?.[0]?.message?.content || '{}';
  return extractJson(rawContent);
}

/**
 * Universal call to active Free Vision API (Gemini Free Tier or OpenRouter Free)
 */
async function callVisionModel(
  imageBase64: string,
  mimeType: string,
  systemPrompt: string,
  userInstruction: string
): Promise<any> {
  const geminiKey = process.env.GEMINI_API_KEY || '';
  const openRouterKey = process.env.OPENROUTER_API_KEY || process.env.OCR_API_KEY || '';

  // 1. Try Google AI Studio Gemini Free Tier if GEMINI_API_KEY is present
  if (geminiKey) {
    try {
      return await callGeminiFreeTier(imageBase64, mimeType, systemPrompt, userInstruction, geminiKey);
    } catch (err: any) {
      console.warn('Gemini Free Tier failed, attempting fallback...', err.message);
      if (openRouterKey) {
        return await callOpenRouterFree(imageBase64, mimeType, systemPrompt, userInstruction, openRouterKey);
      }
      throw err;
    }
  }

  // 2. Use OpenRouter Free Tier if OPENROUTER_API_KEY is present
  if (openRouterKey) {
    return await callOpenRouterFree(imageBase64, mimeType, systemPrompt, userInstruction, openRouterKey);
  }

  // 3. Helpful error guiding the user on how to supply either free key
  throw new Error(
    'No free vision API key configured. Please set either:\n' +
    '1. GEMINI_API_KEY (from Google AI Studio - 100% free, 1,500 req/day), OR\n' +
    '2. OPENROUTER_API_KEY (for openrouter/free zero-cost models)\n' +
    'in your .env.local file.'
  );
}

/**
 * Extract Quality Assurance (QA) Lab Sheet
 */
export async function parseQaSheet(imageBase64: string, mimeType: string = 'image/jpeg'): Promise<{
  sheet_type: string;
  sheet_title: string;
  metadata: Record<string, string>;
  rows: QaExtractedRow[];
}> {
  const systemPrompt = `You are an enterprise quality assurance OCR parser for physical factory laboratory quality reports.
CRITICAL MANDATES:
1. NEVER invent, hallucinate, or create mock/fake data.
2. If any cell is blank, faint, or illegible, return an empty string "" with confidence 0.0.
3. Faithfully read exact numbers, decimals, and text as physically handwritten or printed on paper.
4. Output strict JSON with:
   - "sheet_type": "in_process" or "finished_goods" or "microbiological"
   - "sheet_title": detected title from the header
   - "metadata": {"batch_no": "", "date": "", "product_name": "", "lot_no": ""}
   - "rows": array of objects with:
       "row_index": number (1-indexed),
       "parameter_name": string (e.g. "Fat %", "Moisture %", "Viscosity", "Taste"),
       "standard_val": string,
       "observed_val": string,
       "status": "PASS" | "FAIL" | "PENDING",
       "remarks": string,
       "confidence": number (between 0.0 and 1.0)`;

  const parsed = await callVisionModel(
    imageBase64,
    mimeType,
    systemPrompt,
    'Analyze this factory quality report photo. Accurately extract all rows and parameters without any mock data.'
  );

  return {
    sheet_type: parsed.sheet_type || 'in_process',
    sheet_title: parsed.sheet_title || 'Quality Control Lab Sheet',
    metadata: parsed.metadata || {},
    rows: (parsed.rows || []).map((r: any, idx: number) => ({
      row_index: r.row_index || idx + 1,
      parameter_name: r.parameter_name || '',
      standard_val: r.standard_val || '',
      observed_val: r.observed_val || '',
      status: r.status === 'FAIL' ? 'FAIL' : (r.status === 'PASS' ? 'PASS' : 'PENDING'),
      remarks: r.remarks || '',
      confidence: typeof r.confidence === 'number' ? r.confidence : (r.observed_val ? 0.95 : 0.0)
    }))
  };
}

/**
 * Extract Daily Loader Detail Sheet (with Marathi to English translation)
 */
export async function parseWorkerSheet(imageBase64: string, mimeType: string = 'image/jpeg'): Promise<{
  metadata: Record<string, string>;
  rows: WorkerExtractedRow[];
}> {
  const systemPrompt = `You are an expert industrial logistics OCR parser for factory loader daily working sheets.
The sheet has columns: Sr No, Working Detail (often handwritten in Marathi/Devanagari), Rate, Vehicle No, Unit, Pallets, Qty, Product Code, Remark.
CRITICAL MANDATES:
1. Translate handwritten Marathi task descriptions into clean standard English factory terminology (e.g. "गाड्यांमधी Pallets लोडींग करणे" -> "Inside vehicles Pallets Loading", "परिसर loading" -> "Yard loading", "कंपनी Unloading" -> "Company Unloading").
2. Extract exact vehicle numbers (e.g. "9282" or "MH12 AB 9282").
3. NEVER invent or hallucinate data. If a cell is blank or unreadable, return empty string "" or "-".
4. Output strict JSON with:
   - "metadata": {"date": "", "shift": "", "supervisor": "", "loader_name": ""}
   - "rows": array of objects with:
       "id": number,
       "working_detail": string (translated to English),
       "rate": string,
       "vehicle_no": string,
       "unit": string,
       "pallets": string,
       "qty": string,
       "product_code": string,
       "remark": string`;

  const parsed = await callVisionModel(
    imageBase64,
    mimeType,
    systemPrompt,
    'Analyze this loader daily working sheet photo. Extract all working details, translate Marathi tasks to English, and return structured JSON.'
  );

  return {
    metadata: parsed.metadata || {},
    rows: (parsed.rows || []).map((r: any, idx: number) => ({
      id: r.id || idx + 1,
      working_detail: r.working_detail || '',
      rate: r.rate || '',
      vehicle_no: r.vehicle_no || '',
      unit: r.unit || 'Pallet',
      pallets: r.pallets || '',
      qty: r.qty || '',
      product_code: r.product_code || '',
      remark: r.remark || ''
    }))
  };
}

/**
 * Extract Voucher Payment Slip
 */
export async function parseVoucherSheet(imageBase64: string, mimeType: string = 'image/jpeg'): Promise<VoucherExtractedData> {
  const systemPrompt = `You are an enterprise accounting OCR parser for factory payment voucher receipts.
CRITICAL MANDATES:
1. Extract exact fields: voucher number, date, debit account, payee name, particulars/purpose, amount, bank name, payment mode (Cash/Cheque).
2. NEVER invent fake values. If a field is not filled on paper, leave it as an empty string "".
3. Output strict JSON with:
   - "voucher_no": string,
   - "date": string,
   - "debit_account": string,
   - "pay_to": string,
   - "gl_code": string (default "410000" if blank),
   - "cost_center": string (default "FACTORY-01" if blank),
   - "particulars": string,
   - "amount": number,
   - "bank_name": string,
   - "cheque_no_cash": string,
   - "prepared_by": string,
   - "accountant": string,
   - "sanctioned_by": string,
   - "status": "Prepared" | "Sanctioned" | "Paid"`;

  const parsed = await callVisionModel(
    imageBase64,
    mimeType,
    systemPrompt,
    'Extract payment voucher information from this receipt photo without any mock data.'
  );

  return {
    voucher_no: parsed.voucher_no || '',
    date: parsed.date || new Date().toISOString().split('T')[0],
    debit_account: parsed.debit_account || '',
    pay_to: parsed.pay_to || '',
    gl_code: parsed.gl_code || '410000',
    cost_center: parsed.cost_center || 'FACTORY-01',
    particulars: parsed.particulars || '',
    amount: typeof parsed.amount === 'number' ? parsed.amount : (parseFloat(parsed.amount) || 0.0),
    bank_name: parsed.bank_name || '',
    cheque_no_cash: parsed.cheque_no_cash || 'Cash',
    prepared_by: parsed.prepared_by || 'Staff',
    accountant: parsed.accountant || '',
    sanctioned_by: parsed.sanctioned_by || '',
    status: parsed.status || 'Prepared'
  };
}
