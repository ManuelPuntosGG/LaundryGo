import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, User, LogOut, LayoutDashboard, Building2, HardHat } from 'lucide-react';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { useAuthContext } from '@/providers/AuthProvider';

export function Navbar() {
  const { t } = useTranslation();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuthContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 inset-x-0 z-50 w-full pt-3 sm:pt-4 pb-2 px-3 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto bg-white/95 backdrop-blur-xl border border-stone-200/90 rounded-2xl shadow-sm px-3.5 sm:px-8 h-16 sm:h-18 flex items-center justify-between transition-all">
        {/* Logo / Brand Mark */}
        <Link to="/" className="flex items-center gap-2 sm:gap-3 group shrink-0 py-1 transition-transform active:scale-95 min-w-0">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#815133] to-[#573725] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
            <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-[#eedecd]" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-stone-950 font-black text-sm sm:text-base lg:text-lg tracking-tight uppercase leading-tight group-hover:text-[#815133] transition-colors truncate">
              {t('app.name')}
            </span>
            <span className="text-[9px] sm:text-[11px] font-bold text-stone-500 tracking-wider uppercase hidden sm:block truncate">
              {t('app.subtitle')}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links & Controls */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className={`text-sm font-bold transition-all relative py-1.5 whitespace-nowrap hover:scale-105 ${
                isActive('/')
                  ? 'text-[#815133]'
                  : 'text-stone-700 hover:text-[#815133]'
              }`}
            >
              {t('nav.home')}
              {isActive('/') && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#815133] rounded-full animate-fade-in" />
              )}
            </Link>

            <Link
              to="/about"
              className={`text-sm font-bold transition-all relative py-1.5 whitespace-nowrap hover:scale-105 ${
                isActive('/about')
                  ? 'text-[#815133]'
                  : 'text-stone-700 hover:text-[#815133]'
              }`}
            >
              {t('nav.about')}
              {isActive('/about') && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#815133] rounded-full animate-fade-in" />
              )}
            </Link>
          </div>

          <div className="h-5 w-px bg-stone-200" />

          <LanguageSwitcher />

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                className={`flex items-center gap-2 text-sm font-bold px-3.5 py-2 rounded-xl transition-all whitespace-nowrap hover:scale-102 ${
                  isActive('/dashboard')
                    ? 'bg-[#f7efe6] text-[#573725] font-extrabold'
                    : 'text-stone-700 hover:text-[#573725] hover:bg-stone-100'
                }`}
              >
                <LayoutDashboard className="w-4.5 h-4.5 shrink-0 text-[#815133]" />
                {t('nav.dashboard')}
              </Link>

              <Link
                to="/schedule"
                className="inline-flex items-center gap-2 bg-[#815133] hover:bg-[#6a422a] active:bg-[#573725] text-white text-sm font-bold px-4 py-2 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
              >
                <HardHat className="w-4 h-4" />
                {t('nav.schedule')}
              </Link>

              <div className="flex items-center gap-2.5 bg-[#f7efe6]/70 border border-[#e0c3a7]/80 rounded-xl px-3 py-1.5 shrink-0">
                <div className="w-7 h-7 rounded-lg bg-[#815133] text-white text-xs font-extrabold flex items-center justify-center shrink-0">
                  {user?.first_name?.[0] || 'U'}
                </div>
                <button
                  onClick={logout}
                  className="text-stone-500 hover:text-rose-600 transition-colors p-1 rounded-md hover:bg-rose-50 cursor-pointer"
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
                className="text-sm font-bold text-stone-700 hover:text-[#815133] px-3.5 py-2 transition-colors whitespace-nowrap"
              >
                {t('nav.login')}
              </Link>
              <Link
                to="/schedule"
                className="inline-flex items-center gap-2 bg-[#815133] hover:bg-[#6a422a] active:bg-[#573725] text-white text-sm font-bold px-4 py-2 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
              >
                <HardHat className="w-4 h-4" />
                {t('nav.schedule')}
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button — Hamburger only for clean, non-overflowing header */}
        <div className="flex items-center md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 sm:p-2.5 rounded-xl text-stone-700 hover:text-stone-900 bg-stone-100/90 border border-stone-200/80 focus:outline-none transition-transform active:scale-95 shrink-0 cursor-pointer"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5.5 h-5.5" /> : <Menu className="w-5.5 h-5.5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-2 bg-white/95 backdrop-blur-xl border border-stone-200 rounded-2xl shadow-xl p-4 sm:p-5 animate-fade-in space-y-3">
          <div className="flex flex-col gap-1.5">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center h-11 px-4 rounded-xl text-sm font-bold transition-colors ${
                isActive('/') ? 'bg-[#f7efe6] text-[#573725] font-extrabold border border-[#e0c3a7]' : 'text-stone-700 hover:bg-stone-50'
              }`}
            >
              {t('nav.home')}
            </Link>
            <Link
              to="/about"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center h-11 px-4 rounded-xl text-sm font-bold transition-colors ${
                isActive('/about') ? 'bg-[#f7efe6] text-[#573725] font-extrabold border border-[#e0c3a7]' : 'text-stone-700 hover:bg-stone-50'
              }`}
            >
              {t('nav.about')}
            </Link>
            <Link
              to="/schedule"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 h-11 px-4 rounded-xl text-sm font-extrabold text-white bg-[#815133] hover:bg-[#6a422a] shadow-sm transition-all active:scale-98"
            >
              <HardHat className="w-4 h-4" />
              <span>{t('nav.schedule')}</span>
            </Link>
          </div>

          <div className="h-px bg-stone-100 my-1" />

          {isAuthenticated ? (
            <div className="space-y-1.5">
              <Link
                to="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-bold transition-colors ${
                  isActive('/dashboard') ? 'bg-[#f7efe6] text-[#573725] font-extrabold border border-[#e0c3a7]' : 'text-stone-700 hover:bg-stone-50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-[#815133]" />
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
              className="flex items-center justify-center gap-2 w-full h-10 rounded-xl text-sm font-bold border border-stone-300 text-stone-800 hover:bg-stone-50"
            >
              <User className="w-4 h-4 text-stone-500" />
              <span>{t('nav.login')}</span>
            </Link>
          )}

          {/* Bottom Utilities: Region Info & Language Switcher */}
          <div className="flex items-center justify-between pt-3 border-t border-stone-100">
            <span className="text-xs text-stone-500 font-bold">
              Denver & Boulder, CO
            </span>
            <LanguageSwitcher />
          </div>
        </div>
      )}
    </header>
  );
}
