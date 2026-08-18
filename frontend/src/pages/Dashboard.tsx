import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Package,
  RefreshCw,
  Calendar,
  Clock,
  Plus,
  Pause,
  Play,
  RotateCcw,
  Eye,
  XCircle,
  Trash2,
  AlertCircle,
  CheckCircle2,
  MapPin,
  FileText,
  X,
  Sparkles,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { useAuthContext } from '@/providers/AuthProvider';
import api from '@/api';
import type { Order, RecurringSchedule } from '@/types';

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const [orders, setOrders] = useState<Order[]>([]);
  const [recurring, setRecurring] = useState<RecurringSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<Order | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [scheduleToDelete, setScheduleToDelete] = useState<RecurringSchedule | null>(null);

  // Action status state
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, recurringRes] = await Promise.all([
          api.get<PaginatedResponse<Order>>('/orders/'),
          api.get<PaginatedResponse<RecurringSchedule>>('/recurring/'),
        ]);
        setOrders(ordersRes.data.results || []);
        setRecurring(recurringRes.data.results || []);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleRecurring = async (id: number, isActive: boolean) => {
    try {
      await api.patch(`/recurring/${id}/`, { is_active: !isActive });
      setRecurring((prev) =>
        prev.map((r) => (r.id === id ? { ...r, is_active: !isActive } : r))
      );
      setFeedback({ type: 'success', message: t('dashboard.statusUpdated') });
      setTimeout(() => setFeedback(null), 4000);
    } catch (error) {
      console.error('Failed to toggle recurring schedule:', error);
      setFeedback({ type: 'error', message: t('dashboard.deleteError') });
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleDeleteRecurring = async () => {
    if (!scheduleToDelete) return;
    setIsProcessingAction(true);
    try {
      await api.delete(`/recurring/${scheduleToDelete.id}/`);
      setRecurring((prev) => prev.filter((r) => r.id !== scheduleToDelete.id));
      setScheduleToDelete(null);
      setFeedback({ type: 'success', message: t('dashboard.deleteSuccess') });
      setTimeout(() => setFeedback(null), 4000);
    } catch (error) {
      console.error('Failed to delete recurring schedule:', error);
      setFeedback({ type: 'error', message: t('dashboard.deleteError') });
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!orderToCancel) return;
    setIsProcessingAction(true);
    try {
      const res = await api.post<Order>(`/orders/${orderToCancel.id}/cancel/`);
      const updatedOrder = res.data;

      setOrders((prev) =>
        prev.map((o) => (o.id === orderToCancel.id ? { ...o, status: 'cancelled' } : o))
      );

      // If associated recurring schedule existed, mark paused in UI
      setRecurring((prev) =>
        prev.map((r) => (r.order === orderToCancel.id ? { ...r, is_active: false } : r))
      );

      setOrderToCancel(null);
      if (selectedOrderForDetails?.id === updatedOrder.id) {
        setSelectedOrderForDetails(updatedOrder);
      }

      setFeedback({
        type: 'success',
        message: t('dashboard.cancelSuccess', { id: updatedOrder.id }),
      });
      setTimeout(() => setFeedback(null), 5000);
    } catch (error: any) {
      console.error('Failed to cancel order:', error);
      const msg = error.response?.data?.detail || error.message || 'Error';
      setFeedback({
        type: 'error',
        message: t('dashboard.cancelError', { message: msg }),
      });
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleReorder = (order: Order) => {
    navigate('/schedule', {
      state: {
        reorderData: {
          service_rate_id: order.service_rate,
          order_details: order.order_details,
          pickup_instructions: order.pickup_instructions,
        },
      },
    });
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; dot: string; border: string }> = {
      pending: { bg: 'bg-amber-50/90', text: 'text-amber-700', dot: 'bg-amber-500', border: 'border-amber-200' },
      confirmed: { bg: 'bg-blue-50/90', text: 'text-blue-700', dot: 'bg-blue-500', border: 'border-blue-200' },
      processing: { bg: 'bg-indigo-50/90', text: 'text-indigo-700', dot: 'bg-indigo-500', border: 'border-indigo-200' },
      ready: { bg: 'bg-emerald-50/90', text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-200' },
      delivered: { bg: 'bg-emerald-50/90', text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-200' },
      cancelled: { bg: 'bg-rose-50/90', text: 'text-rose-700', dot: 'bg-rose-500', border: 'border-rose-200' },
    };
    const style = badges[status] || { bg: 'bg-slate-50', text: 'text-slate-700', dot: 'bg-slate-400', border: 'border-slate-200' };
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-extrabold uppercase tracking-wider ${style.bg} ${style.text} ${style.border}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
        {status}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="w-full flex flex-col gap-8 animate-fade-in">
        <div className="flex justify-between items-center pb-6 border-b border-slate-200/80">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64 rounded-xl" />
            <Skeleton className="h-4 w-96 rounded-md" />
          </div>
          <Skeleton variant="button" className="w-36 h-11" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {[1, 2, 3].map((i) => (
            <Card key={i} variant="default" className="flex items-center gap-4">
              <Skeleton variant="avatar" className="w-13 h-13 rounded-2xl" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-3 w-24 rounded-md" />
                <Skeleton className="h-7 w-16 rounded-lg" />
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-6 w-40 rounded-lg mb-4" />
              {[1, 2].map((j) => (
                <Card key={j} variant="default" className="p-5 space-y-3">
                  <Skeleton className="h-5 w-full rounded-md" />
                  <Skeleton className="h-4 w-2/3 rounded-md" />
                </Card>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-8 animate-fade-in">
      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 animate-fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span className="text-sm font-semibold">{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-700 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-1">
            {t('dashboard.welcome', { name: user?.first_name || user?.email?.split('@')[0] || 'Customer' })}
          </h1>
          <p className="text-slate-600 text-sm sm:text-base">
            {t('dashboard.subheader')}
          </p>
        </div>
        <Link to="/schedule">
          <Button size="lg" className="shadow-sm">
            <Plus className="w-5 h-5 mr-1" />
            {t('nav.schedule')}
          </Button>
        </Link>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        <Card variant="default" className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 text-blue-600">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-0.5">{t('dashboard.totalOrders')}</p>
            <p className="text-3xl font-extrabold text-slate-900">{orders.length}</p>
          </div>
        </Card>

        <Card variant="default" className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 text-emerald-600">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-0.5">{t('dashboard.activeRecurring')}</p>
            <p className="text-3xl font-extrabold text-slate-900">
              {recurring.filter((r) => r.is_active).length}
            </p>
          </div>
        </Card>

        <Card variant="flat" className="flex items-center justify-between gap-4 sm:col-span-2 lg:col-span-1">
          <div>
            <p className="text-slate-900 font-bold text-base mb-1">{t('dashboard.needAnother')}</p>
            <p className="text-slate-500 text-xs">{t('dashboard.rebookSubheader')}</p>
          </div>
          <Link to="/schedule">
            <Button variant="outline" size="sm">{t('nav.schedule')}</Button>
          </Link>
        </Card>
      </div>

      {/* Main Grid: Orders & Recurring */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full items-start">
        {/* Order History */}
        <div className="space-y-4">
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5 mb-4">
            <Package className="w-5 h-5 text-blue-600" />
            <span>{t('dashboard.orderHistory')}</span>
          </h2>

          {orders.length === 0 ? (
            <Card variant="default" className="text-center py-10">
              <p className="text-slate-500 mb-4">{t('dashboard.noOrders')}</p>
              <Link to="/schedule">
                <Button variant="outline" size="sm">{t('dashboard.scheduleFirst')}</Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const canCancel = order.status === 'pending' || order.status === 'confirmed';

                return (
                  <Card key={order.id} variant="default" className="p-5 space-y-4 shadow-2xs hover:shadow-md transition-all">
                    {/* 1. Header: Order Number & Service on Left, Status Badge on Right */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                            <Package className="w-4 h-4" />
                          </div>
                          <span className="text-slate-900 font-extrabold text-lg">
                            {t('dashboard.orderNumber', { id: order.id })}
                          </span>
                        </div>
                        <p className="text-slate-500 text-xs font-semibold pl-10">
                          {t('dashboard.service')}: <span className="text-slate-900 font-bold">{order.service_name || 'Standard ($2.25/lb)'}</span>
                        </p>
                      </div>
                      <div className="shrink-0">
                        {getStatusBadge(order.status)}
                      </div>
                    </div>

                    {/* 2. Metadata Capsule Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-700 bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400">{t('schedule.date')}</p>
                          <p className="font-bold text-slate-900">{order.pickup_date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400">{t('schedule.timeSlot')}</p>
                          <p className="font-bold text-slate-900">
                            {order.pickup_time_slot === 'morning' ? '8-11 AM' : '12-4 PM'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[10px] uppercase font-bold text-slate-400">Location</p>
                          <p className="font-bold text-slate-900 truncate" title={order.city || 'Denver'}>
                            {order.city || 'Denver'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 3. Note/Details quote box if present */}
                    {order.order_details && (
                      <div className="bg-slate-50/60 px-3 py-2 rounded-xl border border-slate-100 text-xs text-slate-600 flex items-start gap-1.5">
                        <span className="text-slate-400 italic shrink-0">"</span>
                        <p className="italic line-clamp-1 flex-1">{order.order_details}</p>
                        <span className="text-slate-400 italic shrink-0">"</span>
                      </div>
                    )}

                    {/* 4. Action Buttons Footer Row */}
                    <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
                      <div>
                        {canCancel ? (
                          <button
                            type="button"
                            onClick={() => setOrderToCancel(order)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>{t('dashboard.cancelOrder')}</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">
                            {order.status === 'delivered' ? 'Completed' : order.status === 'cancelled' ? 'Cancelled' : 'In Progress'}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedOrderForDetails(order)}
                          className="text-xs h-9 px-3.5 font-bold"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1 text-slate-500" />
                          <span>{t('dashboard.viewDetails')}</span>
                        </Button>

                        <Button
                          size="sm"
                          onClick={() => handleReorder(order)}
                          className="text-xs h-9 px-4 font-extrabold shadow-sm"
                        >
                          <RotateCcw className="w-3.5 h-3.5 mr-1" />
                          <span>{t('dashboard.reorder')}</span>
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Recurring Schedules */}
        <div className="space-y-4">
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5 mb-4">
            <RefreshCw className="w-5 h-5 text-emerald-600" />
            <span>{t('dashboard.recurringOrders')}</span>
          </h2>

          {recurring.length === 0 ? (
            <Card variant="default" className="text-center py-10">
              <p className="text-slate-500 mb-4">{t('dashboard.noRecurring')}</p>
              <Link to="/schedule">
                <Button variant="outline" size="sm">{t('dashboard.scheduleRecurring')}</Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-4">
              {recurring.map((schedule) => (
                <Card key={schedule.id} variant="default" className="p-5 space-y-4 shadow-2xs hover:shadow-md transition-all">
                  {/* 1. Header: Frequency and Status Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-slate-900 font-extrabold text-base capitalize">
                          {t(`schedule.${schedule.frequency}`, { defaultValue: schedule.frequency })} Plan
                        </h3>
                        <p className="text-emerald-700 text-xs font-bold">7.5% Recurring Discount Active</p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider border ${
                        schedule.is_active
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${schedule.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      {schedule.is_active ? t('dashboard.active') : t('dashboard.paused')}
                    </span>
                  </div>

                  {/* 2. Metadata Info Capsule */}
                  <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-100 flex items-center gap-2.5 text-xs text-slate-700">
                    <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">{t('dashboard.nextPickup')}</p>
                      <p className="font-bold text-slate-900">{schedule.next_pickup_date}</p>
                    </div>
                  </div>

                  {/* 3. Actions Footer Row */}
                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setScheduleToDelete(schedule)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                      title={t('dashboard.deleteRecurring')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{t('dashboard.deleteRecurring')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleRecurring(schedule.id, schedule.is_active)}
                      className={`h-9 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border cursor-pointer ${
                        schedule.is_active
                          ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                      }`}
                    >
                      {schedule.is_active ? (
                        <>
                          <Pause className="w-3.5 h-3.5" />
                          <span>{t('dashboard.deactivate')}</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" />
                          <span>{t('dashboard.activate')}</span>
                        </>
                      )}
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. ORDER DETAILS MODAL (PORTALIZED) */}
      {/* ========================================================================= */}
      <Modal
        isOpen={Boolean(selectedOrderForDetails)}
        onClose={() => setSelectedOrderForDetails(null)}
        maxWidth="xl"
      >
        {selectedOrderForDetails && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">
                    {t('dashboard.orderDetailsTitle', { id: selectedOrderForDetails.id })}
                  </h3>
                  <div className="mt-1">{getStatusBadge(selectedOrderForDetails.status)}</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrderForDetails(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Details List */}
            <div className="space-y-4 text-xs sm:text-sm">
              {/* Pickup & Service Speed */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">{t('dashboard.serviceSpeed')}:</span>
                  <span className="font-extrabold text-slate-900">
                    {selectedOrderForDetails.service_name} (${selectedOrderForDetails.rate_per_lb}/lb)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">{t('schedule.pickupDate')}:</span>
                  <span className="font-bold text-slate-900">
                    {selectedOrderForDetails.pickup_date} (
                    {selectedOrderForDetails.pickup_time_slot === 'morning'
                      ? t('schedule.morningSlot')
                      : t('schedule.afternoonSlot')}
                    )
                  </span>
                </div>
              </div>

              {/* Delivery Address & Zone */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  {t('dashboard.pickupAddress')}
                </p>
                <p className="font-semibold text-slate-900">
                  {selectedOrderForDetails.street_address || 'Address provided on profile'}
                </p>
                <p className="text-slate-600">
                  {selectedOrderForDetails.city} {selectedOrderForDetails.zip_code}
                </p>
                <div className="pt-2 border-t border-slate-200/80 flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-semibold">{t('dashboard.deliveryFee')}:</span>
                  <span
                    className={`font-extrabold ${
                      parseFloat(String(selectedOrderForDetails.delivery_fee)) === 0
                        ? 'text-emerald-700'
                        : 'text-blue-700'
                    }`}
                  >
                    {parseFloat(String(selectedOrderForDetails.delivery_fee)) === 0
                      ? '$0.00 (FREE Central Denver)'
                      : `+$${selectedOrderForDetails.delivery_fee} (Outer Denver Zone)`}
                  </span>
                </div>
              </div>

              {/* Items / Addons */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  {t('dashboard.itemsAndAddons')}
                </p>
                <p className="text-slate-800 whitespace-pre-line font-medium leading-relaxed">
                  {selectedOrderForDetails.order_details || t('dashboard.noneSpecified')}
                </p>
              </div>

              {/* Special Instructions */}
              {selectedOrderForDetails.pickup_instructions && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    {t('dashboard.pickupInstructions')}
                  </p>
                  <p className="text-slate-700 italic">
                    "{selectedOrderForDetails.pickup_instructions}"
                  </p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              {(selectedOrderForDetails.status === 'pending' ||
                selectedOrderForDetails.status === 'confirmed') && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    const ord = selectedOrderForDetails;
                    setSelectedOrderForDetails(null);
                    setOrderToCancel(ord);
                  }}
                  className="bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  {t('dashboard.cancelOrder')}
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedOrderForDetails(null)}
                className="ml-auto font-bold"
              >
                {t('common.cancel')}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ========================================================================= */}
      {/* 2. CONFIRM CANCEL ORDER MODAL (PORTALIZED) */}
      {/* ========================================================================= */}
      <Modal
        isOpen={Boolean(orderToCancel)}
        onClose={() => {
          if (!isProcessingAction) setOrderToCancel(null);
        }}
        maxWidth="md"
      >
        {orderToCancel && (
          <div className="space-y-5 animate-scale-up">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-slate-900">
                {t('dashboard.cancelOrderTitle', { id: orderToCancel.id })}
              </h3>
              <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                {t('dashboard.cancelOrderConfirm', { date: orderToCancel.pickup_date })}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed">
              <p className="font-semibold">{t('dashboard.cannotCancelNotice')}</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                onClick={() => setOrderToCancel(null)}
                disabled={isProcessingAction}
              >
                {t('dashboard.keepOrder')}
              </Button>
              <Button
                variant="danger"
                onClick={handleCancelOrder}
                disabled={isProcessingAction}
                className="bg-rose-600 text-white hover:bg-rose-700 font-extrabold"
              >
                {isProcessingAction ? t('common.loading') : t('dashboard.confirmCancel')}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ========================================================================= */}
      {/* 3. CONFIRM DELETE RECURRING MODAL (PORTALIZED) */}
      {/* ========================================================================= */}
      <Modal
        isOpen={Boolean(scheduleToDelete)}
        onClose={() => {
          if (!isProcessingAction) setScheduleToDelete(null);
        }}
        maxWidth="md"
      >
        {scheduleToDelete && (
          <div className="space-y-5 animate-scale-up">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-slate-900">
                {t('dashboard.deleteRecurringTitle')}
              </h3>
              <p className="text-slate-600 text-sm mt-2">
                {t('dashboard.deleteRecurringConfirm')}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                onClick={() => setScheduleToDelete(null)}
                disabled={isProcessingAction}
              >
                {t('common.cancel')}
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteRecurring}
                disabled={isProcessingAction}
                className="bg-rose-600 text-white hover:bg-rose-700 font-extrabold"
              >
                {isProcessingAction ? t('common.loading') : t('dashboard.confirmDelete')}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
