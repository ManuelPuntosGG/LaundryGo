import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, MapPin, Building2, ShieldCheck } from 'lucide-react';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

export function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white/90 backdrop-blur-xl border-t border-stone-200/80 mt-auto w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 items-start text-center md:text-left">
          {/* 1. Brand Info & Compliance */}
          <div className="flex flex-col items-center md:items-start space-y-3.5">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#815133] to-[#573725] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
                <Building2 className="w-5 h-5 text-[#eedecd]" />
              </div>
              <span className="text-stone-950 font-black text-lg tracking-tight uppercase group-hover:text-[#815133] transition-colors">
                {t('app.name')}
              </span>
            </Link>
            <p className="text-stone-600 text-sm leading-relaxed max-w-sm font-medium">
              {t('footer.description')}
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#f7efe6] border border-[#e0c3a7] text-[#573725] text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-[#815133]" />
              <span>100% General Liability & Workers' Comp</span>
            </div>
          </div>

          {/* 2. Quick Links */}
          <div className="flex flex-col items-center md:items-center">
            <div className="space-y-3">
              <h3 className="text-stone-900 font-extrabold text-xs tracking-wider uppercase">
                {t('footer.quickLinks')}
              </h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link to="/" className="text-stone-600 hover:text-[#815133] font-semibold transition-colors">
                    {t('nav.home')}
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-stone-600 hover:text-[#815133] font-semibold transition-colors">
                    {t('nav.about')}
                  </Link>
                </li>
                <li>
                  <Link to="/schedule" className="text-stone-600 hover:text-[#815133] font-semibold transition-colors">
                    {t('nav.schedule')}
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="text-stone-600 hover:text-[#815133] font-semibold transition-colors">
                    {t('nav.login')} / {t('nav.dashboard')}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* 3. Contact & Regional Coverage */}
          <div className="flex flex-col items-center md:items-end">
            <div className="space-y-3">
              <h3 className="text-stone-900 font-extrabold text-xs tracking-wider uppercase">
                {t('footer.contactArea')}
              </h3>
              <ul className="space-y-2.5 text-sm text-stone-600 font-medium">
                <li className="flex items-center justify-center md:justify-end gap-2">
                  <Mail className="w-4 h-4 text-[#815133] shrink-0" />
                  <a href="mailto:info@evolvingsolutionsllc.com" className="hover:text-[#815133] transition-colors">
                    info@evolvingsolutionsllc.com
                  </a>
                </li>
                <li className="flex items-center justify-center md:justify-end gap-2">
                  <Phone className="w-4 h-4 text-[#815133] shrink-0" />
                  <a href="tel:7205908632" className="hover:text-[#815133] transition-colors">
                    (720) 590-8632
                  </a>
                </li>
                <li className="flex items-center justify-center md:justify-end gap-2">
                  <MapPin className="w-4 h-4 text-[#815133] shrink-0" />
                  <span>Denver Metropolitan Area & Boulder, CO</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-stone-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-center">
          <p className="text-stone-600 text-xs sm:text-sm font-medium">
            &copy; {currentYear} {t('app.name')}. {t('footer.rights')}
          </p>
          <LanguageSwitcher />
        </div>
      </div>
    </footer>
  );
}
