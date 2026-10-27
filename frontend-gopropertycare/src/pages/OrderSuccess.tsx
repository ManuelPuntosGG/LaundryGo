import { useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Home, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SEO } from '@/components/common/SEO';

interface LocationState {
  orderId?: number;
  serviceType?: string;
  selectedTier?: { label: string };
  freqOption?: { nameKey: string };
  selectedDate?: string;
  selectedTimeSlot?: string;
  formData?: {
    street_address?: string;
    city?: string;
  };
  depositAmount?: number;
  remainingBalance?: number;
  totalPrice?: number;
  customQuoteSubmitted?: boolean;
}

export function OrderSuccess() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const state = (location.state as LocationState) || {};
  const orderId = state.orderId || searchParams.get('orderId') || searchParams.get('id');
  const customQuoteSubmitted = state.customQuoteSubmitted || searchParams.get('type') === 'custom_quote';

  // Push Google Ads conversion event to dataLayer if configured
  useEffect(() => {
    if (orderId && typeof window !== 'undefined') {
      const win = window as unknown as { dataLayer?: Array<Record<string, unknown>> };
      if (win.dataLayer) {
        win.dataLayer.push({
          event: 'gpc_conversion_order_success',
          order_id: `GPC-#${orderId}`,
          value: state.totalPrice || 0,
          currency: 'USD',
        });
      }
    }
  }, [orderId, state.totalPrice]);

  return (
    <div className="max-w-2xl mx-auto py-8 sm:py-12 px-4 animate-fade-in-up">
      <SEO
        title={i18n.language?.startsWith('es') ? 'Reserva Recibida | GoPropertyCare' : 'Booking Confirmed | GoPropertyCare'}
        description="Your GoPropertyCare cleaning booking request has been successfully submitted."
        noIndex={true}
      />

      <Card className="p-6 sm:p-10 text-center border-emerald-200/90 shadow-xl space-y-6 bg-white rounded-2xl">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner animate-pop-in">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {customQuoteSubmitted
              ? (i18n.language?.startsWith('es') ? '¡Solicitud de Cotización Recibida!' : 'Custom Quote Request Received!')
              : t('schedule.successTitle')}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 font-medium">
            {customQuoteSubmitted
              ? t('schedule.customQuoteSuccess')
              : t('schedule.successSubtitle')}
          </p>
        </div>

        {/* Details Card */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 text-left text-xs sm:text-sm space-y-3">
          <div className="flex justify-between pb-2 border-b border-slate-200">
            <span className="text-slate-500 font-semibold">{t('schedule.orderNumber')}</span>
            <span className="font-black text-emerald-800 tabular-nums">
              {orderId ? `GPC-#${orderId}` : 'GPC-CONFIRMED'}
            </span>
          </div>

          {state.serviceType && (
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">{t('schedule.serviceTypeLabel')}</span>
              <span className="font-bold text-slate-900">
                {state.serviceType === 'standard'
                  ? t('schedule.serviceStandard')
                  : state.serviceType === 'deep'
                  ? t('schedule.serviceDeep')
                  : state.serviceType === 'move_in_out'
                  ? t('schedule.serviceMoveInOut')
                  : t('schedule.serviceStr')}
              </span>
            </div>
          )}

          {state.selectedTier && (
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">{t('schedule.dimensions')}</span>
              <span className="font-bold text-slate-900 tabular-nums">
                {state.selectedTier.label}
              </span>
            </div>
          )}

          {state.freqOption && (
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">{t('schedule.frequencyTitle')}</span>
              <span className="font-bold text-slate-900">
                {t(state.freqOption.nameKey)}
              </span>
            </div>
          )}

          {state.selectedDate && state.selectedTimeSlot && (
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">{t('schedule.scheduledVisit')}</span>
              <span className="font-bold text-slate-900 tabular-nums">{state.selectedDate} @ {state.selectedTimeSlot}</span>
            </div>
          )}

          {state.formData && (
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">{t('schedule.addressLabel')}</span>
              <span className="font-bold text-slate-900 text-right">
                {state.formData.street_address ? `${state.formData.street_address}, ` : ''}{state.formData.city || 'Denver'}
              </span>
            </div>
          )}

          {!customQuoteSubmitted && state.totalPrice !== undefined && state.depositAmount !== undefined && (
            <div className="pt-3 border-t border-slate-200 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600 font-semibold">{t('schedule.depositDueToday')} (25%):</span>
                <span className="font-bold text-amber-800 text-sm sm:text-base tabular-nums">
                  ${state.depositAmount.toFixed(2)}{' '}
                  <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    ({t('schedule.depositPendingApprovalBadge')})
                  </span>
                </span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>{t('schedule.balanceDueUponCompletion')} (75%):</span>
                <span className="font-semibold text-slate-700 tabular-nums">
                  ${(state.remainingBalance || 0).toFixed(2)}{' '}
                  <span className="text-[11px] font-normal text-slate-500">({t('schedule.balancePendingBadge')})</span>
                </span>
              </div>
              <div className="flex justify-between items-center text-xs text-emerald-800 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                <span>{t('schedule.chargedTodayBadge')}</span>
                <span className="text-sm font-black tabular-nums">$0.00</span>
              </div>
              <div className="flex justify-between items-baseline pt-1.5 border-t border-slate-100">
                <span className="text-slate-900 font-extrabold text-sm sm:text-base">{t('schedule.total')}</span>
                <span className="font-black text-emerald-700 text-base sm:text-lg tabular-nums">
                  ${state.totalPrice.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Assurance Note */}
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4 text-xs text-emerald-900 flex items-start gap-3 text-left">
          <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block">
              {i18n.language?.startsWith('es') ? 'Próximos Pasos & Política de Cobro' : 'Next Steps & Payment Process'}
            </span>
            <p className="text-slate-600 leading-relaxed">
              {i18n.language?.startsWith('es')
                ? 'Nuestro equipo de operaciones revisará la disponibilidad de cuadrilla en tu zona. Tras la aprobación oficial, se procesará el anticipo del 25% con tu tarjeta registrada y recibirás tu confirmación detallada por correo electrónico.'
                : 'Our operations team is verifying crew dispatch in your area. Upon acceptance, the 25% deposit will be processed to your card on file and an official booking receipt will be sent to your email.'}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            variant="outline"
            className="flex-1 hover:scale-102 active:scale-98 transition-all"
            onClick={() => navigate('/')}
          >
            <Home className="w-4 h-4 mr-2" />
            {t('schedule.backHome')}
          </Button>
          <Button
            variant="primary"
            className="flex-1 font-bold hover:scale-102 active:scale-98 transition-all"
            onClick={() => navigate('/dashboard')}
          >
            <LayoutDashboard className="w-4 h-4 mr-2" />
            {t('schedule.viewDashboard')}
          </Button>
        </div>
      </Card>
    </div>
  );
}
