import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  HardHat,
  Calendar,
  Layers,
  Award,
  Check,
  Home as HomeIcon,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import api from '@/api';
import type { CleaningServiceRate } from '@/types';
import { DEFAULT_COMMERCIAL_RATES } from '@/constants/commercialServices';

export function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [rates, setRates] = useState<CleaningServiceRate[]>(DEFAULT_COMMERCIAL_RATES);
  const [sqft, setSqft] = useState<number>(2500);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await api.get('/cleaning/rates/?brand=evolvingsolutions');
        const list: CleaningServiceRate[] = Array.isArray(response.data) ? response.data : response.data?.results || [];
        if (list.length > 0) {
          // Filter to commercial & post_construction & industrial_demolition
          const commercialTypes = ['commercial', 'post_construction', 'industrial_demolition'];
          const filtered = list.filter((r) => commercialTypes.includes(r.service_type));
          if (filtered.length > 0) {
            setRates(filtered);
          }
        }
      } catch (err) {
        console.warn('Using fallback commercial rates:', err);
      }
    };
    fetchRates();
  }, []);

  const calculateTierPrice = (ratePerSqft: string | number, minAmount: string | number = 99) => {
    const rate = Number(ratePerSqft) || 0.18;
    const min = Number(minAmount) || 99;
    const raw = sqft * rate;
    return Math.max(raw, min);
  };

  const steps = [
    {
      step: '01',
      icon: Calendar,
      title: t('home.howItWorks.step1.title'),
      desc: t('home.howItWorks.step1.description'),
    },
    {
      step: '02',
      icon: Layers,
      title: t('home.howItWorks.step2.title'),
      desc: t('home.howItWorks.step2.description'),
    },
    {
      step: '03',
      icon: HardHat,
      title: t('home.howItWorks.step3.title'),
      desc: t('home.howItWorks.step3.description'),
    },
    {
      step: '04',
      icon: Award,
      title: t('home.howItWorks.step4.title'),
      desc: t('home.howItWorks.step4.description'),
    },
  ];

  return (
    <div className="flex flex-col gap-16 sm:gap-24 py-4 sm:py-6">
      {/* Hero Section */}
      <section className="relative pt-6 sm:pt-12 pb-8 sm:pb-12 text-center flex flex-col items-center">
        {/* Location & Compliance Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f7efe6] border border-[#e0c3a7]/90 text-[#573725] text-xs sm:text-sm font-bold mb-6 shadow-2xs animate-fade-in-down">
          <MapPin className="w-3.5 h-3.5 text-[#815133] animate-float" />
          <span>{t('home.badge')}</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-stone-950 tracking-tight max-w-4xl leading-[1.1] mb-6 animate-fade-in-up">
          {t('home.hero.title')}
        </h1>

        <p className="text-base sm:text-lg lg:text-xl text-stone-600 max-w-2xl leading-relaxed mb-8 sm:mb-10 font-medium animate-fade-in-up delay-75">
          {t('home.hero.subtitle')}
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center max-w-md animate-fade-in-up delay-150">
          <Button
            size="lg"
            className="w-full sm:w-auto shadow-md hover:shadow-lg transition-all duration-300 hover:scale-102 active:scale-98"
            onClick={() => navigate('/schedule')}
          >
            <HardHat className="w-5 h-5 mr-2 animate-float" />
            {t('home.hero.cta')}
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-auto group hover:scale-102 active:scale-98 transition-all duration-300"
            onClick={() => {
              document.getElementById('estimator')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            {t('home.hero.secondaryCta')}
            <ArrowRight className="w-4 h-4 ml-2 text-stone-500 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* Commercial Proof Badges */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12 sm:mt-16 w-full max-w-4xl pt-8 border-t border-stone-200/80 animate-fade-in delay-200">
          <div className="flex flex-col items-center text-center p-3">
            <span className="font-black text-stone-950 text-xl sm:text-2xl">100%</span>
            <span className="text-xs text-stone-600 font-bold mt-0.5">{t('home.socialProof.guarantee')}</span>
          </div>
          <div className="flex flex-col items-center text-center p-3">
            <span className="font-black text-[#815133] text-xl sm:text-2xl">+450</span>
            <span className="text-xs text-stone-600 font-bold mt-0.5">{t('home.socialProof.properties')}</span>
          </div>
          <div className="flex flex-col items-center text-center p-3">
            <span className="font-black text-stone-950 text-xl sm:text-2xl">OSHA</span>
            <span className="text-xs text-stone-600 font-bold mt-0.5">{t('home.socialProof.eco')}</span>
          </div>
          <div className="flex flex-col items-center text-center p-3">
            <span className="font-black text-[#815133] text-xl sm:text-2xl">5.0 ★</span>
            <span className="text-xs text-stone-600 font-bold mt-0.5">{t('home.socialProof.rating')}</span>
          </div>
        </div>
      </section>

      {/* Interactive Sq Ft Cost Estimator */}
      <section id="estimator" className="scroll-mt-24">
        <Card variant="featured" className="p-6 sm:p-10 border-[#815133]/40 bg-white/95">
          <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f7efe6] text-[#573725] text-xs font-bold uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5 text-[#815133]" />
              <span>{t('home.estimator.title')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-950 tracking-tight">
              {t('home.estimator.title')}
            </h2>
            <p className="text-stone-600 text-sm sm:text-base font-medium">
              {t('home.estimator.subtitle')}
            </p>
          </div>

          {/* Slider Controls */}
          <div className="max-w-xl mx-auto mb-10 space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="sqft-slider" className="text-sm font-bold text-stone-700">
                {t('home.estimator.sqftLabel')}
              </label>
              <div className="flex items-center gap-2 bg-[#f7efe6] px-4 py-1.5 rounded-xl border border-[#e0c3a7]">
                <input
                  type="number"
                  min={300}
                  max={15000}
                  step={100}
                  value={sqft}
                  onChange={(e) => setSqft(Math.max(100, Number(e.target.value) || 100))}
                  className="w-24 text-right focus:outline-none text-[#815133] font-black text-base"
                />
                <span className="text-stone-600 font-bold text-xs">sq ft</span>
              </div>
            </div>

            <input
              id="sqft-slider"
              type="range"
              min={500}
              max={10000}
              step={100}
              value={sqft}
              onChange={(e) => setSqft(Number(e.target.value))}
              className="w-full accent-[#815133] cursor-pointer h-2 bg-stone-200 rounded-lg"
              aria-label="Square footage slider"
            />

            <div className="flex justify-between text-xs text-stone-600 font-semibold">
              <span>500 sq ft</span>
              <span>5,000 sq ft</span>
              <span>10,000+ sq ft</span>
            </div>

            <p className="text-xs text-stone-700 bg-[#f7efe6] border border-[#e0c3a7]/80 p-3 rounded-xl text-center font-semibold shadow-2xs">
              {t('home.estimator.minOrderNotice')}
            </p>
          </div>

          {/* Results Grid Across 3 Commercial Tiers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {rates.map((rate) => {
              const price = calculateTierPrice(rate.rate_per_sqft, rate.min_order_amount);
              const isMinimum = sqft * Number(rate.rate_per_sqft) < Number(rate.min_order_amount);
              const localizedName = t(`home.pricing.${rate.service_type}.name`, { defaultValue: rate.name });
              const localizedDesc = t(`home.pricing.${rate.service_type}.description`, { defaultValue: rate.description });

              return (
                <div
                  key={rate.id}
                  className="bg-white border-2 border-stone-200/90 rounded-2xl p-6 flex flex-col justify-between hover:border-[#815133] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-[#815133] bg-[#f7efe6] px-2.5 py-1 rounded-md">
                        ${Number(rate.rate_per_sqft).toFixed(2)}/sqft
                      </span>
                      {rate.service_type === 'post_construction' && (
                        <span className="text-[11px] bg-[#815133] text-white px-2.5 py-0.5 rounded-full font-extrabold shadow-2xs">
                          Popular
                        </span>
                      )}
                    </div>
                    <h3 className="font-black text-stone-950 text-lg leading-snug group-hover:text-[#573725] transition-colors">
                      {localizedName}
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-600 font-medium leading-relaxed">
                      {localizedDesc}
                    </p>
                  </div>

                  <div className="pt-4 mt-6 border-t border-stone-100">
                    <div className="text-xs text-stone-600 font-semibold">{t('home.estimator.estTotal')}</div>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-2xl sm:text-3xl font-black text-stone-950">
                        ${price.toFixed(2)}
                      </span>
                      {isMinimum && (
                        <span className="text-xs text-amber-800 font-bold ml-1">(min $99)</span>
                      )}
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full mt-4 font-extrabold text-xs sm:text-sm hover:scale-102 active:scale-98 transition-all duration-200 shadow-xs"
                      onClick={() => navigate(`/schedule?tier=${rate.service_type}&sqft=${sqft}`)}
                    >
                      {t('home.pricing.bookNow')}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </section>

      {/* How It Works */}
      <section className="space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-3xl font-black text-stone-950 tracking-tight">
            {t('home.howItWorks.title')}
          </h2>
          <p className="text-stone-600 text-sm sm:text-base font-medium">
            {t('home.howItWorks.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.step} className="p-6 relative overflow-hidden group hover:border-[#b58057] hover:-translate-y-1.5 hover:shadow-lg transition-all duration-300">
                <div className="w-8 h-8 rounded-xl bg-[#f7efe6] text-[#573725] font-black text-xs flex items-center justify-center absolute top-4 right-4 shadow-2xs select-none group-hover:bg-[#815133] group-hover:text-white transition-colors duration-300">
                  {s.step}
                </div>
                <div className="w-11 h-11 rounded-xl bg-[#f7efe6] text-[#815133] flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-[#eedecd] transition-all duration-300">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-stone-950 mb-1.5 group-hover:text-[#573725] transition-colors">{s.title}</h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-medium">{s.desc}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Commercial Scope Comparison Grid */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-3xl font-black text-stone-950 tracking-tight">
            {t('home.pricing.title')}
          </h2>
          <p className="text-stone-600 text-sm sm:text-base font-medium">
            {t('home.pricing.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {/* Commercial Janitorial */}
          <Card className="flex flex-col justify-between border-stone-200/90 hover:border-[#815133] transition-all duration-300 p-6 sm:p-7">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-[#815133]">
                  {t('home.pricing.commercial.tagline')}
                </span>
                <h3 className="text-xl font-black text-stone-950 mt-1">
                  {t('home.pricing.commercial.name')}
                </h3>
                <div className="mt-2 text-2xl font-black text-stone-950">
                  {t('home.pricing.commercial.rate')}
                </div>
                <p className="text-xs sm:text-sm text-stone-600 font-medium mt-2 leading-relaxed">
                  {t('home.pricing.commercial.description')}
                </p>
              </div>

              <div className="border-t border-stone-100 pt-4">
                <ul className="space-y-2.5 text-xs sm:text-sm text-stone-700">
                  {((t('home.pricing.commercial.features', { returnObjects: true }) as string[]) || []).map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#815133] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <Button
              variant="outline"
              size="md"
              className="w-full mt-6"
              onClick={() => navigate('/schedule?tier=commercial')}
            >
              {t('home.pricing.bookNow')}
            </Button>
          </Card>

          {/* Post-Construction */}
          <Card variant="featured" className="flex flex-col justify-between border-[#815133] bg-white p-6 sm:p-7 relative shadow-md">
            <div className="absolute -top-3 right-6 bg-[#815133] text-white text-[11px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow-xs">
              Turnover Ready
            </div>
            <div className="space-y-4">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-[#815133]">
                  {t('home.pricing.post_construction.tagline')}
                </span>
                <h3 className="text-xl font-black text-stone-950 mt-1">
                  {t('home.pricing.post_construction.name')}
                </h3>
                <div className="mt-2 text-2xl font-black text-stone-950">
                  {t('home.pricing.post_construction.rate')}
                </div>
                <p className="text-xs sm:text-sm text-stone-600 font-medium mt-2 leading-relaxed">
                  {t('home.pricing.post_construction.description')}
                </p>
              </div>

              <div className="border-t border-stone-100 pt-4">
                <ul className="space-y-2.5 text-xs sm:text-sm text-stone-700">
                  {((t('home.pricing.post_construction.features', { returnObjects: true }) as string[]) || []).map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#815133] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              className="w-full mt-6"
              onClick={() => navigate('/schedule?tier=post_construction')}
            >
              {t('home.pricing.bookNow')}
            </Button>
          </Card>

          {/* Drywall Demolition & Industrial Labor */}
          <Card className="flex flex-col justify-between border-stone-200/90 hover:border-[#815133] transition-all duration-300 p-6 sm:p-7">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-[#815133]">
                  {t('home.pricing.industrial_demolition.tagline')}
                </span>
                <h3 className="text-xl font-black text-stone-950 mt-1">
                  {t('home.pricing.industrial_demolition.name')}
                </h3>
                <div className="mt-2 text-2xl font-black text-stone-950">
                  {t('home.pricing.industrial_demolition.rate')}
                </div>
                <p className="text-xs sm:text-sm text-stone-600 font-medium mt-2 leading-relaxed">
                  {t('home.pricing.industrial_demolition.description')}
                </p>
              </div>

              <div className="border-t border-stone-100 pt-4">
                <ul className="space-y-2.5 text-xs sm:text-sm text-stone-700">
                  {((t('home.pricing.industrial_demolition.features', { returnObjects: true }) as string[]) || []).map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#815133] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <Button
              variant="outline"
              size="md"
              className="w-full mt-6"
              onClick={() => navigate('/schedule?tier=industrial_demolition')}
            >
              {t('home.pricing.bookNow')}
            </Button>
          </Card>
        </div>

        <p className="text-center text-xs text-stone-500 font-medium">
          {t('home.pricing.minNotice')}
        </p>
      </section>

      {/* Safety & Compliance Feature Callout */}
      <section>
        <div className="bg-gradient-to-br from-[#2f1b11] to-[#573725] text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[#eedecd] text-xs font-bold uppercase tracking-wider mb-4">
              <ShieldCheck className="w-4 h-4 text-[#e0c3a7]" />
              <span>Full Insurance & OSHA Rigor</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white mb-4">
              Bridging the Gap Between Quality Talent and Project Success
            </h2>
            <p className="text-stone-300 text-sm sm:text-base leading-relaxed mb-6 font-medium">
              We eliminate the friction of finding reliable, insured, and safety-compliant commercial crews. From daily janitorial shifts to intensive drywall teardowns, our workforce is background-checked, insured, and ready to deliver.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold">
                <CheckCircle2 className="w-4 h-4 text-[#e0c3a7]" />
                <span>General Liability Protection</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold">
                <CheckCircle2 className="w-4 h-4 text-[#e0c3a7]" />
                <span>Workers' Compensation Included</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold">
                <CheckCircle2 className="w-4 h-4 text-[#e0c3a7]" />
                <span>Same-Day COI Turnaround</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Residential Division Referral to GoPropertyCare */}
      <section>
        <div className="bg-gradient-to-br from-[#064e3b] via-[#047857] to-[#059669] text-white rounded-3xl p-8 sm:p-10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-emerald-500/30">
          <div className="space-y-3 text-center md:text-left max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-emerald-100 text-xs font-bold uppercase tracking-wider">
              <HomeIcon className="w-3.5 h-3.5 text-emerald-200" />
              <span>{t('home.residentialReferral.badge')}</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {t('home.residentialReferral.title')}
            </h3>
            <p className="text-emerald-100 text-sm sm:text-base leading-relaxed font-medium">
              {t('home.residentialReferral.description')}
            </p>
          </div>

          <div className="shrink-0 w-full md:w-auto">
            <a
              href="https://gopropertycare.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3.5 rounded-xl bg-white text-emerald-950 hover:bg-emerald-50 font-black text-sm shadow-lg hover:shadow-xl hover:scale-102 active:scale-98 transition-all"
            >
              <span>{t('home.residentialReferral.cta')}</span>
              <ArrowRight className="w-4 h-4 text-emerald-700" />
            </a>
          </div>
        </div>
      </section>

      {/* Coverage Areas */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-3xl font-black text-stone-950 tracking-tight">
            {t('home.coverage.title')}
          </h2>
          <p className="text-stone-600 text-sm sm:text-base font-medium">
            {t('home.coverage.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 sm:p-8 space-y-3 border-stone-200">
            <span className="text-xs font-black uppercase tracking-wider text-[#815133] bg-[#f7efe6] px-3 py-1 rounded-md">
              {t('home.coverage.innerBadge')}
            </span>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-medium pt-1">
              {t('home.coverage.innerDesc')}
            </p>
          </Card>

          <Card className="p-6 sm:p-8 space-y-3 border-stone-200">
            <span className="text-xs font-black uppercase tracking-wider text-amber-900 bg-amber-50 px-3 py-1 rounded-md">
              {t('home.coverage.outerBadge')}
            </span>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-medium pt-1">
              {t('home.coverage.outerDesc')}
            </p>
          </Card>
        </div>
      </section>

      {/* Direct Contact & Contractor Inquiries */}
      <section className="border-t border-stone-200/80 pt-12 pb-6">
        <div className="bg-[#f7efe6] border border-[#e0c3a7] rounded-2xl p-8 sm:p-10 text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black text-stone-950">
            {t('home.contact.title')}
          </h2>
          <p className="text-stone-700 text-sm sm:text-base leading-relaxed font-medium max-w-xl mx-auto">
            {t('home.contact.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
            <a
              href="tel:7205908632"
              className="flex items-center gap-2 text-stone-900 hover:text-[#815133] font-bold text-base transition-colors"
            >
              <Phone className="w-5 h-5 text-[#815133]" />
              <span>{t('home.contact.phone')}</span>
            </a>
            <div className="hidden sm:block h-4 w-px bg-stone-300" />
            <a
              href="mailto:info@evolvingsolutionsllc.com"
              className="flex items-center gap-2 text-stone-900 hover:text-[#815133] font-bold text-base transition-colors"
            >
              <Mail className="w-5 h-5 text-[#815133]" />
              <span>{t('home.contact.email')}</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
