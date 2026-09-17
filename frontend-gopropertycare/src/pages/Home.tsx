import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  Home as HomeIcon,
  Calendar,
  Layers,
  Award,
  Zap,
  Clock,
  Check,
  Building2,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import api from '@/api';
import type { CleaningServiceRate } from '@/types';
import { DEFAULT_CLEANING_RATES } from '@/constants/cleaningServices';

export function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [rates, setRates] = useState<CleaningServiceRate[]>(DEFAULT_CLEANING_RATES);
  const [sqft, setSqft] = useState<number>(1500);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await api.get('/cleaning/rates/');
        const list = Array.isArray(response.data) ? response.data : response.data?.results || [];
        if (list.length > 0) {
          const residentialTypes = ['regular', 'deep', 'move_in_out', 'post_construction'];
          const filtered = list.filter((r: CleaningServiceRate) => residentialTypes.includes(r.service_type));
          setRates(filtered.length > 0 ? filtered : list);
        }
      } catch (err) {
        console.warn('Using fallback cleaning rates:', err);
      }
    };
    fetchRates();
  }, []);

  const calculateTierPrice = (ratePerSqft: string | number, minAmount: string | number = 99) => {
    const rate = Number(ratePerSqft) || 0.1;
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
      icon: Sparkles,
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
        {/* Location Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/90 text-emerald-800 text-xs sm:text-sm font-bold mb-6 shadow-2xs animate-fade-in-down">
          <MapPin className="w-3.5 h-3.5 text-emerald-600 animate-float" />
          <span>{t('home.badge')}</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight max-w-4xl leading-[1.1] mb-6 animate-fade-in-up">
          {t('home.hero.title')}
        </h1>

        <p className="text-base sm:text-lg lg:text-xl text-slate-600 max-w-2xl leading-relaxed mb-8 sm:mb-10 font-medium animate-fade-in-up delay-75">
          {t('home.hero.subtitle')}
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center max-w-md animate-fade-in-up delay-150">
          <Button
            size="lg"
            className="w-full sm:w-auto shadow-md hover:shadow-lg hover:shadow-emerald-600/25 transition-all duration-300 hover:scale-102 active:scale-98"
            onClick={() => navigate('/schedule')}
          >
            <Sparkles className="w-5 h-5 mr-2 animate-float" />
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
            <ArrowRight className="w-4 h-4 ml-2 text-slate-500 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* Social Proof Pills */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-12 w-full max-w-4xl text-left animate-fade-in-up delay-200">
          <div className="bg-white/80 border border-emerald-100/90 rounded-xl p-3.5 shadow-2xs flex items-center gap-2.5 hover:-translate-y-0.5 hover:shadow-xs hover:border-emerald-300 transition-all duration-300">
            <div className="w-8 h-8 rounded-lg bg-emerald-100/80 text-emerald-700 flex items-center justify-center shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-800">{t('home.socialProof.rating')}</span>
          </div>

          <div className="bg-white/80 border border-emerald-100/90 rounded-xl p-3.5 shadow-2xs flex items-center gap-2.5 hover:-translate-y-0.5 hover:shadow-xs hover:border-emerald-300 transition-all duration-300">
            <div className="w-8 h-8 rounded-lg bg-emerald-100/80 text-emerald-700 flex items-center justify-center shrink-0">
              <HomeIcon className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-800">{t('home.socialProof.properties')}</span>
          </div>

          <div className="bg-white/80 border border-emerald-100/90 rounded-xl p-3.5 shadow-2xs flex items-center gap-2.5 hover:-translate-y-0.5 hover:shadow-xs hover:border-emerald-300 transition-all duration-300">
            <div className="w-8 h-8 rounded-lg bg-emerald-100/80 text-emerald-700 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-800">{t('home.socialProof.instant')}</span>
          </div>

          <div className="bg-white/80 border border-emerald-100/90 rounded-xl p-3.5 shadow-2xs flex items-center gap-2.5 hover:-translate-y-0.5 hover:shadow-xs hover:border-emerald-300 transition-all duration-300">
            <div className="w-8 h-8 rounded-lg bg-emerald-100/80 text-emerald-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-800">{t('home.socialProof.bonded')}</span>
          </div>
        </div>
      </section>

      {/* Interactive Sq Ft Estimator */}
      <section id="estimator" className="scroll-mt-24">
        <Card className="border-emerald-200/80 bg-linear-to-b from-white via-white to-emerald-50/30 p-6 sm:p-10 shadow-lg">
          <div className="max-w-3xl mx-auto text-center space-y-3 mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {t('home.estimator.title')}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              {t('home.estimator.subtitle')}
            </p>
          </div>

          {/* Presets */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto mb-8">
            <button
              type="button"
              onClick={() => setSqft(800)}
              className={`p-3.5 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer hover:scale-102 active:scale-95 ${
                sqft === 800
                  ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 shadow-xs ring-2 ring-emerald-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
              }`}
            >
              <div className="text-xs font-black text-slate-900">{t('home.estimator.small')}</div>
              <div className="text-xs text-slate-600 font-medium mt-0.5">{t('home.estimator.smallDesc')}</div>
            </button>

            <button
              type="button"
              onClick={() => setSqft(1800)}
              className={`p-3.5 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer hover:scale-102 active:scale-95 ${
                sqft === 1800
                  ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 shadow-xs ring-2 ring-emerald-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
              }`}
            >
              <div className="text-xs font-black text-slate-900">{t('home.estimator.medium')}</div>
              <div className="text-xs text-slate-600 font-medium mt-0.5">{t('home.estimator.mediumDesc')}</div>
            </button>

            <button
              type="button"
              onClick={() => setSqft(3000)}
              className={`p-3.5 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer hover:scale-102 active:scale-95 ${
                sqft === 3000
                  ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 shadow-xs ring-2 ring-emerald-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
              }`}
            >
              <div className="text-xs font-black text-slate-900">{t('home.estimator.large')}</div>
              <div className="text-xs text-slate-600 font-medium mt-0.5">{t('home.estimator.largeDesc')}</div>
            </button>
          </div>

          {/* Slider & Input Controls */}
          <div className="max-w-xl mx-auto space-y-4 mb-10">
            <div className="flex items-center justify-between">
              <label htmlFor="sqft-slider" className="text-sm font-extrabold text-slate-800">
                {t('home.estimator.sqftLabel')}:
              </label>
              <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-xl px-3.5 py-1.5 text-slate-900 font-extrabold text-sm shadow-2xs">
                <input
                  id="sqft-number-input"
                  aria-label={t('home.estimator.sqftLabel')}
                  type="number"
                  min={100}
                  max={8000}
                  step={50}
                  value={sqft}
                  onChange={(e) => setSqft(Math.max(100, Number(e.target.value) || 100))}
                  className="w-20 text-right focus:outline-none text-emerald-700 font-black text-base"
                />
                <span className="text-slate-600 font-bold text-xs">sq ft</span>
              </div>
            </div>

            <input
              id="sqft-slider"
              type="range"
              min={300}
              max={5000}
              step={50}
              value={sqft}
              onChange={(e) => setSqft(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              aria-label="Square footage slider"
            />

            <div className="flex justify-between text-xs text-slate-600 font-semibold">
              <span>300 sq ft</span>
              <span>2,500 sq ft</span>
              <span>5,000+ sq ft</span>
            </div>

            <p className="text-xs text-amber-900 bg-amber-50 border border-amber-200/80 p-3 rounded-xl text-center font-semibold shadow-2xs">
              {t('home.estimator.minOrderNotice')}
            </p>
          </div>

          {/* Results Grid Across 4 Tiers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {rates.map((rate) => {
              const price = calculateTierPrice(rate.rate_per_sqft, rate.min_order_amount);
              const isMinimum = sqft * Number(rate.rate_per_sqft) < Number(rate.min_order_amount);
              const localizedName = t(`home.pricing.${rate.service_type}.name`, { defaultValue: rate.name });
              const localizedDesc = t(`home.pricing.${rate.service_type}.description`, { defaultValue: rate.description });

              return (
                <div
                  key={rate.id}
                  className="bg-white border-2 border-slate-200/90 rounded-2xl p-5 flex flex-col justify-between hover:border-emerald-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50/80 px-2 py-0.5 rounded-md">
                        ${Number(rate.rate_per_sqft).toFixed(2)}/sqft
                      </span>
                      {rate.service_type === 'deep' && (
                        <span className="text-[11px] bg-emerald-600 text-white px-2.5 py-0.5 rounded-full font-extrabold shadow-2xs animate-pulse-glow">
                          Popular
                        </span>
                      )}
                    </div>
                    <h3 className="font-black text-slate-900 text-base leading-snug group-hover:text-emerald-950 transition-colors">
                      {localizedName}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed line-clamp-2">
                      {localizedDesc}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100">
                    <div className="text-xs text-slate-600 font-semibold">{t('home.estimator.estTotal')}</div>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-2xl font-black text-slate-900">
                        ${price.toFixed(2)}
                      </span>
                      {isMinimum && (
                        <span className="text-xs text-amber-700 font-bold ml-1">(min $99)</span>
                      )}
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full mt-3 font-extrabold text-xs hover:scale-102 active:scale-98 transition-all duration-200 shadow-xs group-hover:shadow-md"
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
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            {t('home.howItWorks.title')}
          </h2>
          <p className="text-slate-600 text-sm sm:text-base font-medium">
            {t('home.howItWorks.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.step} className="p-6 relative overflow-hidden group hover:border-emerald-300 hover:-translate-y-1.5 hover:shadow-lg transition-all duration-300">
                <div className="w-8 h-8 rounded-xl bg-emerald-100/90 text-emerald-800 font-black text-xs flex items-center justify-center absolute top-4 right-4 shadow-2xs select-none group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                  {s.step}
                </div>
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-emerald-100 transition-all duration-300">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 mb-1.5 group-hover:text-emerald-950 transition-colors">{s.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">{s.desc}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Services Comparison Grid */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            {t('home.pricing.title')}
          </h2>
          <p className="text-slate-600 text-sm sm:text-base font-medium">
            {t('home.pricing.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Regular */}
          <Card className="flex flex-col justify-between hover:-translate-y-1.5 hover:shadow-lg transition-all duration-300 group">
            <div className="space-y-4">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-md">
                {t('home.pricing.regular.tagline')}
              </span>
              <h3 className="text-xl font-black text-slate-900 group-hover:text-emerald-950 transition-colors">{t('home.pricing.regular.name')}</h3>
              <div className="text-2xl font-black text-slate-900">{t('home.pricing.regular.rate')}</div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">{t('home.pricing.regular.description')}</p>
              <ul className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-700 font-medium">
                {((t('home.pricing.regular.features', { returnObjects: true }) as string[]) || []).map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Button
              className="w-full mt-6 text-slate-800 font-bold border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/50 hover:scale-102 active:scale-98 transition-all duration-200"
              variant="outline"
              onClick={() => navigate('/schedule?tier=regular')}
            >
              {t('home.pricing.bookNow')}
            </Button>
          </Card>

          {/* Deep Clean */}
          <Card variant="featured" className="flex flex-col justify-between relative hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 group ring-2 ring-emerald-600/30">
            <div className="space-y-4">
              <span className="text-xs font-black uppercase tracking-wider text-white bg-emerald-700 px-2.5 py-1 rounded-md shadow-2xs">
                {t('home.pricing.deep.tagline')}
              </span>
              <h3 className="text-xl font-black text-slate-900 group-hover:text-emerald-950 transition-colors">{t('home.pricing.deep.name')}</h3>
              <div className="text-2xl font-black text-emerald-700">{t('home.pricing.deep.rate')}</div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">{t('home.pricing.deep.description')}</p>
              <ul className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-700 font-medium">
                {((t('home.pricing.deep.features', { returnObjects: true }) as string[]) || []).map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Button
              className="w-full mt-6 font-extrabold shadow-md hover:shadow-lg hover:scale-102 active:scale-98 transition-all duration-200"
              onClick={() => navigate('/schedule?tier=deep')}
            >
              {t('home.pricing.bookNow')}
            </Button>
          </Card>

          {/* Move-In / Move-Out */}
          <Card className="flex flex-col justify-between hover:-translate-y-1.5 hover:shadow-lg transition-all duration-300 group">
            <div className="space-y-4">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-md">
                {t('home.pricing.moveInOut.tagline')}
              </span>
              <h3 className="text-xl font-black text-slate-900 group-hover:text-emerald-950 transition-colors">{t('home.pricing.moveInOut.name')}</h3>
              <div className="text-2xl font-black text-slate-900">{t('home.pricing.moveInOut.rate')}</div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">{t('home.pricing.moveInOut.description')}</p>
              <ul className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-700 font-medium">
                {((t('home.pricing.moveInOut.features', { returnObjects: true }) as string[]) || []).map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Button
              className="w-full mt-6 text-slate-800 font-bold border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/50 hover:scale-102 active:scale-98 transition-all duration-200"
              variant="outline"
              onClick={() => navigate('/schedule?tier=move_in_out')}
            >
              {t('home.pricing.bookNow')}
            </Button>
          </Card>

          {/* Post-Construction */}
          <Card className="flex flex-col justify-between hover:-translate-y-1.5 hover:shadow-lg transition-all duration-300 group">
            <div className="space-y-4">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 bg-emerald-100/80 border border-emerald-200/90 px-2.5 py-1 rounded-md">
                {t('home.pricing.postConstruction.tagline')}
              </span>
              <h3 className="text-xl font-black text-slate-900 group-hover:text-emerald-950 transition-colors">{t('home.pricing.postConstruction.name')}</h3>
              <div className="text-2xl font-black text-slate-900">{t('home.pricing.postConstruction.rate')}</div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">{t('home.pricing.postConstruction.description')}</p>
              <ul className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-700 font-medium">
                {((t('home.pricing.postConstruction.features', { returnObjects: true }) as string[]) || []).map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Button
              className="w-full mt-6 text-slate-800 font-bold border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/50 hover:scale-102 active:scale-98 transition-all duration-200"
              variant="outline"
              onClick={() => navigate('/schedule?tier=post_construction')}
            >
              {t('home.pricing.bookNow')}
            </Button>
          </Card>
        </div>
      </section>

      {/* Commercial & Construction Division Referral to Evolving Solutions LLC */}
      <section>
        <div className="bg-gradient-to-br from-[#2f1b11] via-[#573725] to-[#815133] text-white rounded-3xl p-8 sm:p-10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-[#a3704c]/30">
          <div className="space-y-3 text-center md:text-left max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[#eedecd] text-xs font-bold uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5 text-[#e0c3a7]" />
              <span>{t('home.commercialReferral.badge')}</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {t('home.commercialReferral.title')}
            </h3>
            <p className="text-stone-200 text-sm sm:text-base leading-relaxed font-medium">
              {t('home.commercialReferral.description')}
            </p>
          </div>

          <div className="shrink-0 w-full md:w-auto">
            <a
              href="https://evolvingsolutionsllc.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3.5 rounded-xl bg-white text-[#573725] hover:bg-[#fdfaf6] font-black text-sm shadow-lg hover:shadow-xl hover:scale-102 active:scale-98 transition-all"
            >
              <span>{t('home.commercialReferral.cta')}</span>
              <ArrowRight className="w-4 h-4 text-[#815133]" />
            </a>
          </div>
        </div>
      </section>

      {/* Coverage Areas */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            {t('home.coverage.title')}
          </h2>
          <p className="text-slate-600 text-sm sm:text-base font-medium">
            {t('home.coverage.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-7 border-emerald-200/90 bg-emerald-50/40 hover:-translate-y-1 hover:shadow-md hover:border-emerald-300 transition-all duration-300">
            <div className="inline-flex items-center gap-2 text-emerald-800 font-extrabold text-sm mb-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{t('home.coverage.innerBadge')}</span>
            </div>
            <p className="text-sm text-slate-800 leading-relaxed font-medium">
              {t('home.coverage.innerDesc')}
            </p>
          </Card>

          <Card className="p-7 border-amber-200/90 bg-amber-50/40 hover:-translate-y-1 hover:shadow-md hover:border-amber-300 transition-all duration-300">
            <div className="inline-flex items-center gap-2 text-amber-800 font-extrabold text-sm mb-3">
              <MapPin className="w-4 h-4 text-amber-600" />
              <span>{t('home.coverage.outerBadge')}</span>
            </div>
            <p className="text-sm text-slate-800 leading-relaxed font-medium">
              {t('home.coverage.outerDesc')}
            </p>
          </Card>
        </div>
      </section>

      {/* Contact & Support Section */}
      <section>
        <Card variant="dark" className="p-8 sm:p-10 bg-slate-900 border border-slate-800 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="space-y-3 text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {t('home.contact.title')}
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl font-medium">
              {t('home.contact.subtitle')}
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2 text-sm text-emerald-400 font-semibold justify-center md:justify-start">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-400" />
                {t('home.contact.hours')}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-400" />
                Denver & Boulder, CO
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
            <a
              href="tel:7205908632"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm shadow-md hover:shadow-lg hover:scale-102 active:scale-98 transition-all duration-200"
            >
              <Phone className="w-4 h-4" />
              <span>(720) 590-8632</span>
            </a>
            <a
              href="mailto:info@gopropertycare.com"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-white font-bold text-sm border border-slate-700 hover:border-slate-600 hover:scale-102 active:scale-98 transition-all duration-200"
            >
              <Mail className="w-4 h-4 text-emerald-400" />
              <span>info@gopropertycare.com</span>
            </a>
          </div>
        </Card>
      </section>
    </div>
  );
}
