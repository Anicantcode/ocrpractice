import React, { useState } from 'react';
import { 
  X, Database, Key, Globe, Shield, CheckCircle2, 
  AlertCircle, ExternalLink, RefreshCw 
} from 'lucide-react';
import { SapStatus } from '../types';

interface SapConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStatus: SapStatus | null;
  onSaveConfig: (mode: string, apiKey?: string, prodUrl?: string, plant?: string) => Promise<void>;
  onTestConnection: () => Promise<{ success: boolean; message: string }>;
}

export const SapConfigModal: React.FC<SapConfigModalProps> = ({
  isOpen,
  onClose,
  currentStatus,
  onSaveConfig,
  onTestConnection,
}) => {
  const [mode, setMode] = useState<string>(currentStatus?.mode || 'MOCK');
  const [apiKey, setApiKey] = useState<string>('');
  const [prodUrl, setProdUrl] = useState<string>(currentStatus?.prod_url || '');
  const [plant, setPlant] = useState<string>(currentStatus?.plant || '1000');
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveConfig(mode, apiKey, prodUrl, plant);
      onClose();
    } catch (err: any) {
      alert(`Error saving configuration: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await onTestConnection();
      setTestResult(res);
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Connection failed' });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1B0B07]/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-[#E8DEC9] flex flex-col max-h-[92vh] morde-card-accent">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-[#3D2015] bg-[#1B0B07] text-white">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-[#E4022D] flex items-center justify-center shadow-md">
              <Database className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">SAP Connection Settings</h3>
              <p className="text-xs text-[#EACB85]/80">
                Configure SAP QM system endpoint and plant parameters
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close configuration modal"
            className="p-1.5 rounded-full text-[#EACB85]/70 hover:text-white hover:bg-[#2F150C] transition focus-visible:ring-2 focus-visible:ring-[#EACB85] focus-visible:outline-none"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          
          {/* Free Access Guide Box */}
          <div className="rounded-xl border border-[#EACB85]/60 bg-[#FAF3E3] p-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-[#1B0B07] flex items-center space-x-1.5">
                <span>Free SAP Integration Architecture</span>
              </span>
              <a
                href="https://api.sap.com"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-semibold text-[#E4022D] hover:underline flex items-center space-x-1"
              >
                <span>SAP Accelerator Hub</span>
                <ExternalLink className="w-3 h-3" aria-hidden="true" />
              </a>
            </div>
            <p className="text-[11px] text-[#7D5843] leading-relaxed">
              No paid enterprise SAP account is needed to demo this system. Use our <strong>Local SAP Mock Simulator</strong> (active now), or plug in a free developer key from <strong>api.sap.com</strong> to test against live SAP S/4HANA QM API endpoints.
            </p>
          </div>

          {/* Mode Selector */}
          <div>
            <label className="block text-xs font-bold text-[#1B0B07] uppercase tracking-wider mb-2">
              Select SAP Integration Mode
            </label>
            <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="SAP Integration Modes">
              {[
                {
                  id: 'MOCK',
                  title: 'Local SAP QM Simulator',
                  desc: 'Zero-config local OData/RFC mock server with authentic 01-lots & UD decisions.',
                  badge: 'Free / Active',
                },
                {
                  id: 'SANDBOX',
                  title: 'SAP Accelerator Hub',
                  desc: 'Official cloud sandbox at api.sap.com with live S/4HANA QM API.',
                  badge: 'Free SAP Cloud',
                },
                {
                  id: 'PROD_ODATA',
                  title: 'Morde S/4HANA OData',
                  desc: 'Connect to live Morde Foods SAP S/4HANA Cloud / on-premise service.',
                  badge: 'Enterprise Production',
                },
                {
                  id: 'PROD_GUI',
                  title: 'SAP WinGUI Desktop Script',
                  desc: 'Automates SAP Windows desktop client via Win32 COM (QE51N / QA32).',
                  badge: 'Plant Workstation',
                },
              ].map((item) => (
                <div
                  key={item.id}
                  role="radio"
                  aria-checked={mode === item.id}
                  tabIndex={0}
                  onClick={() => setMode(item.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setMode(item.id);
                    }
                  }}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition relative flex flex-col justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E4022D] ${
                    mode === item.id
                      ? 'border-[#E4022D] bg-[#FFF0F2]/50 shadow-sm'
                      : 'border-[#E8DEC9] hover:border-[#D4A853] bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#1B0B07]">{item.title}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold bg-[#F5EFE6] text-[#7D5843]">
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#7D5843] mt-1 leading-snug">{item.desc}</p>
                  </div>
                  {mode === item.id && (
                    <div className="mt-2 flex items-center space-x-1 text-[11px] text-[#E4022D] font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Selected Target</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Mode-specific configuration inputs */}
          {mode === 'SANDBOX' && (
            <div className="space-y-3 p-3.5 rounded-xl bg-[#FDFBF7] border border-[#E8DEC9]">
              <div>
                <label htmlFor="sap-api-key" className="block text-xs font-semibold text-[#1B0B07] mb-1 flex items-center justify-between">
                  <span>SAP API Key (from api.sap.com)</span>
                  <a
                    href="https://api.sap.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-[#E4022D] underline font-bold"
                  >
                    Get Free Key
                  </a>
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7D5843]" aria-hidden="true" />
                  <input
                    id="sap-api-key"
                    name="api_key"
                    type="password"
                    autoComplete="off"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Paste your SAP APIKey here…"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#D4A853]/40 bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E4022D]/20 focus-visible:border-[#E4022D] font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {mode === 'PROD_ODATA' && (
            <div className="space-y-3 p-3.5 rounded-xl bg-[#FDFBF7] border border-[#E8DEC9]">
              <div>
                <label htmlFor="sap-prod-url" className="block text-xs font-semibold text-[#1B0B07] mb-1">
                  Morde SAP S/4HANA OData Endpoint URL
                </label>
                <input
                  id="sap-prod-url"
                  name="prod_url"
                  type="url"
                  autoComplete="off"
                  value={prodUrl}
                  onChange={(e) => setProdUrl(e.target.value)}
                  placeholder="https://morde-sap.internal/sap/opu/odata/sap/API_INSPECTIONLOT_SRV…"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#D4A853]/40 bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E4022D]/20 focus-visible:border-[#E4022D] font-mono"
                />
              </div>
            </div>
          )}

          {/* Plant Code Input */}
          <div>
            <label htmlFor="sap-config-plant" className="block text-xs font-bold text-[#1B0B07] mb-1">
              Plant Code (WERKS)
            </label>
            <input
              id="sap-config-plant"
              name="plant"
              type="text"
              autoComplete="off"
              value={plant}
              onChange={(e) => setPlant(e.target.value)}
              className="w-56 px-3 py-2 text-xs rounded-lg border border-[#D4A853]/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E4022D]/20 focus-visible:border-[#E4022D] font-mono font-bold text-[#1B0B07]"
              placeholder="1000"
            />
          </div>

          {/* Test Connection Result Box */}
          {testResult && (
            <div
              role="status"
              aria-live="polite"
              className={`p-3.5 rounded-xl border text-xs flex items-start space-x-2.5 ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-medium'
                  : 'bg-rose-50 border-rose-300 text-rose-950 font-medium'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
              )}
              <div className="leading-snug">{testResult.message}</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#FDFBF7] border-t border-[#E8DEC9] flex items-center justify-between">
          <button
            type="button"
            onClick={handleTest}
            disabled={isTesting}
            aria-label="Test SAP QM connection"
            className="flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-semibold text-[#1B0B07] bg-white border border-[#D4A853]/50 hover:bg-[#FAF3E3] transition disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-[#E4022D] focus-visible:outline-none"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#E4022D] ${isTesting ? 'animate-spin motion-reduce:animate-none' : ''}`} aria-hidden="true" />
            <span>Test Connection</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#7D5843] hover:text-[#1B0B07] transition focus-visible:ring-2 focus-visible:ring-[#7D5843] focus-visible:outline-none"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 rounded-full bg-[#E4022D] hover:bg-[#C40226] text-white text-xs font-bold shadow-md shadow-red-950/20 disabled:opacity-50 transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#E4022D] focus-visible:outline-none"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
