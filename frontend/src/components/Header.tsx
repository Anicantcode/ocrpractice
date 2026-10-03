import React, { useState, useRef, useEffect } from 'react';
import { Settings, Smartphone, Database, FileSpreadsheet, ChevronRight, LogOut } from 'lucide-react';
import { SapStatus, User, ModuleId } from '../types';

interface HeaderProps {
  user: User | null;
  currentModule: ModuleId;
  onNavigate: (module: ModuleId) => void;
  onLogout: () => void;
  sapStatus: SapStatus | null;
  onOpenSettings?: () => void;
  onOpenHistory?: () => void;
  canInstall: boolean;
  onInstall: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  currentModule,
  onNavigate,
  onLogout,
  sapStatus,
  onOpenSettings,
  onOpenHistory,
  canInstall,
  onInstall,
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    };
    if (isSettingsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSettingsOpen]);

  const titles: Record<ModuleId, { title: string; subtitle: string }> = {
    qa: {
      title: 'Quality Report Scanner',
      subtitle: 'Scan, edit and sync quality sheets to SAP',
    },
    workers: {
      title: 'Loader Working Detail',
      subtitle: 'Morde Foods Pvt Ltd Manchar • Floor operations & pallet logs',
    },
    vouchers: {
      title: 'Petty Cash & Vouchers',
      subtitle: 'Record and authorize factory expenses and slips',
    },
  };

  const isMultiModule = user && (user.role === 'admin' || user.allowed_modules.length > 1);

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl backdrop-saturate-150 border-b border-black/[0.08] shadow-[0_1px_3px_0_rgba(0,0,0,0.03)] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Morde Brand & Section Title */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <img
                src="/morde-logo.png"
                alt="Morde Logo"
                width="112"
                height="32"
                className="h-7 sm:h-8 w-auto object-contain"
              />
            </div>
            
            <div className="border-l border-neutral-200/90 pl-3 sm:pl-4">
              <span className="block font-semibold text-sm sm:text-lg tracking-tight text-[#1B0B07]">
                {titles[currentModule]?.title || 'Factory Operations'}
              </span>
              <p className="text-[11px] text-neutral-500 font-normal hidden sm:block">
                {titles[currentModule]?.subtitle || 'Morde Foods Pvt. Ltd.'}
              </p>
            </div>
          </div>

          {/* Minimal Supabase-Style Section Tabs (for Admins / Multi-Module Users) */}
          {isMultiModule && (
            <div className="flex items-center p-0.5 bg-neutral-100/80 border border-neutral-200/80 rounded-lg">
              <button
                onClick={() => onNavigate('qa')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                  currentModule === 'qa'
                    ? 'bg-white text-neutral-900 shadow-[0_1px_2px_rgba(0,0,0,0.04)] font-semibold'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                QA
              </button>
              <button
                onClick={() => onNavigate('workers')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                  currentModule === 'workers'
                    ? 'bg-white text-neutral-900 shadow-[0_1px_2px_rgba(0,0,0,0.04)] font-semibold'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Workers
              </button>
              <button
                onClick={() => onNavigate('vouchers')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                  currentModule === 'vouchers'
                    ? 'bg-white text-neutral-900 shadow-[0_1px_2px_rgba(0,0,0,0.04)] font-semibold'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Vouchers
              </button>
            </div>
          )}

          {/* Right Action Menu: User info, Settings (if QA), and Logout */}
          <div className="flex items-center space-x-3">
            {/* QA Settings Button (Only on QA) */}
            {currentModule === 'qa' && onOpenSettings && (
              <div className="relative" ref={settingsRef}>
                <button
                  onClick={() => setIsSettingsOpen((prev) => !prev)}
                  className={`p-2 rounded-full text-neutral-600 hover:text-neutral-900 border transition relative focus-visible:ring-2 focus-visible:ring-[#E4022D] focus-visible:outline-none ${
                    isSettingsOpen
                      ? 'bg-neutral-100 border-neutral-300 text-neutral-900 shadow-inner'
                      : 'bg-black/[0.03] hover:bg-black/[0.06] active:bg-black/[0.09] border-black/[0.08]'
                  }`}
                  title="SAP Options"
                  aria-label="Toggle settings"
                >
                  <Settings className="w-4 h-4" />
                  <span
                    className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white"
                    title={`SAP Connected (${sapStatus?.mode || 'MOCK'})`}
                  />
                </button>

                {isSettingsOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white/95 backdrop-blur-xl border border-neutral-200/90 rounded-xl shadow-xl p-2 z-50 text-xs">
                    <div className="px-2 py-1.5 border-b border-neutral-100 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                        SAP QM Configuration
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setIsSettingsOpen(false);
                        onOpenSettings();
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-neutral-50 transition text-left"
                    >
                      <div className="flex items-center space-x-2">
                        <Database className="w-4 h-4 text-neutral-600" />
                        <div>
                          <p className="font-semibold text-neutral-800">Connection Mode</p>
                          <p className="text-[11px] text-neutral-500 font-mono">{sapStatus?.mode || 'MOCK'}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                    </button>

                    {onOpenHistory && (
                      <button
                        onClick={() => {
                          setIsSettingsOpen(false);
                          onOpenHistory();
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-neutral-50 transition text-left"
                      >
                        <div className="flex items-center space-x-2">
                          <FileSpreadsheet className="w-4 h-4 text-[#E4022D]" />
                          <div>
                            <p className="font-semibold text-neutral-800">Saved Lots</p>
                            <p className="text-[11px] text-neutral-500">Audit logs</p>
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                      </button>
                    )}

                    {canInstall && (
                      <button
                        onClick={() => {
                          setIsSettingsOpen(false);
                          onInstall();
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-neutral-50 transition text-left border-t border-neutral-100 mt-1 pt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <Smartphone className="w-4 h-4 text-neutral-600" />
                          <span className="font-semibold text-neutral-800">Install PWA</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* User display & logout */}
            {user && (
              <div className="flex items-center space-x-2.5 pl-2 border-l border-neutral-200">
                <div className="text-right hidden sm:block">
                  <span className="block text-xs font-semibold text-neutral-900 leading-tight">
                    {user.full_name}
                  </span>
                  <span className="block text-[10px] text-neutral-400 font-mono capitalize">
                    {user.role === 'admin' ? 'Admin' : user.role}
                  </span>
                </div>

                <button
                  onClick={onLogout}
                  className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition"
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
