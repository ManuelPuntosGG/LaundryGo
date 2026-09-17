import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, User, LogOut, LayoutDashboard, Sparkles } from 'lucide-react';
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
      <div className="max-w-7xl mx-auto bg-white/95 backdrop-blur-xl border border-emerald-100/90 rounded-2xl shadow-sm px-4 sm:px-8 h-16 sm:h-18 flex items-center justify-between transition-all">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0 py-1 transition-transform active:scale-95">
          <img
            src="/logo.png"
            alt="GoPropertyCare"
            className="w-10 h-10 sm:w-11 sm:h-11 object-contain drop-shadow-xs group-hover:scale-105 transition-transform shrink-0 rounded-lg"
          />
          <span className="text-slate-900 font-extrabold text-lg sm:text-xl tracking-tight whitespace-nowrap group-hover:text-emerald-700 transition-colors">
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
                  ? 'text-emerald-700'
                  : 'text-slate-700 hover:text-emerald-700'
              }`}
            >
              {t('nav.home')}
              {isActive('/') && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full animate-fade-in" />
              )}
            </Link>

            <Link
              to="/about"
              className={`text-sm font-bold transition-all relative py-1.5 whitespace-nowrap hover:scale-105 ${
                isActive('/about')
                  ? 'text-emerald-700'
                  : 'text-slate-700 hover:text-emerald-700'
              }`}
            >
              {t('nav.about')}
              {isActive('/about') && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full animate-fade-in" />
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
                    ? 'bg-emerald-50 text-emerald-800 font-extrabold'
                    : 'text-slate-700 hover:text-emerald-800 hover:bg-slate-100'
                }`}
              >
                <LayoutDashboard className="w-4.5 h-4.5 shrink-0 text-emerald-600" />
                {t('nav.dashboard')}
              </Link>

              <Link
                to="/schedule"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-bold px-4 py-2 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
              >
                <Sparkles className="w-4 h-4" />
                {t('nav.schedule')}
              </Link>

              <div className="flex items-center gap-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl px-3 py-1.5 shrink-0">
                <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white text-xs font-extrabold flex items-center justify-center shrink-0">
                  {user?.first_name?.[0] || 'U'}
                </div>
                <button
                  onClick={logout}
                  className="text-slate-500 hover:text-rose-600 transition-colors p-1 rounded-md hover:bg-rose-50 cursor-pointer"
                  title={t('nav.logout')}
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-bold text-slate-700 hover:text-emerald-700 px-3.5 py-2 transition-colors whitespace-nowrap"
              >
                {t('nav.login')}
              </Link>
              <Link
                to="/schedule"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-bold px-4 py-2 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
              >
                <Sparkles className="w-4 h-4" />
                {t('nav.schedule')}
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button — Hamburger only */}
        <div className="flex items-center md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2.5 rounded-xl text-slate-700 hover:text-slate-900 bg-slate-100/90 border border-slate-200/80 focus:outline-none transition-transform active:scale-95 shrink-0 cursor-pointer"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5.5 h-5.5" /> : <Menu className="w-5.5 h-5.5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-2 bg-white/95 backdrop-blur-xl border border-emerald-100 rounded-2xl shadow-xl p-4 sm:p-5 animate-fade-in space-y-3">
          <div className="flex flex-col gap-1.5">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center h-11 px-4 rounded-xl text-sm font-bold transition-colors ${
                isActive('/') ? 'bg-emerald-50 text-emerald-800 font-extrabold border border-emerald-200' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {t('nav.home')}
            </Link>
            <Link
              to="/about"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center h-11 px-4 rounded-xl text-sm font-bold transition-colors ${
                isActive('/about') ? 'bg-emerald-50 text-emerald-800 font-extrabold border border-emerald-200' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {t('nav.about')}
            </Link>
            <Link
              to="/schedule"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 h-11 px-4 rounded-xl text-sm font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all active:scale-98"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t('nav.schedule')}</span>
            </Link>
          </div>

          <div className="h-px bg-slate-100 my-1" />

          {isAuthenticated ? (
            <div className="space-y-1.5">
              <Link
                to="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-bold transition-colors ${
                  isActive('/dashboard') ? 'bg-emerald-50 text-emerald-800 font-extrabold border border-emerald-200' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                <span>{t('nav.dashboard')}</span>
              </Link>
              <button
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-50 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>{t('nav.logout')}</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full h-10 rounded-xl text-sm font-bold border border-slate-300 text-slate-800 hover:bg-slate-50"
            >
              <User className="w-4 h-4 text-slate-500" />
              <span>{t('nav.login')}</span>
            </Link>
          )}

          {/* Bottom Utilities: Region Info & Language Switcher */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <span className="text-xs text-slate-500 font-bold">
              Denver & Boulder, CO
            </span>
            <LanguageSwitcher />
          </div>
        </div>
      )}
    </header>
  );
}
