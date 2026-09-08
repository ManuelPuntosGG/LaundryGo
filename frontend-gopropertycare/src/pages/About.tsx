import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  ShieldCheck,
  Leaf,
  CheckCircle2,
  Phone,
  FileCheck,
  HeartHandshake,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export function About() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-12 sm:gap-16 py-4 sm:py-6">
      {/* Header */}
      <section className="text-center max-w-3xl mx-auto space-y-4 pt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/90 text-emerald-800 text-xs font-bold shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Denver & Boulder Property Specialists</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          {t('about.title')}
        </h1>
        <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
          {t('about.subtitle')}
        </p>
      </section>

      {/* Mission Card with Logo preview */}
      <section>
        <Card className="p-8 sm:p-12 border-emerald-200/80 bg-linear-to-br from-white via-white to-emerald-50/40 shadow-sm flex flex-col md:flex-row items-center gap-8">
          <div className="w-full md:w-1/3 flex justify-center">
            <img
              src="/logo.png"
              alt="GoPropertyCare Mascot & Logo"
              className="w-48 sm:w-56 h-auto object-contain drop-shadow-md rounded-2xl bg-white p-2 border border-emerald-100"
            />
          </div>
          <div className="w-full md:w-2/3 space-y-4">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {t('about.mission.title')}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
              {t('about.mission.description')}
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-100/60 px-3 py-1.5 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Fully Insured & Bonded</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-100/60 px-3 py-1.5 rounded-lg">
                <Leaf className="w-4 h-4 text-emerald-600" />
                <span>Non-Toxic Biodegradable Chemicals</span>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Values 4-Grid */}
      <section className="space-y-6">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 text-center tracking-tight">
          Our Operational Pillars
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Leaf className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">{t('about.values.ecoTitle')}</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{t('about.values.ecoDesc')}</p>
          </Card>

          <Card className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">{t('about.values.vettedTitle')}</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{t('about.values.vettedDesc')}</p>
          </Card>

          <Card className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">{t('about.values.standardTitle')}</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{t('about.values.standardDesc')}</p>
          </Card>

          <Card className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">{t('about.values.pricingTitle')}</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{t('about.values.pricingDesc')}</p>
          </Card>
        </div>
      </section>

      {/* 50-Point Checklist Overview */}
      <section className="space-y-6">
        <Card className="p-8 sm:p-10 border-slate-200/90 bg-white">
          <div className="max-w-2xl mx-auto text-center space-y-2 mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {t('about.checklist.title')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Every appointment follows our comprehensive room-by-room procedure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-2 font-black text-slate-900 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Kitchen Sanitization</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {t('about.checklist.kitchen')}
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-2 font-black text-slate-900 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Bathrooms & Tiles</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {t('about.checklist.bathrooms')}
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-2 font-black text-slate-900 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Living Areas & Bedrooms</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {t('about.checklist.living')}
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-2 font-black text-slate-900 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Floor Care & Vacuuming</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {t('about.checklist.floors')}
              </p>
            </div>
          </div>
        </Card>
      </section>

      {/* CTA Box */}
      <section className="text-center py-6">
        <Card className="p-8 sm:p-12 bg-linear-to-r from-emerald-800 to-emerald-950 text-white max-w-4xl mx-auto shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-black mb-3 text-white">
            Ready to Experience Impeccable Property Care?
          </h2>
          <p className="text-emerald-100 text-sm sm:text-base max-w-xl mx-auto mb-8">
            Book your service online in minutes. Enjoy transparent $/sq ft rates and zero surprise travel fees in Denver & Boulder core.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/schedule">
              <Button size="lg" className="bg-white text-emerald-900 hover:bg-emerald-50">
                <Sparkles className="w-5 h-5 mr-2 text-emerald-600" />
                Schedule Online
              </Button>
            </Link>
            <a
              href="tel:7205908632"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-emerald-400 text-white font-bold text-sm hover:bg-emerald-800/50 transition-all"
            >
              <Phone className="w-4 h-4" />
              <span>(720) 590-8632</span>
            </a>
          </div>
        </Card>
      </section>
    </div>
  );
}
