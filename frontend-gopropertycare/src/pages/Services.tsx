import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
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
  HelpCircle,
  ChevronDown,
  Building2,
  Store,
  Stethoscope,
  Building,
  Calendar,
  Clock,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SEO } from '@/components/common/SEO';
import { CommercialWalkthroughModal } from '@/components/common/CommercialWalkthroughModal';

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
        <FallbackIcon className="w-14 h-14 opacity-70 mb-2" />
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

function MiniFAQ({ items }: { items: { q: string; a: string }[] }) {
  const { t } = useTranslation();
  if (!items || items.length === 0) return null;

  return (
    <div className="pt-4 border-t border-slate-200/80 space-y-2.5">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>{t('faq.miniFaq.title', 'Quick Questions')}</span>
        </h4>
        <Link
          to="/faq"
          className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1 transition-colors"
        >
          <span>{t('faq.miniFaq.viewFullFaq', 'View Full FAQ')}</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="space-y-2">
        {items.map((item, idx) => (
          <details
            key={idx}
            className="group rounded-xl border border-slate-200/90 bg-white/90 p-2.5 transition-all open:border-emerald-300 open:bg-emerald-50/20"
          >
            <summary className="flex items-center justify-between gap-2 cursor-pointer list-none font-bold text-xs text-slate-900 select-none">
              <span>{item.q}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-open:rotate-180 transition-transform shrink-0" />
            </summary>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed font-medium pl-0.5 border-t border-emerald-100/50 pt-1.5">
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </div>
  );
}

interface CommercialServiceItem {
  title: string;
  tag: string;
  description: string;
  checklist: string[];
  miniFaq: { q: string; a: string }[];
}

export function Services() {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'residential' | 'commercial'>(() => {
    return searchParams.get('tab') === 'commercial' || searchParams.get('tier') === 'commercial'
      ? 'commercial'
      : 'residential';
  });
  const [isWalkthroughModalOpen, setIsWalkthroughModalOpen] = useState(false);

  const handleTabChange = (newTab: 'residential' | 'commercial') => {
    setActiveTab(newTab);
    setSearchParams({ tab: newTab }, { replace: true });
  };

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

  const standardMiniFaq = (t('faq.miniFaq.standard', { returnObjects: true }) as { q: string; a: string }[]) || [];
  const deepMiniFaq = (t('faq.miniFaq.deep', { returnObjects: true }) as { q: string; a: string }[]) || [];
  const moveInMiniFaq = (t('faq.miniFaq.move_in_out', { returnObjects: true }) as { q: string; a: string }[]) || [];
  const strMiniFaq = (t('faq.miniFaq.str_turnover', { returnObjects: true }) as { q: string; a: string }[]) || [];

  const officeData = (t('commercialServices.office', { returnObjects: true }) as CommercialServiceItem) || {
    title: 'Office Cleaning',
    tag: '',
    description: '',
    checklist: [],
    miniFaq: [],
  };
  const retailData = (t('commercialServices.retail', { returnObjects: true }) as CommercialServiceItem) || {
    title: 'Retail Cleaning',
    tag: '',
    description: '',
    checklist: [],
    miniFaq: [],
  };
  const medicalData = (t('commercialServices.medical', { returnObjects: true }) as CommercialServiceItem) || {
    title: 'Medical & Dental Cleaning',
    tag: '',
    description: '',
    checklist: [],
    miniFaq: [],
  };
  const hoaData = (t('commercialServices.hoa', { returnObjects: true }) as CommercialServiceItem) || {
    title: 'HOA & Property Management Cleaning',
    tag: '',
    description: '',
    checklist: [],
    miniFaq: [],
  };

  const commercialCards = [
    {
      key: 'office',
      data: officeData,
      icon: Building2,
    },
    {
      key: 'retail',
      data: retailData,
      icon: Store,
    },
    {
      key: 'medical',
      data: medicalData,
      icon: Stethoscope,
    },
    {
      key: 'hoa',
      data: hoaData,
      icon: Building,
    },
  ];

  return (
    <div className="flex flex-col gap-10 sm:gap-14 py-4 sm:py-6 max-w-6xl mx-auto">
      <SEO
        title={activeTab === 'commercial' ? t('servicesPage.commercialHeading', 'Commercial Cleaning & Janitorial Solutions') : t('servicesPage.title', 'Our Specialized Cleaning Services')}
        description={activeTab === 'commercial' ? t('servicesPage.commercialSubheading', 'Commercial care for offices, retail, clinics & HOAs.') : t('servicesPage.subtitle', 'Comprehensive checklists for homes, move-in/outs, and short-term rentals.')}
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
          {activeTab === 'commercial' ? (
            <Button
              size="lg"
              onClick={() => setIsWalkthroughModalOpen(true)}
              className="w-full sm:w-auto font-black px-8 shadow-md shadow-emerald-600/20 hover:scale-102 transition-transform cursor-pointer"
            >
              {t('servicesPage.requestWalkthroughBtn', 'Request a Walkthrough')}
              <ArrowRight className="w-4.5 h-4.5 ml-1.5 shrink-0" />
            </Button>
          ) : (
            <Link to="/schedule" className="w-full sm:w-auto inline-flex">
              <Button size="lg" className="w-full sm:w-auto font-black px-8 shadow-md shadow-emerald-600/20 hover:scale-102 transition-transform">
                {t('servicesPage.scheduleBtn', 'Schedule Online')}
                <ArrowRight className="w-4.5 h-4.5 ml-1.5 shrink-0" />
              </Button>
            </Link>
          )}
          <Link to="/about" className="w-full sm:w-auto inline-flex">
            <Button variant="outline" size="lg" className="w-full sm:w-auto font-bold px-6 hover:scale-102 transition-transform">
              {t('servicesPage.viewAboutBtn', 'About Our Company')}
            </Button>
          </Link>
        </div>

        {/* Tab Switcher: Residential vs Commercial */}
        <div className="flex justify-center pt-4">
          <div className="inline-flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200/80 shadow-inner">
            <button
              type="button"
              onClick={() => handleTabChange('residential')}
              className={`flex items-center gap-2 px-5 sm:px-7 py-3 rounded-xl font-black text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
                activeTab === 'residential'
                  ? 'bg-white text-emerald-900 shadow-sm border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Home className="w-4 h-4 text-emerald-700" />
              <span>{t('servicesPage.tabResidential', 'Residential Cleaning')}</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('commercial')}
              className={`flex items-center gap-2 px-5 sm:px-7 py-3 rounded-xl font-black text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
                activeTab === 'commercial'
                  ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/25'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>{t('servicesPage.tabCommercial', 'Commercial Cleaning')}</span>
            </button>
          </div>
        </div>
      </section>

      {/* COMMERCIAL SECTION */}
      {activeTab === 'commercial' && (
        <section className="space-y-8 sm:space-y-10 animate-fade-in">
          {/* Walkthrough Announcement Banner (Top CTA) */}
          <div className="bg-linear-to-r from-emerald-900 via-emerald-800 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
                <Building2 className="w-3.5 h-3.5" />
                <span>{t('servicesPage.commercialBadge', 'Custom Quotes & Tailored Operations')}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {t('servicesPage.commercialHeading', 'Commercial Cleaning & Janitorial Solutions')}
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100 font-medium leading-relaxed">
                {t('servicesPage.commercialSubheading')}
              </p>
            </div>
            <Button
              variant="white"
              size="lg"
              onClick={() => setIsWalkthroughModalOpen(true)}
              className="w-full md:w-auto font-black text-emerald-950 hover:bg-emerald-50 shadow-lg px-6 hover:scale-102 transition-transform cursor-pointer shrink-0"
            >
              <Calendar className="w-4 h-4 mr-2 text-emerald-700" />
              <span>{t('servicesPage.requestWalkthroughBtn', 'Request a Walkthrough')}</span>
            </Button>
          </div>

          {/* 4 Commercial Cards (Simplified without redundant card buttons) */}
          <div className="space-y-8 sm:space-y-10">
            {commercialCards.map((card) => {
              const Icon = card.icon;
              return (
                <Card
                  key={card.key}
                  className="p-6 sm:p-8 border-2 border-slate-200/90 hover:border-emerald-300 transition-all shadow-sm space-y-6"
                >
                  {/* Card Header */}
                  <div className="border-b border-slate-100 pb-4">
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 shadow-inner">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 mb-1">
                          <span>{card.data.tag}</span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                          {card.data.title}
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-slate-700 font-medium leading-relaxed">
                    {card.data.description}
                  </p>

                  {/* Checklist */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{i18n.language?.startsWith('es') ? 'Checklist de Servicio Incluido' : 'Included Service Checklist'}</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {card.data.checklist.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 font-medium">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mini FAQ */}
                  <MiniFAQ items={card.data.miniFaq} />

                  {/* Bottom Card Row (Information only) */}
                  <div className="pt-2 flex items-center gap-2 text-xs font-medium text-slate-500 border-t border-slate-100">
                    <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{i18n.language?.startsWith('es') ? '15 min de visita presencial • Cotización personalizada entregada el mismo día hábil' : '15-min on-site walkthrough • Same-day custom itemized proposal'}</span>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* RESIDENTIAL SECTION (4 Dedicated Detailed Services Cards) */}
      {activeTab === 'residential' && (
      <section className="space-y-8 sm:space-y-10 animate-fade-in">
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

              <MiniFAQ items={standardMiniFaq} />

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
                fallbackIcon={Layers}
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

              <MiniFAQ items={deepMiniFaq} />

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

              <MiniFAQ items={moveInMiniFaq} />

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

              <MiniFAQ items={strMiniFaq} />

              {/* Custom Note Callout from Document */}
              <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-emerald-950 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
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
      )}

      {/* Bottom CTA Box */}
      <section className="text-center py-4">
        <Card variant="none" className="p-8 sm:p-12 bg-linear-to-r from-emerald-800 to-emerald-950 text-white max-w-4xl mx-auto shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-black mb-3 text-white">
            {activeTab === 'commercial'
              ? (i18n.language?.startsWith('es') ? '¿Listo para un Cuidado Comercial Confiable?' : 'Ready for Dependable Commercial Care?')
              : t('servicesPage.cta.title', 'Ready to Experience Impeccable Property Care?')}
          </h2>
          <p className="text-emerald-100 text-sm sm:text-base max-w-xl mx-auto mb-8 font-medium">
            {activeTab === 'commercial'
              ? (i18n.language?.startsWith('es') ? 'Agenda tu walkthrough gratuito de 15 minutos hoy. Nuestro equipo comercial entregará tu propuesta personalizada el mismo día.' : 'Schedule your free 15-minute walkthrough today. Our commercial accounts team delivers your custom written quote same-day.')
              : t('servicesPage.cta.subtitle', 'Choose your space, pick your date, and let our insured team handle the rest.')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {activeTab === 'commercial' ? (
              <Button
                variant="white"
                size="lg"
                onClick={() => setIsWalkthroughModalOpen(true)}
                className="font-black text-emerald-950 hover:bg-emerald-50 shadow-lg px-8 hover:scale-102 active:scale-98 transition-all duration-200 cursor-pointer"
              >
                <Calendar className="w-5 h-5 mr-2 text-emerald-600" />
                <span className="text-emerald-950 font-black">
                  {t('servicesPage.requestWalkthroughBtn', 'Request a Walkthrough')}
                </span>
              </Button>
            ) : (
              <Link to="/schedule">
                <Button
                  variant="white"
                  size="lg"
                  className="font-black text-emerald-950 hover:bg-emerald-50 shadow-lg px-8 hover:scale-102 active:scale-98 transition-all duration-200"
                >
                  <Calendar className="w-5 h-5 mr-2 text-emerald-600" />
                  <span className="text-emerald-950 font-black">
                    {t('servicesPage.cta.scheduleBtn', 'Book Your Cleaning')}
                  </span>
                </Button>
              </Link>
            )}
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

      {/* Commercial Walkthrough Modal */}
      <CommercialWalkthroughModal
        isOpen={isWalkthroughModalOpen}
        onClose={() => setIsWalkthroughModalOpen(false)}
      />
    </div>
  );
}
