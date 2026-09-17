import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  HardHat,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export function About() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const values = [
    {
      icon: ShieldCheck,
      title: t('about.values.safetyTitle'),
      desc: t('about.values.safetyDesc'),
    },
    {
      icon: Users,
      title: t('about.values.staffTitle'),
      desc: t('about.values.staffDesc'),
    },
    {
      icon: Clock,
      title: t('about.values.speedTitle'),
      desc: t('about.values.speedDesc'),
    },
    {
      icon: Sparkles,
      title: t('about.values.pricingTitle'),
      desc: t('about.values.pricingDesc'),
    },
  ];

  const capabilities = [
    t('about.checklist.item1'),
    t('about.checklist.item2'),
    t('about.checklist.item3'),
    t('about.checklist.item4'),
    t('about.checklist.item5'),
    t('about.checklist.item6'),
    t('about.checklist.item7'),
    t('about.checklist.item8'),
  ];

  return (
    <div className="flex flex-col gap-16 sm:gap-20 py-4 sm:py-6 max-w-5xl mx-auto">
      {/* Header / Hero */}
      <section className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f7efe6] border border-[#e0c3a7] text-[#573725] text-xs font-bold uppercase tracking-wider">
          <HardHat className="w-3.5 h-3.5 text-[#815133]" />
          <span>{t('about.tagline')}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-stone-950 tracking-tight max-w-3xl mx-auto">
          {t('about.title')}
        </h1>
        <p className="text-base sm:text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed font-medium">
          {t('about.subtitle')}
        </p>
      </section>

      {/* Mission Banner */}
      <section>
        <Card variant="featured" className="border-[#815133] bg-gradient-to-br from-[#fdfaf6] to-[#f7efe6] p-8 sm:p-12">
          <div className="max-w-3xl mx-auto space-y-4 text-center">
            <h2 className="text-2xl sm:text-3xl font-black text-stone-950">
              {t('about.mission.title')}
            </h2>
            <p className="text-stone-700 text-base sm:text-lg leading-relaxed font-medium">
              {t('about.mission.description')}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#cca07c] text-xs font-bold text-stone-800 shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-[#815133]" />
                {t('about.insuredBadge')}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#cca07c] text-xs font-bold text-stone-800 shadow-2xs">
                <HardHat className="w-4 h-4 text-[#815133]" />
                {t('about.ecoBadge')}
              </span>
            </div>
          </div>
        </Card>
      </section>

      {/* 4 Pillars */}
      <section className="space-y-8">
        <h2 className="text-2xl sm:text-3xl font-black text-stone-950 text-center">
          {t('about.pillarsTitle')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {values.map((v, i) => {
            const Icon = v.icon;
            return (
              <Card key={i} className="p-6 sm:p-7 space-y-3 hover:border-[#815133] transition-all">
                <div className="w-10 h-10 rounded-xl bg-[#f7efe6] text-[#815133] flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-stone-950">{v.title}</h3>
                <p className="text-sm text-stone-600 leading-relaxed font-medium">{v.desc}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Core Capabilities Checklist */}
      <section className="bg-white border border-stone-200 rounded-3xl p-8 sm:p-10 space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-stone-950">
            {t('about.capabilitiesTitle')}
          </h2>
          <p className="text-sm sm:text-base text-stone-600 font-medium">
            Equipped, trained, and insured crews for Colorado commercial sites.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          {capabilities.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-[#fdfaf6] border border-stone-100">
              <CheckCircle2 className="w-5 h-5 text-[#815133] shrink-0 mt-0.5" />
              <span className="text-sm font-bold text-stone-800">{item}</span>
            </div>
          ))}
        </div>

        <div className="pt-6 text-center">
          <Button
            size="lg"
            className="shadow-md hover:shadow-lg"
            onClick={() => navigate('/schedule')}
          >
            <HardHat className="w-5 h-5 mr-2" />
            {t('nav.schedule')}
          </Button>
        </div>
      </section>
    </div>
  );
}
