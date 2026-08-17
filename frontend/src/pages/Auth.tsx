import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogIn, UserPlus, MapPin } from 'lucide-react';
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

  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  // Capitalize helper
  const formatCapitalized = (str: string) => {
    return str.replace(/\b[a-z]/g, (char) => char.toUpperCase());
  };

  // Validation helpers
  const isFirstNameValid = (val: string) => val.trim().length >= 2 && /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]+$/.test(val.trim());
  const isLastNameValid = (val: string) => val.trim().length >= 2 && /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]+$/.test(val.trim());
  const isEmailValid = (val: string) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val.trim());
  const isPhoneValid = (val: string) => /^(\+?1\s*[-.]?)?(\(?\d{3}\)?[\s.-]?)?\d{3}[\s.-]?\d{4}$/.test(val.trim());
  const isAddressValid = (val: string) => val.trim().length >= 5;
  const isLocationValid = (city: string) => DENVER_LOCATIONS.some((loc) => loc.name === city);
  const isPasswordValid = (val: string) => val.length >= 8;
  const isPasswordConfirmValid = (p1: string, p2: string) => p1.length >= 8 && p1 === p2;

  const markTouched = (field: string) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
  };

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
    } catch (err: any) {
      console.error('Login failed:', err.response?.data || err);
      const data = err.response?.data;
      if (data?.detail) {
        setError(data.detail);
      } else {
        setError('Invalid email or password. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Touch all fields for validation feedback
    setTouchedFields({
      first_name: true,
      last_name: true,
      email: true,
      phone: true,
      street_address: true,
      city: true,
      password: true,
      password_confirm: true,
    });

    if (!isFirstNameValid(registerData.first_name)) {
      setError('Please enter a valid first name starting with a capital letter.');
      return;
    }
    if (!isLastNameValid(registerData.last_name)) {
      setError('Please enter a valid last name starting with a capital letter.');
      return;
    }
    if (!isEmailValid(registerData.email)) {
      setError('Please enter a valid email address e.g. name@domain.com.');
      return;
    }
    if (!isPhoneValid(registerData.phone)) {
      setError('Please enter a valid 10-digit phone number e.g. (720) 590-8632.');
      return;
    }
    if (!isAddressValid(registerData.street_address)) {
      setError('Please enter a complete street address e.g. 1234 Blake St.');
      return;
    }
    if (!isLocationValid(registerData.city)) {
      setError('Please select a valid Denver metro location.');
      return;
    }
    if (!isPasswordValid(registerData.password)) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (registerData.password !== registerData.password_confirm) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      await register({
        first_name: registerData.first_name.trim(),
        last_name: registerData.last_name.trim(),
        email: registerData.email.trim(),
        phone: registerData.phone.trim(),
        street_address: registerData.street_address.trim(),
        city: registerData.city,
        zip_code: registerData.zip_code.trim(),
        password: registerData.password,
        password_confirm: registerData.password_confirm,
      });
      navigate('/schedule');
    } catch (err: any) {
      console.error('Registration failed:', err.response?.data || err);
      const data = err.response?.data;
      if (data && typeof data === 'object') {
        const errorMessages = Object.entries(data)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
          .join(' | ');
        setError(errorMessages || 'Registration failed. Please try again.');
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto w-full py-4 sm:py-6 flex flex-col justify-center animate-fade-in">
      <div className="flex flex-col items-center text-center mb-6">
        <Link to="/" className="inline-block group mb-2 transition-transform active:scale-95">
          <div className="relative">
            <div className="absolute -inset-2 bg-blue-500/20 rounded-full blur-lg group-hover:blur-xl transition-all" />
            <img
              src="/logo.png"
              alt="LaundryGo"
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-md group-hover:scale-105 transition-transform relative z-10 mx-auto"
            />
          </div>
        </Link>
        <span className="text-slate-900 font-extrabold text-xl sm:text-2xl tracking-tight">
          {t('app.name')}
        </span>
      </div>

      <Card variant="default" className="p-6 sm:p-8 shadow-sm w-full transition-all duration-300">
        <div className="flex mb-6 bg-slate-100 border border-slate-200 rounded-xl p-1">
          <button
            type="button"
            onClick={() => { setTab('login'); setError(''); }}
            className={`flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-colors duration-200 ease-in-out flex items-center justify-center gap-2 cursor-pointer ${
              tab === 'login'
                ? 'bg-white text-blue-600 shadow-2xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LogIn className="w-4 h-4" />
            {t('nav.login')}
          </button>
          <button
            type="button"
            onClick={() => { setTab('register'); setError(''); }}
            className={`flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-colors duration-200 ease-in-out flex items-center justify-center gap-2 cursor-pointer ${
              tab === 'register'
                ? 'bg-white text-blue-600 shadow-2xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            {t('nav.register')}
          </button>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-medium animate-fade-in">
            {error}
          </div>
        )}

        {tab === 'login' ? (
          <form key="login-form" onSubmit={handleLogin} className="space-y-4 animate-fade-in">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-1">{t('auth.login.title')}</h2>
            <p className="text-slate-500 text-xs sm:text-sm mb-4">{t('auth.login.subheader')}</p>
            <Input
              label={t('auth.login.email')}
              type="email"
              placeholder="your@email.com"
              value={loginData.email}
              onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              required
            />
            <Input
              label={t('auth.login.password')}
              type="password"
              placeholder="••••••••"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              required
            />
            <Button type="submit" className="w-full mt-2" disabled={isLoading}>
              {isLoading ? t('common.loading') : t('auth.login.submit')}
            </Button>
            <p className="text-center text-slate-600 text-xs sm:text-sm pt-2">
              {t('auth.login.noAccount')}{' '}
              <button
                type="button"
                onClick={() => setTab('register')}
                className="text-blue-600 font-bold hover:underline"
              >
                {t('auth.login.registerLink')}
              </button>
            </p>
          </form>
        ) : (
          <form key="register-form" onSubmit={handleRegister} className="space-y-3 animate-fade-in">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-1">{t('auth.register.title')}</h2>
            <p className="text-slate-500 text-xs sm:text-sm mb-3">{t('auth.register.subheader')}</p>

            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              <Input
                label={t('auth.register.firstName')}
                placeholder="John"
                value={registerData.first_name}
                onChange={(e) => setRegisterData({ ...registerData, first_name: formatCapitalized(e.target.value) })}
                onBlur={() => markTouched('first_name')}
                error={
                  touchedFields.first_name && !isFirstNameValid(registerData.first_name)
                    ? 'Min 2 chars'
                    : undefined
                }
                required
              />
              <Input
                label={t('auth.register.lastName')}
                placeholder="Doe"
                value={registerData.last_name}
                onChange={(e) => setRegisterData({ ...registerData, last_name: formatCapitalized(e.target.value) })}
                onBlur={() => markTouched('last_name')}
                error={
                  touchedFields.last_name && !isLastNameValid(registerData.last_name)
                    ? 'Min 2 chars'
                    : undefined
                }
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              <Input
                label={t('auth.register.email')}
                type="email"
                placeholder="your@email.com"
                value={registerData.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                onBlur={() => markTouched('email')}
                error={
                  touchedFields.email && !isEmailValid(registerData.email)
                    ? 'Invalid email'
                    : undefined
                }
                required
              />
              <Input
                label={t('auth.register.phone')}
                type="tel"
                placeholder="(720) 590-8632"
                value={registerData.phone}
                onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                onBlur={() => markTouched('phone')}
                error={
                  touchedFields.phone && !isPhoneValid(registerData.phone)
                    ? 'Invalid phone'
                    : undefined
                }
                required
              />
            </div>

            {/* Address Information Section */}
            <div className="pt-2 space-y-2.5 border-t border-slate-200">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>{t('schedule.deliveryAddress')}</span>
              </h3>

              <Input
                label={`${t('auth.register.streetAddress')} *`}
                placeholder="1234 Blake St, Apt 4B"
                value={registerData.street_address}
                onChange={(e) => setRegisterData({ ...registerData, street_address: e.target.value })}
                onBlur={() => markTouched('street_address')}
                error={
                  touchedFields.street_address && !isAddressValid(registerData.street_address)
                    ? 'Min 5 chars'
                    : undefined
                }
                required
              />

              <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1 truncate">
                    {t('auth.register.cityLocation')} *
                  </label>
                  <select
                    value={registerData.city}
                    onChange={(e) => setRegisterData({ ...registerData, city: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 text-xs sm:text-sm shadow-2xs truncate"
                  >
                    {DENVER_LOCATIONS.map((loc) => (
                      <option key={loc.name} value={loc.name}>
                        {loc.name} ({loc.fee === 0 ? 'FREE' : '+$25'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-1">
                  <Input
                    label={t('auth.register.zipCode')}
                    placeholder="80202"
                    value={registerData.zip_code}
                    onChange={(e) => setRegisterData({ ...registerData, zip_code: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 pt-1 border-t border-slate-200">
              <Input
                label={t('auth.register.password')}
                type="password"
                placeholder="••••••••"
                value={registerData.password}
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                onBlur={() => markTouched('password')}
                error={
                  touchedFields.password && !isPasswordValid(registerData.password)
                    ? 'Min 8 chars'
                    : undefined
                }
                required
              />
              <Input
                label={t('auth.register.confirmPassword')}
                type="password"
                placeholder="••••••••"
                value={registerData.password_confirm}
                onChange={(e) => setRegisterData({ ...registerData, password_confirm: e.target.value })}
                onBlur={() => markTouched('password_confirm')}
                error={
                  touchedFields.password_confirm && !isPasswordConfirmValid(registerData.password, registerData.password_confirm)
                    ? 'Passwords mismatch'
                    : undefined
                }
                required
              />
            </div>

            <Button type="submit" className="w-full mt-3" disabled={isLoading}>
              {isLoading ? t('common.loading') : t('auth.register.submit')}
            </Button>
            <p className="text-center text-slate-600 text-xs sm:text-sm pt-2">
              {t('auth.register.hasAccount')}{' '}
              <button
                type="button"
                onClick={() => setTab('login')}
                className="text-blue-600 font-bold hover:underline"
              >
                {t('auth.register.loginLink')}
              </button>
            </p>
          </form>
        )}
      </Card>
    </div>
  );
}
