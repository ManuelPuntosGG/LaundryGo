import { useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Home, LayoutDashboard, ShieldCheck, HardHat } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuthContext } from '@/providers/AuthProvider';

interface LocationState {
  orderId?: number;
  serviceName?: string;
  sqft?: number;
  selectedDate?: string;
  selectedTimeSlot?: string;
  address?: string;
  city?: string;
  totalPrice?: number;
}

export function OrderSuccess() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuthContext();

  const state = (location.state as LocationState) || {};
  const orderId = state.orderId || searchParams.get('orderId') || searchParams.get('id');

  useEffect(() => {
    document.title = i18n.language?.startsWith('es')
      ? 'Orden de Trabajo Confirmada | Evolving Solutions LLC'
      : 'Work Order Confirmed | Evolving Solutions LLC';

    // Set noindex for thank you page
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.setAttribute('name', 'robots');
      document.head.appendChild(metaRobots);
    }
    metaRobots.setAttribute('content', 'noindex, nofollow');

    // Google Ads conversion event trigger
    if (orderId && typeof window !== 'undefined') {
      const win = window as unknown as { dataLayer?: Array<Record<string, unknown>> };
      if (win.dataLayer) {
        win.dataLayer.push({
          event: 'esl_conversion_order_success',
          order_id: `ESL-#${orderId}`,
          value: state.totalPrice || 0,
          currency: 'USD',
        });
      }
    }
  }, [orderId, state.totalPrice, i18n.language]);

  return (
    <div className="max-w-2xl mx-auto py-8 sm:py-12 px-4 animate-scale-in">
      <Card className="p-8 sm:p-10 border-[#815133] bg-white text-center space-y-6 shadow-xl rounded-2xl">
        <div className="w-16 h-16 rounded-2xl bg-[#f7efe6] text-[#815133] flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-stone-950 tracking-tight">
            {t('schedule.step4.successTitle')}
          </h1>
          <p className="text-stone-600 text-sm sm:text-base font-medium max-w-md mx-auto">
            {t('schedule.step4.successMsg')}
          </p>
        </div>

        {/* Work Order Badge */}
        <div className="p-5 rounded-2xl bg-[#fdfaf6] border border-[#e0c3a7] text-center space-y-1 max-w-xs mx-auto">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
            {t('schedule.step4.orderId')}
          </span>
          <div className="text-3xl font-black text-[#815133] tracking-tight">
            {orderId ? `ESL-#${orderId}` : 'ESL-CONFIRMED'}
          </div>
        </div>

        {/* Details Summary (if passed) */}
        {(state.serviceName || state.sqft || state.selectedDate) && (
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 text-left text-xs sm:text-sm space-y-2.5">
            {state.serviceName && (
              <div className="flex justify-between">
                <span className="text-stone-500 font-semibold">{t('schedule.step4.service')}</span>
                <span className="font-bold text-stone-900">{state.serviceName}</span>
              </div>
            )}
            {state.sqft && (
              <div className="flex justify-between">
                <span className="text-stone-500 font-semibold">{t('schedule.step4.sqft')}</span>
                <span className="font-bold text-stone-900 tabular-nums">{state.sqft.toLocaleString()} sq ft</span>
              </div>
            )}
            {state.selectedDate && (
              <div className="flex justify-between">
                <span className="text-stone-500 font-semibold">{t('schedule.step4.date')}</span>
                <span className="font-bold text-stone-900 tabular-nums">{state.selectedDate} ({state.selectedTimeSlot})</span>
              </div>
            )}
            {state.address && (
              <div className="flex justify-between">
                <span className="text-stone-500 font-semibold">{t('schedule.step3.address')}</span>
                <span className="font-bold text-stone-900 text-right">{state.address}, {state.city || 'Denver'}</span>
              </div>
            )}
            {state.totalPrice !== undefined && (
              <div className="pt-2 border-t border-stone-200 flex justify-between items-baseline">
                <span className="text-stone-900 font-extrabold">{t('schedule.step4.total')}</span>
                <span className="font-black text-[#815133] text-base tabular-nums">${state.totalPrice.toFixed(2)}</span>
              </div>
            )}
          </div>
        )}

        {/* Next Steps */}
        <div className="text-left bg-white border border-stone-200 rounded-2xl p-5 space-y-3">
          <h4 className="text-xs font-black text-stone-900 uppercase tracking-wider flex items-center gap-2">
            <HardHat className="w-4 h-4 text-[#815133]" />
            {t('schedule.step4.nextSteps')}
          </h4>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[#f7efe6] text-[#815133] text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
              1
            </div>
            <p className="text-xs sm:text-sm text-stone-700 font-medium">
              {t('schedule.step4.nextStep1')}
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[#f7efe6] text-[#815133] text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
              2
            </div>
            <p className="text-xs sm:text-sm text-stone-700 font-medium">
              {t('schedule.step4.nextStep2')}
            </p>
          </div>
        </div>

        {/* Insurance & Compliance Badge */}
        <div className="bg-[#fdfaf6] border border-[#e0c3a7]/70 rounded-xl p-4 text-xs text-stone-700 flex items-start gap-3 text-left">
          <ShieldCheck className="w-5 h-5 text-[#815133] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            {i18n.language?.startsWith('es')
              ? 'Todas las operaciones de Evolving Solutions LLC cuentan con cobertura completa de Responsabilidad Civil General, Seguro de Compensación para Trabajadores y estricto cumplimiento OSHA.'
              : 'All Evolving Solutions LLC operations carry comprehensive General Liability insurance, Workers\' Compensation coverage, and full OSHA compliance.'}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          {isAuthenticated ? (
            <Button size="md" onClick={() => navigate('/dashboard')} className="flex-1">
              <LayoutDashboard className="w-4 h-4 mr-2" />
              {t('nav.dashboard')}
            </Button>
          ) : (
            <Button size="md" onClick={() => navigate('/login')} className="flex-1">
              {t('auth.loginButton')}
            </Button>
          )}
          <Button variant="outline" size="md" onClick={() => navigate('/')} className="flex-1">
            <Home className="w-4 h-4 mr-2" />
            {t('nav.home')}
          </Button>
        </div>
      </Card>
    </div>
  );
}
