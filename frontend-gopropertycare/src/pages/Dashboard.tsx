import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  Clock,
  MapPin,
  XCircle,
  RotateCcw,
  Home,
  CheckCircle2,
  AlertCircle,
  CreditCard,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthContext } from '@/providers/AuthProvider';
import api from '@/api';
import type { CleaningOrder } from '@/types';
import { DENVER_LOCATIONS } from '@/constants/locations';

export function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, fetchUser } = useAuthContext();

  const [orders, setOrders] = useState<CleaningOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders');

  // Inline cancellation modal & feedback banner state
  const [cancelOrderTarget, setCancelOrderTarget] = useState<CleaningOrder | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [orderBanner, setOrderBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    street_address: user?.street_address || '',
    city: user?.city || 'Denver (Downtown / Central)',
    zip_code: user?.zip_code || '',
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/cleaning/orders/?brand=gopropertycare');
      const list = Array.isArray(response.data) ? response.data : response.data?.results || [];
      const residentialOrders = list.filter(
        (o: CleaningOrder) =>
          o.brand === 'gopropertycare' ||
          ['residential', 'regular', 'deep', 'move_in_out', 'str_on_site', 'str_off_site'].includes(o.service_rate?.service_type)
      );
      setOrders(residentialOrders);
    } catch (err) {
      console.error('Failed to fetch cleaning orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    queueMicrotask(() => {
      fetchOrders();
    });
  }, []);

  const confirmCancelOrder = async () => {
    if (!cancelOrderTarget) return;
    setIsCancelling(true);
    setOrderBanner(null);

    try {
      await api.post(`/cleaning/orders/${cancelOrderTarget.id}/cancel/`);
      setOrderBanner({
        type: 'success',
        message: t('dashboard.cancelSuccessBanner', 'Reservation cancelled successfully.'),
      });
      setCancelOrderTarget(null);
      fetchOrders();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setOrderBanner({
        type: 'error',
        message: axiosErr.response?.data?.detail || t('dashboard.cancelFailed', 'Failed to cancel reservation.'),
      });
      setCancelOrderTarget(null);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileMessage('');

    try {
      await api.patch('/auth/me/', profileData);
      await fetchUser();
      setProfileMessage(t('dashboard.profileUpdated', 'Profile updated successfully!'));
    } catch {
      setProfileMessage(t('dashboard.profileFailed', 'Failed to update profile.'));
    } finally {
      setIsSavingProfile(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 border border-amber-200 text-amber-800 shadow-2xs">
            {t('dashboard.statusPending', 'Pending')}
          </span>
        );
      case 'confirmed':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 border border-blue-200 text-blue-800 shadow-2xs">
            {t('dashboard.statusConfirmed', 'Confirmed')}
          </span>
        );
      case 'in_progress':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 border border-emerald-200 text-emerald-800 shadow-2xs">
            {t('dashboard.statusInProgress', 'In Progress')}
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-2xs">
            {t('dashboard.statusCompleted', 'Completed')}
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 border border-rose-200 text-rose-800 shadow-2xs">
            {t('dashboard.statusCancelled', 'Cancelled')}
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 border border-slate-200 text-slate-700">
            {status}
          </span>
        );
    }
  };

  const getPaymentStatusBadge = (paymentStatus?: CleaningOrder['payment_status']) => {
    const status = paymentStatus || 'unpaid';
    switch (status) {
      case 'deposit_paid':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 border border-blue-200 text-blue-800 shadow-2xs inline-flex items-center gap-1">
            <CreditCard className="w-3 h-3 text-blue-600 shrink-0" />
            <span>{t('dashboard.paymentDepositPaid')}</span>
          </span>
        );
      case 'fully_paid':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 border border-emerald-200 text-emerald-800 shadow-2xs inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
            <span>{t('dashboard.paymentFullyPaid')}</span>
          </span>
        );
      case 'refunded':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 border border-rose-200 text-rose-800 shadow-2xs">
            {t('dashboard.paymentRefunded')}
          </span>
        );
      case 'failed':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 border border-rose-300 text-rose-900 shadow-2xs">
            {t('dashboard.paymentFailed')}
          </span>
        );
      case 'unpaid':
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 border border-amber-200 text-amber-800 shadow-2xs">
            {t('dashboard.paymentUnpaid')}
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight animate-fade-in-up">
            {t('dashboard.title')}
          </h1>
          <p className="text-sm text-slate-600 font-medium animate-fade-in-up delay-75">
            {t('dashboard.welcome', 'Welcome back')}, {user?.first_name || user?.email}!
          </p>
        </div>

        <Link to="/schedule">
          <Button className="hover:scale-102 active:scale-98 transition-all duration-200 shadow-sm hover:shadow-md">
            <Calendar className="w-4 h-4 mr-1.5" />
            <span>{t('dashboard.bookNew', 'Book New Cleaning')}</span>
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`pb-3 text-sm font-extrabold border-b-2 transition-all duration-200 cursor-pointer tabular-nums ${
            activeTab === 'orders'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          {t('dashboard.myOrders')} ({orders.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`pb-3 text-sm font-extrabold border-b-2 transition-all duration-200 cursor-pointer ${
            activeTab === 'profile'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          {t('dashboard.profile')}
        </button>
      </div>

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-4 animate-fade-in-up">
          {orderBanner && (
            <div
              className={`p-4 rounded-xl border text-xs font-bold flex items-center justify-between gap-3 animate-fade-in ${
                orderBanner.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              <div className="flex items-center gap-2">
                {orderBanner.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{orderBanner.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setOrderBanner(null)}
                className="text-slate-500 hover:text-slate-800 font-bold text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-12 text-slate-600 font-medium">
              {t('dashboard.loadingOrders', 'Loading your reservations...')}
            </div>
          ) : orders.length === 0 ? (
            <Card className="p-10 text-center space-y-4 border-dashed">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                <Home className="w-6 h-6" />
              </div>
              <p className="text-slate-700 text-sm font-medium">
                {t('dashboard.noOrders')}
              </p>
              <Button onClick={() => navigate('/schedule')} className="hover:scale-102 active:scale-98 transition-all duration-200">
                {t('dashboard.bookFirst')}
              </Button>
            </Card>
          ) : (
            orders.map((order) => {
              const canCancel = order.status === 'pending' || order.status === 'confirmed';
              const quotedTotal = Number(order.total_price || 0);
              const depositAmt =
                order.deposit_amount !== undefined && order.deposit_amount !== null
                  ? Number(order.deposit_amount)
                  : Number((quotedTotal * 0.25).toFixed(2));
              const remainingAmt =
                order.remaining_balance !== undefined && order.remaining_balance !== null
                  ? Number(order.remaining_balance)
                  : Number((quotedTotal - depositAmt).toFixed(2));
              const surchargeAmt = Number(order.surcharge_amount || 0);
              const finalChargedAmt =
                order.final_total_charged !== undefined && order.final_total_charged !== null && Number(order.final_total_charged) > 0
                  ? Number(order.final_total_charged)
                  : quotedTotal + surchargeAmt;
              const isDepositPaid = order.payment_status === 'deposit_paid' || order.payment_status === 'fully_paid';
              const isFullyPaid = order.payment_status === 'fully_paid';

              return (
                <Card key={order.id} className="p-6 space-y-4 hover:-translate-y-0.5 hover:shadow-md hover:border-emerald-300 transition-all duration-200 border-slate-200 group">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-extrabold text-slate-900 text-base group-hover:text-emerald-950 transition-colors tabular-nums">
                        GPC-#{order.id}
                      </span>
                      <span className="text-xs text-slate-700 font-bold bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                        {t(`home.pricing.${order.service_rate?.service_type}.name`, { defaultValue: order.service_rate?.name || t('dashboard.defaultCleaningService', 'Cleaning Service') })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {getPaymentStatusBadge(order.payment_status)}
                      {getStatusBadge(order.status)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-700 font-medium">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{t('dashboard.date', 'Date')}: <strong className="text-slate-900 font-bold tabular-nums">{order.service_date}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{t('dashboard.window', 'Arrival')}: <strong className="text-slate-900 font-bold tabular-nums">{order.time_slot === 'morning' ? '8AM - 12PM' : order.time_slot === 'afternoon' ? '1PM - 5PM' : order.time_slot}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Home className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="tabular-nums">
                        {t('dashboard.size', 'Size')}: <strong className="text-slate-900 font-bold">{order.square_feet} sq ft</strong>
                        {order.bedrooms !== undefined && order.bedrooms !== null ? (
                          <span className="text-slate-500 font-medium"> • {order.bedrooms === 0 ? 'Studio' : `${order.bedrooms}b`}, {order.bathrooms}ba</span>
                        ) : null}
                      </span>
                    </div>
                    <div className="sm:col-span-3 flex items-center gap-2 text-slate-700">
                      <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{order.street_address}, {order.city}</span>
                    </div>
                  </div>

                  {/* 4-Step Payment & Order Lifecycle Breakdown */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
                    <div className="flex justify-between items-center text-slate-700 font-semibold">
                      <span>{t('dashboard.quotedTotalLabel')}:</span>
                      <span className="font-bold text-slate-900 tabular-nums">${quotedTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <span>{t('dashboard.deposit25Label')}:</span>
                        {isDepositPaid && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded">
                            ✓
                          </span>
                        )}
                      </span>
                      <span className={`font-bold tabular-nums ${isDepositPaid ? 'text-emerald-700' : 'text-slate-800'}`}>
                        ${depositAmt.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <span>{t('dashboard.remaining75Label')}:</span>
                        {isFullyPaid && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded">
                            ✓
                          </span>
                        )}
                      </span>
                      <span className={`font-bold tabular-nums ${isFullyPaid ? 'text-emerald-700' : 'text-slate-800'}`}>
                        ${remainingAmt.toFixed(2)}
                      </span>
                    </div>
                    {surchargeAmt > 0 && (
                      <div className="flex justify-between items-center text-amber-800 font-semibold pt-1 border-t border-slate-200/80">
                        <span>
                          {t('dashboard.surchargeLabel')}
                          {order.surcharge_concept ? ` (${order.surcharge_concept})` : ''}:
                        </span>
                        <span className="font-bold tabular-nums">+${surchargeAmt.toFixed(2)}</span>
                      </div>
                    )}
                    {(isFullyPaid || surchargeAmt > 0) && (
                      <div className="flex justify-between items-center pt-1.5 border-t border-slate-200 font-black text-slate-900 text-sm">
                        <span>{t('dashboard.finalChargedLabel')}:</span>
                        <span className="text-emerald-700 tabular-nums">${finalChargedAmt.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <Button
                      variant="outline"
                      size="sm"
                      className="hover:scale-102 active:scale-98 transition-all duration-200"
                      onClick={() => navigate(`/schedule?tier=${order.service_rate?.service_type}&sqft=${order.square_feet}`)}
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-1" />
                      {t('dashboard.reorder')}
                    </Button>

                    {canCancel && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 hover:scale-102 active:scale-98 transition-all duration-200"
                        onClick={() => setCancelOrderTarget(order)}
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1" />
                        {t('dashboard.cancel')}
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Inline Cancel Reservation Confirmation Modal (Portalized) */}
      {cancelOrderTarget && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-modal-title"
          onClick={() => setCancelOrderTarget(null)}
        >
          <div
            className="max-w-md w-full my-auto"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <Card className="w-full p-6 space-y-4 shadow-2xl border-slate-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 id="cancel-modal-title" className="text-base font-extrabold text-slate-900">
                    {t('dashboard.cancelModalTitle')} — <span className="tabular-nums">GPC-#{cancelOrderTarget.id}</span>
                  </h3>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    {t('dashboard.cancelModalDesc')}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isCancelling}
                  onClick={() => setCancelOrderTarget(null)}
                >
                  {t('dashboard.cancelModalKeep')}
                </Button>
                <Button
                  size="sm"
                  disabled={isCancelling}
                  onClick={confirmCancelOrder}
                  className="bg-rose-600 hover:bg-rose-700 text-white border-rose-600"
                >
                  {isCancelling ? t('common.loading') : t('dashboard.cancelModalConfirm')}
                </Button>
              </div>
            </Card>
          </div>
        </div>,
        document.body
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <Card className="p-6 sm:p-8 max-w-xl animate-fade-in-up">
          <form onSubmit={handleSaveProfile} className="space-y-4">
            {profileMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold animate-fade-in">
                {profileMessage}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Input
                label={t('dashboard.firstName', 'First Name')}
                autoComplete="given-name"
                value={profileData.first_name}
                onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
              />
              <Input
                label={t('dashboard.lastName', 'Last Name')}
                autoComplete="family-name"
                value={profileData.last_name}
                onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
              />
            </div>

            <Input
              label={t('dashboard.phone', 'Phone Number')}
              type="tel"
              autoComplete="tel"
              value={profileData.phone}
              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
            />

            <Input
              label={t('dashboard.streetAddress', 'Default Street Address')}
              autoComplete="street-address"
              value={profileData.street_address}
              onChange={(e) => setProfileData({ ...profileData, street_address: e.target.value })}
            />

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                {t('dashboard.coverageZone', 'City / Coverage Zone')}
              </label>
              <select
                autoComplete="address-level2"
                value={profileData.city}
                onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-600 shadow-2xs"
              >
                {DENVER_LOCATIONS.map((loc) => (
                  <option key={loc.name} value={loc.name}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label={t('dashboard.zipCode', 'ZIP Code')}
              autoComplete="postal-code"
              value={profileData.zip_code}
              onChange={(e) => setProfileData({ ...profileData, zip_code: e.target.value })}
            />

            <Button type="submit" size="lg" className="w-full mt-2 hover:scale-102 active:scale-98 transition-all duration-200" disabled={isSavingProfile}>
              {isSavingProfile ? t('common.loading') : t('common.save')}
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
