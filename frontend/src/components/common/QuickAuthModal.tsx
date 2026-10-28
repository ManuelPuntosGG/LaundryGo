import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { X, LogIn, UserPlus, Lock, Mail, User, Phone, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthContext } from '@/providers/AuthProvider';

interface QuickAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function QuickAuthModal({ isOpen, onClose, onSuccess }: QuickAuthModalProps) {
  const { t } = useTranslation();
  const { login, register } = useAuthContext();

  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('');

  // Keyboard escape listener & body scroll lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      setError('');
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword) {
      setError(t('auth.errors.allFieldsRequired', 'Please fill in your email and password.'));
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      await login(loginEmail.trim(), loginPassword);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string; error?: string } } };
      const msg =
        axiosErr.response?.data?.detail ||
        axiosErr.response?.data?.error ||
        t('auth.errors.invalidCredentials', 'Invalid email or password. Please try again.');
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFirstName.trim() || !regLastName.trim() || !regEmail.trim() || !regPassword) {
      setError(t('auth.errors.allFieldsRequired', 'Please fill in all required fields.'));
      return;
    }
    if (regPassword !== regPasswordConfirm) {
      setError(t('auth.errors.passwordsMismatch', 'Passwords do not match.'));
      return;
    }
    if (regPassword.length < 8) {
      setError(t('auth.errors.passwordLength', 'Password must be at least 8 characters long.'));
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await register({
        first_name: regFirstName.trim(),
        last_name: regLastName.trim(),
        email: regEmail.trim(),
        phone: regPhone.trim(),
        password: regPassword,
        password_confirm: regPasswordConfirm,
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: Record<string, string | string[]> } };
      const data = axiosErr.response?.data;
      if (data) {
        const firstKey = Object.keys(data)[0];
        const val = data[firstKey];
        const msg = Array.isArray(val) ? val[0] : val;
        setError(msg || t('common.error', 'An error occurred during registration.'));
      } else {
        setError(t('common.error', 'An error occurred during registration.'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div
        className="fixed inset-0"
        aria-hidden="true"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 animate-scale-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            aria-label={t('common.close', 'Close')}
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1.5 text-blue-200 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>{t('schedule.coupons.quickAuthHeaderBadge', 'Exclusive Coupons & Discounts')}</span>
          </div>
          <h2 className="text-xl font-extrabold text-white">
            {tab === 'login'
              ? t('schedule.coupons.loginToApplyTitle', 'Sign in to Apply Coupon')
              : t('schedule.coupons.registerToApplyTitle', 'Create Account & Save')}
          </h2>
          <p className="text-xs text-blue-100 mt-1">
            {t('schedule.coupons.quickAuthSubtitle', 'Discounts are linked to your profile so they can be securely applied.')}
          </p>

          {/* Tab buttons */}
          <div className="flex bg-black/20 p-1 rounded-xl mt-4">
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setError('');
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                tab === 'login'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{t('auth.login', 'Log In')}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('register');
                setError('');
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                tab === 'register'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{t('auth.register', 'Sign Up')}</span>
            </button>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <div className="p-6">
          {tab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('auth.email', 'Email Address')}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="pl-10 text-sm"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('auth.password', 'Password')}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 text-sm"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 font-bold py-2.5 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t('common.loading', 'Signing in...')}</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <LogIn className="w-4 h-4" />
                    <span>{t('auth.login', 'Log In & Continue')}</span>
                  </span>
                )}
              </Button>

              <p className="text-center text-xs text-slate-500 pt-1">
                {t('auth.noAccount', "Don't have an account?")}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setTab('register');
                    setError('');
                  }}
                  className="font-bold text-blue-700 hover:underline cursor-pointer"
                >
                  {t('auth.registerNow', 'Sign up for free')}
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('auth.firstName', 'First Name')}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="text"
                      required
                      value={regFirstName}
                      onChange={(e) => setRegFirstName(e.target.value)}
                      placeholder="Jane"
                      className="pl-9 text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('auth.lastName', 'Last Name')}
                  </label>
                  <Input
                    type="text"
                    required
                    value={regLastName}
                    onChange={(e) => setRegLastName(e.target.value)}
                    placeholder="Doe"
                    className="text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('auth.email', 'Email Address')}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="pl-10 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('auth.phone', 'Phone Number')} <span className="text-slate-400 font-normal">({t('common.optional', 'Optional')})</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="(303) 555-0123"
                    className="pl-10 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('auth.password', 'Password')}
                  </label>
                  <Input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('auth.confirmPassword', 'Confirm')}
                  </label>
                  <Input
                    type="password"
                    required
                    value={regPasswordConfirm}
                    onChange={(e) => setRegPasswordConfirm(e.target.value)}
                    placeholder="••••••••"
                    className="text-xs"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full mt-3 font-bold py-2.5 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t('common.loading', 'Creating account...')}</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    <span>{t('auth.register', 'Create Account & Continue')}</span>
                  </span>
                )}
              </Button>

              <p className="text-center text-xs text-slate-500 pt-1">
                {t('auth.alreadyHaveAccount', 'Already have an account?')}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setTab('login');
                    setError('');
                  }}
                  className="font-bold text-blue-700 hover:underline cursor-pointer"
                >
                  {t('auth.login', 'Log In')}
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
