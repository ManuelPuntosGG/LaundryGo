import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, Sparkles, User, LogOut, LayoutDashboard } from 'lucide-react';
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
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm group-hover:bg-blue-700 transition-all group-hover:scale-105 shrink-0">
            <Sparkles className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
          </div>
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

            <a
              href="/#services"
              className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-all relative py-1.5 whitespace-nowrap hover:scale-105"
            >
              {t('footer.services')}
            </a>
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

      {/* Mobile Drawer Menu — Reordered per user request */}
      {isMobileMenuOpen && (
        <div className="max-w-7xl mx-auto mt-2 bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl shadow-xl animate-fade-in">
          <div className="flex flex-col items-center justify-center text-center space-y-4 py-6 px-6 max-w-sm mx-auto">
            {/* 1. Home */}
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`text-center text-lg font-extrabold transition-colors py-1 ${
                isActive('/') ? 'text-blue-600' : 'text-slate-800 hover:text-blue-600'
              }`}
            >
              {t('nav.home')}
            </Link>

            {/* 2. Services */}
            <a
              href="/#services"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-center text-lg font-extrabold text-slate-800 hover:text-blue-600 transition-colors py-1"
            >
              {t('footer.services')}
            </a>

            {/* 3. Primary CTA: Schedule Pickup directly under Services */}
            <div className="w-full pt-1">
              <Link
                to="/schedule"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full max-w-xs text-center inline-flex items-center justify-center h-12 px-6 text-base font-extrabold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all active:scale-98"
              >
                {t('nav.schedule')}
              </Link>
            </div>

            <div className="h-px bg-slate-200/80 w-full my-2" />

            {/* 4. Login / Dashboard */}
            {isAuthenticated ? (
              <div className="flex flex-col items-center gap-3 w-full">
                <Link
                  to="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full max-w-xs text-center inline-flex items-center justify-center gap-2 h-11 px-6 text-sm font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                >
                  <LayoutDashboard className="w-4.5 h-4.5 text-blue-600 shrink-0" />
                  {t('nav.dashboard')}
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full max-w-xs text-center inline-flex items-center justify-center gap-2 h-11 px-6 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all"
                >
                  <LogOut className="w-4.5 h-4.5 shrink-0" />
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <div className="w-full flex justify-center">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full max-w-xs text-center inline-flex items-center justify-center h-11 px-6 text-sm font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                >
                  {t('nav.login')}
                </Link>
              </div>
            )}

            {/* 5. Language Switcher directly under Login */}
            <div className="pt-2">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
