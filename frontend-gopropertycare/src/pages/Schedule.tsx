import { useState, useEffect, useId } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  Clock,
  MapPin,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Home,
  Check,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthContext } from '@/providers/AuthProvider';
import api from '@/api';
import type { CleaningServiceRate, CleaningAddon, CleaningAvailableDate } from '@/types';
import { DEFAULT_CLEANING_RATES } from '@/constants/cleaningServices';
import { PROPERTY_ADDONS } from '@/constants/cleaningAddons';
import { DENVER_LOCATIONS } from '@/constants/locations';

type Step = 1 | 2 | 3 | 4;

const getTomorrowDateStr = (): string => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getFallbackTomorrowDates = (count = 60): CleaningAvailableDate[] => {
  const list: CleaningAvailableDate[] = [];
  const today = new Date();
  for (let i = 1; i <= count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    list.push({
      date: `${y}-${m}-${day}`,
      available: true,
    });
  }
  return list;
};

export function Schedule() {
  const sqftSliderId = useId();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthContext();

  const [step, setStep] = useState<Step>(1);
  const [rates, setRates] = useState<CleaningServiceRate[]>(DEFAULT_CLEANING_RATES);
  const [addons, setAddons] = useState<CleaningAddon[]>(PROPERTY_ADDONS);
  const [availableDates, setAvailableDates] = useState<CleaningAvailableDate[]>(() => getFallbackTomorrowDates(60));

  // Step 1: Size & Tier
  const [sqft, setSqft] = useState<number>(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const sqftParam = searchParams.get('sqft');
    if (sqftParam) {
      const parsed = parseInt(sqftParam, 10);
      if (!isNaN(parsed) && parsed >= 100) return parsed;
    }
    return 1200;
  });

  const [selectedRateId, setSelectedRateId] = useState<number>(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const tierParam = searchParams.get('tier');
    if (tierParam) {
      const match = DEFAULT_CLEANING_RATES.find((r) => r.service_type === tierParam);
      if (match) return match.id;
    }
    return 1;
  });

  // Step 2: Date & Window (strictly tomorrow onwards)
  const [selectedDate, setSelectedDate] = useState<string>(() => getTomorrowDateStr());
  const [viewMonthDate, setViewMonthDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  });
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<'morning' | 'afternoon'>('morning');

  // Step 3: Location, Contact & Addons
  const [selectedLocation, setSelectedLocation] = useState(() => {
    if (user?.city) {
      return DENVER_LOCATIONS.find((l) => l.name === user.city) || DENVER_LOCATIONS[0];
    }
    return DENVER_LOCATIONS[0];
  });
  const [selectedAddonCodes, setSelectedAddonCodes] = useState<Record<string, boolean>>({});
  const [specialInstructions, setSpecialInstructions] = useState<string>('');

  const [formData, setFormData] = useState(() => ({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    street_address: user?.street_address || '',
    city: user?.city || 'Denver (Downtown / Central)',
    zip_code: user?.zip_code || '',
  }));

  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Pre-fill user data if user loads asynchronously after initial mount
  useEffect(() => {
    if (isAuthenticated && user) {
      const userCity = user.city || 'Denver (Downtown / Central)';
      const found = DENVER_LOCATIONS.find((l) => l.name === userCity) || DENVER_LOCATIONS[0];
      setSelectedLocation(found);

      setFormData((prev) => {
        if (prev.email) return prev;
        return {
          ...prev,
          first_name: user.first_name || prev.first_name,
          last_name: user.last_name || prev.last_name,
          phone: user.phone || prev.phone,
          email: user.email || prev.email,
          street_address: user.street_address || prev.street_address,
          city: userCity,
          zip_code: user.zip_code || prev.zip_code,
        };
      });
    }
  }, [isAuthenticated, user]);

  // Fetch rates, addons and available dates from backend API
  useEffect(() => {
    let isMounted = true;
    const fetchApiData = async () => {
      try {
        const [ratesRes, addonsRes, datesRes] = await Promise.all([
          api.get('/cleaning/rates/').catch(() => null),
          api.get('/cleaning/addons/').catch(() => null),
          api.get('/cleaning/schedule/available-dates/').catch(() => null),
        ]);

        if (!isMounted) return;

        if (ratesRes?.data) {
          const list: CleaningServiceRate[] = Array.isArray(ratesRes.data)
            ? ratesRes.data
            : (ratesRes.data as { results?: CleaningServiceRate[] })?.results || [];
          if (list.length > 0) {
            setRates(list);
            const searchParams = new URLSearchParams(window.location.search);
            const tierParam = searchParams.get('tier');
            if (tierParam) {
              const match = list.find((r) => r.service_type === tierParam);
              if (match) {
                setSelectedRateId(match.id);
                return;
              }
            }
            setSelectedRateId((prev) => (list.some((r) => r.id === prev) ? prev : list[0].id));
          }
        }

        if (addonsRes?.data) {
          const list: CleaningAddon[] = Array.isArray(addonsRes.data)
            ? addonsRes.data
            : (addonsRes.data as { results?: CleaningAddon[] })?.results || [];
          if (list.length > 0) {
            setAddons(list);
          }
        }

        if (datesRes?.data && Array.isArray(datesRes.data) && datesRes.data.length > 0) {
          setAvailableDates(datesRes.data);
          setSelectedDate(datesRes.data[0].date);
        }
      } catch (err) {
        console.warn('API data fetch fallback in Schedule:', err);
      }
    };
    fetchApiData();
    return () => {
      isMounted = false;
    };
  }, []);

  const activeRate = rates.find((r) => r.id === selectedRateId) || rates[0];

  // Pricing calculations
  const rawBase = sqft * (Number(activeRate?.rate_per_sqft) || 0.1);
  const minAmount = Number(activeRate?.min_order_amount) || 99;
  const isMinApplied = rawBase < minAmount;
  const basePrice = Math.max(rawBase, minAmount);

  const addonsTotal = addons.reduce((sum, item) => {
    if (selectedAddonCodes[item.code]) {
      return sum + Number(item.price);
    }
    return sum;
  }, 0);

  const deliveryFee = selectedLocation.fee;
  const totalPrice = basePrice + addonsTotal + deliveryFee;

  // Validation
  const isFirstNameValid = formData.first_name.trim().length >= 2;
  const isLastNameValid = formData.last_name.trim().length >= 2;
  const isPhoneValid = formData.phone.replace(/\D/g, '').length >= 10;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim());
  const isAddressValid = formData.street_address.trim().length >= 5;
  const isZipValid = /^\d{5}/.test(formData.zip_code.trim());

  const canProceedFromStep3 =
    isFirstNameValid &&
    isLastNameValid &&
    isPhoneValid &&
    isEmailValid &&
    isAddressValid &&
    isZipValid;

  // Calendar Helpers
  const currentMonthYearStr = viewMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const getCalendarDays = () => {
    const year = viewMonthDate.getFullYear();
    const month = viewMonthDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: (number | null)[] = [];
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const handleDateSelect = (day: number) => {
    const y = viewMonthDate.getFullYear();
    const m = String(viewMonthDate.getMonth() + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;

    const tomorrowStr = getTomorrowDateStr();
    if (dateStr < tomorrowStr) {
      return; // Can't select today or past
    }
    setSelectedDate(dateStr);
  };

  const isDayAvailable = (day: number) => {
    const y = viewMonthDate.getFullYear();
    const m = String(viewMonthDate.getMonth() + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;
    const match = availableDates.find((item) => item.date === dateStr);
    if (match) return match.available;
    const tomorrowStr = getTomorrowDateStr();
    return dateStr >= tomorrowStr;
  };

  const handleSubmitBooking = async () => {
    if (!agreedToTerms) return;
    setIsSubmitting(true);
    setErrorMessage('');

    // Prepare addons list for backend
    const selectedAddonsPayload = addons
      .filter((a) => selectedAddonCodes[a.code])
      .map((a) => ({
        code: a.code,
        name: a.name,
        price: Number(a.price),
      }));

    const payload = {
      guest_email: formData.email.trim(),
      guest_first_name: formData.first_name.trim(),
      guest_last_name: formData.last_name.trim(),
      guest_phone: formData.phone.trim(),
      street_address: formData.street_address.trim(),
      city: selectedLocation.name,
      zip_code: formData.zip_code.trim(),
      delivery_zone: selectedLocation.zone,
      service_rate_id: activeRate.id,
      square_feet: sqft,
      selected_addons: selectedAddonsPayload,
      service_date: selectedDate,
      time_slot: selectedTimeSlot,
      special_instructions: specialInstructions.trim(),
      language: i18n.language?.startsWith('es') ? 'es' : 'en',
    };

    try {
      const response = await api.post('/cleaning/orders/', payload);
      setCreatedOrderId(response.data.id);
      setIsSuccess(true);
    } catch (err: unknown) {
      console.error('Failed to submit cleaning reservation:', err);
      const axiosErr = err as { response?: { data?: Record<string, unknown> | string } };
      let msg = t('common.error');
      if (axiosErr.response?.data) {
        if (typeof axiosErr.response.data === 'string') {
          msg = axiosErr.response.data;
        } else {
          msg = Object.values(axiosErr.response.data).flat().join(' ');
        }
      }
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success Screen
  if (isSuccess && createdOrderId) {
    return (
      <div className="max-w-2xl mx-auto py-8 sm:py-12 animate-fade-in-up">
        <Card className="p-8 sm:p-12 text-center border-emerald-200/90 shadow-xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner animate-pop-in">
            <CheckCircle2 className="w-9 h-9 animate-float" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              {t('schedule.successTitle')}
            </h1>
            <p className="text-sm sm:text-base text-slate-600 font-medium">
              {t('schedule.successSubtitle')}
            </p>
          </div>

          {/* Details Card */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 text-left space-y-3 text-sm">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <span className="text-slate-500 font-semibold">{t('schedule.orderNumber')}:</span>
              <span className="font-extrabold text-emerald-800 text-base">GPC-#{createdOrderId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">{t('home.pricing.title')}:</span>
              <span className="font-bold text-slate-900">{activeRate.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Square Footage:</span>
              <span className="font-bold text-slate-900">{sqft} sq ft</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">{t('schedule.step2')}:</span>
              <span className="font-bold text-slate-900">
                {selectedDate} ({selectedTimeSlot === 'morning' ? '8AM - 12PM' : '1PM - 5PM'})
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Address:</span>
              <span className="font-bold text-slate-900">{formData.street_address}, {selectedLocation.name}</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-slate-200 text-base">
              <span className="font-bold text-slate-900">{t('schedule.totalDue')}:</span>
              <span className="font-black text-emerald-700 text-lg">${totalPrice.toFixed(2)}</span>
            </div>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            A detailed confirmation has been dispatched to <strong>{formData.email}</strong>. Our crew will arrive punctually during your scheduled window.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              className="w-full"
              onClick={() => navigate('/')}
            >
              {t('schedule.backHome')}
            </Button>
            {isAuthenticated && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/dashboard')}
              >
                {t('schedule.viewDashboard')}
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8 space-y-8 animate-fade-in">
      {/* Header & Steps Indicator */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight animate-fade-in-up">
          {t('schedule.title')}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 font-medium animate-fade-in-up delay-75">
          {t('schedule.subtitle')}
        </p>

        {/* Steps Bar with Animated Track */}
        <div className="relative max-w-xl mx-auto pt-4">
          <div className="absolute top-[28px] left-[12%] right-[12%] h-1 bg-slate-200 rounded-full -z-0">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            />
          </div>
          <div className="grid grid-cols-4 gap-2 sm:gap-4 relative z-10">
            {[1, 2, 3, 4].map((s) => {
              const isCompleted = step > s;
              const isCurrent = step === s;
              return (
                <div key={s} className="flex flex-col items-center gap-1.5">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                      isCurrent
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 ring-4 ring-emerald-500/20 scale-110'
                        : isCompleted
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-white border border-slate-200 text-slate-400'
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4 animate-pop-in" /> : s}
                  </div>
                  <span
                    className={`text-xs font-bold truncate max-w-[80px] sm:max-w-none transition-colors duration-300 ${
                      isCurrent ? 'text-emerald-800' : 'text-slate-500'
                    }`}
                  >
                    {s === 1
                      ? t('schedule.step1')
                      : s === 2
                      ? t('schedule.step2')
                      : s === 3
                      ? t('schedule.step3')
                      : t('schedule.step4')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* STEP 1: Size & Cleaning Tier */}
      {step === 1 && (
        <Card key="step-1" className="p-6 sm:p-9 space-y-8 animate-fade-in-up">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-extrabold text-slate-900">
              {t('schedule.step1Title')}
            </h2>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              {t('schedule.sqftHelp')}
            </p>
          </div>

          {/* Sq Ft Controls */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <label htmlFor={sqftSliderId} className="block text-sm font-extrabold text-slate-900">
                  {t('schedule.sqftLabel')}
                </label>
                <span className="text-xs text-slate-600 font-medium">
                  Approximate total area for residential or commercial cleaning
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-xl px-4 py-2 shadow-2xs">
                <input
                  id="schedule-sqft-number-input"
                  aria-label={t('schedule.sqftLabel')}
                  type="number"
                  min={100}
                  max={8000}
                  step={50}
                  value={sqft}
                  onChange={(e) => setSqft(Math.max(100, Number(e.target.value) || 100))}
                  className="w-24 text-right font-black text-emerald-700 text-lg focus:outline-none"
                />
                <span className="text-slate-600 font-bold text-sm">sq ft</span>
              </div>
            </div>

            <input
              id={sqftSliderId}
              type="range"
              min={300}
              max={5000}
              step={50}
              value={sqft}
              onChange={(e) => setSqft(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              aria-label={t('schedule.sqftLabel')}
            />

            <div className="flex justify-between text-xs text-slate-600 font-semibold">
              <span>300 sq ft</span>
              <span>1,800 sq ft (Typical Home)</span>
              <span>5,000+ sq ft</span>
            </div>

            {isMinApplied && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Standard order minimum of $99.00 applies to smaller spaces.</span>
              </div>
            )}
          </div>

          {/* Tiers Grid */}
          <div className="space-y-4">
            <label className="block text-sm font-extrabold text-slate-900">
              {t('schedule.selectTier')}
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rates.map((rate) => {
                const isSelected = selectedRateId === rate.id;
                const estPrice = Math.max(sqft * Number(rate.rate_per_sqft), Number(rate.min_order_amount));
                const localizedName = t(`home.pricing.${rate.service_type}.name`, { defaultValue: rate.name });
                const localizedDesc = t(`home.pricing.${rate.service_type}.description`, { defaultValue: rate.description });

                return (
                  <div
                    key={rate.id}
                    onClick={() => setSelectedRateId(rate.id)}
                    className={`p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-md active:scale-99 ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/50 shadow-sm ring-2 ring-emerald-600/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                          ${Number(rate.rate_per_sqft).toFixed(2)} / sq ft
                        </span>
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-600 text-white scale-105'
                              : 'border-slate-300'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 animate-pop-in" />}
                        </div>
                      </div>
                      <h3 className="font-black text-slate-900 text-base leading-snug">
                        {localizedName}
                      </h3>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        {localizedDesc}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-slate-600 font-semibold">Estimated Base</span>
                      <span className="text-lg font-black text-slate-900">
                        ${estPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Next Button */}
          <div className="flex justify-end pt-4 border-t border-slate-100">
            <Button size="lg" onClick={() => setStep(2)} className="hover:scale-102 active:scale-98 transition-all duration-200 shadow-sm">
              <span>{t('schedule.step2')}</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 2: Date & Window */}
      {step === 2 && (
        <Card key="step-2" className="p-6 sm:p-9 space-y-8 animate-fade-in-up">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-extrabold text-slate-900">
              {t('schedule.step2Title')}
            </h2>
            <p className="text-xs text-emerald-900 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg inline-block mt-2 font-semibold">
              {t('schedule.dateNotice')}
            </p>
          </div>

          {/* Month Navigation & Calendar */}
          <div className="max-w-md mx-auto bg-white border-2 border-slate-200 rounded-2xl p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <span className="font-black text-slate-900 capitalize text-base">
                {currentMonthYearStr}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    const prev = new Date(viewMonthDate);
                    prev.setMonth(prev.getMonth() - 1);
                    setViewMonthDate(prev);
                  }}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const next = new Date(viewMonthDate);
                    next.setMonth(next.getMonth() + 1);
                    setViewMonthDate(next);
                  }}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                <div key={d} className="font-black text-slate-700 py-1.5">
                  {d}
                </div>
              ))}

              {getCalendarDays().map((day, idx) => {
                if (!day) {
                  return <div key={`empty-${idx}`} />;
                }

                const y = viewMonthDate.getFullYear();
                const m = String(viewMonthDate.getMonth() + 1).padStart(2, '0');
                const d = String(day).padStart(2, '0');
                const dateStr = `${y}-${m}-${d}`;

                const isSelected = selectedDate === dateStr;
                const available = isDayAvailable(day);

                return (
                  <button
                    key={dateStr}
                    type="button"
                    disabled={!available}
                    onClick={() => handleDateSelect(day)}
                    className={`py-2.5 rounded-xl font-bold transition-all duration-150 text-xs cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-sm font-black scale-105 animate-pop-in ring-2 ring-emerald-600/30'
                        : available
                        ? 'hover:bg-emerald-50 text-slate-900 hover:scale-105 active:scale-95'
                        : 'text-slate-300 cursor-not-allowed'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Window Selection */}
          <div className="space-y-3 max-w-md mx-auto">
            <label className="block text-sm font-extrabold text-slate-900">
              Arrival Time Window
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedTimeSlot('morning')}
                className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer hover:-translate-y-0.5 hover:shadow-xs active:scale-98 ${
                  selectedTimeSlot === 'morning'
                    ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 shadow-xs ring-2 ring-emerald-600/30'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-800'
                }`}
              >
                <div className="flex items-center gap-2 font-black text-xs text-slate-900">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>Morning</span>
                </div>
                <div className="text-xs text-slate-600 font-medium mt-1">8:00 AM – 12:00 PM</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTimeSlot('afternoon')}
                className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer hover:-translate-y-0.5 hover:shadow-xs active:scale-98 ${
                  selectedTimeSlot === 'afternoon'
                    ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 shadow-xs ring-2 ring-emerald-600/30'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-800'
                }`}
              >
                <div className="flex items-center gap-2 font-black text-xs text-slate-900">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>Afternoon</span>
                </div>
                <div className="text-xs text-slate-600 font-medium mt-1">1:00 PM – 5:00 PM</div>
              </button>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-between pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setStep(1)} className="hover:scale-102 active:scale-98 transition-all duration-200">
              <ChevronLeft className="w-4 h-4 mr-1" />
              <span>Back</span>
            </Button>
            <Button size="lg" onClick={() => setStep(3)} className="hover:scale-102 active:scale-98 transition-all duration-200 shadow-sm">
              <span>{t('schedule.step3')}</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 3: Location & Property Surcharges */}
      {step === 3 && (
        <Card key="step-3" className="p-6 sm:p-9 space-y-8 animate-fade-in-up">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-extrabold text-slate-900">
              {t('schedule.step3Title')}
            </h2>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              Specify your property address in Denver or Boulder and any difficulty factors.
            </p>
          </div>

          {/* Location / Zone Selection */}
          <div className="space-y-4">
            <label className="block text-sm font-extrabold text-slate-900">
              {t('schedule.citySelect')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {DENVER_LOCATIONS.map((loc) => {
                const isSelected = selectedLocation.name === loc.name;
                return (
                  <button
                    key={loc.name}
                    type="button"
                    onClick={() => setSelectedLocation(loc)}
                    className={`p-3.5 rounded-xl border-2 text-left text-xs font-bold transition-all duration-200 flex items-center justify-between cursor-pointer hover:scale-102 active:scale-95 ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 shadow-xs ring-2 ring-emerald-600/20'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
                    }`}
                  >
                    <span className="font-extrabold text-slate-900">{loc.name}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-md font-extrabold ${
                        loc.zone === 'inner'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {loc.zone === 'inner' ? 'Free Travel' : '+$25 Travel'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Address and Contact Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Street Address *"
              value={formData.street_address}
              onChange={(e) => setFormData({ ...formData, street_address: e.target.value })}
              onBlur={() => setTouchedFields({ ...touchedFields, street_address: true })}
              error={touchedFields.street_address && !isAddressValid ? 'Address is required (min 5 characters)' : ''}
              placeholder="e.g. 1234 Blake St, Apt 4B"
            />

            <Input
              label="ZIP Code *"
              value={formData.zip_code}
              onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
              onBlur={() => setTouchedFields({ ...touchedFields, zip_code: true })}
              error={touchedFields.zip_code && !isZipValid ? 'Valid 5-digit ZIP code required' : ''}
              placeholder="e.g. 80202"
            />

            <Input
              label="First Name *"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              onBlur={() => setTouchedFields({ ...touchedFields, first_name: true })}
              error={touchedFields.first_name && !isFirstNameValid ? 'First name required' : ''}
              placeholder="First name"
            />

            <Input
              label="Last Name *"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              onBlur={() => setTouchedFields({ ...touchedFields, last_name: true })}
              error={touchedFields.last_name && !isLastNameValid ? 'Last name required' : ''}
              placeholder="Last name"
            />

            <Input
              label="Phone Number *"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              onBlur={() => setTouchedFields({ ...touchedFields, phone: true })}
              error={touchedFields.phone && !isPhoneValid ? 'Valid 10-digit phone required' : ''}
              placeholder="(720) 000-0000"
            />

            <Input
              label="Email Address *"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              onBlur={() => setTouchedFields({ ...touchedFields, email: true })}
              error={touchedFields.email && !isEmailValid ? 'Valid email required' : ''}
              placeholder="you@example.com"
            />
          </div>

          {/* Difficulty Surcharges (Add-ons) */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div>
              <label className="block text-sm font-extrabold text-slate-900">
                {t('schedule.addonsTitle')}
              </label>
              <p className="text-xs text-slate-600 font-medium">
                {t('schedule.addonsSubtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {addons.map((addon) => {
                const isChecked = !!selectedAddonCodes[addon.code];
                const localizedName = t(`cleaningAddons.${addon.code}.name`, { defaultValue: addon.name });
                const localizedDesc = t(`cleaningAddons.${addon.code}.description`, { defaultValue: addon.description });

                return (
                  <div
                    key={addon.code}
                    onClick={() => {
                      setSelectedAddonCodes({
                        ...selectedAddonCodes,
                        [addon.code]: !isChecked,
                      });
                    }}
                    className={`p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer flex items-start gap-3.5 hover:-translate-y-0.5 hover:shadow-xs active:scale-99 ${
                      isChecked
                        ? 'border-emerald-600 bg-emerald-50/60 shadow-xs ring-2 ring-emerald-600/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md border mt-0.5 flex items-center justify-center shrink-0 transition-all duration-200 ${
                        isChecked
                          ? 'border-emerald-600 bg-emerald-600 text-white scale-105'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5 animate-pop-in" />}
                    </div>
                    <div className="flex-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-slate-900 text-sm">{localizedName}</span>
                        <span className="font-black text-emerald-700 text-sm">+${Number(addon.price).toFixed(2)}</span>
                      </div>
                      <p className="text-slate-600 text-xs font-medium mt-1 leading-relaxed">{localizedDesc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Access Instructions */}
          <div className="space-y-1.5 pt-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              {t('schedule.specialInstructions')}
            </label>
            <textarea
              rows={2}
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. Callbox code #1234, key under planter, friendly golden retriever at home..."
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 shadow-2xs font-medium"
            />
          </div>

          {/* Controls */}
          <div className="flex justify-between pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setStep(2)} className="hover:scale-102 active:scale-98 transition-all duration-200">
              <ChevronLeft className="w-4 h-4 mr-1" />
              <span>Back</span>
            </Button>
            <Button
              size="lg"
              disabled={!canProceedFromStep3}
              onClick={() => setStep(4)}
              className="hover:scale-102 active:scale-98 transition-all duration-200 shadow-sm"
            >
              <span>{t('schedule.step4')}</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 4: Review & Confirm */}
      {step === 4 && (
        <Card key="step-4" className="p-6 sm:p-9 space-y-8 animate-fade-in-up">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-extrabold text-slate-900">
              {t('schedule.step4Title')}
            </h2>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              Review your cleaning reservation details before confirmation.
            </p>
          </div>

          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Summary Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Service & Schedule */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3.5 text-xs">
              <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                <Home className="w-4 h-4 text-emerald-600" />
                <span>Service Details</span>
              </h3>
              <div className="flex justify-between">
                <span className="text-slate-600 font-semibold">Service Tier:</span>
                <span className="font-bold text-slate-900">
                  {t(`home.pricing.${activeRate.service_type}.name`, { defaultValue: activeRate.name })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-semibold">Property Size:</span>
                <span className="font-bold text-slate-900">{sqft} sq ft</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-semibold">Scheduled Date:</span>
                <span className="font-bold text-slate-900">{selectedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-semibold">Arrival Window:</span>
                <span className="font-bold text-slate-900">
                  {selectedTimeSlot === 'morning' ? '8:00 AM – 12:00 PM' : '1:00 PM – 5:00 PM'}
                </span>
              </div>
            </div>

            {/* Address & Contact */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3.5 text-xs">
              <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Location & Contact</span>
              </h3>
              <div className="flex justify-between">
                <span className="text-slate-600 font-semibold">Client:</span>
                <span className="font-bold text-slate-900">{formData.first_name} {formData.last_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-semibold">Phone:</span>
                <span className="font-bold text-slate-900">{formData.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-semibold">Email:</span>
                <span className="font-bold text-slate-900">{formData.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-semibold">Address:</span>
                <span className="font-bold text-slate-900 text-right">{formData.street_address}, {selectedLocation.name} {formData.zip_code}</span>
              </div>
            </div>
          </div>

          {/* Pricing Breakdown Card */}
          <div className="bg-white border-2 border-emerald-200/90 rounded-2xl p-6 space-y-3.5 shadow-sm">
            <h3 className="font-black text-emerald-950 text-sm uppercase tracking-wider">
              Cost Breakdown
            </h3>
            <div className="flex justify-between text-slate-700 text-xs font-medium">
              <span>{t('schedule.basePrice')} ({sqft} sqft @ ${Number(activeRate.rate_per_sqft).toFixed(2)}/sqft):</span>
              <span className="font-bold text-slate-900">
                ${basePrice.toFixed(2)} {isMinApplied && '(Min $99)'}
              </span>
            </div>
            {addonsTotal > 0 && (
              <div className="flex justify-between text-slate-700 text-xs font-medium">
                <span>{t('schedule.addonsFee')}:</span>
                <span className="font-bold text-slate-900">+${addonsTotal.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-700 text-xs font-medium">
              <span>{t('schedule.travelFee')} ({selectedLocation.name}):</span>
              <span className="font-bold text-slate-900">
                {deliveryFee === 0 ? 'FREE' : `+$${deliveryFee.toFixed(2)}`}
              </span>
            </div>
            <div className="pt-3 border-t-2 border-emerald-100 flex justify-between items-baseline">
              <span className="font-black text-slate-900 text-base">{t('schedule.totalDue')}:</span>
              <span className="font-black text-2xl text-emerald-700">${totalPrice.toFixed(2)}</span>
            </div>
          </div>

          {/* Terms Agreement Checkbox */}
          <div className="flex items-start gap-3 bg-white p-4 border border-slate-200 rounded-xl shadow-2xs">
            <input
              type="checkbox"
              id="agree-terms"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="w-4 h-4 accent-emerald-600 rounded mt-0.5 cursor-pointer"
            />
            <label htmlFor="agree-terms" className="text-xs text-slate-700 cursor-pointer font-medium leading-relaxed">
              {t('schedule.termsAgree')}
            </label>
          </div>

          {/* Controls */}
          <div className="flex justify-between pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setStep(3)} className="hover:scale-102 active:scale-98 transition-all duration-200">
              <ChevronLeft className="w-4 h-4 mr-1" />
              <span>Back</span>
            </Button>
            <Button
              size="lg"
              disabled={!agreedToTerms || isSubmitting}
              onClick={handleSubmitBooking}
              className="font-black text-base shadow-md hover:shadow-lg hover:scale-102 active:scale-98 transition-all duration-200"
            >
              <Sparkles className="w-4 h-4 mr-2 animate-float" />
              {isSubmitting ? t('schedule.submitting') : t('schedule.submitOrder')}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
