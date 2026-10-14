import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { UserRole } from '../types';
import { AUTHORIZED_ADMIN_EMAIL } from '../data/mockProducts';
import {
  X,
  User,
  ShieldCheck,
  Mail,
  KeyRound,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Phone,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Smartphone,
  Send,
  ExternalLink,
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalRole,
    setAuthModalRole,
    authModalMode,
    setAuthModalMode,
    login,
    register,
    sendOtp,
    resetPasswordWithOtp,
  } = useShop();

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Forgot Password / OTP states
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [otp, setOtp] = useState('');
  const [dispatchedOtp, setDispatchedOtp] = useState<{ otp: string; phone: string; email: string } | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Status Alerts
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Reset errors and notifications on mode switch
  useEffect(() => {
    setError(null);
    setSuccessMsg(null);
    if (authModalMode !== 'forgot') {
      setForgotStep(1);
      setDispatchedOtp(null);
    }
  }, [authModalMode, authModalRole]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  if (!isAuthModalOpen) return null;

  // Handle Login submission
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!phone.trim()) {
      setError('Please enter your registered mobile number, email, or username.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    const res = login(phone, password, authModalRole);
    if (!res.success) {
      setError(res.message);
    }
  };

  // Handle Registration submission
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanPhone = phone.replace(/[\s\-\(\)\+]/g, '');
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!cleanPhone || cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!password || password.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your confirmation password.');
      return;
    }
    if (authModalRole === 'admin' && email.trim().toLowerCase() !== AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
      setError(`Administrator registration is strictly restricted to ${AUTHORIZED_ADMIN_EMAIL}. Other accounts can only register as Customers.`);
      return;
    }

    const res = register(name, email, cleanPhone, password, authModalRole);
    if (!res.success) {
      setError(res.message);
    } else {
      // NOTE: User must manually sign in after registration!
      // Switch to login tab, pre-fill phone, and prompt to sign in.
      setAuthModalMode('login');
      setPassword('');
      setConfirmPassword('');
      setSuccessMsg('Account registered successfully! Please sign in below with your mobile number and password.');
    }
  };

  // Handle Send SMS & Gmail OTP for Forgot Password
  const handleSendOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const identifier = phone.trim();
    if (!identifier) {
      setError('Please enter your registered mobile number or Gmail address.');
      return;
    }

    const res = sendOtp(identifier);
    if (!res.success) {
      setError(res.message);
    } else {
      setDispatchedOtp({
        otp: res.otp!,
        phone: res.phone || identifier,
        email: res.email || '',
      });
      setForgotStep(2);
      setResendCooldown(30);
      setSuccessMsg(`Verification code sent to registered Gmail (${res.email}) and mobile (+91 ${res.phone}).`);
    }
  };

  // Handle Reset Password submission
  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!otp.trim()) {
      setError('Please enter the 6-digit verification code.');
      return;
    }
    if (!password || password.length < 4) {
      setError('New password must be at least 4 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('New passwords do not match. Please re-enter.');
      return;
    }

    const res = resetPasswordWithOtp(
      dispatchedOtp?.email || dispatchedOtp?.phone || phone,
      otp,
      dispatchedOtp?.otp || '',
      password
    );

    if (!res.success) {
      setError(res.message);
    } else {
      // Switch back to login mode with prefilled phone
      setAuthModalMode('login');
      if (dispatchedOtp?.phone) {
        setPhone(dispatchedOtp.phone);
      }
      setPassword('');
      setConfirmPassword('');
      setOtp('');
      setDispatchedOtp(null);
      setSuccessMsg('Password updated successfully! Please sign in with your new password.');
    }
  };

  // 1-Click Fast Demo Fill & Login
  const handleQuickDemo = (role: UserRole) => {
    setError(null);
    setSuccessMsg(null);
    if (role === 'admin') {
      setPhone('7013304012');
      setPassword('admin123');
      login('7013304012', 'admin123', 'admin');
    } else {
      setPhone('9123456789');
      setPassword('user123');
      login('9123456789', 'user123', 'customer');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
    >
      <div className="fixed inset-0" onClick={closeAuthModal} />

      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 max-h-[94vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 z-20 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-6 sm:p-7 text-center pb-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-md shadow-brand-500/25 mb-3">
            {authModalMode === 'forgot' ? (
              <Smartphone className="w-6 h-6" />
            ) : authModalRole === 'admin' ? (
              <ShieldCheck className="w-6 h-6" />
            ) : (
              <ShoppingBag className="w-6 h-6" />
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {authModalMode === 'forgot'
              ? 'Reset Password via SMS OTP'
              : authModalMode === 'register'
              ? 'Create Your DreamIT Account'
              : 'Sign In to DreamIT Mall'}
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {authModalMode === 'forgot'
              ? 'Verify your registered mobile number using a secure one-time passcode.'
              : authModalMode === 'register'
              ? 'Sign up once, then sign in with your mobile number to unlock shopping features.'
              : 'Sign in with your registered mobile number and password.'}
          </p>

          {/* Mode Switcher Tabs (Sign In vs Sign Up) */}
          {authModalMode !== 'forgot' && (
            <div className="grid grid-cols-2 gap-2 mt-4 p-1 rounded-xl bg-slate-200/80 dark:bg-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setAuthModalMode('login');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className={`py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  authModalMode === 'login'
                    ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthModalMode('register');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className={`py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  authModalMode === 'register'
                    ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign Up (Register)</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Form Body */}
        <div className="overflow-y-auto p-6 sm:p-7 space-y-4">
          {/* Success Banner */}
          {successMsg && (
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 flex items-start gap-2.5 text-xs text-emerald-800 dark:text-emerald-200 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="font-medium">{successMsg}</div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
              <div className="font-medium">{error}</div>
            </div>
          )}

          {/* ========================================================
              MODE: FORGOT PASSWORD (SMS OTP FLOW)
             ======================================================== */}
          {authModalMode === 'forgot' ? (
            <div className="space-y-4">
              {forgotStep === 1 ? (
                /* Step 1: Request OTP via Registered Gmail or Mobile */
                <form onSubmit={handleSendOtp} className="space-y-4 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Registered Mobile Number or Gmail Address *
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400 border-r border-slate-200 dark:border-slate-700 pr-2">
                        <Mail className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="text"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 7013304012 or pokurinageswari@gmail.com"
                        className="w-full pl-12 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Demo accounts: <code className="text-emerald-600 dark:text-emerald-400 font-bold">7013304012</code> / <code className="text-emerald-600 dark:text-emerald-400 font-bold">pokurinageswari@gmail.com</code> (Admin) or <code className="text-brand-600 dark:text-brand-400 font-bold">9123456789</code> (Customer)
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-xs shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Verification Code to Gmail & Mobile</span>
                  </button>
                </form>
              ) : (
                /* Step 2: Verify OTP & Enter New Password */
                <form onSubmit={handleResetPasswordSubmit} className="space-y-4 text-xs">
                  {/* Real Registered Gmail & Mobile Delivery Card */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-800 space-y-3 animate-scale-in">
                    <div className="flex items-center justify-between pb-2 border-b border-blue-100 dark:border-blue-900/60">
                      <div className="flex items-center gap-2 text-blue-900 dark:text-blue-200 font-bold text-xs">
                        <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span>Registered Gmail & Mobile Delivery</span>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-800">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span>Dispatched</span>
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 w-16">Gmail:</span>
                        <strong className="text-blue-600 dark:text-blue-400 font-mono text-[11px]">{dispatchedOtp?.email || 'Registered Gmail'}</strong>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 w-16">Mobile:</span>
                        <strong className="text-slate-900 dark:text-white font-mono text-[11px]">+91 {dispatchedOtp?.phone || phone}</strong>
                      </div>
                    </div>

                    {/* Private Dispatched Notice (Strictly NO OTP code displayed on screen) */}
                    <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 flex items-center justify-between shadow-xs">
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          Private Dispatch Status
                        </div>
                        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                          Code sent to your Gmail &amp; mobile SMS
                        </div>
                      </div>

                      <a
                        href="https://mail.google.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-[11px] flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                        title="Open Gmail Inbox to read your OTP"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open Gmail</span>
                      </a>
                    </div>
                  </div>

                  {/* OTP Code Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-semibold text-slate-700 dark:text-slate-300">
                        Enter 6-Digit SMS Code *
                      </label>
                      <button
                        type="button"
                        disabled={resendCooldown > 0}
                        onClick={() => handleSendOtp()}
                        className="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline disabled:text-slate-400 cursor-pointer"
                      >
                        {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend Code'}
                      </button>
                    </div>
                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder="e.g. 582491"
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-black tracking-widest text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      New Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter new password (min 4 chars)"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Confirm New Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setForgotStep(1)}
                      className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-xs shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Update & Save Password</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Back to Sign In button */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalMode('login');
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer"
                >
                  ← Back to Sign In
                </button>
              </div>
            </div>
          ) : authModalMode === 'login' ? (
            /* ========================================================
               MODE: SIGN IN (MOBILE NUMBER + PASSWORD)
               ======================================================== */
            <div className="space-y-4">
              {/* Account Role Selector */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
                <span className="font-semibold text-slate-600 dark:text-slate-300">
                  Target Portal:
                </span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setAuthModalRole('customer')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                      authModalRole === 'customer'
                        ? 'bg-brand-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Customer
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthModalRole('admin')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                      authModalRole === 'admin'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Administrator
                  </button>
                </div>
              </div>

              {authModalRole === 'admin' && (
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 animate-fade-in">
                  <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Admin portal is strictly restricted to: <strong>{AUTHORIZED_ADMIN_EMAIL}</strong></span>
                </div>
              )}

              {/* Fast 1-Click Demo Logins */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-brand-50 to-indigo-50 dark:from-brand-950/40 dark:to-indigo-950/40 border border-brand-200/80 dark:border-brand-900/60 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                    <Sparkles className="w-4 h-4 text-brand-600" />
                    <span>Quick Demo Logins (1-Click Fill & Sign In):</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('customer')}
                    className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand-500 text-left transition-all cursor-pointer group"
                  >
                    <div className="text-[10px] font-extrabold uppercase text-brand-600">Customer</div>
                    <div className="font-bold text-slate-900 dark:text-white text-[11px]">9123456789</div>
                    <div className="text-[10px] text-slate-400">Pass: user123</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemo('admin')}
                    className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-left transition-all cursor-pointer group"
                  >
                    <div className="text-[10px] font-extrabold uppercase text-emerald-600">Administrator (Nageswari)</div>
                    <div className="font-bold text-slate-900 dark:text-white text-[11px]">7013304012</div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium truncate">{AUTHORIZED_ADMIN_EMAIL}</div>
                    <div className="text-[10px] text-slate-400">Pass: admin123</div>
                  </button>
                </div>
              </div>

              {/* Sign In Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
                {/* Mobile / Email / Username Input */}
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Mobile Number, Email, or Username *
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400 border-r border-slate-200 dark:border-slate-700 pr-2">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 9123456789, keerthi1, or user@dreamit.com"
                      maxLength={60}
                      className="w-full pl-12 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      Password *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthModalMode('forgot');
                        setError(null);
                        setSuccessMsg(null);
                      }}
                      className="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Smartphone className="w-3 h-3" />
                      <span>Forgot Password? (SMS OTP)</span>
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter account password"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-xs shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Sign In with Mobile</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Switch to Sign Up */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500">
                <p>
                  Don&apos;t have a DreamIT account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthModalMode('register');
                      setError(null);
                      setSuccessMsg(null);
                    }}
                    className="text-brand-600 dark:text-brand-400 font-bold hover:underline cursor-pointer"
                  >
                    Create a new account (Sign Up)
                  </button>
                </p>
              </div>
            </div>
          ) : (
            /* ========================================================
               MODE: SIGN UP (REGISTRATION)
               ======================================================== */
            <div className="space-y-4">
              {/* Account Role Selector */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
                <span className="font-semibold text-slate-600 dark:text-slate-300">
                  Register as:
                </span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setAuthModalRole('customer')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                      authModalRole === 'customer'
                        ? 'bg-brand-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Customer
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthModalRole('admin')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                      authModalRole === 'admin'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Administrator
                  </button>
                </div>
              </div>

              {authModalRole === 'admin' && (
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-1.5 animate-fade-in">
                  <Lock className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Admin registration is strictly authorized only for: <strong>{AUTHORIZED_ADMIN_EMAIL}</strong></span>
                </div>
              )}

              {/* Registration Form */}
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
                {/* Full Name */}
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Mobile Number (Primary Login ID) *
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400 border-r border-slate-200 dark:border-slate-700 pr-2">
                      <Phone className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">+91</span>
                    </div>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="10-digit mobile number"
                      maxLength={15}
                      className="w-full pl-20 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. rahul@example.com"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Passwords */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min 4 characters"
                        className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                  <span>After signing up, you will sign in with your mobile number & password.</span>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-xs shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Complete Sign Up</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Switch to Sign In */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500">
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthModalMode('login');
                      setError(null);
                      setSuccessMsg(null);
                    }}
                    className="text-brand-600 dark:text-brand-400 font-bold hover:underline cursor-pointer"
                  >
                    Sign in here
                  </button>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
