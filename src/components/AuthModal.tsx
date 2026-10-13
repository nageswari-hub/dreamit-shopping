import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { UserRole } from '../types';
import {
  X,
  User,
  ShieldCheck,
  Mail,
  KeyRound,
  ArrowRight,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalRole,
    setAuthModalRole,
    login,
    register,
  } = useShop();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'login') {
      const res = login(email, authModalRole);
      if (!res.success) {
        setError(res.message);
      }
    } else {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      const res = register(name, email, authModalRole);
      if (!res.success) {
        setError(res.message);
      }
    }
  };

  const handleQuickDemo = (role: UserRole) => {
    if (role === 'admin') {
      login('admin@dreamit.com', 'admin');
    } else {
      login('user@dreamit.com', 'customer');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
    >
      <div className="fixed inset-0" onClick={closeAuthModal} />

      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 z-20 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-6 sm:p-8 text-center pb-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-md shadow-brand-500/25 mb-3">
            {authModalRole === 'admin' ? (
              <ShieldCheck className="w-6 h-6" />
            ) : (
              <ShoppingBag className="w-6 h-6" />
            )}
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            {authModalRole === 'admin' ? 'Administrator Portal' : 'Customer Account'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {authModalRole === 'admin'
              ? 'Secure access to DreamIT Mall financials, orders, and SKU inventory'
              : 'Sign in to access your orders, saved wishlist, and express checkout'}
          </p>

          {/* Role Toggle Tabs */}
          <div className="grid grid-cols-2 gap-2 mt-4 p-1 rounded-xl bg-slate-200/80 dark:bg-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setAuthModalRole('customer');
                setError(null);
              }}
              className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                authModalRole === 'customer'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Customer</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthModalRole('admin');
                setError(null);
              }}
              className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                authModalRole === 'admin'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Administrator</span>
            </button>
          </div>
        </div>

        {/* Modal Form */}
        <div className="p-6 sm:p-8 pt-6 space-y-5">
          {/* Quick Demo Login Pill */}
          <div className="p-3 rounded-2xl bg-brand-50/80 dark:bg-brand-950/40 border border-brand-200/80 dark:border-brand-900/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-brand-900 dark:text-brand-200">
              <Sparkles className="w-4 h-4 text-brand-600 flex-shrink-0" />
              <span className="font-semibold">
                Quick Test as {authModalRole === 'admin' ? 'Admin' : 'Customer'}?
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleQuickDemo(authModalRole)}
              className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-bold text-[11px] shadow-xs transition-all cursor-pointer"
            >
              1-Click Demo
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {mode === 'register' && (
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Mercer"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    authModalRole === 'admin' ? 'admin@dreamit.com' : 'user@dreamit.com'
                  }
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Password
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-rose-500 font-semibold p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-brand-600 dark:hover:bg-brand-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Mode Switcher */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500">
            {mode === 'login' ? (
              <p>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError(null);
                  }}
                  className="text-brand-600 dark:text-brand-400 font-bold hover:underline cursor-pointer"
                >
                  Register now
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                  }}
                  className="text-brand-600 dark:text-brand-400 font-bold hover:underline cursor-pointer"
                >
                  Log in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
