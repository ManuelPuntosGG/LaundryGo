import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Droplets, Mail, Phone, MapPin, Globe, MessageCircle, Send } from 'lucide-react';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

export function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-glass-white-5 backdrop-blur-md border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Droplets className="w-8 h-8 text-primary-400" />
              <span className="text-white font-bold text-xl">{t('app.name')}</span>
            </Link>
            <p className="text-white/60 text-sm mb-6 max-w-md">
              {t('footer.description')}
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-10 h-10 rounded-xl bg-glass-white-10 border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-glass-white-20 transition-all">
                <Globe className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-glass-white-10 border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-glass-white-20 transition-all">
                <MessageCircle className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-glass-white-10 border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-glass-white-20 transition-all">
                <Send className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-white/60 hover:text-white text-sm transition-colors">
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link to="/schedule" className="text-white/60 hover:text-white text-sm transition-colors">
                  {t('nav.schedule')}
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-white/60 hover:text-white text-sm transition-colors">
                  {t('nav.login')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">{t('footer.contact')}</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-white/60 text-sm">
                <Mail className="w-4 h-4" />
                <span>hello@laundrygo.com</span>
              </li>
              <li className="flex items-center gap-2 text-white/60 text-sm">
                <Phone className="w-4 h-4" />
                <span>(303) 555-0123</span>
              </li>
              <li className="flex items-center gap-2 text-white/60 text-sm">
                <MapPin className="w-4 h-4" />
                <span>{t('home.contact.address')}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/40 text-sm">
              &copy; {currentYear} {t('app.name')}. {t('footer.rights')}
            </p>
            <div className="md:hidden">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
