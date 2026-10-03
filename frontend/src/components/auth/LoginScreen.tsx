import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { User as UserType } from '../../types';

interface LoginScreenProps {
  onLoginSuccess: (user: UserType, token: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMessage('Please enter your username and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password: password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Invalid username or password.');
      }

      onLoginSuccess(data.user, data.token);
    } catch (err: any) {
      setErrorMessage(err.message || 'Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-neutral-50/80 flex flex-col justify-center items-center px-4 font-sans select-none">
      <div className="w-full max-w-sm">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <img
            src="/morde-logo.png"
            alt="Morde Foods"
            className="h-8 w-auto mx-auto object-contain mb-3"
          />
          <h1 className="text-lg font-semibold text-neutral-900 tracking-tight">
            Sign in to Morde Operations
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Enter your credentials to access your section
          </p>
        </div>

        {/* Minimal Supabase Card */}
        <div className="bg-white rounded-xl border border-neutral-200/90 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.03),0_1px_2px_-1px_rgba(0,0,0,0.03)]">
          
          {errorMessage && (
            <div className="mb-4 p-2.5 bg-red-50/80 border border-red-200/80 rounded-lg text-xs text-red-700 font-medium">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username (e.g. qa_user, admin)"
                autoComplete="username"
                required
                className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-200/90 rounded-lg text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full px-3 py-1.5 pr-8 text-xs bg-white border border-neutral-200/90 rounded-lg text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-neutral-400 hover:text-neutral-600 transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-1 py-2 px-3 bg-[#E4022D] hover:bg-[#C40226] text-white text-xs font-semibold rounded-lg shadow-sm transition active:scale-[0.99] disabled:opacity-50"
            >
              {isLoading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* Minimal Quick-Login Links */}
          <div className="mt-5 pt-4 border-t border-neutral-100 text-[11px] text-neutral-500">
            <span className="block mb-2 font-medium text-neutral-600">Quick sign in:</span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickFill('qa_user', 'qa123')}
                className="px-2 py-1 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/80 rounded text-neutral-700 text-left transition truncate"
              >
                QA: <span className="font-mono text-neutral-900">qa_user</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('worker_lead', 'worker123')}
                className="px-2 py-1 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/80 rounded text-neutral-700 text-left transition truncate"
              >
                Workers: <span className="font-mono text-neutral-900">worker_lead</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('voucher_user', 'voucher123')}
                className="px-2 py-1 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/80 rounded text-neutral-700 text-left transition truncate"
              >
                Vouchers: <span className="font-mono text-neutral-900">voucher_user</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('admin', 'admin123')}
                className="px-2 py-1 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/80 rounded text-neutral-700 text-left transition truncate"
              >
                Admin: <span className="font-mono text-neutral-900">admin</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
