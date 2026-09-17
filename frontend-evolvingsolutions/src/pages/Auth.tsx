import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogIn, UserPlus, Building2, AlertCircle } from 'lucide-react';
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
    city: 'Denver (Downtown & Metro)',
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
      setError(detail || 'Invalid corporate email or password. Please try again.');
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
      const axiosErr = err as { response?: { data?: Record<string, string[]> | string } };
      if (axiosErr.response?.data) {
        if (typeof axiosErr.response.data === 'string') {
          setError(axiosErr.response.data);
        } else {
          setError(Object.values(axiosErr.response.data).flat().join(' '));
        }
      } else {
        setError('Registration failed. Please review your details and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 sm:py-12 animate-fade-in">
      <Card className="p-6 sm:p-8 bg-white border-stone-200 shadow-lg">
        {/* Header Icon & Title */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#815133] to-[#573725] text-white flex items-center justify-center mx-auto shadow-xs">
            <Building2 className="w-6 h-6 text-[#eedecd]" />
          </div>
          <h1 className="text-2xl font-black text-stone-950 tracking-tight">
            {tab === 'login' ? t('auth.loginTitle') : t('auth.registerTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 font-medium">
            {tab === 'login' ? t('auth.loginSubtitle') : t('auth.registerSubtitle')}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-[#f7efe6] rounded-xl mb-6">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setError('');
            }}
            className={`py-2 text-xs sm:text-sm font-black rounded-lg transition-all cursor-pointer ${
              tab === 'login'
                ? 'bg-white text-[#815133] shadow-xs'
                : 'text-stone-600 hover:text-[#573725]'
            }`}
          >
            {t('nav.login')}
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setError('');
            }}
            className={`py-2 text-xs sm:text-sm font-black rounded-lg transition-all cursor-pointer ${
              tab === 'register'
                ? 'bg-white text-[#815133] shadow-xs'
                : 'text-stone-600 hover:text-[#573725]'
            }`}
          >
            {t('nav.register')}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-medium flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label={t('auth.email')}
              type="email"
              value={loginData.email}
              onChange={(e) => setLoginData((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="manager@company.com"
              required
            />
            <Input
              label={t('auth.password')}
              type="password"
              value={loginData.password}
              onChange={(e) => setLoginData((prev) => ({ ...prev, password: e.target.value }))}
              placeholder="••••••••"
              required
            />
            <Button
              type="submit"
              size="lg"
              disabled={isLoading}
              className="w-full mt-2"
            >
              <LogIn className="w-4 h-4 mr-2" />
              {isLoading ? t('common.loading') : t('auth.loginButton')}
            </Button>
          </form>
        )}

        {/* Register Form */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label={t('auth.firstName')}
                value={registerData.first_name}
                onChange={(e) => setRegisterData((prev) => ({ ...prev, first_name: e.target.value }))}
                required
              />
              <Input
                label={t('auth.lastName')}
                value={registerData.last_name}
                onChange={(e) => setRegisterData((prev) => ({ ...prev, last_name: e.target.value }))}
                required
              />
            </div>

            <Input
              label={t('auth.email')}
              type="email"
              value={registerData.email}
              onChange={(e) => setRegisterData((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="manager@company.com"
              required
            />

            <Input
              label={t('auth.phone')}
              type="tel"
              value={registerData.phone}
              onChange={(e) => setRegisterData((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder="(720) 000-0000"
            />

            <Input
              label={t('schedule.step3.addressLabel')}
              value={registerData.street_address}
              onChange={(e) => setRegisterData((prev) => ({ ...prev, street_address: e.target.value }))}
              placeholder="123 Business Parkway"
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  City
                </label>
                <select
                  value={registerData.city}
                  onChange={(e) => setRegisterData((prev) => ({ ...prev, city: e.target.value }))}
                  className="w-full min-h-[44px] bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900 text-sm focus:outline-none focus:border-[#815133]"
                >
                  {DENVER_LOCATIONS.map((loc) => (
                    <option key={loc.name} value={loc.name}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label={t('schedule.step3.zipLabel')}
                value={registerData.zip_code}
                onChange={(e) => setRegisterData((prev) => ({ ...prev, zip_code: e.target.value }))}
                placeholder="80202"
              />
            </div>

            <Input
              label={t('auth.password')}
              type="password"
              value={registerData.password}
              onChange={(e) => setRegisterData((prev) => ({ ...prev, password: e.target.value }))}
              placeholder="••••••••"
              required
            />

            <Input
              label={t('auth.passwordConfirm')}
              type="password"
              value={registerData.password_confirm}
              onChange={(e) => setRegisterData((prev) => ({ ...prev, password_confirm: e.target.value }))}
              placeholder="••••••••"
              required
            />

            <p className="text-[11px] text-stone-500 font-medium leading-relaxed">
              {t('auth.guestNotice')}
            </p>

            <Button
              type="submit"
              size="lg"
              disabled={isLoading}
              className="w-full mt-2"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              {isLoading ? t('common.loading') : t('auth.registerButton')}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
