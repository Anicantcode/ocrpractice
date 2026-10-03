import React, { useState, useEffect } from 'react';
import { 
  X, Database, CheckCircle2, Clock, Search, RefreshCw, 
  ExternalLink, Copy, Check, FileSpreadsheet, ShieldCheck, Tag
} from 'lucide-react';
import { SapLotRecord, SapLogEntry } from '../types';

interface SapHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  sapMode?: string;
}

export const SapHistoryModal: React.FC<SapHistoryModalProps> = ({
  isOpen,
  onClose,
  sapMode = 'SANDBOX',
}) => {
  const [lots, setLots] = useState<SapLotRecord[]>([]);
  const [logs, setLogs] = useState<SapLogEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'lots' | 'logs'>('lots');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen]);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const [lotsRes, logsRes] = await Promise.all([
        fetch('/api/sap/lots'),
        fetch('/api/sap/history'),
      ]);
      if (lotsRes.ok) {
        const lotsData = await lotsRes.json();
        setLots(lotsData);
      }
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setLogs(logsData);
      }
    } catch (err) {
      console.error('Failed to fetch SAP history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredLots = lots.filter(
    (l) =>
      l.inspection_lot?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.batch?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const copyAllJson = () => {
    const dataToCopy = activeTab === 'lots' ? lots : logs;
    navigator.clipboard.writeText(JSON.stringify(dataToCopy, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1B0B07]/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-[#E8DEC9] flex flex-col max-h-[90vh] morde-card-accent">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-[#3D2015] bg-[#1B0B07] text-white">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-[#E4022D] flex items-center justify-center shadow-md">
              <Database className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white tracking-tight">SAP QM Inspection Records</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EACB85] text-[#1B0B07]">
                  {sapMode}
                </span>
              </div>
              <p className="text-xs text-[#EACB85]/80">
                View saved inspection lot objects, usage decisions, and audit history
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close SAP records viewer"
            className="p-1.5 rounded-full text-[#EACB85]/70 hover:text-white hover:bg-[#2F150C] transition focus-visible:ring-2 focus-visible:ring-[#EACB85] focus-visible:outline-none"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Toolbar & Tabs */}
        <div className="p-4 border-b border-[#E8DEC9] bg-[#FDFBF7] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('lots')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                activeTab === 'lots'
                  ? 'bg-[#1B0B07] text-[#EACB85] shadow'
                  : 'bg-white text-[#7D5843] border border-[#E8DEC9] hover:bg-[#FAF3E3]'
              }`}
            >
              Inspection Lots ({lots.length})
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                activeTab === 'logs'
                  ? 'bg-[#1B0B07] text-[#EACB85] shadow'
                  : 'bg-white text-[#7D5843] border border-[#E8DEC9] hover:bg-[#FAF3E3]'
              }`}
            >
              Sync Audit Logs ({logs.length})
            </button>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#7D5843]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search lot or batch..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-full border border-[#D4A853]/40 bg-white focus:outline-none focus:ring-2 focus:ring-[#E4022D]"
              />
            </div>
            <button
              onClick={fetchHistory}
              disabled={isLoading}
              title="Refresh records"
              className="p-1.5 rounded-full bg-white border border-[#D4A853]/40 text-[#7D5843] hover:text-[#1B0B07] transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {activeTab === 'lots' ? (
            <div className="space-y-3">
              {filteredLots.length === 0 ? (
                <div className="p-8 text-center text-[#7D5843] text-xs">
                  No inspection lots found matching your filter.
                </div>
              ) : (
                <div className="border border-[#E8DEC9] rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-xs text-left" aria-label="Recorded SAP Inspection Lots">
                    <thead className="bg-[#1B0B07] text-[#EACB85] font-semibold">
                      <tr>
                        <th className="p-2.5">Inspection Lot #</th>
                        <th className="p-2.5">Batch</th>
                        <th className="p-2.5">Usage Decision</th>
                        <th className="p-2.5">Lab Characteristics</th>
                        <th className="p-2.5">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EFE7D8] text-[11px]">
                      {filteredLots.map((lot, idx) => (
                        <tr key={idx} className="hover:bg-[#FFF8EC] transition">
                          <td className="p-2.5 font-mono font-bold text-[#E4022D]">
                            {lot.inspection_lot}
                          </td>
                          <td className="p-2.5 font-semibold text-[#1B0B07]">{lot.batch}</td>
                          <td className="p-2.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              {lot.usage_decision || 'UD: Accepted'}
                            </span>
                          </td>
                          <td className="p-2.5">
                            {lot.recorded_results ? (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {Object.entries(lot.recorded_results).map(([k, v]) => {
                                  const displayKey = k.toLowerCase().includes('fat') ? 'COCO %' : (k.toLowerCase().includes('moist') ? 'SUGAR %' : k);
                                  return (
                                    <span
                                      key={k}
                                      className="px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-800 text-[10px] font-mono"
                                    >
                                      {displayKey}: {String(v)}
                                    </span>
                                  );
                                })}
                              </div>
                            ) : (
                              <span className="text-neutral-400">None</span>
                            )}
                          </td>
                          <td className="p-2.5 text-neutral-500 font-mono text-[10px]">
                            {lot.sync_timestamp ? lot.sync_timestamp.replace('T', ' ').slice(0, 19) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            /* Sync Audit Logs Tab */
            <div className="space-y-3">
              {logs.length === 0 ? (
                <div className="p-8 text-center text-[#7D5843] text-xs">
                  No sync audit logs recorded yet.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3.5 rounded-xl border border-[#E8DEC9] bg-[#FDFBF7] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-[#1B0B07]">{log.report_id || 'REPORT'}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                            {log.status}
                          </span>
                          <span className="text-[10px] text-neutral-500 font-mono">
                            Mode: {log.sap_mode}
                          </span>
                        </div>
                        <p className="text-[#7D5843] text-[11px]">
                          Committed {log.processed_count} batch lots into SAP QM
                        </p>
                      </div>

                      <div className="flex items-center space-x-2 text-[11px] text-neutral-500 font-mono">
                        <Clock className="w-3.5 h-3.5 text-[#B8882C]" />
                        <span>{log.timestamp.replace('T', ' ').slice(0, 19)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#FDFBF7] border-t border-[#E8DEC9] flex items-center justify-between">
          <button
            onClick={copyAllJson}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#1B0B07] bg-white border border-[#D4A853]/50 hover:bg-[#FAF3E3] transition focus-visible:ring-2 focus-visible:ring-[#E4022D] focus-visible:outline-none"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#E4022D]" />}
            <span>{copied ? 'Copied Full JSON' : 'Export JSON'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-[#1B0B07] hover:bg-[#2C130A] text-[#EACB85] text-xs font-bold shadow transition border border-[#D4A853]/40 focus-visible:ring-2 focus-visible:ring-[#EACB85] focus-visible:outline-none"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
