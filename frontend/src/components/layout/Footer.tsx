import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, MapPin } from 'lucide-react';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

function InstagramIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white/90 backdrop-blur-xl border-t border-slate-200/80 mt-auto w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 w-full">
        {/* Main Footer Grid: Clean 3-Column Centered & Balanced Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 items-start text-center md:text-left">
          {/* 1. Brand Info & Socials */}
          <div className="flex flex-col items-center md:items-start space-y-3.5">
            <Link to="/" className="flex items-center gap-2.5 group">
              <img
                src="/logo.png"
                alt="LaundryGo"
                className="w-10 h-10 object-contain drop-shadow-xs group-hover:scale-105 transition-transform shrink-0"
              />
              <span className="text-slate-900 font-extrabold text-xl tracking-tight">
                {t('app.name')}
              </span>
            </Link>
            <p className="text-slate-600 text-sm leading-relaxed max-w-sm">
              {t('footer.description')}
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://www.instagram.com/laundrygodenver?igsh=ZjdicWYxZG5wMXpy"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram @laundrygodenver"
                className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shadow-xs hover:shadow-md hover:scale-108 transition-all active:scale-95"
              >
                <InstagramIcon className="w-5 h-5" />
              </a>
              <a
                href="mailto:info@thelaundrygo.com"
                aria-label="Email"
                className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-all hover:scale-105"
              >
                <Mail className="w-4.5 h-4.5" />
              </a>
              <a
                href="tel:7205908632"
                aria-label="Phone"
                className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-all hover:scale-105"
              >
                <Phone className="w-4.5 h-4.5" />
              </a>
            </div>
          </div>

          {/* 2. Quick Links */}
          <div className="flex flex-col items-center md:items-center">
            <div className="space-y-3">
              <h3 className="text-slate-900 font-extrabold text-xs tracking-wider uppercase">
                {t('footer.quickLinks')}
              </h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link to="/" className="text-slate-600 hover:text-blue-600 font-semibold transition-colors">
                    {t('nav.home')}
                  </Link>
                </li>
                <li>
                  <Link to="/schedule" className="text-slate-600 hover:text-blue-600 font-semibold transition-colors">
                    {t('nav.schedule')}
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="text-slate-600 hover:text-blue-600 font-semibold transition-colors">
                    {t('nav.login')} / {t('nav.dashboard')}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* 3. Contact & Service Zone */}
          <div className="flex flex-col items-center md:items-end">
            <div className="space-y-3">
              <h3 className="text-slate-900 font-extrabold text-xs tracking-wider uppercase">
                {t('footer.contact')}
              </h3>
              <ul className="space-y-2.5 text-sm text-slate-600">
                <li className="flex items-center justify-center md:justify-end gap-2">
                  <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                  <a href="mailto:info@thelaundrygo.com" className="hover:text-blue-600 font-medium transition-colors">
                    info@thelaundrygo.com
                  </a>
                </li>
                <li className="flex items-center justify-center md:justify-end gap-2">
                  <Phone className="w-4 h-4 text-blue-600 shrink-0" />
                  <a href="tel:7205908632" className="hover:text-blue-600 font-medium transition-colors">
                    (720) 590-8632
                  </a>
                </li>
                <li className="flex items-center justify-center md:justify-end gap-2">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Denver, Colorado & Metro Area</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-center">
          <p className="text-slate-500 text-xs sm:text-sm font-medium">
            &copy; {currentYear} {t('app.name')}. {t('footer.rights')}
          </p>
          <LanguageSwitcher />
        </div>
      </div>
    </footer>
  );
}

