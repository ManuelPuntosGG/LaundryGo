import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  HardHat,
  Clock,
  Plus,
  Building2,
  CheckCircle2,
  XCircle,
  RotateCcw,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuthContext } from '@/providers/AuthProvider';
import api from '@/api';
import type { CleaningOrder } from '@/types';

export function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [orders, setOrders] = useState<CleaningOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/cleaning/orders/?brand=evolvingsolutions');
      const list: CleaningOrder[] = Array.isArray(response.data) ? response.data : response.data?.results || [];
      const commercialOrders = list.filter(
        (o) =>
          o.brand === 'evolvingsolutions' ||
          ['commercial', 'post_construction', 'industrial_demolition'].includes(o.service_rate?.service_type)
      );
      setOrders(commercialOrders);
    } catch (err) {
      console.error('Failed to fetch commercial orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    queueMicrotask(() => {
      fetchOrders();
    });
  }, []);

  const handleCancelOrder = async (orderId: number) => {
    if (!window.confirm(t('dashboard.cancelConfirm'))) return;

    setCancellingId(orderId);
    try {
      await api.post(`/cleaning/orders/${orderId}/cancel/`);
      fetchOrders();
    } catch (err) {
      console.error('Failed to cancel order:', err);
      alert(t('common.error'));
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status: CleaningOrder['status']) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            {t('dashboard.statuses.pending')}
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {t('dashboard.statuses.confirmed')}
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#f7efe6] text-[#573725] border border-[#e0c3a7]">
            <HardHat className="w-3.5 h-3.5 text-[#815133]" />
            {t('dashboard.statuses.in_progress')}
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {t('dashboard.statuses.completed')}
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            {t('dashboard.statuses.cancelled')}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-4 sm:py-6 space-y-8">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-950 tracking-tight">
            {t('dashboard.title')}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 font-medium mt-1">
            Welcome, <span className="font-bold text-stone-900">{user?.first_name} {user?.last_name}</span> ({user?.email})
          </p>
        </div>

        <Button
          size="md"
          onClick={() => navigate('/schedule')}
          className="shadow-sm hover:shadow-md self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          {t('dashboard.newOrder')}
        </Button>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="text-center py-12 text-stone-500 font-medium">
          {t('common.loading')}
        </div>
      ) : orders.length === 0 ? (
        <Card className="p-10 text-center space-y-4 bg-white border-dashed">
          <div className="w-14 h-14 rounded-2xl bg-[#f7efe6] text-[#815133] flex items-center justify-center mx-auto">
            <Building2 className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-black text-stone-900">{t('dashboard.noOrders')}</h3>
          <p className="text-sm text-stone-600 font-medium max-w-sm mx-auto">
            Ready to dispatch our vetted commercial crew or schedule post-construction clean?
          </p>
          <Button size="md" onClick={() => navigate('/schedule')} className="mt-2">
            <HardHat className="w-4 h-4 mr-2" />
            {t('dashboard.newOrder')}
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isPending = order.status === 'pending';
            const price = Number(order.total_price) || 0;

            return (
              <Card key={order.id} className="p-5 sm:p-6 bg-white border-stone-200 hover:border-[#815133] transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#f7efe6] text-[#815133] flex items-center justify-center shrink-0">
                      <HardHat className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-black text-stone-950 text-base">
                        ESL-#{order.id}
                      </div>
                      <div className="text-xs text-stone-500 font-medium">
                        {order.service_rate?.name || 'Commercial Service'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-start sm:self-auto">
                    {getStatusBadge(order.status)}
                    <span className="text-lg font-black text-stone-950">
                      ${price.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 text-xs">
                  <div>
                    <span className="text-stone-400 font-bold uppercase tracking-wider">{t('dashboard.date')}</span>
                    <p className="font-bold text-stone-800 mt-0.5">{order.service_date}</p>
                  </div>
                  <div>
                    <span className="text-stone-400 font-bold uppercase tracking-wider">{t('dashboard.shift')}</span>
                    <p className="font-bold text-stone-800 mt-0.5">
                      {order.time_slot === 'morning' ? '8AM – 12PM' : '1PM – 5PM'}
                    </p>
                  </div>
                  <div>
                    <span className="text-stone-400 font-bold uppercase tracking-wider">{t('dashboard.sqft')}</span>
                    <p className="font-bold text-stone-800 mt-0.5">{order.square_feet} sq ft</p>
                  </div>
                  <div>
                    <span className="text-stone-400 font-bold uppercase tracking-wider">Site</span>
                    <p className="font-bold text-stone-800 mt-0.5 truncate">{order.city}</p>
                  </div>
                </div>

                {order.selected_addons && order.selected_addons.length > 0 && (
                  <div className="pt-2 pb-1 border-t border-stone-100 flex flex-wrap gap-1.5">
                    {order.selected_addons.map((add, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-bold px-2 py-0.5 bg-stone-100 text-stone-700 rounded-md"
                      >
                        +{add.name}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() =>
                      navigate(
                        `/schedule?tier=${order.service_rate?.service_type || 'commercial'}&sqft=${order.square_feet}`
                      )
                    }
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1" />
                    {t('dashboard.reorder')}
                  </Button>

                  {isPending && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={cancellingId === order.id}
                      onClick={() => handleCancelOrder(order.id)}
                      className="text-xs text-rose-600 hover:text-rose-700 hover:border-rose-300"
                    >
                      {cancellingId === order.id ? t('common.loading') : t('dashboard.cancel')}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
