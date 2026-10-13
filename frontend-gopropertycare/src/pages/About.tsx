import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  ShieldCheck,
  Leaf,
  CheckCircle2,
  Phone,
  Clock,
  CheckSquare,
  HeartHandshake,
  ArrowRight,
  Home,
  Check,
  Bed,
  Utensils,
  Bath,
  KeyRound,
  DoorOpen,
  Layers,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SEO } from '@/components/common/SEO';

function ImageWithFallback({
  src,
  alt,
  className,
  fallbackIcon: FallbackIcon,
}: {
  src: string;
  alt: string;
  className?: string;
  fallbackIcon: typeof Home;
}) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className={`bg-linear-to-br from-emerald-50 via-emerald-100/60 to-emerald-200/40 flex flex-col items-center justify-center text-emerald-700 ${className}`}>
        <FallbackIcon className="w-14 h-14 opacity-70 mb-2 animate-float" />
        <span className="text-xs font-black tracking-wider uppercase text-emerald-800">GoPropertyCare</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      className={className}
      loading="lazy"
      decoding="async"
    />
  );
}

export function About() {
  const { t } = useTranslation();

  const standardKitchen = (t('about.servicesIncluded.standard.kitchen', { returnObjects: true }) as string[]) || [];
  const standardBathrooms = (t('about.servicesIncluded.standard.bathrooms', { returnObjects: true }) as string[]) || [];
  const standardBedrooms = (t('about.servicesIncluded.standard.bedrooms', { returnObjects: true }) as string[]) || [];
  const standardWholeHome = (t('about.servicesIncluded.standard.wholeHome', { returnObjects: true }) as string[]) || [];

  const deepItems = (t('about.servicesIncluded.deep.items', { returnObjects: true }) as string[]) || [];

  const moveInKitchen = (t('about.servicesIncluded.move_in_out.kitchen', { returnObjects: true }) as string[]) || [];
  const moveInBathrooms = (t('about.servicesIncluded.move_in_out.bathrooms', { returnObjects: true }) as string[]) || [];
  const moveInBedrooms = (t('about.servicesIncluded.move_in_out.bedrooms', { returnObjects: true }) as string[]) || [];
  const moveInThroughout = (t('about.servicesIncluded.move_in_out.throughout', { returnObjects: true }) as string[]) || [];

  const strBedrooms = (t('about.servicesIncluded.str_turnover.bedrooms', { returnObjects: true }) as string[]) || [];
  const strBathrooms = (t('about.servicesIncluded.str_turnover.bathrooms', { returnObjects: true }) as string[]) || [];
  const strKitchen = (t('about.servicesIncluded.str_turnover.kitchen', { returnObjects: true }) as string[]) || [];
  const strLiving = (t('about.servicesIncluded.str_turnover.living', { returnObjects: true }) as string[]) || [];

  return (
    <div className="flex flex-col gap-12 sm:gap-16 py-4 sm:py-6 max-w-6xl mx-auto">
      <SEO
        title={t('about.title')}
        description={t('about.subtitle')}
        canonical="https://gopropertycare.com/about"
      />

      {/* 1. Header & Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-b from-emerald-50/70 via-white/80 to-slate-50/50 border border-emerald-100/90 p-6 sm:p-10 lg:p-12 shadow-sm">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200/90 text-emerald-900 text-xs font-bold shadow-2xs animate-fade-in-down">
            <Sparkles className="w-3.5 h-3.5 text-emerald-700 animate-float" />
            <span>{t('about.tagline', 'Denver & Boulder Property Specialists')}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight animate-fade-in-up">
            {t('about.title')}
          </h1>
          <p className="text-base sm:text-lg text-slate-700 font-medium leading-relaxed max-w-2xl mx-auto animate-fade-in-up delay-75">
            {t('about.subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <Link to="/schedule" className="w-full sm:w-auto inline-flex">
              <Button size="lg" className="w-full sm:w-auto font-black px-8 shadow-md shadow-emerald-600/20 hover:scale-102 transition-transform">
                {t('about.cta.scheduleBtn', 'Book Online')}
                <ArrowRight className="w-4.5 h-4.5 ml-1.5 shrink-0" />
              </Button>
            </Link>
            <a href="#services-included" className="w-full sm:w-auto inline-flex">
              <Button variant="outline" size="lg" className="w-full sm:w-auto font-bold px-6 hover:scale-102 transition-transform">
                <CheckSquare className="w-4 h-4 text-emerald-600 mr-1.5" />
                {t('about.servicesIncluded.exploreBtn', 'Explore Included Services')}
              </Button>
            </a>
          </div>
        </div>

        {/* Four Trust Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 pt-6 sm:pt-8 mt-8 border-t border-emerald-100/80">
          <div className="p-3 sm:p-3.5 rounded-2xl bg-white/90 border border-slate-200/70 text-center shadow-2xs">
            <p className="text-xl sm:text-2xl font-black text-emerald-700">100%</p>
            <p className="text-xs font-bold text-slate-600 mt-0.5">{t('about.insuredBadge', 'Fully Insured')}</p>
          </div>
          <div className="p-3 sm:p-3.5 rounded-2xl bg-white/90 border border-slate-200/70 text-center shadow-2xs">
            <p className="text-xl sm:text-2xl font-black text-emerald-800">50+</p>
            <p className="text-xs font-bold text-slate-600 mt-0.5">Checklist Points</p>
          </div>
          <div className="p-3 sm:p-3.5 rounded-2xl bg-white/90 border border-slate-200/70 text-center shadow-2xs">
            <p className="text-xl sm:text-2xl font-black text-emerald-700">3h Min</p>
            <p className="text-xs font-bold text-slate-600 mt-0.5">Same-Day Notice</p>
          </div>
          <div className="p-3 sm:p-3.5 rounded-2xl bg-white/90 border border-slate-200/70 text-center shadow-2xs">
            <p className="text-xl sm:text-2xl font-black text-emerald-800">$0.00</p>
            <p className="text-xs font-bold text-slate-600 mt-0.5">Denver Core Travel</p>
          </div>
        </div>
      </section>

      {/* 2. Mission Card with Logo preview */}
      <section className="animate-fade-in-up delay-150">
        <Card className="p-8 sm:p-12 border-emerald-200/80 bg-linear-to-br from-white via-white to-emerald-50/40 shadow-sm flex flex-col md:flex-row items-center gap-8">
          <div className="w-full md:w-1/3 flex justify-center">
            <img
              src="/logo.png"
              alt="GoPropertyCare Mascot & Logo"
              className="w-44 sm:w-52 h-auto object-contain drop-shadow-md rounded-2xl bg-white p-3 border border-emerald-100 animate-float"
            />
          </div>
          <div className="w-full md:w-2/3 space-y-4">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {t('about.mission.title')}
            </h2>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-medium">
              {t('about.mission.description')}
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 bg-emerald-100/80 border border-emerald-200/70 px-3 py-1.5 rounded-lg shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{t('about.insuredBadge', 'Fully Insured & Bonded')}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 bg-emerald-100/80 border border-emerald-200/70 px-3 py-1.5 rounded-lg shadow-2xs">
                <Leaf className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{t('about.ecoBadge', 'Safe for Families & Pets')}</span>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* 3. Dedicated Detailed Services Section (Copy directly from document) */}
      <section id="services-included" className="space-y-8 scroll-mt-24">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-extrabold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t('about.servicesIncluded.badge')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {t('about.servicesIncluded.title')}
          </h2>
          <p className="text-slate-600 text-sm sm:text-base font-medium max-w-2xl mx-auto">
            {t('about.servicesIncluded.subtitle')}
          </p>
        </div>

        <div className="space-y-8">
          {/* SERVICE 1: Standard Clean */}
          <Card className="p-0 overflow-hidden border-2 border-slate-200/90 hover:border-emerald-300 transition-all shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
              {/* Visual Image Column */}
              <div className="lg:col-span-5 relative h-64 sm:h-72 lg:h-auto min-h-[260px] overflow-hidden">
                <ImageWithFallback
                  src="/images/services/standard.jpg"
                  alt={t('about.servicesIncluded.standard.headline')}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  fallbackIcon={Home}
                />
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200 shadow-xs text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  <span>{t('about.servicesIncluded.standard.tag')}</span>
                </div>
              </div>

              {/* Text Information Column */}
              <div className="lg:col-span-7 p-6 sm:p-8 space-y-5 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-100">
                      Residential Service
                    </span>
                    <span className="text-xs font-black text-slate-500">From $155.00</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                    {t('about.servicesIncluded.standard.headline')}
                  </h3>

                  <p className="text-sm text-slate-700 leading-relaxed font-medium">
                    {t('about.servicesIncluded.standard.intro')}
                  </p>
                </div>

                {/* Checklists by Room */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {/* Kitchen */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2.5">
                    <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                      <Utensils className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t('about.servicesIncluded.standard.kitchenTitle')}</span>
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-600 font-medium">
                      {standardKitchen.map((item, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Bathrooms */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2.5">
                    <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                      <Bath className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t('about.servicesIncluded.standard.bathroomsTitle')}</span>
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-600 font-medium">
                      {standardBathrooms.map((item, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Bedrooms & Living */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2.5">
                    <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                      <Bed className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t('about.servicesIncluded.standard.bedroomsTitle')}</span>
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-600 font-medium">
                      {standardBedrooms.map((item, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Whole Home */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2.5">
                    <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                      <DoorOpen className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t('about.servicesIncluded.standard.wholeHomeTitle')}</span>
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-600 font-medium">
                      {standardWholeHome.map((item, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Link to="/schedule?tier=residential">
                    <Button size="md" className="font-extrabold shadow-sm hover:scale-102 transition-transform">
                      <span>{t('about.servicesIncluded.bookThisService')}</span>
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>

          {/* SERVICE 2: Deep Clean */}
          <Card className="p-0 overflow-hidden border-2 border-slate-200/90 hover:border-emerald-300 transition-all shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
              {/* Visual Image Column (Right on desktop for alternation) */}
              <div className="lg:col-span-5 lg:order-2 relative h-64 sm:h-72 lg:h-auto min-h-[260px] overflow-hidden">
                <ImageWithFallback
                  src="/images/services/deep.jpg"
                  alt={t('about.servicesIncluded.deep.headline')}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  fallbackIcon={Sparkles}
                />
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200 shadow-xs text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  <span>{t('about.servicesIncluded.deep.tag')}</span>
                </div>
              </div>

              {/* Text Information Column */}
              <div className="lg:col-span-7 lg:order-1 p-6 sm:p-8 space-y-5 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-100">
                      Intensive Detailing
                    </span>
                    <span className="text-xs font-black text-slate-500">From $235.00</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                    {t('about.servicesIncluded.deep.headline')}
                  </h3>

                  <p className="text-sm text-slate-700 leading-relaxed font-medium">
                    {t('about.servicesIncluded.deep.intro')}
                  </p>
                </div>

                {/* Deep Clean Inclusions Grid */}
                <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-5 space-y-3">
                  <h4 className="text-xs font-black text-emerald-950 flex items-center gap-1.5 uppercase tracking-wider">
                    <Layers className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{t('about.servicesIncluded.deep.plusTitle')}</span>
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 font-medium">
                    {deepItems.map((item, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 flex justify-end">
                  <Link to="/schedule?tier=deep">
                    <Button size="md" className="font-extrabold shadow-sm hover:scale-102 transition-transform">
                      <span>{t('about.servicesIncluded.bookThisService')}</span>
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>

          {/* SERVICE 3: Move-In / Move-Out Clean */}
          <Card className="p-0 overflow-hidden border-2 border-slate-200/90 hover:border-emerald-300 transition-all shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
              {/* Visual Image Column */}
              <div className="lg:col-span-5 relative h-64 sm:h-72 lg:h-auto min-h-[260px] overflow-hidden">
                <ImageWithFallback
                  src="/images/services/move_in_out.jpg"
                  alt={t('about.servicesIncluded.move_in_out.headline')}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  fallbackIcon={KeyRound}
                />
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200 shadow-xs text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  <span>{t('about.servicesIncluded.move_in_out.tag')}</span>
                </div>
              </div>

              {/* Text Information Column */}
              <div className="lg:col-span-7 p-6 sm:p-8 space-y-5 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-100">
                      Empty Home Guarantee
                    </span>
                    <span className="text-xs font-black text-slate-500">From $235.00</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                    {t('about.servicesIncluded.move_in_out.headline')}
                  </h3>

                  <p className="text-sm text-slate-700 leading-relaxed font-medium">
                    {t('about.servicesIncluded.move_in_out.intro')}
                  </p>
                </div>

                {/* Checklists by Room */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {/* Kitchen */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2.5">
                    <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                      <Utensils className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t('about.servicesIncluded.move_in_out.kitchenTitle')}</span>
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-600 font-medium">
                      {moveInKitchen.map((item, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Bathrooms */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2.5">
                    <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                      <Bath className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t('about.servicesIncluded.move_in_out.bathroomsTitle')}</span>
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-600 font-medium">
                      {moveInBathrooms.map((item, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Bedrooms & Closets */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2.5">
                    <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                      <Bed className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t('about.servicesIncluded.move_in_out.bedroomsTitle')}</span>
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-600 font-medium">
                      {moveInBedrooms.map((item, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Throughout Property */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2.5">
                    <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                      <DoorOpen className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t('about.servicesIncluded.move_in_out.throughoutTitle')}</span>
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-600 font-medium">
                      {moveInThroughout.map((item, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Link to="/schedule?tier=move_in_out">
                    <Button size="md" className="font-extrabold shadow-sm hover:scale-102 transition-transform">
                      <span>{t('about.servicesIncluded.bookThisService')}</span>
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>

          {/* SERVICE 4: Short-Term Rental Turnover */}
          <Card className="p-0 overflow-hidden border-2 border-slate-200/90 hover:border-emerald-300 transition-all shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
              {/* Visual Image Column (Right on desktop for alternation) */}
              <div className="lg:col-span-5 lg:order-2 relative h-64 sm:h-72 lg:h-auto min-h-[260px] overflow-hidden">
                <ImageWithFallback
                  src="/images/services/str_turnover.jpg"
                  alt={t('about.servicesIncluded.str_turnover.headline')}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  fallbackIcon={Bed}
                />
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200 shadow-xs text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  <span>{t('about.servicesIncluded.str_turnover.tag')}</span>
                </div>
              </div>

              {/* Text Information Column */}
              <div className="lg:col-span-7 lg:order-1 p-6 sm:p-8 space-y-5 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-100">
                      Airbnb & VRBO Specialist
                    </span>
                    <span className="text-xs font-black text-slate-500">From $90.00</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                    {t('about.servicesIncluded.str_turnover.headline')}
                  </h3>

                  <p className="text-sm text-slate-700 leading-relaxed font-medium">
                    {t('about.servicesIncluded.str_turnover.intro')}
                  </p>
                </div>

                {/* Room Checklists */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {/* Bedrooms */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2.5">
                    <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                      <Bed className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t('about.servicesIncluded.str_turnover.bedroomsTitle')}</span>
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-600 font-medium">
                      {strBedrooms.map((item, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Bathrooms */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2.5">
                    <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                      <Bath className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t('about.servicesIncluded.str_turnover.bathroomsTitle')}</span>
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-600 font-medium">
                      {strBathrooms.map((item, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Kitchen */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2.5">
                    <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                      <Utensils className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t('about.servicesIncluded.str_turnover.kitchenTitle')}</span>
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-600 font-medium">
                      {strKitchen.map((item, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Living Areas */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2.5">
                    <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                      <DoorOpen className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t('about.servicesIncluded.str_turnover.livingTitle')}</span>
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-600 font-medium">
                      {strLiving.map((item, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Custom Note Callout from Document */}
                <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-emerald-950 text-xs font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>{t('about.servicesIncluded.customRequestNote')}</span>
                </div>

                <div className="pt-2 flex justify-end">
                  <Link to="/schedule?tier=str_on_site">
                    <Button size="md" className="font-extrabold shadow-sm hover:scale-102 transition-transform">
                      <span>{t('about.servicesIncluded.bookThisService')}</span>
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* 4. Values 4-Grid */}
      <section className="space-y-6">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 text-center tracking-tight">
          {t('about.pillarsTitle', 'Why Choose GoPropertyCare?')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 space-y-3 hover:-translate-y-1 hover:shadow-md hover:border-emerald-300 transition-all duration-300 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-100 transition-all duration-300">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base group-hover:text-emerald-950 transition-colors">{t('about.values.ecoTitle')}</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">{t('about.values.ecoDesc')}</p>
          </Card>

          <Card className="p-6 space-y-3 hover:-translate-y-1 hover:shadow-md hover:border-emerald-300 transition-all duration-300 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-100 transition-all duration-300">
              <CheckSquare className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base group-hover:text-emerald-950 transition-colors">{t('about.values.vettedTitle')}</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">{t('about.values.vettedDesc')}</p>
          </Card>

          <Card className="p-6 space-y-3 hover:-translate-y-1 hover:shadow-md hover:border-emerald-300 transition-all duration-300 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-100 transition-all duration-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base group-hover:text-emerald-950 transition-colors">{t('about.values.standardTitle')}</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">{t('about.values.standardDesc')}</p>
          </Card>

          <Card className="p-6 space-y-3 hover:-translate-y-1 hover:shadow-md hover:border-emerald-300 transition-all duration-300 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-100 transition-all duration-300">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base group-hover:text-emerald-950 transition-colors">{t('about.values.pricingTitle')}</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">{t('about.values.pricingDesc')}</p>
          </Card>
        </div>
      </section>

      {/* 5. CTA Box */}
      <section className="text-center py-6">
        <Card variant="none" className="p-8 sm:p-12 bg-linear-to-r from-emerald-800 to-emerald-950 text-white max-w-4xl mx-auto shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-black mb-3 text-white">
            {t('about.cta.title', 'Ready to Experience Impeccable Property Care?')}
          </h2>
          <p className="text-emerald-100 text-sm sm:text-base max-w-xl mx-auto mb-8 font-medium">
            {t('about.cta.subtitle', 'Book your service online in minutes. Enjoy transparent rates and zero surprise fees in Denver & Boulder core.')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/schedule">
              <Button
                variant="white"
                size="lg"
                className="font-black text-emerald-950 hover:bg-emerald-50 shadow-lg px-8 hover:scale-102 active:scale-98 transition-all duration-200"
              >
                <Sparkles className="w-5 h-5 mr-2 text-emerald-600" />
                <span className="text-emerald-950 font-black">
                  {t('about.cta.scheduleBtn', 'Schedule Online')}
                </span>
              </Button>
            </Link>
            <a
              href="tel:7205908632"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-emerald-400/80 text-white font-bold text-sm bg-emerald-900/40 hover:bg-emerald-800/60 hover:scale-102 active:scale-98 transition-all duration-200 shadow-sm"
            >
              <Phone className="w-4 h-4 text-emerald-300" />
              <span>(720) 590-8632</span>
            </a>
          </div>
        </Card>
      </section>
    </div>
  );
}
