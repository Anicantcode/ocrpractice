import React, { useState } from 'react';
import { 
  X, Send, CheckCircle2, AlertCircle, Database, 
  ExternalLink, FileCheck, Copy, Check 
} from 'lucide-react';
import { QualityRow, SapStatus, SapSyncResponse } from '../types';

interface SapSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  rows: QualityRow[];
  sapStatus: SapStatus | null;
  onSync: (plant: string) => Promise<SapSyncResponse>;
  reportId?: string;
}

export const SapSyncModal: React.FC<SapSyncModalProps> = ({
  isOpen,
  onClose,
  rows,
  sapStatus,
  onSync,
  reportId,
}) => {
  const [plant, setPlant] = useState(sapStatus?.plant || '1000');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [syncResponse, setSyncResponse] = useState<SapSyncResponse | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleStartSync = async () => {
    setIsSubmitting(true);
    try {
      const res = await onSync(plant);
      setSyncResponse(res);
    } catch (err: any) {
      alert(`SAP QM Sync failed: ${err.message || err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyReceipt = () => {
    if (syncResponse) {
      navigator.clipboard.writeText(JSON.stringify(syncResponse, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1B0B07]/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-[#E8DEC9] flex flex-col max-h-[90vh] morde-card-accent">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-[#3D2015] bg-[#1B0B07] text-white">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-[#E4022D] flex items-center justify-center shadow-md">
              <Database className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white tracking-tight">SAP QM Sync</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EACB85] text-[#1B0B07]">
                  QE51N
                </span>
              </div>
              <p className="text-xs text-[#EACB85]/80">
                Commit inspected batch results to SAP QM
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close SAP sync dialog"
            className="p-1.5 rounded-full text-[#EACB85]/70 hover:text-white hover:bg-[#2F150C] transition focus-visible:ring-2 focus-visible:ring-[#EACB85] focus-visible:outline-none"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {!syncResponse ? (
            <>
              {/* SAP Environment Banner */}
              <div className="p-4 rounded-xl border border-[#EACB85]/50 bg-[#FAF3E3]/60 flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-[#1B0B07] text-[#EACB85] mt-0.5">
                  <Database className="w-4 h-4" aria-hidden="true" />
                </div>
                <div className="text-xs">
                  <div className="font-bold text-[#1B0B07] flex items-center gap-1.5">
                    <span>Target SAP System: {sapStatus?.mode === 'MOCK' ? 'Local QM Simulator' : sapStatus?.mode}</span>
                  </div>
                  <p className="text-[#7D5843] mt-1 leading-relaxed">
                    {sapStatus?.mode === 'MOCK'
                      ? 'Simulates SAP Result Recording (QE51N) and generates inspection lots with usage decisions.'
                      : `Connecting to SAP Endpoint: ${sapStatus?.sandbox_url || sapStatus?.prod_url}`}
                  </p>
                </div>
              </div>

              {/* Plant selection & summary */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="sap-plant-input" className="block text-xs font-bold text-[#1B0B07] mb-1">
                    Plant Code (WERKS)
                  </label>
                  <input
                    id="sap-plant-input"
                    name="plant"
                    type="text"
                    autoComplete="off"
                    value={plant}
                    onChange={(e) => setPlant(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#D4A853]/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E4022D]/20 focus-visible:border-[#E4022D] font-mono font-semibold"
                    placeholder="e.g. 1000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1B0B07] mb-1">
                    Verified Batches
                  </label>
                  <div className="px-3 py-2 text-xs font-bold bg-[#FDFBF7] rounded-lg text-[#1B0B07] border border-[#E8DEC9]">
                    {rows.length} Batches Ready
                  </div>
                </div>
              </div>

              {/* Preview table snippet */}
              <div>
                <label className="block text-xs font-bold text-[#1B0B07] mb-1.5">
                  SAP QM Payload
                </label>
                <div className="border border-[#E8DEC9] rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                  <table className="w-full text-[11px] text-left">
                    <thead className="bg-[#1B0B07] text-[#EACB85]">
                      <tr>
                        <th className="p-2.5">Batch</th>
                        <th className="p-2.5">Coco %</th>
                        <th className="p-2.5">Sugar %</th>
                        <th className="p-2.5">pH</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EFE7D8] font-sans">
                      {rows.slice(0, 5).map((r, i) => (
                        <tr key={i} className="hover:bg-[#FFF8EC]">
                          <td className="p-2.5 font-mono font-bold text-[#1B0B07]">{r['Batch Number']}</td>
                          <td className="p-2.5 font-semibold text-[#1B0B07]">{r['fat %']}%</td>
                          <td className="p-2.5 font-semibold text-[#1B0B07]">{r['moisture %']}%</td>
                          <td className="p-2.5 font-semibold text-[#1B0B07]">{r['ph']}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            /* Results Screen after Sync */
            <div className="space-y-4" role="status" aria-live="polite">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center space-x-3.5">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 flex-shrink-0" aria-hidden="true" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-950">SAP QM Results Confirmed &amp; Recorded</h4>
                  <p className="text-xs text-emerald-700">
                    Successfully committed {syncResponse.processed_count} lots into SAP QM Plant {plant} (Status: {syncResponse.status})
                  </p>
                </div>
              </div>

              {/* Inspection Lots List */}
              <div className="border border-[#E8DEC9] rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full text-xs text-left" aria-label="Committed SAP inspection lots">
                  <thead className="bg-[#1B0B07] text-[#EACB85] font-semibold">
                    <tr>
                      <th className="p-2.5">Inspection Lot #</th>
                      <th className="p-2.5">Batch</th>
                      <th className="p-2.5">Usage Decision</th>
                      <th className="p-2.5">Material Doc</th>
                      <th className="p-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFE7D8] font-mono text-[11px]">
                    {syncResponse.results.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#FFF8EC]">
                        <td className="p-2.5 font-bold text-[#E4022D]">{item.inspection_lot || '-'}</td>
                        <td className="p-2.5 text-[#1B0B07] font-semibold">{item.batch || '-'}</td>
                        <td className="p-2.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.usage_decision?.startsWith('A')
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {item.usage_decision || 'UD: Accepted'}
                          </span>
                        </td>
                        <td className="p-2.5 text-[#7D5843]">{item.sap_document_number || 'Posted'}</td>
                        <td className="p-2.5 text-emerald-600 font-bold">{item.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Errors if any */}
              {syncResponse.errors && syncResponse.errors.length > 0 && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 space-y-1" role="alert">
                  <div className="font-semibold flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4 text-rose-600" aria-hidden="true" />
                    <span>Errors Encountered:</span>
                  </div>
                  {syncResponse.errors.map((err, eIdx) => (
                    <div key={eIdx} className="text-[11px]">{err}</div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#FDFBF7] border-t border-[#E8DEC9] flex items-center justify-between">
          {syncResponse ? (
            <>
              <button
                onClick={copyReceipt}
                aria-label="Copy SAP transaction receipt JSON"
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#1B0B07] bg-white border border-[#D4A853]/50 hover:bg-[#FAF3E3] transition focus-visible:ring-2 focus-visible:ring-[#E4022D] focus-visible:outline-none"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" /> : <Copy className="w-3.5 h-3.5 text-[#E4022D]" aria-hidden="true" />}
                <span>{copied ? 'Copied SAP JSON' : 'Copy SAP Receipt'}</span>
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-full bg-[#1B0B07] hover:bg-[#2C130A] text-[#EACB85] text-xs font-bold shadow transition border border-[#D4A853]/40 focus-visible:ring-2 focus-visible:ring-[#EACB85] focus-visible:outline-none"
              >
                Done
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-[#7D5843] hover:text-[#1B0B07] transition focus-visible:ring-2 focus-visible:ring-[#7D5843] focus-visible:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={handleStartSync}
                disabled={isSubmitting || rows.length === 0}
                className="px-6 py-2.5 rounded-full bg-[#E4022D] hover:bg-[#C40226] text-white text-xs sm:text-sm font-bold shadow-md shadow-red-950/30 disabled:opacity-50 transition flex items-center space-x-2 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#E4022D] focus-visible:outline-none"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin motion-reduce:animate-none" aria-hidden="true" />
                    <span>Transmitting to SAP QE51N…</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" aria-hidden="true" />
                    <span>Confirm &amp; Transmit to SAP</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
