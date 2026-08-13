import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, Clock, User, FileText, Truck, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthContext } from '@/providers/AuthProvider';
import api from '@/api';
import type { ServiceRate, AvailableDate } from '@/types';

type Step = 1 | 2 | 3 | 4;

export function Schedule() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuthContext();

  const [step, setStep] = useState<Step>(1);
  const [rates, setRates] = useState<ServiceRate[]>([]);
  const [availableDates, setAvailableDates] = useState<AvailableDate[]>([]);

  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<'morning' | 'afternoon'>('morning');
  const [selectedFrequency, setSelectedFrequency] = useState<string>('oneTime');
  const [selectedRate, setSelectedRate] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [orderDetails, setOrderDetails] = useState('');
  const [pickupInstructions, setPickupInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData({
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        email: user.email,
      });
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ratesRes, datesRes] = await Promise.all([
          api.get<ServiceRate[]>('/services/rates/'),
          api.get<AvailableDate[]>('/schedule/available-dates/'),
        ]);
        setRates(ratesRes.data);
        setAvailableDates(datesRes.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, []);

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const isDateAvailable = (date: string) => {
    return availableDates.some((d) => d.date === date);
  };

  const canSelectGoFurther = (date: string) => {
    const dateData = availableDates.find((d) => d.date === date);
    return dateData?.gofurther_available ?? false;
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const available = isDateAvailable(dateStr);
      const isSelected = selectedDate === dateStr;
      const isToday = day === today.getDate();

      days.push(
        <button
          key={day}
          disabled={!available}
          onClick={() => setSelectedDate(dateStr)}
          className={`h-10 rounded-xl text-sm font-medium transition-all duration-200 ${
            isSelected
              ? 'bg-primary-500 text-white'
              : available
              ? 'bg-glass-white-10 border border-white/20 text-white hover:bg-glass-white-20'
              : 'text-white/30 cursor-not-allowed'
          } ${isToday && !isSelected ? 'ring-2 ring-primary-400' : ''}`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return selectedDate && selectedTimeSlot;
      case 2:
        return formData.first_name && formData.last_name && formData.email && formData.phone && agreedToTerms;
      case 3:
        return selectedRate && orderDetails.trim();
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (!canProceed()) return;

    setIsSubmitting(true);
    try {
      await api.post('/orders/', {
        service_rate: selectedRate,
        pickup_date: selectedDate,
        pickup_time_slot: selectedTimeSlot,
        order_details: orderDetails,
        pickup_instructions: pickupInstructions,
        guest_email: formData.email,
        guest_first_name: formData.first_name,
        guest_last_name: formData.last_name,
        guest_phone: formData.phone,
      });
      setIsSuccess(true);
    } catch (error) {
      console.error('Failed to submit order:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card variant="glass-strong" className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Order Submitted!</h2>
          <p className="text-white/70 mb-6">
            We've received your pickup request. You'll receive a confirmation email shortly.
          </p>
          <Link to="/">
            <Button variant="glass">Back to Home</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  step >= s ? 'bg-primary-500 text-white' : 'bg-glass-white-10 text-white/50'
                }`}
              >
                {s}
              </div>
              {s < 4 && (
                <div className={`w-12 h-0.5 ${step > s ? 'bg-primary-500' : 'bg-glass-white-10'}`} />
              )}
            </div>
          ))}
        </div>

        {step === 1 && (
          <Card variant="glass-strong">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              {t('schedule.title')}
            </h2>

            <div className="mb-6">
              <label className="block text-sm font-medium text-white/80 mb-3">{t('schedule.date')}</label>
              <div className="grid grid-cols-7 gap-1">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                  <div key={day} className="h-8 flex items-center justify-center text-white/50 text-xs font-medium">
                    {day}
                  </div>
                ))}
                {renderCalendar()}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-white/80 mb-3">{t('schedule.timeSlot')}</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedTimeSlot('morning')}
                  className={`p-4 rounded-xl border transition-all ${
                    selectedTimeSlot === 'morning'
                      ? 'bg-primary-500/20 border-primary-400 text-white'
                      : 'bg-glass-white-10 border-white/20 text-white/70 hover:bg-glass-white-20'
                  }`}
                >
                  <Clock className="w-5 h-5 mb-2" />
                  <p className="font-medium">{t('schedule.morning')}</p>
                </button>
                <button
                  onClick={() => setSelectedTimeSlot('afternoon')}
                  className={`p-4 rounded-xl border transition-all ${
                    selectedTimeSlot === 'afternoon'
                      ? 'bg-primary-500/20 border-primary-400 text-white'
                      : 'bg-glass-white-10 border-white/20 text-white/70 hover:bg-glass-white-20'
                  }`}
                >
                  <Clock className="w-5 h-5 mb-2" />
                  <p className="font-medium">{t('schedule.afternoon')}</p>
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-white/80 mb-3">{t('schedule.frequency')}</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {[
                  { value: 'oneTime', label: t('schedule.oneTime') },
                  { value: 'daily', label: t('schedule.daily') },
                  { value: 'weekly', label: t('schedule.weekly') },
                  { value: 'fortnightly', label: t('schedule.fortnightly') },
                  { value: 'monthly', label: t('schedule.monthly') },
                ].map((freq) => (
                  <button
                    key={freq.value}
                    onClick={() => setSelectedFrequency(freq.value)}
                    className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                      selectedFrequency === freq.value
                        ? 'bg-primary-500 text-white'
                        : 'bg-glass-white-10 border border-white/20 text-white/70 hover:bg-glass-white-20'
                    }`}
                  >
                    {freq.label}
                  </button>
                ))}
              </div>
            </div>

            {!isAuthenticated && (
              <p className="text-white/60 text-sm">
                {t('schedule.loginPrompt')}{' '}
                <Link to="/login" className="text-primary-400 hover:text-primary-300">
                  {t('schedule.loginLink')}
                </Link>
              </p>
            )}
          </Card>
        )}

        {step === 2 && (
          <Card variant="glass-strong">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <User className="w-6 h-6" />
              {t('schedule.yourInfo')}
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={t('schedule.firstName')}
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                />
                <Input
                  label={t('schedule.lastName')}
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  required
                />
              </div>
              <Input
                label={t('schedule.phone')}
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
              <Input
                label={t('schedule.email')}
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-white/30 bg-white/10 text-primary-500 focus:ring-primary-400"
                />
                <span className="text-white/70 text-sm">{t('schedule.terms')}</span>
              </label>
            </div>
          </Card>
        )}

        {step === 3 && (
          <Card variant="glass-strong">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Truck className="w-6 h-6" />
              {t('schedule.serviceType')}
            </h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {rates.map((rate) => (
                  <button
                    key={rate.id}
                    onClick={() => {
                      if (rate.service_type !== 'gofurther' || canSelectGoFurther(selectedDate)) {
                        setSelectedRate(rate.id);
                      }
                    }}
                    disabled={rate.service_type === 'gofurther' && !canSelectGoFurther(selectedDate)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      selectedRate === rate.id
                        ? 'bg-primary-500/20 border-primary-400'
                        : rate.service_type === 'gofurther' && !canSelectGoFurther(selectedDate)
                        ? 'bg-glass-white-5 border-white/10 opacity-50 cursor-not-allowed'
                        : 'bg-glass-white-10 border-white/20 hover:bg-glass-white-20'
                    }`}
                  >
                    <p className="font-semibold text-white">{rate.name}</p>
                    <p className="text-primary-400 font-bold">${rate.rate_per_lb}/lb</p>
                    <p className="text-white/60 text-sm">{rate.description}</p>
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  {t('schedule.orderDetails')} *
                </label>
                <textarea
                  value={orderDetails}
                  onChange={(e) => setOrderDetails(e.target.value)}
                  placeholder={t('schedule.orderDetailsPlaceholder')}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:border-primary-400/50 transition-all duration-200 text-sm min-h-[120px] resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  {t('schedule.pickupInstructions')}
                </label>
                <textarea
                  value={pickupInstructions}
                  onChange={(e) => setPickupInstructions(e.target.value)}
                  placeholder={t('schedule.pickupInstructionsPlaceholder')}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:border-primary-400/50 transition-all duration-200 text-sm min-h-[100px] resize-none"
                />
              </div>
            </div>
          </Card>
        )}

        {step === 4 && (
          <Card variant="glass-strong">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <FileText className="w-6 h-6" />
              Review & Confirm
            </h2>

            <div className="space-y-4">
              <div className="bg-glass-white-10 rounded-xl p-4 border border-white/10">
                <p className="text-white/60 text-sm mb-1">Pickup Date</p>
                <p className="text-white font-medium">{selectedDate}</p>
              </div>
              <div className="bg-glass-white-10 rounded-xl p-4 border border-white/10">
                <p className="text-white/60 text-sm mb-1">Time Slot</p>
                <p className="text-white font-medium">
                  {selectedTimeSlot === 'morning' ? t('schedule.morning') : t('schedule.afternoon')}
                </p>
              </div>
              <div className="bg-glass-white-10 rounded-xl p-4 border border-white/10">
                <p className="text-white/60 text-sm mb-1">Service</p>
                <p className="text-white font-medium">
                  {rates.find((r) => r.id === selectedRate)?.name} - ${rates.find((r) => r.id === selectedRate)?.rate_per_lb}/lb
                </p>
              </div>
              <div className="bg-glass-white-10 rounded-xl p-4 border border-white/10">
                <p className="text-white/60 text-sm mb-1">Order Details</p>
                <p className="text-white font-medium">{orderDetails}</p>
              </div>
            </div>
          </Card>
        )}

        <div className="flex justify-between mt-6">
          {step > 1 ? (
            <Button variant="glass" onClick={() => setStep((step - 1) as Step)}>
              <ChevronLeft className="w-4 h-4 mr-1" />
              {t('common.back')}
            </Button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <Button onClick={() => setStep((step + 1) as Step)} disabled={!canProceed()}>
              {t('common.next')}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={!canProceed() || isSubmitting}>
              {isSubmitting ? t('common.loading') : t('schedule.reserve')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
