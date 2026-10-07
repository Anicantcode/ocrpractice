# Changelog

## 2026-10-06

- Added a text-only worker translation pass through the pinned OpenRouter Gemini model. English is stored in output fields while verbatim OCR remains in source fields; rows needing translation are flagged for review, and translation failure preserves the source text. Updated `src/lib/ocr.ts`.
- Updated the worker table and Excel export to show English fields alongside the verbatim source text, added source-language search, and visibly flagged translations for review. Updated `src/components/workers/WorkersModule.tsx`.
- Enabled low reasoning effort only for pinned worker-model OpenRouter calls because Gemini 3.8 Flash rejects reasoning-disabled requests. QA and voucher request settings remain unchanged. Updated `src/lib/ocr.ts`.
- Routed worker OCR extraction, its row-count audit, and recovery exclusively through OpenRouter using `google/gemini-3.8-flash`; this bypasses the shared provider/model fallback. Updated `src/lib/ocr.ts`.
- Enabled OpenRouter JSON response mode for the pinned Gemini worker requests. Updated `src/lib/ocr.ts`.
- Updated environment example comments to document that worker OCR is pinned through OpenRouter while QA/vouchers retain configurable routing. Updated `.env.example`.
- Fixed the Finished Goods prompt so it excludes only intermediate weight columns and requires all other visible schema fields, including PS (particle size in micrometres), to be transcribed. Updated `src/lib/ocr.ts` after reviewing `qc.jpeg`.
- Clarified the Finished Goods PS table label to show the particle-size unit as `µm`. Updated `src/lib/constants.ts`.
- Fixed an overbroad microbiological QA prompt instruction: only individual TPC dilution-count columns are excluded; TPC Total and every other visible schema result field must be transcribed. Updated `src/lib/ocr.ts` after comparing the reported output with the attached report.
- Audited OCR prompts for QA sheets, worker sheets, and vouchers. Preserved QA marks as observed rather than converting them to `PASS`; clarified blank versus unreadable values and exact date transcription; removed the voucher payment-mode restriction and inferred `Prepared` status; added document-as-data guidance to extraction, audit, and worker recovery prompts. Updated worker table-row wording so visible notes inside table cells are not excluded. Updated `src/lib/ocr.ts`.
- Kept an OCR voucher's status blank when no status is visible instead of replacing it with `Prepared`. Updated `src/app/api/vouchers/scan/route.ts`.
- Added contributor and agent guidance, including the requirement to append a changelog entry after every logical change. Added `AGENTS.md` and this `CHANGELOG.md`.
- Verification: inspected all OCR prompt definitions and their adjacent normalization/routes; ran `git diff --check`. No build or tests run.
