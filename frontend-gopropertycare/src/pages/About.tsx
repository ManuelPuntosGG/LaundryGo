import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  ShieldCheck,
  Leaf,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Clock,
  ArrowRight,
  CheckSquare,
  HeartHandshake,
  UserCheck,
  Compass,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SEO } from '@/components/common/SEO';

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

export function About() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-10 sm:gap-14 py-4 sm:py-6 max-w-6xl mx-auto">
      <SEO
        title={t('about.title', 'About GoPropertyCare — Trusted Home Cleaning in Denver & Boulder')}
        description={t('about.subtitle', 'Meet GoPropertyCare. Fully insured professional cleaners serving Denver, Boulder, Lakewood, Aurora, and surrounding areas.')}
        canonical="https://gopropertycare.com/about"
      />

      {/* 1. Header & Hero Section */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          {t('about.title')}
        </h1>
        <p className="text-base sm:text-lg text-slate-700 font-medium leading-relaxed max-w-2xl mx-auto">
          {t('about.subtitle')}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link to="/services" className="w-full sm:w-auto inline-flex">
            <Button size="lg" className="w-full sm:w-auto font-black px-8 shadow-md shadow-emerald-600/20 hover:scale-102 transition-transform">
              <Sparkles className="w-4.5 h-4.5 mr-1.5 shrink-0" />
              {t('about.contactInfo.exploreServicesBtn', 'View Our Services')}
              <ArrowRight className="w-4.5 h-4.5 ml-1.5 shrink-0" />
            </Button>
          </Link>
          <Link to="/schedule" className="w-full sm:w-auto inline-flex">
            <Button variant="outline" size="lg" className="w-full sm:w-auto font-bold px-6 hover:scale-102 transition-transform">
              {t('about.cta.scheduleBtn', 'Book Online')}
            </Button>
          </Link>
        </div>
      </section>

      {/* 2. Mission Card with Logo */}
      <section>
        <Card className="p-8 sm:p-12 border-slate-200/90 bg-white shadow-sm flex flex-col md:flex-row items-center gap-8 lg:gap-10">
          <div className="w-full md:w-1/3 flex justify-center">
            <img
              src="/logo.png"
              alt="GoPropertyCare Mascot & Logo"
              className="w-44 sm:w-52 h-auto object-contain drop-shadow-md rounded-2xl bg-white p-3 border border-slate-100 animate-float"
            />
          </div>
          <div className="w-full md:w-2/3 space-y-4">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {t('about.mission.title')}
            </h2>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-medium">
              {t('about.mission.description')}
            </p>
            <div className="pt-2 flex flex-wrap gap-4 text-xs font-bold text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{t('about.insuredBadge', 'Fully Insured Personnel')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Leaf className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{t('about.ecoBadge', 'Family & Pet Safe Supplies')}</span>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* 3. Core Customer Guarantees (Focusing on Peace of Mind) */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t('about.guarantees.title', 'Our Core Guarantees')}
          </h2>
          <p className="text-slate-600 text-sm sm:text-base font-medium">
            {t('about.guarantees.subtitle', 'Uncompromising standards delivering absolute confidence to property owners and hosts.')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card className="p-6 space-y-3 border-slate-200/90 hover:border-emerald-300 hover:shadow-md transition-all">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-5.5 h-5.5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">
              {t('about.guarantees.insured', '100% Insured Personnel')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              {t('about.guarantees.insuredDesc', 'Full liability protection safeguarding your home and belongings on every cleaning appointment.')}
            </p>
          </Card>

          <Card className="p-6 space-y-3 border-slate-200/90 hover:border-emerald-300 hover:shadow-md transition-all">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <UserCheck className="w-5.5 h-5.5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">
              {t('about.guarantees.vetted', 'Background-Checked Specialists')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              {t('about.guarantees.vettedDesc', 'Punctual, vetted, and thoroughly trained specialists dedicated to your peace of mind.')}
            </p>
          </Card>

          <Card className="p-6 space-y-3 border-slate-200/90 hover:border-emerald-300 hover:shadow-md transition-all">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckSquare className="w-5.5 h-5.5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">
              {t('about.guarantees.satisfaction', 'Satisfaction Guaranteed')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              {t('about.guarantees.satisfactionDesc', 'Every visit follows strict inspection checklists to guarantee spotless, dependable 5-star results.')}
            </p>
          </Card>

          <Card className="p-6 space-y-3 border-slate-200/90 hover:border-emerald-300 hover:shadow-md transition-all">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Leaf className="w-5.5 h-5.5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">
              {t('about.guarantees.ecoSafe', 'Family & Pet Friendly')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              {t('about.guarantees.ecoSafeDesc', 'High-grade cleaning supplies carefully selected to protect the health of your loved ones and pets.')}
            </p>
          </Card>
        </div>
      </section>

      {/* 4. Company Details & Direct Contact Section */}
      <section id="company-contact" className="space-y-6 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t('about.contactInfo.title', 'Company Details & Direct Support')}
          </h2>
          <p className="text-slate-600 text-sm sm:text-base font-medium">
            {t('about.contactInfo.subtitle', 'Connect directly with our local Denver and Boulder management team.')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Phone Card */}
          <Card className="p-6 space-y-4 border-slate-200/90 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Phone className="w-5.5 h-5.5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  {t('about.contactInfo.phoneLabel', 'Direct Phone')}
                </h3>
                <p className="text-lg font-black text-emerald-700 mt-1">
                  (720) 590-8632
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Direct call or text message support.
                </p>
              </div>
            </div>
            <a
              href="tel:7205908632"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>{t('about.contactInfo.callBtn', 'Call (720) 590-8632')}</span>
            </a>
          </Card>

          {/* Email Card */}
          <Card className="p-6 space-y-4 border-slate-200/90 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Mail className="w-5.5 h-5.5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  {t('about.contactInfo.emailLabel', 'Email Address')}
                </h3>
                <p className="text-base font-black text-slate-900 mt-1 break-all">
                  info@gopropertycare.com
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Proposals, inquiries, and customer care.
                </p>
              </div>
            </div>
            <a
              href="mailto:info@gopropertycare.com"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl font-bold text-sm bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span>{t('about.contactInfo.emailBtn', 'Send an Email')}</span>
            </a>
          </Card>

          {/* Service Area & Hours Card */}
          <Card className="p-6 space-y-4 border-slate-200/90 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between md:col-span-2 lg:col-span-1">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <MapPin className="w-5.5 h-5.5" />
              </div>
              <div className="space-y-2">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    {t('about.contactInfo.coverageLabel', 'Service Areas')}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 font-semibold mt-0.5">
                    {t('about.contactInfo.coverageValue', 'Denver Metropolitan Area & Boulder, CO')}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-start gap-2">
                  <Clock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      {t('about.contactInfo.hoursLabel', 'Service Hours')}
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {t('about.contactInfo.hoursValue', 'Monday – Saturday: 8:00 AM – 6:00 PM')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">
                {t('about.contactInfo.instagramLabel', 'Official Instagram')}:
              </span>
              <a
                href="https://www.instagram.com/gopropertycare?stkn=OHlxNHBpMGdwYTEx"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-black text-rose-600 hover:text-rose-700 transition-colors"
              >
                <InstagramIcon className="w-4 h-4" />
                <span>@gopropertycare</span>
              </a>
            </div>
          </Card>
        </div>
      </section>

      {/* 5. Company Values 4-Grid */}
      <section className="space-y-6">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 text-center tracking-tight">
          {t('about.pillarsTitle', 'Why Choose GoPropertyCare?')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 space-y-3 hover:-translate-y-1 hover:shadow-md hover:border-emerald-300 transition-all duration-300 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-100 transition-all duration-300">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base group-hover:text-emerald-950 transition-colors">
              {t('about.values.ecoTitle')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              {t('about.values.ecoDesc')}
            </p>
          </Card>

          <Card className="p-6 space-y-3 hover:-translate-y-1 hover:shadow-md hover:border-emerald-300 transition-all duration-300 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-100 transition-all duration-300">
              <CheckSquare className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base group-hover:text-emerald-950 transition-colors">
              {t('about.values.vettedTitle')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              {t('about.values.vettedDesc')}
            </p>
          </Card>

          <Card className="p-6 space-y-3 hover:-translate-y-1 hover:shadow-md hover:border-emerald-300 transition-all duration-300 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-100 transition-all duration-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base group-hover:text-emerald-950 transition-colors">
              {t('about.values.standardTitle')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              {t('about.values.standardDesc')}
            </p>
          </Card>

          <Card className="p-6 space-y-3 hover:-translate-y-1 hover:shadow-md hover:border-emerald-300 transition-all duration-300 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-100 transition-all duration-300">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base group-hover:text-emerald-950 transition-colors">
              {t('about.values.pricingTitle')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              {t('about.values.pricingDesc')}
            </p>
          </Card>
        </div>
      </section>

      {/* 6. CTA Box */}
      <section className="text-center py-4">
        <Card variant="none" className="p-8 sm:p-12 bg-linear-to-r from-emerald-800 to-emerald-950 text-white max-w-4xl mx-auto shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-black mb-3 text-white">
            {t('about.cta.title', 'Ready to Experience Impeccable Property Care?')}
          </h2>
          <p className="text-emerald-100 text-sm sm:text-base max-w-xl mx-auto mb-8 font-medium">
            {t('about.cta.subtitle', 'Book your service online in minutes. Enjoy transparent rates and zero surprise fees in Denver & Boulder.')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/services">
              <Button
                variant="white"
                size="lg"
                className="font-black text-emerald-950 hover:bg-emerald-50 shadow-lg px-8 hover:scale-102 active:scale-98 transition-all duration-200"
              >
                <Compass className="w-5 h-5 mr-2 text-emerald-600" />
                <span className="text-emerald-950 font-black">
                  {t('about.contactInfo.exploreServicesBtn', 'Explore Services')}
                </span>
              </Button>
            </Link>
            <Link to="/schedule">
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-emerald-400 text-white hover:bg-emerald-800/60 shadow-lg px-8 hover:scale-102 active:scale-98 transition-all duration-200"
              >
                <Sparkles className="w-5 h-5 mr-2 text-emerald-300" />
                <span>{t('about.cta.scheduleBtn', 'Book Online')}</span>
              </Button>
            </Link>
          </div>
        </Card>
      </section>
    </div>
  );
}
