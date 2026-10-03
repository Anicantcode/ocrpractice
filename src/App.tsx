import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LoginScreen } from './components/auth/LoginScreen';
import { QaModule } from './components/qa/QaModule';
import { WorkersModule } from './components/workers/WorkersModule';
import { VouchersModule } from './components/vouchers/VouchersModule';
import { InstallPwaBanner } from './components/InstallPwaBanner';
import { User, ModuleId, SapStatus } from './types';

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => (typeof window !== 'undefined' ? localStorage.getItem('morde_auth_token') : null));
  const [currentModule, setCurrentModule] = useState<ModuleId>('qa');
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);

  // System & PWA State
  const [sapStatus, setSapStatus] = useState<SapStatus | null>(null);
  const [paddleReady, setPaddleReady] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstall, setCanInstall] = useState<boolean>(false);

  // Global SAP Modals
  const [isSapConfigOpen, setIsSapConfigOpen] = useState<boolean>(false);
  const [isSapHistoryOpen, setIsSapHistoryOpen] = useState<boolean>(false);

  useEffect(() => {
    verifyExistingSession();
    fetchHealthAndStatus();

    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const verifyExistingSession = async () => {
    const savedToken = localStorage.getItem('morde_auth_token');
    if (!savedToken) {
      setIsAuthChecking(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${savedToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setToken(savedToken);
        setCurrentModule(data.user.default_module || 'qa');
      } else {
        localStorage.removeItem('morde_auth_token');
        setUser(null);
        setToken(null);
      }
    } catch (err) {
      console.warn('Session verification error:', err);
    } finally {
      setIsAuthChecking(false);
    }
  };

  const fetchHealthAndStatus = async () => {
    try {
      const [hRes, sRes] = await Promise.all([
        fetch('/api/health'),
        fetch('/api/sap/status'),
      ]);
      if (hRes.ok) {
        const hData = await hRes.json();
        setPaddleReady(hData.paddle_ready);
      }
      if (sRes.ok) {
        const sData = await sRes.json();
        setSapStatus(sData);
      }
    } catch (err) {
      console.warn('Backend connection note:', err);
    }
  };

  const handleLoginSuccess = (authenticatedUser: User, sessionToken: string) => {
    localStorage.setItem('morde_auth_token', sessionToken);
    setUser(authenticatedUser);
    setToken(sessionToken);
    setCurrentModule(authenticatedUser.default_module || 'qa');
  };

  const handleLogout = async () => {
    try {
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ token }),
        });
      }
    } catch (err) {
      console.warn('Logout notification error:', err);
    } finally {
      localStorage.removeItem('morde_auth_token');
      setUser(null);
      setToken(null);
      setCurrentModule('qa');
    }
  };

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setCanInstall(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleNavigate = (module: ModuleId) => {
    if (!user) return;
    if (user.role === 'admin' || user.allowed_modules.includes(module) || module === user.default_module) {
      setCurrentModule(module);
    }
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-3">
          <img src="/morde-logo.png" alt="Morde Logo" className="h-7 w-auto object-contain" />
          <div className="w-5 h-5 border-2 border-neutral-300 border-t-[#E4022D] rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] font-sans selection:bg-[#E4022D]/15 selection:text-[#E4022D]">
      
      {/* PWA Install Notification Bar */}
      <InstallPwaBanner onInstall={handleInstallApp} canInstall={canInstall} />

      {/* Main Header */}
      <Header
        user={user}
        currentModule={currentModule}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        sapStatus={sapStatus}
        onOpenSettings={() => setIsSapConfigOpen(true)}
        onOpenHistory={() => setIsSapHistoryOpen(true)}
        canInstall={canInstall}
        onInstall={handleInstallApp}
      />

      {/* Main Content View */}
      <main id="main-content" tabIndex={-1} className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 focus:outline-none">
        {currentModule === 'qa' && (
          <QaModule
            sapStatus={sapStatus}
            paddleReady={paddleReady}
            onRefreshSapStatus={fetchHealthAndStatus}
            isSapConfigOpen={isSapConfigOpen}
            onCloseSapConfig={() => setIsSapConfigOpen(false)}
            isSapHistoryOpen={isSapHistoryOpen}
            onCloseSapHistory={() => setIsSapHistoryOpen(false)}
          />
        )}

        {currentModule === 'workers' && (
          <WorkersModule />
        )}

        {currentModule === 'vouchers' && (
          <VouchersModule currentUser={user} />
        )}
      </main>

    </div>
  );
}

export default App;
