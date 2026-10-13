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
  Clock,
  Check,
  Building2,
  KeyRound,
  HardHat,
  Star,
  FileCheck2,
  CheckSquare,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import api from '@/api';
import type { CleaningServiceRate } from '@/types';
import { DEFAULT_CLEANING_RATES } from '@/constants/cleaningServices';
import { SERVICE_AREAS } from '@/constants/locations';
import { SEO } from '@/components/common/SEO';

export function Home() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [rates, setRates] = useState<CleaningServiceRate[]>(DEFAULT_CLEANING_RATES);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await api.get('/cleaning/rates/?brand=gopropertycare');
        const list = Array.isArray(response.data) ? response.data : response.data?.results || [];
        if (list.length > 0) {
          setRates(list);
        }
      } catch (err) {
        console.warn('Using fallback cleaning rates:', err);
      }
    };
    fetchRates();
  }, []);

  const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
      case 'move_in_out':
        return KeyRound;
      case 'residential':
      case 'regular':
      case 'deep':
        return HomeIcon;
      case 'commercial':
        return Building2;
      case 'post_construction':
        return HardHat;
      case 'short_term_rental':
      case 'str_on_site':
      case 'str_off_site':
        return Star;
      default:
        return Sparkles;
    }
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
      icon: FileCheck2,
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
      <SEO
        title={t('home.hero.title')}
        description={t('home.hero.subtitle')}
        canonical="https://gopropertycare.com/"
      />
      {/* Hero Section */}
      <section className="relative pt-6 sm:pt-12 pb-6 sm:pb-10 text-center flex flex-col items-center">
        {/* Contact & Location Badge */}

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight max-w-4xl leading-[1.1] mb-6 animate-fade-in-up">
          {t('home.hero.title')}
        </h1>

        <p className="text-base sm:text-lg lg:text-xl text-slate-600 max-w-3xl leading-relaxed mb-8 sm:mb-10 font-medium animate-fade-in-up delay-75">
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
              document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            {t('home.hero.secondaryCta')}
            <ArrowRight className="w-4 h-4 ml-2 text-slate-500 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* Social Proof Pills */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-12 w-full max-w-4xl text-left animate-fade-in-up delay-200">
          <div className="bg-white/90 border border-emerald-100 rounded-xl p-3.5 shadow-2xs flex items-center gap-2.5 hover:-translate-y-0.5 hover:shadow-xs hover:border-emerald-300 transition-all duration-300">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-800">{t('home.socialProof.rating')}</span>
          </div>

          <div className="bg-white/90 border border-emerald-100 rounded-xl p-3.5 shadow-2xs flex items-center gap-2.5 hover:-translate-y-0.5 hover:shadow-xs hover:border-emerald-300 transition-all duration-300">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckSquare className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-800">{t('home.socialProof.properties')}</span>
          </div>

          <div className="bg-white/90 border border-emerald-100 rounded-xl p-3.5 shadow-2xs flex items-center gap-2.5 hover:-translate-y-0.5 hover:shadow-xs hover:border-emerald-300 transition-all duration-300">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-800">{t('home.socialProof.instant')}</span>
          </div>

          <div className="bg-white/90 border border-emerald-100 rounded-xl p-3.5 shadow-2xs flex items-center gap-2.5 hover:-translate-y-0.5 hover:shadow-xs hover:border-emerald-300 transition-all duration-300">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-800">{t('home.socialProof.bonded')}</span>
          </div>
        </div>
      </section>

      {/* Official Company Presentation Card (Directly from Document) */}
      <section className="max-w-4xl mx-auto w-full">
        <Card className="border-2 border-emerald-300/80 bg-linear-to-br from-emerald-50/50 via-white to-emerald-50/20 p-7 sm:p-10 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200/30 rounded-bl-full pointer-events-none" />

          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-800 text-white text-xs font-extrabold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('home.letter.badge')}</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              {t('home.letter.salutation')}
            </h3>

            <p className="text-slate-700 text-sm sm:text-base leading-relaxed font-medium">
              {t('home.letter.body')}
            </p>

            <div className="pt-4 border-t border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-xs sm:text-sm text-slate-600 italic">
                {t('home.letter.closing')}
              </p>
              <div className="shrink-0 text-right sm:text-right">
                <span className="text-xs font-black text-emerald-900 block">
                  {t('home.letter.signature')}
                </span>
                <span className="text-[11px] text-slate-500 font-semibold">
                  Denver, Colorado • (720) 590-8632
                </span>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Why Choose GoPropertyCare? (The 3 Official Pillars) */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            {t('home.pillars.title')}
          </h2>
          <p className="text-slate-600 text-sm sm:text-base font-medium">
            {t('home.pillars.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Pillar 1 */}
          <Card className="p-7 border-emerald-200/80 bg-white hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col items-start gap-4 group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:scale-105 group-hover:bg-emerald-600 group-hover:text-white transition-all">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 group-hover:text-emerald-950 transition-colors mb-2">
                {t('home.pillars.reliableTitle')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                {t('home.pillars.reliableDesc')}
              </p>
            </div>
          </Card>

          {/* Pillar 2 */}
          <Card className="p-7 border-emerald-200/80 bg-white hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col items-start gap-4 group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:scale-105 group-hover:bg-emerald-600 group-hover:text-white transition-all">
              <CheckSquare className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 group-hover:text-emerald-950 transition-colors mb-2">
                {t('home.pillars.detailTitle')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                {t('home.pillars.detailDesc')}
              </p>
            </div>
          </Card>

          {/* Pillar 3 */}
          <Card className="p-7 border-emerald-200/80 bg-white hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col items-start gap-4 group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:scale-105 group-hover:bg-emerald-600 group-hover:text-white transition-all">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 group-hover:text-emerald-950 transition-colors mb-2">
                {t('home.pillars.trustedTitle')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                {t('home.pillars.trustedDesc')}
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Services Detailed Cards Grid (Specialized Services) */}
      <section id="services" className="space-y-8 scroll-mt-20">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            {t('home.pricing.title')}
          </h2>
          <p className="text-slate-600 text-sm sm:text-base font-medium">
            {t('home.pricing.subtitle')}
          </p>
        </div>

        {/* 4 Service Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {rates.map((rate) => {
            const Icon = getServiceIcon(rate.service_type);
            const localizedName = t(`home.pricing.${rate.service_type}.name`, { defaultValue: rate.name });
            const localizedDesc = t(`home.pricing.${rate.service_type}.description`, { defaultValue: rate.description });
            const features = (t(`home.pricing.${rate.service_type}.features`, { returnObjects: true }) as string[]) || [];

            return (
              <Card
                key={rate.id}
                className="flex flex-col justify-between hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 group border-slate-200 hover:border-emerald-400 p-6"
              >
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className="text-xl font-black text-slate-900 group-hover:text-emerald-950 transition-colors">
                    {localizedName}
                  </h3>

                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    {localizedDesc}
                  </p>

                  {Array.isArray(features) && features.length > 0 && (
                    <ul className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-700 font-medium">
                      {features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <Button
                  className="w-full mt-6 font-extrabold shadow-sm hover:shadow-md hover:scale-102 active:scale-98 transition-all duration-200"
                  onClick={() => navigate(`/schedule?tier=${rate.service_type}`)}
                >
                  {t('home.pricing.bookNow')}
                </Button>
              </Card>
            );
          })}
        </div>
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

        <Card className="p-7 sm:p-10 border-emerald-200/90 bg-emerald-50/30 shadow-md">
          <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-base mb-6">
            <MapPin className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{i18n.language?.startsWith('es') ? 'Áreas de Servicio en Denver y Boulder' : 'Denver & Boulder Service Areas'}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {SERVICE_AREAS.map((city) => (
              <div
                key={city}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-emerald-100 shadow-2xs font-bold text-slate-800 text-xs sm:text-sm hover:border-emerald-300 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{city}</span>
              </div>
            ))}
          </div>
        </Card>
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
