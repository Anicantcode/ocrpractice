import React, { useState, useEffect } from 'react';
import { Search, Download, Clock, Camera, FileCheck2, X, RefreshCw, RotateCcw } from 'lucide-react';
import * as XLSX from 'xlsx';
import { WorkerItem, WorkerSheetMetadata, User } from '../../types';
import { WorkerUploadModal } from './WorkerUploadModal';
import { DocumentPreview } from '../DocumentPreview';

interface WorkersModuleProps {
  currentUser?: User;
}

export const WorkersModule: React.FC<WorkersModuleProps> = ({ currentUser: _currentUser }) => {
  const [workerRows, setWorkerRows] = useState<WorkerItem[]>([]);
  const [metadata, setMetadata] = useState<WorkerSheetMetadata | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // OCR Scan Document Modal
  const [isScanOpen, setIsScanOpen] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scannedImageUrl, setScannedImageUrl] = useState<string>('');
  const [imageRotation, setImageRotation] = useState<number>(0);
  const [isPhotoViewerOpen, setIsPhotoViewerOpen] = useState<boolean>(false);

  const handleClearSlate = () => {
    setWorkerRows([]);
    setMetadata(null);
    setScannedImageUrl('');
  };

  const fetchWorkerRows = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/workers');
      if (res.ok) {
        const data = await res.json();
        setWorkerRows(data || []);
        if (data && data.length > 0) {
          const first = data[0];
          setMetadata({
            date: first.date,
            gang_leader_name: first.gang_leader_name || first.supervisor || first.loader_name || '',
            shift: first.shift,
            sr_no: first.sr_no,
            row_count_expected: first.row_count_expected,
            row_count_extracted: first.row_count_extracted,
            row_count_status: first.row_count_status,
          });
          if (first.image_url) {
            setScannedImageUrl(first.image_url);
            setImageRotation(first.image_rotation || 0);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load workers data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScanFile = async (file: File, sourceFile?: File, rotation?: number) => {
    setIsScanning(true);
    const formData = new FormData();
    formData.append('file', file);
    if (sourceFile) formData.append('source_file', sourceFile);
    if (rotation !== undefined) {
      formData.append('rotation', String(rotation));
    }

    try {
      const res = await fetch('/api/workers/scan', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Failed to scan worker sheet');
      }
      const localUrl = URL.createObjectURL(sourceFile || file);
      const data = await res.json();
      setWorkerRows(data.rows || []);
      setMetadata(data.metadata || null);
      setScannedImageUrl(data.image_url || localUrl);
      setImageRotation(data.image_rotation || 0);
      setIsScanOpen(false);
    } catch (err: any) {
      alert(`Document Processing Error: ${err.message || err}`);
    } finally {
      setIsScanning(false);
    }
  };

  const handleExportExcel = () => {
    const cleanData = workerRows.map((w, index) => ({
      'SR NO': index + 1,
      'WORKING DETAIL (ENGLISH)': w.working_detail,
      'WORKING DETAIL (SOURCE)': w.source_working_detail || w.working_detail,
      'RATE': w.rate,
      'VEHICLE NO': w.vehicle_no,
      'UNIT': w.unit,
      'PALLETS': w.pallets,
      'QTY': w.qty,
      'PRODUCT CODE': w.product_code,
      'REMARK (ENGLISH)': w.remark,
      'REMARK (SOURCE)': w.source_remark || w.remark,
      'DATE': w.date || metadata?.date || '',
      'GANG LEADER': w.gang_leader_name || metadata?.gang_leader_name || '',
      'SHIFT': w.shift || metadata?.shift || '',
    }));
    const worksheet = XLSX.utils.json_to_sheet(cleanData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Loader_Working_Detail');
    XLSX.writeFile(workbook, `Loader_Daily_Working_Detail_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const filteredRows = workerRows.filter((w) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      w.working_detail.toLowerCase().includes(search) ||
      (w.source_working_detail || '').toLowerCase().includes(search) ||
      w.product_code.toLowerCase().includes(search) ||
      w.vehicle_no.toLowerCase().includes(search) ||
      w.remark.toLowerCase().includes(search) ||
      (w.source_remark || '').toLowerCase().includes(search) ||
      w.rate.toLowerCase().includes(search) ||
      w.qty.toLowerCase().includes(search) ||
      w.unit.toLowerCase().includes(search)
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Top Report Banner (consistent button placement across all modules) */}
      <div className="bg-white rounded-xl p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.03),0_1px_2px_-1px_rgba(0,0,0,0.03)] border border-neutral-200/90 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-md font-semibold bg-neutral-100 text-neutral-800 border border-neutral-200/80 tracking-wide">
              LOADER-WORKING-DETAIL
            </span>
            <span className="text-xs text-neutral-500 font-medium flex items-center gap-1.5 font-mono">
              <Clock className="w-3.5 h-3.5 text-neutral-400" />
              {metadata?.date || new Date().toLocaleDateString(undefined, {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight text-balance">
            Loader Daily Working Detail
          </h1>
          <p className="text-xs text-neutral-500">
            MORDE FOODS PVT LTD MANCHAR • Floor Operations & Pallet Logistics Log
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2.5 flex-wrap gap-y-2">
          <button
            onClick={fetchWorkerRows}
            disabled={isLoading}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium text-neutral-700 bg-white hover:bg-neutral-50 border border-neutral-200/90 transition shadow-sm disabled:opacity-50"
            title="Refresh rows"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-neutral-500 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={handleExportExcel}
            disabled={workerRows.length === 0}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium text-neutral-700 bg-white hover:bg-neutral-50 border border-neutral-200/90 transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5 text-neutral-500" />
            <span>Export CSV</span>
          </button>

          {scannedImageUrl && (
            <button
              onClick={() => setIsPhotoViewerOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium text-neutral-700 bg-white hover:bg-neutral-50 border border-neutral-200/90 transition shadow-sm"
            >
              <FileCheck2 className="w-3.5 h-3.5 text-neutral-500" />
              <span>View Sheet Photo</span>
            </button>
          )}

          {workerRows.length > 0 && (
            <button
              onClick={handleClearSlate}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium text-neutral-600 bg-white hover:bg-neutral-50 border border-neutral-200/90 transition shadow-sm hover:text-red-600"
              title="Clear table and start new slate"
            >
              <RotateCcw className="w-3.5 h-3.5 text-neutral-400 group-hover:text-red-500" />
              <span>New Slate</span>
            </button>
          )}

          <button
            onClick={() => setIsScanOpen(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold text-white bg-[#E4022D] hover:bg-[#C40226] shadow-sm transition active:scale-[0.99]"
          >
            <Camera className="w-4 h-4" />
            <span>Scan Document</span>
          </button>
        </div>
      </div>

      {/* Sheet Metadata Strip if scanned */}
      {metadata && (
        <div className="space-y-2">
        {metadata.row_count_status && (
          <div className={`rounded-lg px-4 py-2 text-xs border ${metadata.row_count_status === 'MATCH' ? 'bg-sky-50 border-sky-200 text-sky-900' : 'bg-amber-50 border-amber-300 text-amber-900'}`} role="status">
            {metadata.row_count_status === 'MATCH'
              ? `Visual row-count pass: ${metadata.row_count_expected} populated rows; ${metadata.row_count_extracted} rows extracted. Please verify against the source.`
              : metadata.row_count_status === 'MISMATCH'
                ? `Possible missing or extra rows: visual count ${metadata.row_count_expected}, extracted ${metadata.row_count_extracted}. Review this sheet against the original.`
                : `Could not confidently count populated rows. Review the extracted rows against the original.`}
          </div>
        )}
        <div className="bg-neutral-50/80 rounded-xl px-5 py-3 border border-neutral-200/80 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center space-x-6 flex-wrap gap-y-2">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block">Date</span>
              <span className="font-semibold text-neutral-900 font-mono">{metadata.date}</span>
            </div>
            <div className="h-6 w-[1px] bg-neutral-200 hidden sm:block" />
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block">Gang Leader Name</span>
              <span className="font-semibold text-neutral-900">{metadata.gang_leader_name || 'Mohan Ghodekar'}</span>
            </div>
            <div className="h-6 w-[1px] bg-neutral-200 hidden sm:block" />
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block">Shift</span>
              <span className="font-semibold text-neutral-900 font-mono">{metadata.shift || 'General'}</span>
            </div>
            {metadata.sr_no && (
              <>
                <div className="h-6 w-[1px] bg-neutral-200 hidden sm:block" />
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block">Sr. No</span>
                  <span className="font-semibold text-neutral-900 font-mono">{metadata.sr_no}</span>
                </div>
              </>
            )}
          </div>
          <div className="text-[11px] text-neutral-500 font-mono">
            {workerRows.length} items logged
          </div>
        </div>
        </div>
      )}

      {/* Clean Physical Table (8 Columns matching physical slip input) */}
      <div className="bg-white rounded-xl border border-neutral-200/90 shadow-[0_1px_3px_0_rgba(0,0,0,0.03),0_1px_2px_-1px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col transition-all">
        
        {/* Toolbar */}
        <div className="px-4 py-3 border-b border-neutral-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white">
          <div className="flex items-center space-x-2.5">
            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="search"
                autoComplete="off"
                placeholder="Filter by product code, vehicle #, detail, remark…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-50/70 hover:bg-neutral-50 focus:bg-white rounded-lg border border-neutral-200/90 focus:border-neutral-900 focus:outline-none transition text-neutral-900 placeholder:text-neutral-400 font-sans"
              />
            </div>
            <span className="text-[11px] font-mono text-neutral-400 px-2 py-1 rounded bg-neutral-100/70 hidden sm:inline-block">
              {filteredRows.length} {filteredRows.length === 1 ? 'row' : 'rows'}
            </span>
          </div>
        </div>

        {/* Physical 8 Columns */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50/70 border-b border-neutral-200 text-neutral-500 font-semibold uppercase text-[11px] tracking-wider font-mono">
                <th className="py-2.5 px-3 min-w-[220px]">WORKING DETAIL (ENGLISH)</th>
                <th className="py-2.5 px-3 text-center">RATE</th>
                <th className="py-2.5 px-3 font-mono">VEHICLE NO</th>
                <th className="py-2.5 px-3 text-center">UNIT</th>
                <th className="py-2.5 px-3 text-center font-mono">PALLETS</th>
                <th className="py-2.5 px-3">QTY</th>
                <th className="py-2.5 px-3 font-mono">PRODUCT CODE</th>
                <th className="py-2.5 px-3 min-w-[150px]">REMARK (ENGLISH)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredRows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-neutral-50/70 transition-colors"
                >
                  <td className="py-2.5 px-3 text-neutral-900 font-medium">
                    <div className="flex flex-col items-start gap-1">
                      <span>{row.working_detail}</span>
                      {row.source_working_detail && row.source_working_detail !== row.working_detail && (
                        <span className="text-[11px] font-normal text-neutral-500">Source: {row.source_working_detail}</span>
                      )}
                      {row.translation_needs_review && (
                        <span className="rounded border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">Verify English translation</span>
                      )}
                      {row.review_required && (
                        <span className="rounded border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">Review OCR against source</span>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono text-neutral-700">
                    <div className="inline-flex items-center gap-1 justify-center">
                      <span>{row.rate || '-'}</span>
                      {row.rate_matched && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" title="Master Rate Verified" />
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-semibold text-neutral-900">
                    {row.vehicle_no && row.vehicle_no !== '-' ? (
                      <span className="px-1.5 py-0.5 rounded bg-neutral-100 border border-neutral-200 text-neutral-800 text-[11px]">
                        {row.vehicle_no}
                      </span>
                    ) : (
                      <span className="text-neutral-400">-</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center text-neutral-600 font-mono">
                    {row.unit || '—'}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-semibold text-neutral-900">
                    {row.pallets || '-'}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-neutral-900">
                    {row.qty || '-'}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-neutral-900 font-semibold">
                    {row.product_code && row.product_code !== '-' ? (
                      <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200/70 text-[11px]">
                        {row.product_code}
                      </span>
                    ) : (
                      <span className="text-neutral-400">-</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-neutral-700 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span className="text-neutral-800 font-medium">{row.remark || '-'}</span>
                      {row.source_remark && row.source_remark !== row.remark && (
                        <span className="text-[11px] text-neutral-500">Source: {row.source_remark}</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Empty State */}
          {filteredRows.length === 0 && (
            <div className="py-14 text-center text-neutral-400 text-xs">
              No working sheets scanned yet. Click &quot;Scan Document&quot; above to scan a loader working detail sheet.
            </div>
          )}
        </div>

      </div>

      {/* Scan Document Modal */}
      <WorkerUploadModal
        isOpen={isScanOpen}
        onClose={() => setIsScanOpen(false)}
        onScanFile={handleScanFile}
        isLoading={isScanning}
      />

      {/* Scanned Sheet Full Photo Viewer Modal */}
      {isPhotoViewerOpen && scannedImageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full overflow-hidden border border-neutral-200">
            <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-200 bg-neutral-50">
              <div className="flex items-center space-x-2">
                <FileCheck2 className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-semibold text-neutral-900">Authentic Loader Working Detail Sheet Photo</span>
              </div>
              <button
                onClick={() => setIsPhotoViewerOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-[78vh] overflow-auto">
              <div className="bg-neutral-950/5 min-h-80 flex items-center justify-center overflow-auto rounded-lg"><DocumentPreview src={scannedImageUrl} alt="Original loader sheet" rotation={imageRotation} className="max-h-[70vh] max-w-full object-contain rounded border border-neutral-200 shadow" /></div>
              <div className="overflow-auto border rounded-lg">
                <div className="px-3 py-2 text-xs font-semibold bg-neutral-50 border-b">Extracted values — compare with source</div>
                <table className="min-w-full text-xs"><thead><tr>{['#','Working detail','Rate','Vehicle no','Unit','Pallets','Qty','Product code','Remark'].map(h=><th key={h} className="p-2 text-left border-b whitespace-nowrap">{h}</th>)}</tr></thead>
                  <tbody>{workerRows.map((row,index)=><tr key={row.id ?? index} className={row.review_required ? 'bg-amber-50' : ''}><td className="p-2 border-b">{index+1}</td><td className="p-2 border-b">{row.working_detail || '—'}</td><td className="p-2 border-b">{row.rate || '—'}</td><td className="p-2 border-b">{row.vehicle_no || '—'}</td><td className="p-2 border-b">{row.unit || '—'}</td><td className="p-2 border-b">{row.pallets || '—'}</td><td className="p-2 border-b">{row.qty || '—'}</td><td className="p-2 border-b">{row.product_code || '—'}</td><td className="p-2 border-b">{row.remark || '—'}</td></tr>)}</tbody></table>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
