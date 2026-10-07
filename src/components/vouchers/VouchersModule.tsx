import React, { useState, useEffect } from 'react';
import { Search, Download, X, Clock, RefreshCw, Printer, Camera, FileCheck2, RotateCcw } from 'lucide-react';
import * as XLSX from 'xlsx';
import { VoucherItem, User } from '../../types';
import { VoucherUploadModal } from './VoucherUploadModal';
import { DocumentPreview } from '../DocumentPreview';

interface VouchersModuleProps {
  currentUser?: User;
}

function parseAmount(amt: number | null) {
  if (amt === null || !Number.isFinite(amt)) return { rs: '', ps: '' };
  const rs = Math.floor(amt);
  const ps = Math.round((amt - rs) * 100);
  return {
    rs: rs.toLocaleString('en-IN'),
    ps: String(ps).padStart(2, '0'),
  };
}

function amountToWords(amt: number | null) {
  if (amt === null || !Number.isFinite(amt)) return { lakhs: '——', thousands: '——', hundreds: '——', ps: '——' };
  const intPart = Math.floor(amt);
  const ps = Math.round((amt - intPart) * 100);

  const lakhs = Math.floor(intPart / 100000);
  const rem1 = intPart % 100000;
  const thousands = Math.floor(rem1 / 1000);
  const hundreds = rem1 % 1000;

  return {
    lakhs: lakhs > 0 ? String(lakhs) : '——',
    thousands: thousands > 0 ? String(thousands) : '——',
    hundreds: hundreds > 0 ? String(hundreds) : '——',
    ps: ps > 0 ? String(ps) : '00',
  };
}

export const VouchersModule: React.FC<VouchersModuleProps> = ({ currentUser: _currentUser }) => {
  const [vouchers, setVouchers] = useState<VoucherItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Scan Document Modal
  const [isScanOpen, setIsScanOpen] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scannedImageUrl, setScannedImageUrl] = useState<string>('');
  const [imageRotation, setImageRotation] = useState<number>(0);
  const [isPhotoViewerOpen, setIsPhotoViewerOpen] = useState<boolean>(false);
  const [highlightedVoucherNo, setHighlightedVoucherNo] = useState<string | null>(null);

  // View Physical Slip Modal
  const [activeSlip, setActiveSlip] = useState<VoucherItem | null>(null);

  const handleClearSlate = () => {
    setVouchers([]);
    setScannedImageUrl('');
    setHighlightedVoucherNo(null);
  };

  const fetchVouchers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/vouchers');
      if (res.ok) {
        const data = await res.json();
        setVouchers(data);
      }
    } catch (err) {
      console.error('Failed to load vouchers:', err);
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
      const res = await fetch('/api/vouchers/scan', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Failed to scan voucher document');
      }
      const localUrl = URL.createObjectURL(sourceFile || file);
      const data = await res.json();
      if (data.voucher) {
        const voucherWithImg = { ...data.voucher, image_url: data.voucher.image_url || localUrl };
        setVouchers((prev) => {
          const filtered = prev.filter((v) => v.voucher_no !== data.voucher.voucher_no);
          return [voucherWithImg, ...filtered];
        });
        setHighlightedVoucherNo(data.voucher.voucher_no);
      }
      setScannedImageUrl(data.image_url || localUrl);
      setImageRotation(data.image_rotation || 0);
      setIsScanOpen(false);
    } catch (err: any) {
      alert(`Scanning Error: ${err.message || err}`);
    } finally {
      setIsScanning(false);
    }
  };

  const handleExportExcel = () => {
    const cleanData = vouchers.map((v) => {
      const { rs, ps } = parseAmount(v.amount);
      return {
        'VOUCHER NO': v.voucher_no,
        'DATE': v.date,
        'DEBIT': v.debit_account,
        'PAY TO': v.pay_to,
        'G/L CODE': v.gl_code,
        'CC/IO': v.cost_center,
        'PARTICULARS': v.particulars,
        'RS': rs,
        'PS': ps,
        'BANK': v.bank_name || '',
        'CHEQUE NO / CASH': v.cheque_no_cash,
        'PREPARED BY': v.prepared_by,
        'ACCOUNTANT': v.accountant || '',
        'SANCTIONED BY': v.sanctioned_by || '',
      };
    });
    const worksheet = XLSX.utils.json_to_sheet(cleanData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Morde_Vouchers');
    XLSX.writeFile(workbook, `Morde_Vouchers_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const filteredVouchers = vouchers.filter((v) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      v.voucher_no.toLowerCase().includes(search) ||
      v.pay_to.toLowerCase().includes(search) ||
      v.debit_account.toLowerCase().includes(search) ||
      v.gl_code.toLowerCase().includes(search) ||
      v.cost_center.toLowerCase().includes(search) ||
      v.particulars.toLowerCase().includes(search)
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner (identical to QA page) */}
      <div className="bg-white rounded-xl p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.03),0_1px_2px_-1px_rgba(0,0,0,0.03)] border border-neutral-200/90 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-md font-semibold bg-neutral-100 text-neutral-800 border border-neutral-200/80 tracking-wide">
              MORDE-VOUCHERS
            </span>
            <span className="text-xs text-neutral-500 font-medium flex items-center gap-1.5 font-mono">
              <Clock className="w-3.5 h-3.5 text-neutral-400" />
              {new Date().toLocaleDateString(undefined, {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight text-balance">
            Morde Foods Debit Vouchers
          </h1>
          <p className="text-xs text-neutral-500">
            Automated scanner and ledger for Morde Foods voucher slips.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 flex-shrink-0">
          <button
            onClick={fetchVouchers}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium text-neutral-700 bg-white hover:bg-neutral-50 border border-neutral-200/90 transition shadow-sm"
            title="Refresh List"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-neutral-500 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium text-neutral-700 bg-white hover:bg-neutral-50 border border-neutral-200/90 transition shadow-sm"
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

          {vouchers.length > 0 && (
            <button
              onClick={handleClearSlate}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium text-neutral-600 bg-white hover:bg-neutral-50 border border-neutral-200/90 transition shadow-sm hover:text-red-600"
              title="Clear vouchers and start new slate"
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
                placeholder="Filter by voucher #, pay to, debit a/c, particulars…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-50/70 hover:bg-neutral-50 focus:bg-white rounded-lg border border-neutral-200/90 focus:border-neutral-900 focus:outline-none transition text-neutral-900 placeholder:text-neutral-400 font-sans"
              />
            </div>
            <span className="text-[11px] font-mono text-neutral-400 px-2 py-1 rounded bg-neutral-100/70 hidden sm:inline-block">
              {filteredVouchers.length} {filteredVouchers.length === 1 ? 'voucher' : 'vouchers'}
            </span>
          </div>
        </div>

        {/* Data Table: Strict Morde Slip Columns */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50/70 border-b border-neutral-200 text-neutral-500 font-semibold uppercase text-[11px] tracking-wider font-mono">
                <th className="py-2.5 px-3">VOUCHER NO.</th>
                <th className="py-2.5 px-3">DATE</th>
                <th className="py-2.5 px-3">DEBIT</th>
                <th className="py-2.5 px-3">PAY TO</th>
                <th className="py-2.5 px-3">G/L CODE</th>
                <th className="py-2.5 px-3">CC/IO</th>
                <th className="py-2.5 px-3">PARTICULARS</th>
                <th className="py-2.5 px-3">CHEQUE / CASH</th>
                <th className="py-2.5 px-3 text-right">TOTAL (Rs. Ps.)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredVouchers.map((v) => {
                const { rs, ps } = parseAmount(v.amount);
                const isNew = highlightedVoucherNo === v.voucher_no;
                const needsReview = v.review_required ?? (v.amount === null || !v.date || !v.pay_to || !v.gl_code || !v.cost_center || v.coverage_status !== 'MATCH');
                return (
                  <tr
                    key={v.voucher_no}
                    className={`transition-colors ${
                      isNew ? 'bg-amber-50/70 hover:bg-amber-50' : 'hover:bg-neutral-50/70'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-mono font-semibold text-neutral-900">
                      <button
                        onClick={() => setActiveSlip(v)}
                        className="hover:underline text-neutral-900 hover:text-[#E4022D]"
                        title="View Official Morde Voucher Slip"
                      >
                        {v.voucher_no}
                      </button>
                      {Boolean(v.voucher_no_generated) && <span className="ml-1 block text-[9px] font-normal text-amber-700">system ID · source number unread</span>}
                      {needsReview && <span className="ml-1 block text-[9px] font-normal text-amber-700">review missing fields</span>}
                      {v.coverage_status && v.coverage_status !== 'MATCH' && <span className="ml-1 block text-[9px] font-normal text-amber-700">form coverage: {v.coverage_status.toLowerCase().replaceAll('_', ' ')}</span>}
                    </td>
                    <td className="py-2.5 px-3 text-neutral-600 font-mono text-xs whitespace-nowrap">
                      {v.date}
                    </td>
                    <td className="py-2.5 px-3 text-neutral-800 font-medium whitespace-nowrap">
                      {v.debit_account}
                    </td>
                    <td className="py-2.5 px-3 text-neutral-900 font-semibold whitespace-nowrap">
                      {v.pay_to}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-neutral-600">
                      {v.gl_code}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-neutral-600">
                      {v.cost_center}
                    </td>
                    <td className="py-2.5 px-3 text-neutral-600 max-w-xs truncate" title={v.particulars}>
                      {v.particulars}
                    </td>
                    <td className="py-2.5 px-3 text-neutral-600 text-xs font-mono whitespace-nowrap">
                      {v.cheque_no_cash} {v.bank_name ? `(${v.bank_name})` : ''}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-neutral-900 whitespace-nowrap">
                      ₹{rs}.<span className="text-neutral-500 text-[11px]">{ps}</span>
                    </td>
                  </tr>
                );
              })}

              {filteredVouchers.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-neutral-400">
                    No vouchers found. Click &quot;Scan Document&quot; to scan a physical voucher slip.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scan Voucher Modal */}
      <VoucherUploadModal
        isOpen={isScanOpen}
        onClose={() => setIsScanOpen(false)}
        onScanFile={handleScanFile}
        isLoading={isScanning}
      />

      {/* Scanned Photo Viewer Modal */}
      {isPhotoViewerOpen && scannedImageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-xl p-4 max-w-6xl w-full shadow-2xl border border-neutral-200 relative">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <h3 className="text-sm font-semibold text-neutral-900">
                Scanned Voucher Photo
              </h3>
              <button
                onClick={() => setIsPhotoViewerOpen(false)}
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-[78vh] overflow-auto">
              <div className="flex items-center justify-center bg-neutral-950 rounded-lg min-h-80 p-2"><DocumentPreview src={scannedImageUrl} alt="Original voucher document" rotation={imageRotation} className="max-h-[70vh] max-w-full w-auto object-contain" /></div>
              <div className="border rounded-lg overflow-auto text-sm">
                <div className="px-3 py-2 font-semibold bg-neutral-50 border-b">Extracted values — compare with source</div>
                {vouchers.find(v => v.voucher_no === highlightedVoucherNo)?.coverage_status && <div className="px-3 py-2 border-b bg-amber-50 text-amber-900">Voucher form coverage: {vouchers.find(v => v.voucher_no === highlightedVoucherNo)?.coverage_status}. {((vouchers.find(v => v.voucher_no === highlightedVoucherNo)?.coverage_missing_fields || []).length > 0) ? `Audit saw filled fields not extracted: ${vouchers.find(v => v.voucher_no === highlightedVoucherNo)?.coverage_missing_fields?.join(', ')}.` : ''} {((vouchers.find(v => v.voucher_no === highlightedVoucherNo)?.coverage_extra_fields || []).length > 0) ? `Extracted fields not confirmed by audit: ${vouchers.find(v => v.voucher_no === highlightedVoucherNo)?.coverage_extra_fields?.join(', ')}.` : ''}</div>}
                {vouchers.find(v => v.voucher_no === highlightedVoucherNo) ? Object.entries(vouchers.find(v => v.voucher_no === highlightedVoucherNo)!).filter(([key]) => !['id','created_at','image_url'].includes(key)).map(([key,value])=><div key={key} className="px-3 py-2 border-b flex gap-3"><span className="w-36 shrink-0 text-neutral-500">{key.replaceAll('_',' ')}</span><span className="break-words">{value === null || value === '' ? '—' : String(value)}</span></div>) : <div className="p-3 text-neutral-500">No extracted voucher fields.</div>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Exact Physical Morde Slip Viewer Modal */}
      {activeSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-neutral-300 relative my-8 font-sans">
            <button
              onClick={() => setActiveSlip(null)}
              className="absolute top-4 right-4 p-1 rounded-md text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 print:hidden"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Official Morde Physical Voucher Slip Document */}
            <div className="border-2 border-stone-800 p-5 bg-white text-stone-900 space-y-3 print:border-black">
              
              {/* Slip Header */}
              <div className="text-center border-b-2 border-stone-800 pb-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-stone-900 font-serif">
                  MORDE FOODS PVT. LTD.
                </h2>
                <p className="text-[10px] text-stone-600 leading-tight mt-0.5">
                  Head Office: 103, 1st Floor, Center Point Building, Dr. Baba Saheb Ambedkar Road, Parel (E), Mumbai 400 012 (INDIA)
                </p>
                <p className="text-[10px] text-stone-600 leading-tight font-medium">
                  Factory: At &amp; Post Manchar, Tal. Ambegaon, Dist. Pune.
                </p>
              </div>

              {/* Upper Details Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs font-mono pt-1">
                {/* Left col */}
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2 border-b border-stone-300 pb-0.5">
                    <span className="font-bold text-stone-700 uppercase text-[11px] shrink-0">DEBIT:</span>
                    <span className="font-semibold text-stone-900 break-words">{activeSlip.debit_account}</span>
                  </div>
                  <div className="flex items-baseline gap-2 border-b border-stone-300 pb-0.5">
                    <span className="font-bold text-stone-700 text-[11px] shrink-0">Pay to:</span>
                    <span className="font-semibold text-stone-900 break-words">{activeSlip.pay_to}</span>
                  </div>
                </div>

                {/* Right col */}
                <div className="space-y-1.5 text-right sm:text-left sm:pl-6">
                  <div className="flex items-baseline justify-between border-b border-stone-300 pb-0.5">
                    <span className="font-bold text-stone-700 uppercase text-[11px]">VOUCHER NO.:</span>
                    <span className="font-bold text-stone-900">{activeSlip.voucher_no}</span>
                  </div>
                  <div className="flex items-baseline justify-between border-b border-stone-300 pb-0.5">
                    <span className="font-bold text-stone-700 uppercase text-[11px]">DATE:</span>
                    <span className="font-semibold text-stone-900">{activeSlip.date}</span>
                  </div>
                  <div className="flex items-baseline justify-between border-b border-stone-300 pb-0.5">
                    <span className="font-bold text-stone-700 uppercase text-[11px]">G/L Code:</span>
                    <span className="font-semibold text-stone-900">{activeSlip.gl_code}</span>
                  </div>
                  <div className="flex items-baseline justify-between border-b border-stone-300 pb-0.5">
                    <span className="font-bold text-stone-700 uppercase text-[11px]">CC/IO:</span>
                    <span className="font-semibold text-stone-900">{activeSlip.cost_center}</span>
                  </div>
                </div>
              </div>

              {/* Particulars & Amount Table */}
              <div className="border-2 border-stone-800 mt-2">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="border-b-2 border-stone-800 font-bold font-mono text-[11px]">
                      <th className="py-1.5 px-3 text-center border-r-2 border-stone-800">PARTICULARS</th>
                      <th className="py-1.5 px-2 text-right w-24 border-r-2 border-stone-800">Rs.</th>
                      <th className="py-1.5 px-2 text-right w-12">Ps.</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="min-h-[140px]">
                      <td className="p-3 align-top border-r-2 border-stone-800">
                        <span className="block text-[10px] text-stone-500 font-mono italic mb-1">
                          Being amount paid towards:
                        </span>
                        <p className="text-xs text-stone-900 leading-relaxed font-sans font-medium">
                          {activeSlip.particulars}
                        </p>
                      </td>
                      <td className="p-3 align-top text-right font-mono font-bold text-sm border-r-2 border-stone-800">
                        {parseAmount(activeSlip.amount).rs}
                      </td>
                      <td className="p-3 align-top text-right font-mono font-bold text-sm">
                        {parseAmount(activeSlip.amount).ps}
                      </td>
                    </tr>
                    
                    {/* Total Row */}
                    <tr className="border-t-2 border-stone-800 font-bold font-mono">
                      <td className="py-1.5 px-3 text-right border-r-2 border-stone-800">Total</td>
                      <td className="py-1.5 px-2 text-right border-r-2 border-stone-800">
                        {parseAmount(activeSlip.amount).rs}
                      </td>
                      <td className="py-1.5 px-2 text-right">
                        {parseAmount(activeSlip.amount).ps}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Amount in words line */}
              {(() => {
                const words = amountToWords(activeSlip.amount);
                return (
                  <div className="text-[11px] font-mono border-b border-stone-400 pb-1 pt-1 leading-relaxed">
                    <span>Rs. </span>
                    <span className="font-bold underline px-1">{words.lakhs}</span>
                    <span> Lakhs </span>
                    <span className="font-bold underline px-1">{words.thousands}</span>
                    <span> Thousand </span>
                    <span className="font-bold underline px-1">{words.hundreds}</span>
                    <span> Hundred </span>
                    <span>&amp; Ps. </span>
                    <span className="font-bold underline px-1">{words.ps}</span>
                    <span> Only.</span>
                  </div>
                );
              })()}

              {/* Bank & Cheque Details */}
              <div className="grid grid-cols-2 gap-4 text-xs font-mono border-b border-stone-400 pb-2 pt-1">
                <div>
                  <span className="text-stone-600">Name of the Bank: </span>
                  <span className="font-semibold text-stone-900">{activeSlip.bank_name || '————'}</span>
                </div>
                <div>
                  <span className="text-stone-600">Cheque No./ Cash: </span>
                  <span className="font-semibold text-stone-900">{activeSlip.cheque_no_cash}</span>
                </div>
              </div>

              {/* 4 Signatures row matching physical voucher */}
              <div className="grid grid-cols-4 gap-2 pt-4 text-center text-[10px] font-mono">
                <div className="flex flex-col justify-end">
                  <div className="border-t border-stone-800 pt-1 font-semibold text-stone-900">
                    {activeSlip.prepared_by || 'Staff'}
                  </div>
                  <span className="text-stone-500 uppercase text-[9px]">Prepared by</span>
                </div>

                <div className="flex flex-col justify-end">
                  <div className="border-t border-stone-800 pt-1 font-semibold text-stone-900">
                    {activeSlip.accountant || 'Amit Deshmukh'}
                  </div>
                  <span className="text-stone-500 uppercase text-[9px]">Accountant</span>
                </div>

                <div className="flex flex-col justify-end">
                  <div className="border-t border-stone-800 pt-1 font-semibold text-stone-900">
                    {activeSlip.sanctioned_by || (
                      <span className="italic text-stone-400">Sanctioned</span>
                    )}
                  </div>
                  <span className="text-stone-500 uppercase text-[9px]">Sanctioned by</span>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-12 h-10 border border-dashed border-stone-400 mb-1 flex items-center justify-center text-[9px] text-stone-400">
                    Stamp
                  </div>
                  <div className="border-t border-stone-800 w-full pt-1">
                    <span className="text-stone-500 uppercase text-[9px]">Receiver's Signature</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end mt-4 print:hidden">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800 shadow-sm transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Slip</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
