import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  Truck,
  Sparkles,
  Package,
  MapPin,
  Mail,
  Phone,
  ArrowRight,
  Clock,
  Zap,
  Star,
  ShieldCheck,
  CheckCircle2,
  Scale,
  Leaf,
  Award,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import api from '@/api';
import type { ServiceRate } from '@/types';

function InstagramIcon({ className = 'w-4 h-4' }: { className?: string }) {
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

export function Home() {
  const { t } = useTranslation();
  const [apiRates, setApiRates] = useState<ServiceRate[]>([]);
  const [estimatedLbs, setEstimatedLbs] = useState<number>(20);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await api.get('/services/rates/');
        const ratesList: ServiceRate[] = Array.isArray(response.data)
          ? response.data
          : response.data?.results || [];
        if (ratesList.length > 0) {
          setApiRates(ratesList);
        }
      } catch (error) {
        console.error('Failed to fetch service rates for Home page:', error);
      }
    };
    fetchRates();
  }, []);

  const steps = [
    {
      icon: Calendar,
      step: '01',
      title: t('home.howItWorks.step1.title'),
      description: t('home.howItWorks.step1.description'),
    },
    {
      icon: Truck,
      step: '02',
      title: t('home.howItWorks.step2.title'),
      description: t('home.howItWorks.step2.description'),
    },
    {
      icon: Sparkles,
      step: '03',
      title: t('home.howItWorks.step3.title'),
      description: t('home.howItWorks.step3.description'),
    },
    {
      icon: Package,
      step: '04',
      title: t('home.howItWorks.step4.title'),
      description: t('home.howItWorks.step4.description'),
    },
  ];

  const fallbackServices = [
    {
      icon: Package,
      name: t('home.pricing.standard.name'),
      rate: 2.25,
      price: t('home.pricing.standard.price'),
      delivery: t('home.pricing.standard.delivery'),
      description: t('home.pricing.standard.description'),
      badge: 'Standard',
      popular: false,
    },
    {
      icon: Zap,
      name: t('home.pricing.go.name'),
      rate: 2.45,
      price: t('home.pricing.go.price'),
      delivery: t('home.pricing.go.delivery'),
      description: t('home.pricing.go.description'),
      badge: 'Most Popular',
      popular: true,
    },
    {
      icon: Star,
      name: t('home.pricing.gofurther.name'),
      rate: 3.85,
      price: t('home.pricing.gofurther.price'),
      delivery: t('home.pricing.gofurther.delivery'),
      description: t('home.pricing.gofurther.description'),
      badge: 'Same-Day Express',
      popular: false,
    },
  ];

  const services =
    apiRates.length > 0
      ? apiRates.map((rate) => {
          let icon = Package;
          let badge = 'Standard';
          let popular = false;

          if (rate.service_type === 'go') {
            icon = Zap;
            badge = 'Most Popular';
            popular = true;
          } else if (rate.service_type === 'gofurther') {
            icon = Star;
            badge = 'Same-Day Express';
            popular = false;
          }

          let deliveryText = `${rate.delivery_days}-day delivery`;
          if (rate.delivery_days === 0) {
            deliveryText = 'Same-day delivery';
          } else if (rate.delivery_days === 1) {
            deliveryText = 'Next-day delivery';
          }

          return {
            icon,
            name: rate.name,
            rate: parseFloat(rate.rate_per_lb),
            price: `$${rate.rate_per_lb}/lb`,
            delivery: deliveryText,
            description:
              rate.description ||
              (rate.service_type === 'standard'
                ? t('home.pricing.standard.description')
                : rate.service_type === 'go'
                ? t('home.pricing.go.description')
                : t('home.pricing.gofurther.description')),
            badge,
            popular,
          };
        })
      : fallbackServices;

  return (
    <div className="w-full flex flex-col gap-10 sm:gap-14 animate-fade-in max-w-6xl mx-auto">
      {/* 1. Hero Section (Compact & High Impact) */}
      <section className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-4 pt-2 sm:pt-4">
        {/* Brand Emblem & Geo Badge */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-extrabold shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{t('home.badge')}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight tracking-tight max-w-2xl">
          {t('home.hero.title')}
        </h1>

        <p className="text-slate-600 text-sm sm:text-base md:text-lg max-w-xl leading-relaxed">
          {t('home.hero.subtitle')}
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1 w-full sm:w-auto">
          <Link to="/schedule" className="w-full sm:w-auto inline-flex">
            <Button
              size="lg"
              className="w-full sm:w-auto font-extrabold px-8 shadow-md shadow-blue-500/20 hover:scale-102 transition-transform"
            >
              {t('home.hero.cta')}
              <ArrowRight className="w-4.5 h-4.5 ml-1.5 shrink-0" />
            </Button>
          </Link>
          <a href="#services" className="w-full sm:w-auto inline-flex">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto font-bold px-6 hover:scale-102 transition-transform"
            >
              <Scale className="w-4 h-4 text-blue-600 mr-1.5" />
              {t('home.hero.secondaryCta')}
            </Button>
          </a>
        </div>

        {/* Compact Trust Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 w-full max-w-2xl text-slate-700">
          <div className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200/70 text-xs font-bold">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400 shrink-0" />
            <span>{t('home.socialProof.rating')}</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200/70 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>{t('home.socialProof.delivered')}</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200/70 text-xs font-bold">
            <Leaf className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{t('home.socialProof.eco')}</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200/70 text-xs font-bold">
            <Award className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>{t('home.socialProof.guarantee')}</span>
          </div>
        </div>
      </section>

      {/* 2. How It Works (Streamlined 4-Step Horizontal Process) */}
      <section className="flex flex-col gap-5 w-full">
        <div className="text-center max-w-lg mx-auto space-y-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('home.howItWorks.title')}
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm">
            {t('home.howItWorks.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
          {steps.map((stepItem, index) => (
            <Card
              key={index}
              variant="flat"
              className="relative p-4 sm:p-5 flex flex-col items-start justify-between border-slate-200/90 hover:border-blue-300 transition-colors group"
            >
              <div className="flex items-center justify-between w-full mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
                  <stepItem.icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-black text-slate-300 group-hover:text-blue-500 transition-colors">
                  {stepItem.step}
                </span>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">{stepItem.title}</h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  {stepItem.description}
                </p>
              </div>
            </Card>
          ))}
        </div>

        <div className="flex justify-center pt-1">
          <Link
            to="/about"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200/70 px-4 py-2 rounded-xl transition-all hover:scale-102"
          >
            <span>{t('home.howItWorks.learnMore')}</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </Link>
        </div>
      </section>

      {/* 3. Pricing Tiers & Interactive Estimator */}
      <section id="services" className="flex flex-col gap-6 w-full scroll-mt-20">
        <div className="text-center max-w-xl mx-auto space-y-1.5">
          <div className="flex flex-wrap items-center justify-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" />
              {t('home.pricing.recurringDiscountBadge')}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold shadow-2xs">
              <Package className="w-3.5 h-3.5" />
              {t('home.pricing.minimumOrderBadge')}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('home.pricing.title')}
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm">
            {t('home.pricing.subtitle')}
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 w-full items-stretch">
          {services.map((service, index) => (
            <Card
              key={index}
              variant={service.popular ? 'featured' : 'interactive'}
              className="relative flex flex-col justify-between p-5 sm:p-6 space-y-4 group"
            >
              <div className="space-y-3 w-full">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
                    <service.icon className="w-5 h-5" />
                  </div>
                  {service.popular && (
                    <span className="bg-blue-600 text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-full shadow-2xs">
                      {service.badge}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900">{service.name}</h3>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl sm:text-3xl font-black text-blue-600">{service.price}</span>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 text-slate-700 text-xs font-semibold bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
                  <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>{service.delivery}</span>
                </div>

                <p className="text-slate-600 text-xs leading-relaxed">{service.description}</p>
              </div>

              <div className="pt-2 w-full">
                <Link to="/schedule" className="block w-full">
                  <Button
                    variant={service.popular ? 'primary' : 'outline'}
                    size="sm"
                    className="w-full font-bold"
                  >
                    {t('home.hero.cta')}
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>

        {/* Compact Estimator Widget */}
        <Card variant="flat" className="p-5 sm:p-6 border-slate-200 space-y-4 w-full bg-slate-50/70">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-blue-600" />
                <span>{t('home.estimator.title')}</span>
              </h3>
              <p className="text-slate-500 text-xs">{t('home.estimator.subtitle')}</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shrink-0 shadow-2xs">
              <span>{t('home.estimator.weightLabel')}:</span>
              <span className="text-blue-600 font-black text-sm">{estimatedLbs} lbs</span>
            </div>
          </div>

          {/* Quick Presets & Slider */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { lbs: 15, title: t('home.estimator.small'), desc: t('home.estimator.smallDesc') },
              { lbs: 30, title: t('home.estimator.medium'), desc: t('home.estimator.mediumDesc') },
              { lbs: 45, title: t('home.estimator.large'), desc: t('home.estimator.largeDesc') },
            ].map((preset) => (
              <button
                key={preset.lbs}
                type="button"
                onClick={() => setEstimatedLbs(preset.lbs)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  estimatedLbs === preset.lbs
                    ? 'bg-blue-50 border-blue-600 shadow-2xs ring-1 ring-blue-600/20'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <p className="text-xs font-extrabold text-slate-900">{preset.title}</p>
                <p className="text-[11px] text-slate-500">{preset.desc}</p>
              </button>
            ))}
          </div>

          <div className="space-y-1">
            <input
              type="range"
              min="10"
              max="80"
              step="5"
              value={estimatedLbs}
              onChange={(e) => setEstimatedLbs(parseInt(e.target.value, 10))}
              className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-semibold px-1">
              <span>10 lbs</span>
              <span>45 lbs</span>
              <span>80 lbs</span>
            </div>
          </div>

          {/* Price Preview Strip */}
          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            {services.map((srv, idx) => {
              const total = Math.max(40, estimatedLbs * srv.rate);
              return (
                <div key={idx} className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <p className="text-[10px] font-bold uppercase text-slate-500 truncate">{srv.name}</p>
                  <p className="text-base sm:text-lg font-black text-slate-900">${total.toFixed(2)}</p>
                </div>
              );
            })}
          </div>
        </Card>
      </section>

      {/* 4. Service Coverage Area */}
      <section className="flex flex-col gap-4 w-full">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('home.serviceArea.title')}
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm">
            {t('home.serviceArea.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {/* Inner Free Zone */}
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/90 border border-emerald-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {t('home.serviceArea.innerBadge')}
              </span>
              <span className="text-xs font-black text-emerald-700 bg-white px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                $0 Delivery Fee
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {['Denver (Downtown/Central)', 'Lakewood', 'Englewood', 'Wheat Ridge', 'Arvada', 'Westminster', 'Boulder', 'Broomfield'].map((area) => (
                <span key={area} className="bg-white text-slate-800 text-xs font-semibold px-2.5 py-1 rounded-lg border border-emerald-100 shadow-2xs">
                  {area}
                </span>
              ))}
            </div>
          </div>

          {/* Outer Zone */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-blue-600" />
                {t('home.serviceArea.outerBadge')}
              </span>
              <span className="text-xs font-black text-slate-700 bg-white px-2.5 py-0.5 rounded-full border border-slate-200 shadow-2xs">
                +$25 Delivery Fee
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {['Aurora', 'Thornton', 'Centennial', 'Highlands Ranch'].map((area) => (
                <span key={area} className="bg-white text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                  {area}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Contact & Support Strip */}
      <section className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="space-y-0.5">
          <h3 className="text-base font-extrabold text-slate-900">{t('home.contact.title')}</h3>
          <p className="text-xs text-slate-500">Need help or a custom quote for your business?</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href="tel:7205908632"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-blue-600" />
            <span>(720) 590-8632</span>
          </a>
          <a
            href="mailto:info@thelaundrygo.com"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors"
          >
            <Mail className="w-3.5 h-3.5 text-slate-600" />
            <span>info@thelaundrygo.com</span>
          </a>
          <a
            href="https://www.instagram.com/laundrygodenver?igsh=ZjdicWYxZG5wMXpy"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white text-xs font-bold shadow-2xs hover:opacity-95 hover:scale-102 transition-all"
          >
            <InstagramIcon className="w-3.5 h-3.5" />
            <span>@laundrygodenver</span>
          </a>
        </div>
      </section>
    </div>
  );
}
