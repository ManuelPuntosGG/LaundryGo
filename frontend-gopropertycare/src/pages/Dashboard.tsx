import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  XCircle,
  RotateCcw,
  Home,
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
      const response = await api.get('/cleaning/orders/');
      const list = Array.isArray(response.data) ? response.data : response.data?.results || [];
      setOrders(list);
    } catch (err) {
      console.error('Failed to fetch cleaning orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId: number) => {
    if (!window.confirm(t('dashboard.cancelConfirm'))) return;

    try {
      await api.post(`/cleaning/orders/${orderId}/cancel/`);
      alert(t('dashboard.cancelledSuccess'));
      fetchOrders();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      alert(axiosErr.response?.data?.detail || t('dashboard.cancelFailed', 'Failed to cancel reservation.'));
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
            <Sparkles className="w-4 h-4 mr-1.5 animate-float" />
            <span>{t('dashboard.bookNew', 'Book New Cleaning')}</span>
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`pb-3 text-sm font-extrabold border-b-2 transition-all duration-200 cursor-pointer ${
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

              return (
                <Card key={order.id} className="p-6 space-y-4 hover:-translate-y-0.5 hover:shadow-md hover:border-emerald-300 transition-all duration-200 border-slate-200 group">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-slate-900 text-base group-hover:text-emerald-950 transition-colors">
                        GPC-#{order.id}
                      </span>
                      <span className="text-xs text-slate-700 font-bold bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                        {t(`home.pricing.${order.service_rate?.service_type}.name`, { defaultValue: order.service_rate?.name || t('dashboard.defaultCleaningService', 'Cleaning Service') })}
                      </span>
                    </div>
                    <div>{getStatusBadge(order.status)}</div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-700 font-medium">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{t('dashboard.date', 'Date')}: <strong className="text-slate-900 font-bold">{order.service_date}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{t('dashboard.window', 'Window')}: <strong className="text-slate-900 font-bold">{order.time_slot === 'morning' ? '8AM - 12PM' : '1PM - 5PM'}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Home className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{t('dashboard.size', 'Size')}: <strong className="text-slate-900 font-bold">{order.square_feet} sq ft</strong></span>
                    </div>
                    <div className="sm:col-span-2 flex items-center gap-2 text-slate-700">
                      <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{order.street_address}, {order.city}</span>
                    </div>
                    <div className="text-right sm:text-right font-black text-slate-900 text-sm">
                      {t('dashboard.total', 'Total')}: <span className="text-emerald-700 font-black">${Number(order.total_price).toFixed(2)}</span>
                    </div>
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
                        onClick={() => handleCancelOrder(order.id)}
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
                value={profileData.first_name}
                onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
              />
              <Input
                label={t('dashboard.lastName', 'Last Name')}
                value={profileData.last_name}
                onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
              />
            </div>

            <Input
              label={t('dashboard.phone', 'Phone Number')}
              value={profileData.phone}
              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
            />

            <Input
              label={t('dashboard.streetAddress', 'Default Street Address')}
              value={profileData.street_address}
              onChange={(e) => setProfileData({ ...profileData, street_address: e.target.value })}
            />

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                {t('dashboard.coverageZone', 'City / Coverage Zone')}
              </label>
              <select
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
