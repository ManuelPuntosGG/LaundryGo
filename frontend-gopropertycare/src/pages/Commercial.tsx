import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  Check,
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

export function Commercial() {
  const { t, i18n } = useTranslation();
  const [isWalkthroughModalOpen, setIsWalkthroughModalOpen] = useState(false);

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
        title={t('commercialPage.title', 'Commercial Cleaning & Janitorial Solutions — GoPropertyCare Denver')}
        description={t('commercialPage.subtitle', 'Dependable, insured commercial care for offices, retail stores, healthcare clinics, and HOA properties across Denver. Request a 15-minute walkthrough.')}
        canonical="https://gopropertycare.com/commercial"
      />

      {/* Hero Header */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
          <Building2 className="w-4 h-4 text-emerald-700" />
          <span>{t('commercialPage.badge', 'Custom Quotes & Tailored Operations')}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          {t('commercialPage.title', 'Commercial Cleaning & Janitorial Solutions')}
        </h1>
        <p className="text-base sm:text-lg text-slate-700 font-medium leading-relaxed max-w-2xl mx-auto">
          {t('commercialPage.subtitle', 'Dependable, insured commercial care for offices, retail stores, healthcare clinics, and HOA properties across Denver. Custom proposals delivered same-day after a 15-minute walkthrough.')}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button
            size="lg"
            onClick={() => setIsWalkthroughModalOpen(true)}
            className="w-full sm:w-auto font-black shadow-md hover:scale-102 active:scale-98 transition-all px-6 cursor-pointer"
          >
            <Calendar className="w-4 h-4 mr-2" />
            <span>{t('commercialPage.requestWalkthroughBtn', 'Request a Walkthrough')}</span>
          </Button>
        </div>
      </section>

      {/* COMMERCIAL SECTION */}
      <section className="space-y-8 sm:space-y-10 animate-fade-in">
        {/* Walkthrough Announcement Banner (Top CTA) */}
        <div className="bg-linear-to-r from-emerald-900 via-emerald-800 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
              <Building2 className="w-3.5 h-3.5" />
              <span>{t('commercialPage.badge', 'Custom Quotes & Tailored Operations')}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {t('commercialPage.title', 'Commercial Cleaning & Janitorial Solutions')}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 font-medium leading-relaxed">
              {t('commercialPage.subtitle')}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsWalkthroughModalOpen(true)}
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-emerald-400/90 text-white font-black text-sm bg-emerald-900/50 hover:bg-emerald-800/80 hover:border-emerald-300 shadow-lg hover:scale-102 transition-transform cursor-pointer shrink-0"
          >
            <Calendar className="w-4 h-4 mr-1 text-emerald-300" />
            <span className="text-white font-black">{t('commercialPage.requestWalkthroughBtn', 'Request a Walkthrough')}</span>
          </button>
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

      {/* Bottom CTA Box */}
      <section className="text-center py-4">
        <Card variant="none" className="p-8 sm:p-12 bg-linear-to-r from-emerald-800 to-emerald-950 text-white max-w-4xl mx-auto shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-black mb-3 text-white">
            {t('commercialPage.cta.title', 'Schedule Your 15-Minute On-Site Walkthrough')}
          </h2>
          <p className="text-emerald-100 text-sm sm:text-base max-w-xl mx-auto mb-8 font-medium">
            {t('commercialPage.cta.subtitle', 'Tell us about your facility and schedule an on-site visit. Receive your custom itemized proposal the same business day with $0 upfront.')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setIsWalkthroughModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border-2 border-emerald-400/90 text-white font-black text-sm bg-emerald-900/50 hover:bg-emerald-800/80 hover:border-emerald-300 shadow-lg hover:scale-102 active:scale-98 transition-all duration-200 cursor-pointer"
            >
              <Calendar className="w-5 h-5 mr-1 text-emerald-300" />
              <span className="text-white font-black">
                {t('commercialPage.cta.requestWalkthroughBtn', 'Request a Walkthrough')}
              </span>
            </button>
            <a
              href="tel:7205908632"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border-2 border-emerald-400/80 text-white font-black text-sm bg-emerald-900/40 hover:bg-emerald-800/60 hover:scale-102 active:scale-98 transition-all duration-200 shadow-sm cursor-pointer"
            >
              <Phone className="w-4 h-4 text-emerald-300" />
              <span className="text-white font-black">(720) 590-8632</span>
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
