import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  Truck,
  Sparkles,
  Scale,
  ShieldCheck,
  CheckCircle2,
  Leaf,
  Award,
  ArrowRight,
  Clock,
  Zap,
  MapPin,
  Phone,
  Mail,
  HeartHandshake,
  Droplets,
  DollarSign,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface ProcessStep {
  number: string;
  tag: string;
  title: string;
  description: string;
  highlight: string;
  image: string;
  fallbackIcon: typeof Calendar;
  iconBg: string;
}

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

function ImageWithFallback({
  src,
  alt,
  className,
  fallbackIcon: FallbackIcon,
}: {
  src: string;
  alt: string;
  className?: string;
  fallbackIcon: typeof Calendar;
}) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className={`bg-gradient-to-br from-blue-50 to-blue-100/60 flex items-center justify-center text-blue-500 ${className}`}>
        <FallbackIcon className="w-12 h-12 opacity-60" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      className={className}
      decoding="async"
    />
  );
}

export function About() {
  const { t } = useTranslation();

  const processSteps: ProcessStep[] = [
    {
      number: '01',
      tag: t('about.process.step1.tag'),
      title: t('about.process.step1.title'),
      description: t('about.process.step1.description'),
      highlight: t('about.process.step1.highlight'),
      image: '/images/about/pickup.jpg',
      fallbackIcon: Calendar,
      iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
    },
    {
      number: '02',
      tag: t('about.process.step2.tag'),
      title: t('about.process.step2.title'),
      description: t('about.process.step2.description'),
      highlight: t('about.process.step2.highlight'),
      image: '/images/about/sorting.jpg',
      fallbackIcon: Scale,
      iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    },
    {
      number: '03',
      tag: t('about.process.step3.tag'),
      title: t('about.process.step3.title'),
      description: t('about.process.step3.description'),
      highlight: t('about.process.step3.highlight'),
      image: '/images/about/washing.jpg',
      fallbackIcon: Droplets,
      iconBg: 'bg-cyan-50 text-cyan-600 border-cyan-100',
    },
    {
      number: '04',
      tag: t('about.process.step4.tag'),
      title: t('about.process.step4.title'),
      description: t('about.process.step4.description'),
      highlight: t('about.process.step4.highlight'),
      image: '/images/about/folding.jpg',
      fallbackIcon: Sparkles,
      iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
    },
    {
      number: '05',
      tag: t('about.process.step5.tag'),
      title: t('about.process.step5.title'),
      description: t('about.process.step5.description'),
      highlight: t('about.process.step5.highlight'),
      image: '/images/about/delivery.jpg',
      fallbackIcon: Truck,
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
  ];

  const businessRules = [
    {
      icon: Scale,
      title: t('about.businessRules.rule1.title'),
      description: t('about.businessRules.rule1.description'),
      accentColor: 'text-blue-600 bg-blue-50 border-blue-100',
    },
    {
      icon: Clock,
      title: t('about.businessRules.rule2.title'),
      description: t('about.businessRules.rule2.description'),
      accentColor: 'text-amber-600 bg-amber-50 border-amber-100',
    },
    {
      icon: Zap,
      title: t('about.businessRules.rule3.title'),
      description: t('about.businessRules.rule3.description'),
      accentColor: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
    {
      icon: MapPin,
      title: t('about.businessRules.rule4.title'),
      description: t('about.businessRules.rule4.description'),
      accentColor: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    },
  ];

  const valuePillars = [
    {
      icon: DollarSign,
      title: t('about.values.item1.title'),
      description: t('about.values.item1.description'),
      color: 'text-blue-600 bg-blue-50 border-blue-100',
    },
    {
      icon: Award,
      title: t('about.values.item2.title'),
      description: t('about.values.item2.description'),
      color: 'text-amber-600 bg-amber-50 border-amber-100',
    },
    {
      icon: Leaf,
      title: t('about.values.item3.title'),
      description: t('about.values.item3.description'),
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
    {
      icon: HeartHandshake,
      title: t('about.values.item4.title'),
      description: t('about.values.item4.description'),
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    },
  ];

  return (
    <div className="w-full flex flex-col gap-10 sm:gap-14 animate-fade-in max-w-6xl mx-auto pb-4">
      {/* 1. Hero & Mission Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-blue-50/70 via-white/80 to-slate-50/50 border border-blue-100/80 p-6 sm:p-10 lg:p-12 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Text Story */}
          <div className="lg:col-span-7 space-y-4 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/70 border border-blue-200 text-blue-800 text-xs font-extrabold shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{t('about.badge')}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              {t('about.hero.title')}
            </h1>

            <p className="text-slate-600 text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl">
              {t('about.hero.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <Link to="/schedule" className="w-full sm:w-auto inline-flex">
                <Button size="lg" className="w-full sm:w-auto font-extrabold px-8 shadow-md shadow-blue-500/20 hover:scale-102 transition-transform">
                  {t('about.hero.cta')}
                  <ArrowRight className="w-4.5 h-4.5 ml-1.5 shrink-0" />
                </Button>
              </Link>
              <a href="#process-steps" className="w-full sm:w-auto inline-flex">
                <Button variant="outline" size="lg" className="w-full sm:w-auto font-bold px-6 hover:scale-102 transition-transform">
                  <Sparkles className="w-4 h-4 text-blue-600 mr-1.5" />
                  {t('about.hero.secondaryCta')}
                </Button>
              </a>
            </div>
          </div>

          {/* Right Column: Hero Visual Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none rounded-2xl overflow-hidden shadow-lg border border-slate-200/90 group">
              <ImageWithFallback
                src="/images/about/hero.jpg"
                alt="LaundryGo Denver Service"
                className="w-full h-64 sm:h-80 object-cover group-hover:scale-105 transition-transform duration-500"
                fallbackIcon={Sparkles}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent flex flex-col justify-end p-5 text-white">
                <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-blue-300">
                  <MapPin className="w-3.5 h-3.5" />
                  Denver, Colorado
                </span>
                <p className="font-extrabold text-sm sm:text-base leading-snug">
                  Precision wash & fold, eco detergents, on-time doorstep delivery.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Four Trust Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 pt-6 sm:pt-8 mt-6 border-t border-slate-200/80">
          <div className="p-3 sm:p-3.5 rounded-2xl bg-white/90 border border-slate-200/70 text-center shadow-2xs">
            <p className="text-xl sm:text-2xl font-black text-blue-600">{t('about.mission.stat1Value')}</p>
            <p className="text-xs font-bold text-slate-600 mt-0.5">{t('about.mission.stat1Label')}</p>
          </div>
          <div className="p-3 sm:p-3.5 rounded-2xl bg-white/90 border border-slate-200/70 text-center shadow-2xs">
            <p className="text-xl sm:text-2xl font-black text-amber-500">{t('about.mission.stat2Value')}</p>
            <p className="text-xs font-bold text-slate-600 mt-0.5">{t('about.mission.stat2Label')}</p>
          </div>
          <div className="p-3 sm:p-3.5 rounded-2xl bg-white/90 border border-slate-200/70 text-center shadow-2xs">
            <p className="text-xl sm:text-2xl font-black text-emerald-600">{t('about.mission.stat3Value')}</p>
            <p className="text-xs font-bold text-slate-600 mt-0.5">{t('about.mission.stat3Label')}</p>
          </div>
          <div className="p-3 sm:p-3.5 rounded-2xl bg-white/90 border border-slate-200/70 text-center shadow-2xs">
            <p className="text-xl sm:text-2xl font-black text-indigo-600">{t('about.mission.stat4Value')}</p>
            <p className="text-xs font-bold text-slate-600 mt-0.5">{t('about.mission.stat4Label')}</p>
          </div>
        </div>
      </section>

      {/* 2. Mission & Purpose Detail */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        <div className="md:col-span-5 space-y-2">
          <span className="text-xs font-extrabold text-blue-600 tracking-wider uppercase bg-blue-50 px-3 py-1 rounded-full border border-blue-100 inline-block">
            {t('about.mission.badge')}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
            {t('about.mission.title')}
          </h2>
        </div>
        <div className="md:col-span-7 space-y-3 text-slate-600 text-xs sm:text-sm md:text-base leading-relaxed bg-white/90 border border-slate-200/80 p-5 sm:p-6 rounded-2xl shadow-2xs">
          <p>{t('about.mission.p1')}</p>
          <p>{t('about.mission.p2')}</p>
        </div>
      </section>

      {/* 3. Detailed 5-Step Business Flow With Visual Cards */}
      <section id="process-steps" className="flex flex-col gap-6 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto space-y-1.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-extrabold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            {t('about.process.badge')}
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            {t('about.process.title')}
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm">
            {t('about.process.subtitle')}
          </p>
        </div>

        {/* Step-by-Step Flow List */}
        <div className="space-y-5">
          {processSteps.map((step, idx) => {
            const isEven = idx % 2 === 1;
            return (
              <Card
                key={step.number}
                variant="default"
                className="overflow-hidden border-slate-200/90 shadow-sm hover:shadow-md transition-shadow p-0"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch">
                  {/* Visual Image Column */}
                  <div
                    className={`lg:col-span-5 relative h-56 sm:h-64 lg:h-auto min-h-[220px] overflow-hidden ${
                      isEven ? 'lg:order-2' : 'lg:order-1'
                    }`}
                  >
                    <ImageWithFallback
                      src={step.image}
                      alt={step.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      fallbackIcon={step.fallbackIcon}
                    />
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full border border-slate-200 shadow-2xs text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                      {step.tag}
                    </div>
                  </div>

                  {/* Text Information Column */}
                  <div
                    className={`lg:col-span-7 p-5 sm:p-7 lg:p-8 flex flex-col justify-between space-y-4 ${
                      isEven ? 'lg:order-1' : 'lg:order-2'
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${step.iconBg}`}>
                          <step.fallbackIcon className="w-5 h-5" />
                        </div>
                        <span className="text-2xl sm:text-3xl font-black text-slate-300 tracking-tight">
                          {step.number}
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-slate-900">
                        {step.title}
                      </h3>

                      <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                        {step.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-blue-700 bg-blue-50/70 px-3 py-2 rounded-xl border border-blue-100/80">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>{step.highlight}</span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* 4. Core Business Model & Key Rules */}
      <section className="flex flex-col gap-6">
        <div className="text-center max-w-xl mx-auto space-y-1.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-extrabold shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5" />
            {t('about.businessRules.badge')}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('about.businessRules.title')}
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm">
            {t('about.businessRules.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {businessRules.map((rule, idx) => (
            <Card
              key={idx}
              variant="flat"
              className="p-5 sm:p-6 border-slate-200 bg-white/90 space-y-3 flex flex-col justify-between hover:border-blue-200 transition-colors shadow-2xs"
            >
              <div className="space-y-2.5">
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${rule.accentColor}`}>
                  <rule.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">{rule.title}</h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">{rule.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 5. Values & Quality Standards (Homogenized Light Theme) */}
      <section className="flex flex-col gap-6">
        <div className="text-center max-w-xl mx-auto space-y-1.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-extrabold shadow-2xs">
            <Award className="w-3.5 h-3.5 text-blue-600" />
            <span>LaundryGo Quality</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('about.values.title')}
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm">
            {t('about.values.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {valuePillars.map((pillar, idx) => (
            <Card
              key={idx}
              variant="flat"
              className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 space-y-2.5 hover:border-blue-300 hover:shadow-sm transition-all shadow-2xs flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${pillar.color}`}>
                  <pillar.icon className="w-4.5 h-4.5" />
                </div>
                <h4 className="text-sm sm:text-base font-bold text-slate-900">{pillar.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{pillar.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 6. Denver Coverage & Direct Contact */}
      <section className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        <div className="space-y-0.5">
          <div className="flex items-center justify-center md:justify-start gap-1.5 text-blue-600 text-xs font-bold">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span>Denver Metropolitan Coverage Area</span>
          </div>
          <h3 className="text-base font-extrabold text-slate-900">
            Have special inquiries or commercial volume?
          </h3>
          <p className="text-xs text-slate-500">
            We provide customized laundry plans for Airbnbs, clinics, gyms, and local businesses.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2.5 shrink-0">
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

      {/* 7. Final Call to Action Banner (Homogenized Glassmorphism Card) */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-blue-50/90 via-white to-slate-50/70 border border-blue-200/90 p-8 sm:p-12 text-center shadow-sm">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/70 border border-blue-200 text-blue-800 text-xs font-extrabold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>LaundryGo Denver</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            {t('about.cta.title')}
          </h2>

          <p className="text-slate-600 text-xs sm:text-sm md:text-base leading-relaxed max-w-xl mx-auto">
            {t('about.cta.subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link to="/schedule" className="w-full sm:w-auto inline-flex">
              <Button
                size="lg"
                className="w-full sm:w-auto font-extrabold px-8 shadow-md shadow-blue-500/20 hover:scale-102 transition-transform"
              >
                {t('about.cta.primaryBtn')}
                <ArrowRight className="w-4.5 h-4.5 ml-1.5 shrink-0" />
              </Button>
            </Link>
            <Link to="/" className="w-full sm:w-auto inline-flex">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto font-bold px-6 hover:scale-102 transition-transform"
              >
                <Scale className="w-4 h-4 text-blue-600 mr-1.5" />
                {t('about.cta.secondaryBtn')}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
