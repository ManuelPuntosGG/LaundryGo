import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogIn, UserPlus } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthContext } from '@/providers/AuthProvider';

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
    password: '',
    password_confirm: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await login(loginData.email, loginData.password);
      navigate('/dashboard');
    } catch {
      setError('Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (registerData.password !== registerData.password_confirm) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      await register(registerData);
      navigate('/dashboard');
    } catch {
      setError('Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <Card variant="glass-strong" className="max-w-md w-full">
        <div className="flex mb-6 bg-glass-white-10 rounded-xl p-1">
          <button
            onClick={() => setTab('login')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === 'login'
                ? 'bg-primary-500 text-white'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <LogIn className="w-4 h-4 inline mr-2" />
            {t('nav.login')}
          </button>
          <button
            onClick={() => setTab('register')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === 'register'
                ? 'bg-primary-500 text-white'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4 inline mr-2" />
            {t('nav.register')}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-400/30 text-red-300 text-sm">
            {error}
          </div>
        )}

        {tab === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-6">{t('auth.login.title')}</h2>
            <Input
              label={t('auth.login.email')}
              type="email"
              value={loginData.email}
              onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              required
            />
            <Input
              label={t('auth.login.password')}
              type="password"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              required
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t('common.loading') : t('auth.login.submit')}
            </Button>
            <p className="text-center text-white/60 text-sm">
              {t('auth.login.noAccount')}{' '}
              <button
                type="button"
                onClick={() => setTab('register')}
                className="text-primary-400 hover:text-primary-300"
              >
                {t('auth.login.registerLink')}
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-6">{t('auth.register.title')}</h2>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t('auth.register.firstName')}
                value={registerData.first_name}
                onChange={(e) => setRegisterData({ ...registerData, first_name: e.target.value })}
                required
              />
              <Input
                label={t('auth.register.lastName')}
                value={registerData.last_name}
                onChange={(e) => setRegisterData({ ...registerData, last_name: e.target.value })}
                required
              />
            </div>
            <Input
              label={t('auth.register.email')}
              type="email"
              value={registerData.email}
              onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
              required
            />
            <Input
              label={t('auth.register.phone')}
              type="tel"
              value={registerData.phone}
              onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
            />
            <Input
              label={t('auth.register.password')}
              type="password"
              value={registerData.password}
              onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
              required
            />
            <Input
              label={t('auth.register.confirmPassword')}
              type="password"
              value={registerData.password_confirm}
              onChange={(e) => setRegisterData({ ...registerData, password_confirm: e.target.value })}
              required
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t('common.loading') : t('auth.register.submit')}
            </Button>
            <p className="text-center text-white/60 text-sm">
              {t('auth.register.hasAccount')}{' '}
              <button
                type="button"
                onClick={() => setTab('login')}
                className="text-primary-400 hover:text-primary-300"
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
