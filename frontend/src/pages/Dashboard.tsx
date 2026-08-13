import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Package, RefreshCw, Calendar, Clock, Plus, Pause, Play } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
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
        console.error('Failed to fetch data:', error);
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
      console.error('Failed to toggle recurring:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500/20 text-yellow-300',
      confirmed: 'bg-blue-500/20 text-blue-300',
      processing: 'bg-purple-500/20 text-purple-300',
      ready: 'bg-green-500/20 text-green-300',
      delivered: 'bg-green-500/20 text-green-300',
      cancelled: 'bg-red-500/20 text-red-300',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-300';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {t('dashboard.welcome', { name: user?.first_name })}
          </h1>
          <p className="text-white/60">{t('dashboard.title')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card variant="glass">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
                <Package className="w-6 h-6 text-primary-400" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Total Orders</p>
                <p className="text-2xl font-bold text-white">{orders.length}</p>
              </div>
            </div>
          </Card>
          <Card variant="glass">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Active Recurring</p>
                <p className="text-2xl font-bold text-white">
                  {recurring.filter((r) => r.is_active).length}
                </p>
              </div>
            </div>
          </Card>
          <Card variant="glass">
            <Link to="/schedule">
              <Button className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                {t('nav.schedule')}
              </Button>
            </Link>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              {t('dashboard.orderHistory')}
            </h2>
            {orders.length === 0 ? (
              <Card variant="glass" className="text-center">
                <p className="text-white/60 mb-4">{t('dashboard.noOrders')}</p>
                <Link to="/schedule">
                  <Button variant="glass" size="sm">{t('dashboard.scheduleFirst')}</Button>
                </Link>
              </Card>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <Card key={order.id} variant="glass">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">Order #{order.id}</p>
                        <div className="flex items-center gap-2 text-white/60 text-sm mt-1">
                          <Calendar className="w-4 h-4" />
                          <span>{order.pickup_date}</span>
                          <Clock className="w-4 h-4 ml-2" />
                          <span>{order.pickup_time_slot}</span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              {t('dashboard.recurringOrders')}
            </h2>
            {recurring.length === 0 ? (
              <Card variant="glass" className="text-center">
                <p className="text-white/60 mb-4">{t('dashboard.noRecurring')}</p>
                <Link to="/schedule">
                  <Button variant="glass" size="sm">{t('dashboard.scheduleRecurring')}</Button>
                </Link>
              </Card>
            ) : (
              <div className="space-y-3">
                {recurring.map((schedule) => (
                  <Card key={schedule.id} variant="glass">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium capitalize">{schedule.frequency}</p>
                        <div className="flex items-center gap-2 text-white/60 text-sm mt-1">
                          <Calendar className="w-4 h-4" />
                          <span>Next: {schedule.next_pickup_date}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleRecurring(schedule.id, schedule.is_active)}
                        className={`p-2 rounded-lg transition-all ${
                          schedule.is_active
                            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                            : 'bg-glass-white-10 text-white/50 hover:bg-glass-white-20'
                        }`}
                      >
                        {schedule.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
