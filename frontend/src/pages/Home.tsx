import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, Truck, Sparkles, Package, MapPin, Mail, Phone, ArrowRight, Clock, Zap, Star, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import api from '@/api';
import type { ServiceRate } from '@/types';

export function Home() {
  const { t } = useTranslation();
  const [apiRates, setApiRates] = useState<ServiceRate[]>([]);

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
    { icon: Calendar, step: '01', title: t('home.howItWorks.step1.title'), description: t('home.howItWorks.step1.description') },
    { icon: Truck, step: '02', title: t('home.howItWorks.step2.title'), description: t('home.howItWorks.step2.description') },
    { icon: Sparkles, step: '03', title: t('home.howItWorks.step3.title'), description: t('home.howItWorks.step3.description') },
    { icon: Package, step: '04', title: t('home.howItWorks.step4.title'), description: t('home.howItWorks.step4.description') },
  ];

  const fallbackServices = [
    {
      icon: Package,
      name: t('home.pricing.standard.name'),
      price: t('home.pricing.standard.price'),
      delivery: t('home.pricing.standard.delivery'),
      description: t('home.pricing.standard.description'),
      badge: 'Standard',
      popular: false,
    },
    {
      icon: Zap,
      name: t('home.pricing.go.name'),
      price: t('home.pricing.go.price'),
      delivery: t('home.pricing.go.delivery'),
      description: t('home.pricing.go.description'),
      badge: 'Most Popular',
      popular: true,
    },
    {
      icon: Star,
      name: t('home.pricing.gofurther.name'),
      price: t('home.pricing.gofurther.price'),
      delivery: t('home.pricing.gofurther.delivery'),
      description: t('home.pricing.gofurther.description'),
      badge: 'Same-Day Express',
      popular: false,
    },
  ];

  const services = apiRates.length > 0
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
          price: `$${rate.rate_per_lb}/lb`,
          delivery: deliveryText,
          description: rate.description || (rate.service_type === 'standard' ? t('home.pricing.standard.description') : rate.service_type === 'go' ? t('home.pricing.go.description') : t('home.pricing.gofurther.description')),
          badge,
          popular,
        };
      })
    : fallbackServices;

  return (
    <div className="w-full flex flex-col gap-10 sm:gap-14 lg:gap-18 animate-fade-in">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-5 w-full pt-4 sm:pt-8 lg:pt-12 pb-2">
        {/* Brand Logo Emblem */}
        <div className="relative group">
          <div className="absolute -inset-3 bg-gradient-to-r from-blue-500/20 via-sky-400/20 to-blue-600/20 rounded-full blur-xl group-hover:blur-2xl transition-all opacity-80" />
          <img
            src="/logo.png"
            alt="LaundryGo Logo"
            className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 object-contain relative z-10 drop-shadow-md group-hover:scale-105 transition-transform duration-300 mx-auto"
          />
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50/90 border border-blue-200/80 text-blue-700 text-xs sm:text-sm font-semibold shadow-2xs hover:scale-102 transition-transform">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{t('home.badge')}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.15] tracking-tight w-full">
          {t('home.hero.title')}
        </h1>

        <p className="text-slate-600 text-base sm:text-lg md:text-xl max-w-2xl leading-relaxed">
          {t('home.hero.subtitle')}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-3 w-full sm:w-auto">
          <Link to="/schedule" className="w-full sm:w-auto inline-flex">
            <Button size="lg" className="w-full sm:w-auto font-bold px-7 hover:scale-102 transition-transform">
              {t('home.hero.cta')}
              <ArrowRight className="w-5 h-5 ml-1 shrink-0" />
            </Button>
          </Link>
          <a href="#services" className="w-full sm:w-auto inline-flex">
            <Button variant="outline" size="lg" className="w-full sm:w-auto font-bold px-7 hover:scale-102 transition-transform">
              {t('footer.services')}
            </Button>
          </a>
        </div>
      </section>

      {/* How It Works */}
      <section className="flex flex-col gap-8 w-full">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            {t('home.howItWorks.title')}
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            {t('home.howItWorks.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 w-full items-stretch">
          {steps.map((stepItem, index) => (
            <Card key={index} variant="interactive" className="relative text-center flex flex-col items-center justify-start p-6 h-full space-y-4 group">
              <span className="absolute top-4 right-4 text-xs font-bold text-slate-300 group-hover:text-blue-500 transition-colors">
                {stepItem.step}
              </span>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                <stepItem.icon className="w-6 h-6" />
              </div>
              <div className="space-y-1.5 w-full">
                <h3 className="text-lg font-bold text-slate-900">{stepItem.title}</h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">{stepItem.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing Tiers / Services */}
      <section id="services" className="flex flex-col gap-8 w-full scroll-mt-24">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" />
              {t('home.pricing.recurringDiscountBadge')}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold shadow-2xs">
              <Package className="w-3.5 h-3.5" />
              {t('home.pricing.minimumOrderBadge')}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            {t('home.pricing.title')}
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            {t('home.pricing.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 w-full items-stretch">
          {services.map((service, index) => (
            <Card
              key={index}
              variant={service.popular ? 'featured' : 'interactive'}
              className="relative flex flex-col justify-between p-7 h-full space-y-6 group"
            >
              <div className="space-y-4 w-full">
                {service.popular && (
                  <div className="inline-flex bg-blue-600 text-white text-xs font-bold px-3.5 py-1 rounded-full shadow-2xs mb-1">
                    {service.badge}
                  </div>
                )}
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                  <service.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{service.name}</h3>
                  <p className="text-3xl font-extrabold text-blue-600 mt-1">{service.price}</p>
                </div>

                <div className="inline-flex items-center gap-2 text-slate-700 text-xs sm:text-sm font-semibold bg-slate-50/90 px-3 py-2 rounded-lg border border-slate-200/80">
                  <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>{service.delivery}</span>
                </div>

                <p className="text-slate-600 text-sm leading-relaxed">{service.description}</p>
              </div>

              <div className="pt-2 w-full space-y-2">
                <Link to="/schedule" className="block w-full">
                  <Button
                    variant={service.popular ? 'primary' : 'outline'}
                    className="w-full"
                  >
                    {t('home.hero.cta')}
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>

        {/* Pricing Policies Bar */}
        <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-slate-600 text-center sm:text-left">
          <div className="flex items-center gap-2 text-emerald-700 font-semibold">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{t('home.pricing.recurringDiscountNotice')}</span>
          </div>
          <span className="text-slate-400 hidden sm:inline">•</span>
          <div className="text-slate-500 font-medium">
            {t('home.pricing.minimumOrderNotice')}
          </div>
        </div>
      </section>

      {/* Service Area */}
      <section className="flex flex-col w-full">
        <Card variant="flat" className="p-8 sm:p-12 border-slate-200/80 w-full flex flex-col items-center text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-100/90 text-blue-600 flex items-center justify-center shrink-0">
            <MapPin className="w-7 h-7" />
          </div>
          <div className="max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{t('home.serviceArea.title')}</h2>
            <p className="text-slate-600 text-sm sm:text-base">{t('home.serviceArea.description')}</p>
          </div>

          <div className="flex flex-wrap justify-center gap-2.5 max-w-2xl mx-auto pt-2">
            {['Denver', 'Aurora', 'Lakewood', 'Thornton', 'Arvada', 'Westminster'].map((area) => (
              <div key={area} className="inline-flex items-center gap-2 bg-white/95 border border-slate-200 text-slate-800 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-2xs hover:scale-105 transition-transform">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{area}</span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Contact Section */}
      <section className="flex flex-col gap-6 w-full pb-2">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {t('home.contact.title')}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 w-full items-stretch">
          <a href="mailto:info@thelaundrygo.com" className="block group">
            <Card variant="interactive" className="flex items-center gap-4 p-5 h-full">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                <Mail className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-slate-500 text-xs font-semibold uppercase mb-0.5">{t('home.contact.email')}</p>
                <p className="text-slate-900 font-bold text-sm sm:text-base truncate group-hover:text-blue-600 transition-colors">info@thelaundrygo.com</p>
              </div>
            </Card>
          </a>

          <a href="tel:7205908632" className="block group">
            <Card variant="interactive" className="flex items-center gap-4 p-5 h-full">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                <Phone className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-slate-500 text-xs font-semibold uppercase mb-0.5">{t('home.contact.phone')}</p>
                <p className="text-slate-900 font-bold text-sm sm:text-base truncate group-hover:text-blue-600 transition-colors">(720) 590-8632</p>
              </div>
            </Card>
          </a>

          <Card variant="default" className="flex items-center gap-4 p-5 h-full sm:col-span-2 lg:col-span-1">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 text-blue-600">
              <MapPin className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-slate-500 text-xs font-semibold uppercase mb-0.5">{t('home.contact.address')}</p>
              <p className="text-slate-900 font-bold text-sm sm:text-base">Denver, Colorado</p>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
