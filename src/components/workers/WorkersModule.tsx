import React, { useState, useEffect } from 'react';
import { Search, Download, Clock, Camera, FileCheck2, X, RefreshCw } from 'lucide-react';
import * as XLSX from 'xlsx';
import { WorkerItem, WorkerSheetMetadata, User } from '../../types';
import { WorkerUploadModal } from './WorkerUploadModal';

interface WorkersModuleProps {
  currentUser?: User;
}

export const WorkersModule: React.FC<WorkersModuleProps> = ({ currentUser: _currentUser }) => {
  const [workerRows, setWorkerRows] = useState<WorkerItem[]>([]);
  const [metadata, setMetadata] = useState<WorkerSheetMetadata | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // OCR Scan Document Modal
  const [isScanOpen, setIsScanOpen] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scannedImageUrl, setScannedImageUrl] = useState<string>('');
  const [isPhotoViewerOpen, setIsPhotoViewerOpen] = useState<boolean>(false);

  useEffect(() => {
    fetchWorkerRows();
  }, []);

  const fetchWorkerRows = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/workers');
      if (res.ok) {
        const data = await res.json();
        setWorkerRows(data);
        if (data.length > 0) {
          const first = data[0];
          setMetadata({
            date: first.date,
            gang_leader_name: first.gang_leader_name,
            shift: first.shift,
            sr_no: first.sr_no,
          });
          if (first.image_url) {
            setScannedImageUrl(first.image_url);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load workers data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScanFile = async (file: File, rotation?: number) => {
    setIsScanning(true);
    const formData = new FormData();
    formData.append('file', file);
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
        throw new Error(errText || 'Failed to scan worker sheet with PaddleOCR');
      }
      const data = await res.json();
      if (data.rows && data.rows.length > 0) {
        setWorkerRows(data.rows);
        setMetadata(data.metadata);
      }
      if (data.image_url) {
        setScannedImageUrl(data.image_url);
      }
      setIsScanOpen(false);
    } catch (err: any) {
      alert(`PaddleOCR Extraction Error: ${err.message || err}`);
    } finally {
      setIsScanning(false);
    }
  };

  const handleExportExcel = () => {
    const cleanData = workerRows.map((w, index) => ({
      'SR NO': index + 1,
      'WORKING DETAIL': w.working_detail,
      'RATE': w.rate,
      'VEHICLE NO': w.vehicle_no,
      'UNIT': w.unit,
      'PALLETS': w.pallets,
      'QTY': w.qty,
      'PRODUCT CODE': w.product_code,
      'REMARK': w.remark,
      'DATE': w.date,
      'GANG LEADER': w.gang_leader_name,
      'SHIFT': w.shift,
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
      w.product_code.toLowerCase().includes(search) ||
      w.vehicle_no.toLowerCase().includes(search) ||
      w.remark.toLowerCase().includes(search) ||
      w.rate.toLowerCase().includes(search) ||
      w.qty.toLowerCase().includes(search)
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Top Report Banner (identical to QA & Vouchers page) */}
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
        <div className="bg-neutral-50/80 rounded-xl px-5 py-3 border border-neutral-200/80 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center space-x-6 flex-wrap gap-y-2">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block">Date</span>
              <span className="font-semibold text-neutral-900 font-mono">{metadata.date}</span>
            </div>
            <div className="h-6 w-[1px] bg-neutral-200 hidden sm:block" />
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block">Gang Leader Name</span>
              <span className="font-semibold text-neutral-900">{metadata.gang_leader_name}</span>
            </div>
            <div className="h-6 w-[1px] bg-neutral-200 hidden sm:block" />
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block">Shift</span>
              <span className="font-semibold text-neutral-900 font-mono">{metadata.shift}</span>
            </div>
            <div className="h-6 w-[1px] bg-neutral-200 hidden sm:block" />
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block">Sr. No</span>
              <span className="font-semibold text-neutral-900 font-mono">{metadata.sr_no}</span>
            </div>
          </div>
          <div className="text-[11px] text-neutral-500 font-mono">
            {workerRows.length} items logged
          </div>
        </div>
      )}

      {/* Supabase-style Clean Action Table Container */}
      <div className="bg-white rounded-xl border border-neutral-200/90 shadow-[0_1px_3px_0_rgba(0,0,0,0.03),0_1px_2px_-1px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col transition-all">
        
        {/* Supabase Toolbar */}
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

        {/* Data Table: Strict 8 Physical Columns */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50/70 border-b border-neutral-200 text-neutral-500 font-semibold uppercase text-[11px] tracking-wider font-mono">
                <th className="py-2.5 px-3 min-w-[200px]">WORKING DETAIL</th>
                <th className="py-2.5 px-3 text-center">RATE</th>
                <th className="py-2.5 px-3 font-mono">VEHICLE NO</th>
                <th className="py-2.5 px-3 text-center">UNIT</th>
                <th className="py-2.5 px-3 text-center font-mono">PALLETS</th>
                <th className="py-2.5 px-3">QTY</th>
                <th className="py-2.5 px-3 font-mono">PRODUCT CODE</th>
                <th className="py-2.5 px-3 min-w-[150px]">REMARK</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredRows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-neutral-50/70 transition-colors"
                >
                  <td className="py-2.5 px-3 text-neutral-900 font-medium whitespace-nowrap">
                    {row.working_detail}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono text-neutral-600">
                    {row.rate}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-semibold text-neutral-900">
                    {row.vehicle_no !== '-' ? (
                      <span className="px-1.5 py-0.5 rounded bg-neutral-100 border border-neutral-200 text-neutral-800">
                        {row.vehicle_no}
                      </span>
                    ) : (
                      <span className="text-neutral-400">-</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center text-neutral-500">
                    {row.unit}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-semibold text-neutral-900">
                    {row.pallets}
                  </td>
                  <td className="py-2.5 px-3 text-neutral-700">
                    {row.qty}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-neutral-900 font-semibold">
                    {row.product_code !== '-' ? (
                      <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200/70 text-[11px]">
                        {row.product_code}
                      </span>
                    ) : (
                      <span className="text-neutral-400">-</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-neutral-700 whitespace-nowrap">
                    {row.remark !== '-' ? (
                      <span className="text-neutral-800 font-medium">
                        {row.remark}
                      </span>
                    ) : (
                      <span className="text-neutral-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Empty State */}
          {filteredRows.length === 0 && (
            <div className="py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-3">
                <Camera className="w-6 h-6 text-neutral-400" />
              </div>
              <h3 className="text-sm font-semibold text-neutral-900">No working sheets scanned yet</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1">
                Upload or capture a photo of the Loader Daily Working Detail sheet to extract records with PaddleOCR.
              </p>
              <div className="mt-4">
                <button
                  onClick={() => setIsScanOpen(true)}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#E4022D] hover:bg-[#C40226] shadow-sm transition"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Scan Document</span>
                </button>
              </div>
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
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full overflow-hidden border border-neutral-200">
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
            <div className="p-4 bg-neutral-950/5 flex items-center justify-center max-h-[75vh] overflow-auto">
              <img
                src={scannedImageUrl}
                alt="Scanned Loader Sheet"
                className="max-h-[70vh] object-contain rounded border border-neutral-200 shadow"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
