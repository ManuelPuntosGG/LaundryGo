import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { useAuthContext } from '@/providers/AuthProvider';

export function Navbar() {
  const { t } = useTranslation();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuthContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 inset-x-0 z-50 w-full pt-3 sm:pt-4 pb-2 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-sm px-4 sm:px-8 h-16 sm:h-18 flex items-center justify-between transition-all">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0 py-1 transition-transform active:scale-95">
          <img
            src="/logo.png"
            alt="LaundryGo"
            className="w-10 h-10 sm:w-11 sm:h-11 object-contain drop-shadow-xs group-hover:scale-105 transition-transform shrink-0"
          />
          <span className="text-slate-900 font-extrabold text-lg sm:text-xl tracking-tight whitespace-nowrap group-hover:text-blue-600 transition-colors">
            {t('app.name')}
          </span>
        </Link>

        {/* Desktop Navigation Links & Right Controls */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className={`text-sm font-bold transition-all relative py-1.5 whitespace-nowrap hover:scale-105 ${
                isActive('/')
                  ? 'text-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('nav.home')}
              {isActive('/') && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full animate-fade-in" />
              )}
            </Link>

            <Link
              to="/schedule"
              className={`text-sm font-bold transition-all relative py-1.5 whitespace-nowrap hover:scale-105 ${
                isActive('/schedule')
                  ? 'text-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('nav.schedule')}
              {isActive('/schedule') && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full animate-fade-in" />
              )}
            </Link>
          </div>

          <div className="h-5 w-px bg-slate-200" />

          <LanguageSwitcher />

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                className={`flex items-center gap-2 text-sm font-bold px-3.5 py-2 rounded-xl transition-all whitespace-nowrap hover:scale-102 ${
                  isActive('/dashboard')
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <LayoutDashboard className="w-4.5 h-4.5 shrink-0" />
                {t('nav.dashboard')}
              </Link>

              <div className="flex items-center gap-2.5 bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 shrink-0">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white text-xs font-extrabold flex items-center justify-center shrink-0">
                  {user?.first_name?.[0] || 'U'}
                </div>
                <button
                  onClick={logout}
                  title={t('nav.logout')}
                  className="text-slate-500 hover:text-red-600 transition-colors p-1"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3.5">
              <Link
                to="/login"
                className="flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:text-slate-900 px-3 py-2 transition-all whitespace-nowrap hover:scale-102"
              >
                <User className="w-4 h-4 text-slate-500 shrink-0" />
                {t('nav.login')}
              </Link>
              <Link
                to="/schedule"
                className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-extrabold h-11 px-6 rounded-xl transition-all shadow-sm hover:shadow-md hover:scale-102 active:scale-98 whitespace-nowrap"
              >
                {t('nav.schedule')}
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Header Controls — Hamburger Menu Only */}
        <div className="flex items-center md:hidden">
          <button
            className="text-slate-700 hover:text-slate-900 p-2.5 rounded-xl bg-slate-100 border border-slate-200 focus:outline-none transition-transform active:scale-95 shrink-0"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5.5 h-5.5" /> : <Menu className="w-5.5 h-5.5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="max-w-7xl mx-auto mt-2 bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl shadow-xl animate-fade-in p-4 sm:p-5">
          <div className="flex flex-col gap-3 max-w-sm mx-auto">
            {/* Primary Navigation Links */}
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center justify-center h-10 px-4 rounded-xl text-sm font-bold transition-colors ${
                  isActive('/')
                    ? 'bg-blue-50 text-blue-600 border border-blue-200'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                }`}
              >
                {t('nav.home')}
              </Link>

              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl text-sm font-bold transition-colors ${
                    isActive('/dashboard')
                      ? 'bg-blue-50 text-blue-600 border border-blue-200'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>{t('nav.dashboard')}</span>
                </Link>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl text-sm font-bold transition-colors ${
                    isActive('/login')
                      ? 'bg-blue-50 text-blue-600 border border-blue-200'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                  }`}
                >
                  <User className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>{t('nav.login')}</span>
                </Link>
              )}
            </div>

            {/* Single Primary Action: Schedule Pickup */}
            <Link
              to="/schedule"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full text-center inline-flex items-center justify-center h-11 px-6 text-sm font-extrabold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all active:scale-98"
            >
              {t('nav.schedule')}
            </Link>

            {/* Bottom Utilities: User / Logout & Language Switcher */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white text-xs font-extrabold flex items-center justify-center shrink-0">
                    {user?.first_name?.[0] || 'U'}
                  </div>
                  <span className="text-xs font-bold text-slate-800 truncate max-w-[120px]">
                    {user?.first_name || user?.email?.split('@')[0]}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    title={t('nav.logout')}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="text-xs text-slate-500 font-semibold">
                  LaundryGo Denver
                </div>
              )}

              <LanguageSwitcher />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
