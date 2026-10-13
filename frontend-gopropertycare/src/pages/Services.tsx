import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  ArrowRight,
  Home,
  Check,
  Bed,
  Utensils,
  Bath,
  KeyRound,
  DoorOpen,
  Layers,
  CheckCircle2,
  Phone,
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

export function Services() {
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
    <div className="flex flex-col gap-10 sm:gap-14 py-4 sm:py-6 max-w-6xl mx-auto">
      <SEO
        title={t('servicesPage.title', 'Our Specialized Cleaning Services')}
        description={t('servicesPage.subtitle', 'Comprehensive checklists for homes, move-in/outs, and short-term rentals.')}
        canonical="https://gopropertycare.com/services"
      />

      {/* Header & Hero */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          {t('servicesPage.title', 'Our Specialized Services')}
        </h1>
        <p className="text-base sm:text-lg text-slate-700 font-medium leading-relaxed max-w-2xl mx-auto">
          {t('servicesPage.subtitle', 'Clear, room-by-room checklists tailored for Denver homes, turnover rentals, and property resets.')}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link to="/schedule" className="w-full sm:w-auto inline-flex">
            <Button size="lg" className="w-full sm:w-auto font-black px-8 shadow-md shadow-emerald-600/20 hover:scale-102 transition-transform">
              {t('servicesPage.scheduleBtn', 'Schedule Online')}
              <ArrowRight className="w-4.5 h-4.5 ml-1.5 shrink-0" />
            </Button>
          </Link>
          <Link to="/about" className="w-full sm:w-auto inline-flex">
            <Button variant="outline" size="lg" className="w-full sm:w-auto font-bold px-6 hover:scale-102 transition-transform">
              {t('servicesPage.viewAboutBtn', 'About Our Company')}
            </Button>
          </Link>
        </div>
      </section>

      {/* 4 Dedicated Detailed Services Cards */}
      <section className="space-y-8 sm:space-y-10">
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
            </div>

            {/* Text Information Column */}
            <div className="lg:col-span-7 p-6 sm:p-8 space-y-5 flex flex-col justify-between">
              <div className="space-y-3">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                  {t('about.servicesIncluded.standard.headline')}
                </h2>

                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                  {t('about.servicesIncluded.standard.intro')}
                </p>
              </div>

              {/* Checklists by Room */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Kitchen */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2.5">
                  <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                    <Utensils className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t('about.servicesIncluded.standard.kitchenTitle')}</span>
                  </h3>
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
                  <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                    <Bath className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t('about.servicesIncluded.standard.bathroomsTitle')}</span>
                  </h3>
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
                  <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                    <Bed className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t('about.servicesIncluded.standard.bedroomsTitle')}</span>
                  </h3>
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
                  <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                    <DoorOpen className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t('about.servicesIncluded.standard.wholeHomeTitle')}</span>
                  </h3>
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
            </div>

            {/* Text Information Column */}
            <div className="lg:col-span-7 lg:order-1 p-6 sm:p-8 space-y-5 flex flex-col justify-between">
              <div className="space-y-3">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                  {t('about.servicesIncluded.deep.headline')}
                </h2>

                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                  {t('about.servicesIncluded.deep.intro')}
                </p>
              </div>

              {/* Deep Clean Inclusions Grid */}
              <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-5 space-y-3">
                <h3 className="text-xs font-black text-emerald-950 flex items-center gap-1.5 uppercase tracking-wider">
                  <Layers className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{t('about.servicesIncluded.deep.plusTitle')}</span>
                </h3>
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
            </div>

            {/* Text Information Column */}
            <div className="lg:col-span-7 p-6 sm:p-8 space-y-5 flex flex-col justify-between">
              <div className="space-y-3">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                  {t('about.servicesIncluded.move_in_out.headline')}
                </h2>

                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                  {t('about.servicesIncluded.move_in_out.intro')}
                </p>
              </div>

              {/* Checklists by Room */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Kitchen */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2.5">
                  <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                    <Utensils className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t('about.servicesIncluded.move_in_out.kitchenTitle')}</span>
                  </h3>
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
                  <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                    <Bath className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t('about.servicesIncluded.move_in_out.bathroomsTitle')}</span>
                  </h3>
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
                  <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                    <Bed className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t('about.servicesIncluded.move_in_out.bedroomsTitle')}</span>
                  </h3>
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
                  <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                    <DoorOpen className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t('about.servicesIncluded.move_in_out.throughoutTitle')}</span>
                  </h3>
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
            </div>

            {/* Text Information Column */}
            <div className="lg:col-span-7 lg:order-1 p-6 sm:p-8 space-y-5 flex flex-col justify-between">
              <div className="space-y-3">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                  {t('about.servicesIncluded.str_turnover.headline')}
                </h2>

                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                  {t('about.servicesIncluded.str_turnover.intro')}
                </p>
              </div>

              {/* Room Checklists */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Bedrooms */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2.5">
                  <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                    <Bed className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t('about.servicesIncluded.str_turnover.bedroomsTitle')}</span>
                  </h3>
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
                  <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                    <Bath className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t('about.servicesIncluded.str_turnover.bathroomsTitle')}</span>
                  </h3>
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
                  <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                    <Utensils className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t('about.servicesIncluded.str_turnover.kitchenTitle')}</span>
                  </h3>
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
                  <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                    <DoorOpen className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t('about.servicesIncluded.str_turnover.livingTitle')}</span>
                  </h3>
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
      </section>

      {/* Bottom CTA Box */}
      <section className="text-center py-4">
        <Card variant="none" className="p-8 sm:p-12 bg-linear-to-r from-emerald-800 to-emerald-950 text-white max-w-4xl mx-auto shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-black mb-3 text-white">
            {t('servicesPage.cta.title', 'Ready to Experience Impeccable Property Care?')}
          </h2>
          <p className="text-emerald-100 text-sm sm:text-base max-w-xl mx-auto mb-8 font-medium">
            {t('servicesPage.cta.subtitle', 'Choose your space, pick your date, and let our insured team handle the rest.')}
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
                  {t('servicesPage.cta.scheduleBtn', 'Book Your Cleaning')}
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
