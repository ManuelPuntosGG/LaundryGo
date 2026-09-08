import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Phone, Mail, MapPin, Clock, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="w-full bg-slate-900 text-slate-300 pt-16 pb-12 mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 pb-12 border-b border-slate-800">
          {/* Brand & Description */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3 group">
              <img
                src="/logo.png"
                alt="GoPropertyCare"
                className="w-10 h-10 object-contain rounded-lg bg-white/10 p-1"
              />
              <span className="text-white font-extrabold text-xl tracking-tight">
                {t('app.name')}
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              {t('app.tagline')}. Hospital-grade cleanliness, insured staff, and transparent per-square-foot pricing.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>100% Satisfaction & Safety Guarantee</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-white font-bold text-sm uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-emerald-400 transition-colors">
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-emerald-400 transition-colors">
                  {t('nav.about')}
                </Link>
              </li>
              <li>
                <Link to="/schedule" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  {t('nav.schedule')}
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-emerald-400 transition-colors">
                  {t('nav.dashboard')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-3">
            <h3 className="text-white font-bold text-sm uppercase tracking-wider">
              Cleaning Tiers
            </h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Regular Maintenance ($0.10/sqft)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Deep Clean - GoFurther ($0.16/sqft)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Move-In / Move-Out ($0.20/sqft)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Post-Construction ($0.26/sqft)</span>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h3 className="text-white font-bold text-sm uppercase tracking-wider">
              Contact & Area
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href="tel:7205908632" className="hover:text-emerald-400 transition-colors">
                  (720) 590-8632
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href="mailto:info@gopropertycare.com" className="hover:text-emerald-400 transition-colors">
                  info@gopropertycare.com
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-slate-400">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Denver Metropolitan Area & Boulder, CO</span>
              </li>
              <li className="flex items-center gap-2.5 text-slate-400 text-xs pt-1">
                <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>Mon – Sat: 7:00 AM – 7:00 PM</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} GoPropertyCare. All rights reserved.</p>
          <p className="flex items-center gap-4">
            <span>Powered by unified clean infrastructure</span>
            <span>•</span>
            <span>Denver, Colorado</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
