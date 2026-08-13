import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Package, RefreshCw, Calendar, Clock, Plus, Pause, Play, RotateCcw } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
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
    } catch (error) {
      console.error('Failed to toggle recurring schedule:', error);
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
    const badges: Record<string, { bg: string; text: string; border: string }> = {
      pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
      confirmed: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
      processing: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
      ready: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
      delivered: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
      cancelled: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
    };
    const style = badges[status] || { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };
    return (
      <span className={`px-2.5 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${style.bg} ${style.text} ${style.border}`}>
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-1">
            {t('dashboard.welcome', { name: user?.first_name || 'Customer' })}
          </h1>
          <p className="text-slate-600 text-sm sm:text-base">
            Manage your past orders, recurring pickups, and reorders in one place.
          </p>
        </div>
        <Link to="/schedule">
          <Button size="lg" className="shadow-sm">
            <Plus className="w-5 h-5" />
            {t('nav.schedule')}
          </Button>
        </Link>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        <Card variant="default" className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 text-blue-600">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-0.5">Total Orders</p>
            <p className="text-3xl font-extrabold text-slate-900">{orders.length}</p>
          </div>
        </Card>

        <Card variant="default" className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 text-emerald-600">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-0.5">Active Recurring</p>
            <p className="text-3xl font-extrabold text-slate-900">
              {recurring.filter((r) => r.is_active).length}
            </p>
          </div>
        </Card>

        <Card variant="flat" className="flex items-center justify-between gap-4 sm:col-span-2 lg:col-span-1">
          <div>
            <p className="text-slate-900 font-bold text-base mb-1">Need another pickup?</p>
            <p className="text-slate-500 text-xs">Rebook past orders with one click.</p>
          </div>
          <Link to="/schedule">
            <Button variant="outline" size="sm">Schedule</Button>
          </Link>
        </Card>
      </div>

      {/* Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
        {/* History */}
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
            <div className="space-y-3">
              {orders.map((order) => (
                <Card key={order.id} variant="interactive" className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-900 font-bold text-base">Order #{order.id}</span>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-slate-500 text-xs mt-1">
                        Service: <strong className="text-slate-700">{order.service_name || 'Laundry Service'}</strong>
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReorder(order)}
                      className="self-start sm:self-auto text-xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{t('dashboard.reorder')}</span>
                    </Button>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span>{order.pickup_date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="capitalize">{order.pickup_time_slot}</span>
                    </div>
                  </div>
                  {order.order_details && (
                    <p className="text-slate-500 text-xs mt-2 line-clamp-1 italic">
                      "{order.order_details}"
                    </p>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Recurring */}
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
            <div className="space-y-3">
              {recurring.map((schedule) => (
                <Card key={schedule.id} variant="interactive" className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-900 font-bold text-base capitalize">{schedule.frequency} Pickup</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          schedule.is_active
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}>
                          {schedule.is_active ? t('dashboard.active') : t('dashboard.paused')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 text-xs mt-2">
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        <span>Next Pickup: <strong className="text-slate-800">{schedule.next_pickup_date}</strong></span>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleRecurring(schedule.id, schedule.is_active)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        schedule.is_active
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
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
    </div>
  );
}
