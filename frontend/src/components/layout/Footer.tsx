import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sparkles, Mail, Phone, MapPin, Globe, MessageCircle, Send } from 'lucide-react';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

export function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white/90 backdrop-blur-xl border-t border-slate-200/80 mt-auto w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          <div className="col-span-1 md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-slate-900 font-extrabold text-xl tracking-tight">
                {t('app.name')}
              </span>
            </Link>
            <p className="text-slate-600 text-sm leading-relaxed max-w-md">
              {t('footer.description')}
            </p>
            <div className="flex items-center gap-2.5 pt-2">
              <a href="#" aria-label="Website" className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all hover:scale-105">
                <Globe className="w-4 h-4" />
              </a>
              <a href="#" aria-label="Chat" className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all hover:scale-105">
                <MessageCircle className="w-4 h-4" />
              </a>
              <a href="#" aria-label="Share" className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all hover:scale-105">
                <Send className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-slate-900 font-bold text-xs tracking-wider uppercase mb-4">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2.5">
              <li>
                <Link to="/" className="text-slate-600 hover:text-blue-600 text-sm font-medium transition-colors">
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link to="/schedule" className="text-slate-600 hover:text-blue-600 text-sm font-medium transition-colors">
                  {t('nav.schedule')}
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-slate-600 hover:text-blue-600 text-sm font-medium transition-colors">
                  {t('nav.login')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-slate-900 font-bold text-xs tracking-wider uppercase mb-4">{t('footer.contact')}</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2.5 text-slate-600 text-sm">
                <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                <span>hello@laundrygo.com</span>
              </li>
              <li className="flex items-center gap-2.5 text-slate-600 text-sm">
                <Phone className="w-4 h-4 text-blue-600 shrink-0" />
                <span>(303) 555-0123</span>
              </li>
              <li className="flex items-center gap-2.5 text-slate-600 text-sm">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{t('home.contact.address')}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-xs sm:text-sm">
            &copy; {currentYear} {t('app.name')}. {t('footer.rights')}
          </p>
          <LanguageSwitcher />
        </div>
      </div>
    </footer>
  );
}
