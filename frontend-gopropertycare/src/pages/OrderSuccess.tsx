import { useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Home, LayoutDashboard, ShieldCheck, FileText } from 'lucide-react';
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
    first_name?: string;
    last_name?: string;
    street_address?: string;
    city?: string;
  };
  depositAmount?: number;
  remainingBalance?: number;
  totalPrice?: number;
  customQuoteSubmitted?: boolean;
  customQuoteSqft?: number;
  bedrooms?: number;
  bathrooms?: number;
  isSTR?: boolean;
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
          event: customQuoteSubmitted ? 'gpc_conversion_custom_quote' : 'gpc_conversion_order_success',
          order_id: `GPC-#${orderId}`,
          value: state.totalPrice || 0,
          currency: 'USD',
        });
      }
    }
  }, [orderId, state.totalPrice, customQuoteSubmitted]);

  return (
    <div className="max-w-2xl mx-auto py-8 sm:py-12 px-4 animate-fade-in-up">
      <SEO
        title={
          customQuoteSubmitted
            ? (i18n.language?.startsWith('es') ? 'Cotización Recibida | GoPropertyCare' : 'Quote Request Received | GoPropertyCare')
            : (i18n.language?.startsWith('es') ? 'Reserva Recibida | GoPropertyCare' : 'Booking Confirmed | GoPropertyCare')
        }
        description="Your GoPropertyCare cleaning booking or custom quote request has been successfully submitted."
        noIndex={true}
      />

      <Card className="p-6 sm:p-10 text-center border-emerald-200/90 shadow-xl space-y-6 bg-white rounded-2xl">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner animate-pop-in">
          {customQuoteSubmitted ? <FileText className="w-9 h-9" /> : <CheckCircle2 className="w-9 h-9" />}
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

          <div className="flex justify-between">
            <span className="text-slate-500 font-semibold">{t('schedule.dimensions')}</span>
            <span className="font-bold text-slate-900 tabular-nums">
              {customQuoteSubmitted
                ? (state.isSTR
                    ? `${state.bedrooms || 5}+ ${i18n.language?.startsWith('es') ? 'Habitaciones' : 'Beds'} (${i18n.language?.startsWith('es') ? 'Rotación STR a Medida' : 'Custom STR Proposal'})`
                    : `${(state.customQuoteSqft || 6500).toLocaleString()} sq ft (${i18n.language?.startsWith('es') ? 'Cotización a Medida' : 'Custom Quote'})`)
                : (state.selectedTier?.label || '500 – 999 sq ft')}
            </span>
          </div>

          {state.freqOption && !customQuoteSubmitted && (
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">{t('schedule.frequencyTitle')}</span>
              <span className="font-bold text-slate-900">
                {t(state.freqOption.nameKey)}
              </span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-slate-500 font-semibold">
              {customQuoteSubmitted
                ? (i18n.language?.startsWith('es') ? 'Entrega de Propuesta' : 'Proposal Delivery')
                : t('schedule.scheduledVisit')}
            </span>
            <span className="font-bold text-slate-900 tabular-nums">
              {customQuoteSubmitted
                ? (i18n.language?.startsWith('es') ? 'Mismo día hábil (< 24 hrs)' : 'Same business day (< 24 hrs)')
                : `${state.selectedDate || 'Upcoming'} @ ${state.selectedTimeSlot || '09:00 AM'}`}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-500 font-semibold">{t('schedule.addressLabel')}</span>
            <span className="font-bold text-slate-900 text-right">
              {state.formData?.street_address ? `${state.formData.street_address}, ` : ''}{state.formData?.city || 'Denver, CO'}
            </span>
          </div>

          {customQuoteSubmitted ? (
            <div className="pt-3 border-t border-slate-200 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600 font-semibold">
                  {i18n.language?.startsWith('es') ? 'Evaluación y Presupuesto por Escrito:' : 'Walkthrough & Custom Proposal:'}
                </span>
                <span className="font-bold text-emerald-800 text-sm sm:text-base tabular-nums">
                  $0.00{' '}
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {i18n.language?.startsWith('es') ? '100% Gratuito' : '100% Free'}
                  </span>
                </span>
              </div>
              <div className="flex justify-between items-center text-xs text-emerald-800 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                <span>{t('schedule.chargedTodayBadge')}</span>
                <span className="text-sm font-black tabular-nums">$0.00</span>
              </div>
              <div className="flex justify-between items-baseline pt-1.5 border-t border-slate-100">
                <span className="text-slate-900 font-extrabold text-sm sm:text-base">
                  {i18n.language?.startsWith('es') ? 'Anticipo Requerido Hoy' : 'Upfront Due Today'}
                </span>
                <span className="font-black text-emerald-700 text-base sm:text-lg tabular-nums">
                  $0.00
                </span>
              </div>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-200 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600 font-semibold">{t('schedule.depositDueToday')} (25%):</span>
                <span className="font-bold text-amber-800 text-sm sm:text-base tabular-nums">
                  ${(state.depositAmount ?? 0).toFixed(2)}{' '}
                  <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    ({t('schedule.depositPendingApprovalBadge')})
                  </span>
                </span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>{t('schedule.balanceDueUponCompletion')} (75%):</span>
                <span className="font-semibold text-slate-700 tabular-nums">
                  ${(state.remainingBalance ?? 0).toFixed(2)}{' '}
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
                  ${(state.totalPrice ?? 0).toFixed(2)}
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
              {customQuoteSubmitted
                ? (i18n.language?.startsWith('es') ? 'Próximos Pasos para tu Propuesta a Medida' : 'Next Steps for Your Custom Proposal')
                : (i18n.language?.startsWith('es') ? 'Próximos Pasos & Política de Cobro' : 'Next Steps & Payment Process')}
            </span>
            <p className="text-slate-600 leading-relaxed">
              {customQuoteSubmitted
                ? (i18n.language?.startsWith('es')
                    ? 'Nuestro equipo de operaciones en Denver revisará las dimensiones y requerimientos de tu propiedad. Te contactaremos dentro de 24 horas con una propuesta detallada y sin compromiso ($0.00 cobrado hoy).'
                    : 'Our Denver operations team will review your property dimensions and specific requirements. We will contact you within 24 hours with a comprehensive, tailored proposal at no obligation ($0.00 charged today).')
                : (i18n.language?.startsWith('es')
                    ? 'Nuestro equipo de operaciones revisará la disponibilidad de cuadrilla en tu zona. Tras la aprobación oficial, se procesará el anticipo del 25% con tu tarjeta registrada y recibirás tu confirmación detallada por correo electrónico.'
                    : 'Our operations team is verifying crew dispatch in your area. Upon acceptance, the 25% deposit will be processed to your card on file and an official booking receipt will be sent to your email.')}
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
