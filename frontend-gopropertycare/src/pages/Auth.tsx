import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogIn, UserPlus, Sparkles, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthContext } from '@/providers/AuthProvider';
import { DENVER_LOCATIONS } from '@/constants/locations';

type Tab = 'login' | 'register';

export function Auth() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, register } = useAuthContext();
  const [tab, setTab] = useState<Tab>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  const [registerData, setRegisterData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    street_address: '',
    city: 'Denver (Downtown / Central)',
    zip_code: '',
    password: '',
    password_confirm: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) {
      setError(t('common.error'));
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await login(loginData.email, loginData.password);
      navigate('/dashboard');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      const detail = axiosErr.response?.data?.detail;
      setError(detail || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (registerData.password !== registerData.password_confirm) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      await register({
        email: registerData.email.trim(),
        first_name: registerData.first_name.trim(),
        last_name: registerData.last_name.trim(),
        phone: registerData.phone.trim(),
        street_address: registerData.street_address.trim(),
        city: registerData.city,
        zip_code: registerData.zip_code.trim(),
        password: registerData.password,
        password_confirm: registerData.password_confirm,
      });
      navigate('/dashboard');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: Record<string, string[]> | { detail?: string } } };
      const data = axiosErr.response?.data;
      if (data && 'detail' in data && typeof data.detail === 'string') {
        setError(data.detail);
      } else if (data) {
        const msg = Object.entries(data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(' ') : v}`)
          .join('\n');
        setError(msg);
      } else {
        setError('Registration failed. Please verify your details.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 sm:py-12 animate-fade-in-up">
      <Card className="p-6 sm:p-8 border-emerald-100 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
            <Sparkles className="w-6 h-6 animate-float" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {tab === 'login' ? t('auth.loginTitle') : t('auth.registerTitle')}
          </h1>
          <p className="text-xs text-slate-600 font-medium">
            Unified access to your cleaning bookings across Denver & Boulder.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setError('');
            }}
            className={`py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
              tab === 'login'
                ? 'bg-white text-emerald-800 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LogIn className="w-3.5 h-3.5 inline mr-1.5" />
            {t('nav.login')}
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setError('');
            }}
            className={`py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
              tab === 'register'
                ? 'bg-white text-emerald-800 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 inline mr-1.5" />
            {t('nav.register')}
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        {tab === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label={t('auth.emailLabel')}
              type="email"
              value={loginData.email}
              onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              placeholder="you@example.com"
              required
            />
            <Input
              label={t('auth.passwordLabel')}
              type="password"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              placeholder="••••••••"
              required
            />
            <Button size="lg" className="w-full hover:scale-102 active:scale-98 transition-all duration-200" disabled={isLoading}>
              {isLoading ? t('common.loading') : t('auth.signInBtn')}
            </Button>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label={t('auth.firstName')}
                value={registerData.first_name}
                onChange={(e) => setRegisterData({ ...registerData, first_name: e.target.value })}
                required
              />
              <Input
                label={t('auth.lastName')}
                value={registerData.last_name}
                onChange={(e) => setRegisterData({ ...registerData, last_name: e.target.value })}
                required
              />
            </div>
            <Input
              label={t('auth.emailLabel')}
              type="email"
              value={registerData.email}
              onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
              required
            />
            <Input
              label={t('auth.phone')}
              type="tel"
              value={registerData.phone}
              onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
              placeholder="(720) 000-0000"
            />
            <Input
              label={t('auth.street')}
              value={registerData.street_address}
              onChange={(e) => setRegisterData({ ...registerData, street_address: e.target.value })}
              placeholder="1234 Main St"
            />

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                {t('auth.city')}
              </label>
              <select
                value={registerData.city}
                onChange={(e) => setRegisterData({ ...registerData, city: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-600"
              >
                {DENVER_LOCATIONS.map((loc) => (
                  <option key={loc.name} value={loc.name}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label={t('auth.zip')}
              value={registerData.zip_code}
              onChange={(e) => setRegisterData({ ...registerData, zip_code: e.target.value })}
              placeholder="80202"
            />

            <Input
              label={t('auth.passwordLabel')}
              type="password"
              value={registerData.password}
              onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
              required
            />
            <Input
              label={t('auth.confirmPasswordLabel')}
              type="password"
              value={registerData.password_confirm}
              onChange={(e) => setRegisterData({ ...registerData, password_confirm: e.target.value })}
              required
            />

            <Button size="lg" className="w-full mt-2 hover:scale-102 active:scale-98 transition-all duration-200" disabled={isLoading}>
              {isLoading ? t('common.loading') : t('auth.registerBtn')}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
