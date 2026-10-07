import React, { useState, useEffect } from 'react';
import { QualitySheetGrid } from '../QualitySheetGrid';
import { UploadModal } from '../UploadModal';
import { InspectionCropViewer } from '../InspectionCropViewer';
import { SapSyncModal } from '../SapSyncModal';
import { SapConfigModal } from '../SapConfigModal';
import { SapHistoryModal } from '../SapHistoryModal';
import { QualityRow, ColumnKey, SapStatus, SapSyncResponse, QaSheetType } from '../../types';
import { Camera, FileCheck2, Clock, RotateCcw, Download, Send } from 'lucide-react';
import * as XLSX from 'xlsx';
import { SHEET_COLUMNS } from '../../lib/constants';

interface QaModuleProps {
  sapStatus: SapStatus | null;
  onRefreshSapStatus?: () => void;
  isSapConfigOpen: boolean;
  onCloseSapConfig: () => void;
  isSapHistoryOpen: boolean;
  onCloseSapHistory: () => void;
}

export const QaModule: React.FC<QaModuleProps> = ({
  sapStatus,
  onRefreshSapStatus,
  isSapConfigOpen,
  onCloseSapConfig,
  isSapHistoryOpen,
  onCloseSapHistory,
}) => {
  const [sheetType, setSheetType] = useState<QaSheetType>('finished_goods');
  const [rows, setRows] = useState<QualityRow[]>([]);
  const [reportId, setReportId] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageRotation, setImageRotation] = useState<number>(0);
  const [rowCoverage, setRowCoverage] = useState<{ expected: number | null; extracted: number; status: 'MATCH' | 'MISMATCH' | 'COUNT_UNCERTAIN' } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Modals & Panels
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isSapSyncOpen, setIsSapSyncOpen] = useState<boolean>(false);
  const [cropViewer, setCropViewer] = useState<{
    isOpen: boolean;
    rowIdx: number;
    col: ColumnKey;
  }>({
    isOpen: false,
    rowIdx: 0,
    col: 'Batch Number',
  });

  const handleUploadFile = async (file: File, sourceFile?: File, rotation?: number) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    if (sourceFile) formData.append('source_file', sourceFile);
    formData.append('sheet_type', sheetType);
    if (rotation !== undefined) {
      formData.append('rotation', String(rotation));
    }

    try {
      const res = await fetch('/api/ocr/process', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Failed to process image');
      }
      const localUrl = URL.createObjectURL(sourceFile || file);
      const data = await res.json();
      setReportId(data.report_id);
      setImageUrl(data.image_url || localUrl);
      setImageRotation(data.image_rotation || 0);
      setRowCoverage(data.row_coverage || null);
      if (data.sheet_type) {
        setSheetType(data.sheet_type as QaSheetType);
      }
      setRows(data.rows || []);
      setIsUploadOpen(false);
    } catch (err: any) {
      alert(`Scanning Error: ${err.message || err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncToSap = async (plant: string): Promise<SapSyncResponse> => {
    const res = await fetch('/api/sap/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        report_id: reportId,
        plant,
        rows,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || 'Failed to sync to SAP');
    }
    const data: SapSyncResponse = await res.json();
    return data;
  };

  const handleSaveSapConfig = async (
    mode: string,
    apiKey?: string,
    prodUrl?: string,
    plant?: string
  ) => {
    const res = await fetch('/api/sap/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode, api_key: apiKey, prod_url: prodUrl, plant }),
    });
    if (res.ok && onRefreshSapStatus) {
      onRefreshSapStatus();
    }
  };

  const handleTestSapConnection = async () => {
    const res = await fetch('/api/sap/test-connection', { method: 'POST' });
    return await res.json();
  };

  const handleSelectCellCrop = (rowIdx: number, col: ColumnKey) => {
    setCropViewer({
      isOpen: true,
      rowIdx,
      col,
    });
  };

  const handleExportExcel = () => {
    if (rows.length === 0) return;
    const activeColumns = SHEET_COLUMNS[sheetType] || SHEET_COLUMNS['in_process'];
    const cleanData = rows.map((r) => {
      const rowObj: Record<string, any> = {};
      for (const c of activeColumns) {
        rowObj[c.label] = r[c.key] !== undefined ? r[c.key] : '';
      }
      return rowObj;
    });
    const worksheet = XLSX.utils.json_to_sheet(cleanData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Quality_Report');
    XLSX.writeFile(workbook, `Morde_${sheetType}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Top Report Banner */}
      <div className="bg-white rounded-xl p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.03),0_1px_2px_-1px_rgba(0,0,0,0.03)] border border-neutral-200/90 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-md font-semibold bg-neutral-100 text-neutral-800 border border-neutral-200/80 tracking-wide">
              {reportId || 'QA-REPORT'}
            </span>
            <span className="text-xs text-neutral-500 font-medium flex items-center gap-1.5 font-mono">
              <Clock className="w-3.5 h-3.5 text-neutral-400" aria-hidden="true" />
              {new Date().toLocaleDateString(undefined, {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight text-balance">
            Quality Assurance Test Report
          </h1>
          
          {/* Dropdown Menu for QA Sheet Selection */}
          <div className="flex items-center space-x-2 pt-1">
            <label htmlFor="qa-sheet-select" className="text-xs text-neutral-500 font-medium">Test Sheet:</label>
            <select
              id="qa-sheet-select"
              value={sheetType}
              onChange={(e) => {
                setSheetType(e.target.value as QaSheetType);
                setRows([]);
              }}
              className="text-xs font-semibold bg-neutral-50 hover:bg-white border border-neutral-200/90 rounded-lg px-3 py-1.5 text-neutral-900 focus:outline-none focus:border-neutral-900 cursor-pointer shadow-sm transition"
            >
              <option value="finished_goods">Finished Goods Analysis (FRM/QC/024)</option>
              <option value="microbiological">Microbiological Analysis (FRM/QC/001)</option>
              <option value="in_process">In-Process Lab Quality Sheet</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 flex-shrink-0">
          <button
            onClick={handleExportExcel}
            disabled={rows.length === 0}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium text-neutral-700 bg-white hover:bg-neutral-50 border border-neutral-200/90 transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5 text-neutral-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsSapSyncOpen(true)}
            disabled={rows.length === 0}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 shadow-sm transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Sync to SAP</span>
          </button>

          {imageUrl && (
            <button
              onClick={() =>
                setCropViewer({ isOpen: true, rowIdx: 0, col: 'Batch Number' })
              }
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-medium text-neutral-700 bg-white hover:bg-neutral-50 border border-neutral-200/90 transition shadow-sm focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:outline-none"
            >
              <FileCheck2 className="w-4 h-4 text-neutral-500" aria-hidden="true" />
              <span>View Sheet Photo</span>
            </button>
          )}

          {rows.length > 0 && (
            <button
              onClick={() => {
                setRows([]);
                setReportId('');
                setImageUrl('');
              }}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium text-neutral-600 bg-white hover:bg-neutral-50 border border-neutral-200/90 transition shadow-sm hover:text-red-600 focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:outline-none"
              title="Clear table and start new slate"
            >
              <RotateCcw className="w-3.5 h-3.5 text-neutral-400 group-hover:text-red-500" />
              <span>New Slate</span>
            </button>
          )}

          <button
            onClick={() => setIsUploadOpen(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold text-white bg-[#E4022D] hover:bg-[#C40226] shadow-sm transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#E4022D] focus-visible:outline-none"
          >
            <Camera className="w-4 h-4" aria-hidden="true" />
            <span>Scan Document</span>
          </button>
        </div>
      </div>

      {rowCoverage && (
        <div className={`mb-3 rounded-lg border px-4 py-2.5 text-xs ${rowCoverage.status === 'MATCH' ? 'border-sky-200 bg-sky-50 text-sky-900' : 'border-amber-300 bg-amber-50 text-amber-900'}`} role="status">
          {rowCoverage.status === 'MATCH'
            ? `Visual row-count pass: ${rowCoverage.expected} populated rows; ${rowCoverage.extracted} rows extracted. Please verify against the source.`
            : rowCoverage.status === 'MISMATCH'
              ? `Possible missing or extra QA rows: visual count ${rowCoverage.expected}, extracted ${rowCoverage.extracted}. Review against the source.`
              : 'Could not confidently count populated QA rows. Review the extracted rows against the source.'}
        </div>
      )}

      {/* Dynamic Multi-Sheet Quality Grid */}
      <QualitySheetGrid
        rows={rows}
        sheetType={sheetType}
        onChangeRows={setRows}
        onSelectCellCrop={handleSelectCellCrop}
        onOpenSapSync={() => setIsSapSyncOpen(true)}
        hasOriginalImage={Boolean(imageUrl)}
        reportId={reportId}
      />

      {/* Modals & Slide-outs */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadFile={handleUploadFile}
        isLoading={isLoading}
      />

      <InspectionCropViewer
        isOpen={cropViewer.isOpen}
        onClose={() => setCropViewer((prev) => ({ ...prev, isOpen: false }))}
        imageUrl={imageUrl}
        imageRotation={imageRotation}
        selectedRow={rows[cropViewer.rowIdx] || null}
        selectedCol={cropViewer.col}
      />

      <SapSyncModal
        isOpen={isSapSyncOpen}
        onClose={() => setIsSapSyncOpen(false)}
        rows={rows}
        sapStatus={sapStatus}
        onSync={handleSyncToSap}
        reportId={reportId}
      />

      <SapConfigModal
        isOpen={isSapConfigOpen}
        onClose={onCloseSapConfig}
        currentStatus={sapStatus}
        onSaveConfig={handleSaveSapConfig}
        onTestConnection={handleTestSapConnection}
      />

      <SapHistoryModal
        isOpen={isSapHistoryOpen}
        onClose={onCloseSapHistory}
        sapMode={sapStatus?.mode}
      />
    </div>
  );
};
