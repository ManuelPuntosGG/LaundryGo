import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, Droplets } from 'lucide-react';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { useAuthContext } from '@/providers/AuthProvider';

export function Navbar() {
  const { t } = useTranslation();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuthContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { path: '/', label: t('nav.home') },
    { path: '/schedule', label: t('nav.schedule') },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-glass-white-10 backdrop-blur-xl border-b border-white/20">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <Link to="/" className="flex items-center gap-2">
            <Droplets className="w-8 h-8 text-primary-400" />
            <span className="text-white font-bold text-xl">{t('app.name')}</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'text-white'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}

            <LanguageSwitcher />

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link
                  to="/dashboard"
                  className={`text-sm font-medium transition-colors ${
                    isActive('/dashboard')
                      ? 'text-white'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  {t('nav.dashboard')}
                </Link>
                <button
                  onClick={logout}
                  className="text-sm font-medium text-white/70 hover:text-white transition-colors"
                >
                  {t('nav.logout')}
                </button>
                <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-medium">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-white/70 hover:text-white transition-colors"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/schedule"
                  className="bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all duration-200"
                >
                  {t('nav.schedule')}
                </Link>
              </div>
            )}
          </div>

          <button
            className="md:hidden text-white p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-glass-white-15 backdrop-blur-xl border-t border-white/20">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block py-2 text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'text-white'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-2 text-sm font-medium text-white/70 hover:text-white transition-colors"
                >
                  {t('nav.dashboard')}
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="block py-2 text-sm font-medium text-white/70 hover:text-white transition-colors"
                >
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-2 text-sm font-medium text-white/70 hover:text-white transition-colors"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/schedule"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all duration-200 text-center"
                >
                  {t('nav.schedule')}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
