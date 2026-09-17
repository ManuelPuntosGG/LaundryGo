import { useState, useEffect, useId } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  HardHat,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Check,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthContext } from '@/providers/AuthProvider';
import api from '@/api';
import type { CleaningServiceRate, CleaningAddon, CleaningAvailableDate } from '@/types';
import { DEFAULT_COMMERCIAL_RATES } from '@/constants/commercialServices';
import { COMMERCIAL_ADDONS } from '@/constants/commercialAddons';
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
  const [rates, setRates] = useState<CleaningServiceRate[]>(DEFAULT_COMMERCIAL_RATES);
  const [addons, setAddons] = useState<CleaningAddon[]>(COMMERCIAL_ADDONS);
  const [availableDates, setAvailableDates] = useState<CleaningAvailableDate[]>(() => getFallbackTomorrowDates(60));

  // Step 1: Footprint & Scope
  const [sqft, setSqft] = useState<number>(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const sqftParam = searchParams.get('sqft');
    if (sqftParam) {
      const parsed = parseInt(sqftParam, 10);
      if (!isNaN(parsed) && parsed >= 100) return parsed;
    }
    return 2500;
  });

  const [selectedRateId, setSelectedRateId] = useState<number>(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const tierParam = searchParams.get('tier');
    if (tierParam) {
      const match = DEFAULT_COMMERCIAL_RATES.find((r) => r.service_type === tierParam);
      if (match) return match.id;
    }
    return DEFAULT_COMMERCIAL_RATES[0].id;
  });

  // Step 2: Date & Shift
  const [selectedDate, setSelectedDate] = useState<string>(getTomorrowDateStr);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<'morning' | 'afternoon'>('morning');
  const [viewMonthDate, setViewMonthDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  });

  // Step 3: Location & Logistics
  const [selectedLocation, setSelectedLocation] = useState(DENVER_LOCATIONS[0]);
  const [selectedAddonCodes, setSelectedAddonCodes] = useState<Record<string, boolean>>({});
  const [specialInstructions, setSpecialInstructions] = useState('');

  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    street_address: user?.street_address || '',
    zip_code: user?.zip_code || '80202',
  });

  // Step 4: Submission
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      queueMicrotask(() => {
        setFormData((prev) => ({
          ...prev,
          first_name: user.first_name || prev.first_name,
          last_name: user.last_name || prev.last_name,
          email: user.email || prev.email,
          phone: user.phone || prev.phone,
          street_address: user.street_address || prev.street_address,
          zip_code: user.zip_code || prev.zip_code,
        }));
      });
    }
  }, [user]);

  // Fetch rates and dates from backend API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ratesRes, addonsRes, datesRes] = await Promise.allSettled([
          api.get('/cleaning/rates/?brand=evolvingsolutions'),
          api.get('/cleaning/addons/?brand=evolvingsolutions'),
          api.get('/cleaning/schedule/available-dates/'),
        ]);

        if (ratesRes.status === 'fulfilled') {
          const list: CleaningServiceRate[] = Array.isArray(ratesRes.value.data)
            ? ratesRes.value.data
            : ratesRes.value.data?.results || [];
          if (list.length > 0) {
            const commercialTypes = ['commercial', 'post_construction', 'industrial_demolition'];
            const filtered = list.filter((r) => commercialTypes.includes(r.service_type));
            if (filtered.length > 0) {
              setRates(filtered);
              setSelectedRateId((prev) => (filtered.some((r) => r.id === prev) ? prev : filtered[0].id));
            }
          }
        }

        if (addonsRes.status === 'fulfilled') {
          const list: CleaningAddon[] = Array.isArray(addonsRes.value.data)
            ? addonsRes.value.data
            : addonsRes.value.data?.results || [];
          if (list.length > 0) {
            setAddons(list);
          }
        }

        if (datesRes.status === 'fulfilled' && Array.isArray(datesRes.value.data) && datesRes.value.data.length > 0) {
          setAvailableDates(datesRes.value.data);
          const firstAvail = datesRes.value.data.find((d: CleaningAvailableDate) => d.available);
          if (firstAvail) {
            setSelectedDate(firstAvail.date);
          }
        }
      } catch (err) {
        console.warn('API fetch issue in Schedule, using robust fallbacks:', err);
      }
    };
    fetchData();
  }, []);

  const activeRate = rates.find((r) => r.id === selectedRateId) || rates[0] || DEFAULT_COMMERCIAL_RATES[0];

  // Pricing calculations
  const ratePerSqft = Number(activeRate.rate_per_sqft) || 0.18;
  const minOrder = Number(activeRate.min_order_amount) || 99;
  const calculatedBase = sqft * ratePerSqft;
  const basePrice = Math.max(calculatedBase, minOrder);
  const isMinimumApplied = calculatedBase < minOrder;

  const addonsTotal = addons
    .filter((a) => selectedAddonCodes[a.code])
    .reduce((acc, a) => acc + Number(a.price), 0);

  const deliveryFee = selectedLocation.fee;
  const totalPrice = basePrice + addonsTotal + deliveryFee;

  const toggleAddon = (code: string) => {
    setSelectedAddonCodes((prev) => ({
      ...prev,
      [code]: !prev[code],
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Calendar helpers
  const nextMonth = () => {
    setViewMonthDate(new Date(viewMonthDate.getFullYear(), viewMonthDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    const today = new Date();
    if (viewMonthDate.getFullYear() === today.getFullYear() && viewMonthDate.getMonth() <= today.getMonth()) {
      return;
    }
    setViewMonthDate(new Date(viewMonthDate.getFullYear(), viewMonthDate.getMonth() - 1, 1));
  };

  const getDaysInViewMonth = () => {
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
      return;
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

    const selectedAddonsPayload = addons
      .filter((a) => selectedAddonCodes[a.code])
      .map((a) => ({
        code: a.code,
        name: a.name,
        price: Number(a.price),
      }));

    const payload = {
      brand: 'evolvingsolutions',
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
      console.error('Failed to submit commercial work order:', err);
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

  if (isSuccess && createdOrderId) {
    return (
      <div className="max-w-2xl mx-auto py-8 sm:py-12 animate-scale-in">
        <Card className="p-8 sm:p-10 border-[#815133] bg-white text-center space-y-6 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-[#f7efe6] text-[#815133] flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-stone-950">
              {t('schedule.step4.successTitle')}
            </h2>
            <p className="text-stone-600 text-sm sm:text-base font-medium max-w-md mx-auto">
              {t('schedule.step4.successMsg')}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#fdfaf6] border border-[#e0c3a7] text-center space-y-1 max-w-xs mx-auto">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              {t('schedule.step4.orderId')}
            </span>
            <div className="text-3xl font-black text-[#815133] tracking-tight">
              ESL-#{createdOrderId}
            </div>
          </div>

          <div className="text-left bg-white border border-stone-200 rounded-2xl p-5 space-y-3">
            <h4 className="text-xs font-black text-stone-900 uppercase tracking-wider">
              {t('schedule.step4.nextSteps')}
            </h4>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#f7efe6] text-[#815133] text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                1
              </div>
              <p className="text-xs sm:text-sm text-stone-700 font-medium">
                {t('schedule.step4.nextStep1')}
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#f7efe6] text-[#815133] text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                2
              </div>
              <p className="text-xs sm:text-sm text-stone-700 font-medium">
                {t('schedule.step4.nextStep2')}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            {isAuthenticated ? (
              <Button size="md" onClick={() => navigate('/dashboard')}>
                {t('nav.dashboard')}
              </Button>
            ) : (
              <Button size="md" onClick={() => navigate('/login')}>
                {t('auth.loginButton')}
              </Button>
            )}
            <Button variant="outline" size="md" onClick={() => navigate('/')}>
              {t('nav.home')}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-6 space-y-8">
      {/* Step Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-stone-950 tracking-tight">
          {t('schedule.title')}
        </h1>
        <p className="text-stone-600 text-sm sm:text-base font-medium max-w-xl mx-auto">
          {t('schedule.subtitle')}
        </p>
      </div>

      {/* 4-Step Progress Indicator */}
      <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-2xl mx-auto">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`flex flex-col items-center gap-1.5 p-2 rounded-xl text-center transition-all ${
              step === s
                ? 'bg-[#f7efe6] text-[#573725] font-black'
                : step > s
                ? 'text-[#815133] font-bold'
                : 'text-stone-400 font-medium'
            }`}
          >
            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                step === s
                  ? 'bg-[#815133] text-white shadow-sm'
                  : step > s
                  ? 'bg-[#eedecd] text-[#573725]'
                  : 'bg-stone-200 text-stone-500'
              }`}
            >
              {step > s ? <Check className="w-4 h-4" /> : s}
            </div>
            <span className="text-[11px] sm:text-xs hidden sm:inline">
              {t(`schedule.steps.step${s}`)}
            </span>
          </div>
        ))}
      </div>

      {/* Step 1: Scope & Footprint */}
      {step === 1 && (
        <Card className="p-6 sm:p-8 space-y-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-950 mb-1">
              {t('schedule.step1.title')}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 font-medium">
              Choose the commercial service scope and adjust square footage for an exact estimate.
            </p>
          </div>

          {/* Service Cards */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
              {t('schedule.step1.ratesLabel')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {rates.map((rate) => {
                const isSelected = rate.id === selectedRateId;
                const localizedName = t(`home.pricing.${rate.service_type}.name`, { defaultValue: rate.name });
                const localizedDesc = t(`home.pricing.${rate.service_type}.description`, { defaultValue: rate.description });

                return (
                  <button
                    type="button"
                    key={rate.id}
                    onClick={() => setSelectedRateId(rate.id)}
                    className={`p-5 rounded-2xl text-left border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#815133] bg-[#fdfaf6] shadow-sm'
                        : 'border-stone-200 bg-white hover:border-[#cca07c]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black uppercase text-[#815133] bg-[#f7efe6] px-2 py-0.5 rounded-md">
                          ${Number(rate.rate_per_sqft).toFixed(2)}/sqft
                        </span>
                        {isSelected && <CheckCircle2 className="w-5 h-5 text-[#815133]" />}
                      </div>
                      <h4 className="font-black text-stone-950 text-base mb-1">{localizedName}</h4>
                      <p className="text-xs text-stone-600 font-medium line-clamp-3">{localizedDesc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Square Footage Input & Slider */}
          <div className="space-y-4 pt-4 border-t border-stone-100">
            <div className="flex items-center justify-between">
              <label htmlFor={sqftSliderId} className="text-sm font-bold text-stone-700">
                {t('schedule.step1.sqftLabel')}
              </label>
              <div className="flex items-center gap-2 bg-[#f7efe6] px-4 py-1.5 rounded-xl border border-[#e0c3a7]">
                <input
                  type="number"
                  min={300}
                  max={15000}
                  step={100}
                  value={sqft}
                  onChange={(e) => setSqft(Math.max(100, Number(e.target.value) || 100))}
                  className="w-24 text-right focus:outline-none text-[#815133] font-black text-base"
                />
                <span className="text-stone-600 font-bold text-xs">sq ft</span>
              </div>
            </div>

            <input
              id={sqftSliderId}
              type="range"
              min={500}
              max={10000}
              step={100}
              value={sqft}
              onChange={(e) => setSqft(Number(e.target.value))}
              className="w-full accent-[#815133] cursor-pointer h-2 bg-stone-200 rounded-lg"
            />

            <div className="flex justify-between text-xs text-stone-600 font-semibold">
              <span>500 sq ft</span>
              <span>5,000 sq ft</span>
              <span>10,000+ sq ft</span>
            </div>
          </div>

          {/* Live Base Calculation Box */}
          <div className="p-4 rounded-2xl bg-[#f7efe6] border border-[#e0c3a7] flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-stone-600 uppercase">
                {t('schedule.step1.basePrice')}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-stone-950">${basePrice.toFixed(2)}</span>
                {isMinimumApplied && (
                  <span className="text-xs text-amber-800 font-bold">
                    ({t('schedule.step1.minApplied')})
                  </span>
                )}
              </div>
            </div>

            <Button size="md" onClick={() => setStep(2)}>
              <span>{t('schedule.steps.step2')}</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 2: Date & Shift Window */}
      {step === 2 && (
        <Card className="p-6 sm:p-8 space-y-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-950 mb-1">
              {t('schedule.step2.title')}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 font-medium">
              {t('schedule.step2.noSameDay')}
            </p>
          </div>

          {/* Mini Interactive Month Calendar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-[#fdfaf6] p-3 rounded-xl border border-stone-200">
              <button
                type="button"
                onClick={prevMonth}
                className="p-1.5 rounded-lg hover:bg-stone-200 text-stone-700 cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="font-extrabold text-stone-900 text-sm sm:text-base capitalize">
                {viewMonthDate.toLocaleDateString(i18n.language?.startsWith('es') ? 'es-ES' : 'en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
              <button
                type="button"
                onClick={nextMonth}
                className="p-1.5 rounded-lg hover:bg-stone-200 text-stone-700 cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-stone-500 py-1">
              <span>Su</span>
              <span>Mo</span>
              <span>Tu</span>
              <span>We</span>
              <span>Th</span>
              <span>Fr</span>
              <span>Sa</span>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {getDaysInViewMonth().map((day, idx) => {
                if (day === null) {
                  return <div key={`empty-${idx}`} className="h-10 sm:h-11" />;
                }
                const y = viewMonthDate.getFullYear();
                const m = String(viewMonthDate.getMonth() + 1).padStart(2, '0');
                const d = String(day).padStart(2, '0');
                const dateStr = `${y}-${m}-${d}`;
                const isSelected = selectedDate === dateStr;
                const available = isDayAvailable(day);

                return (
                  <button
                    type="button"
                    key={dateStr}
                    disabled={!available}
                    onClick={() => handleDateSelect(day)}
                    className={`h-10 sm:h-11 rounded-xl text-xs sm:text-sm font-extrabold flex flex-col items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-[#815133] text-white shadow-sm'
                        : available
                        ? 'bg-white hover:bg-[#f7efe6] text-stone-900 border border-stone-200'
                        : 'bg-stone-100 text-stone-300 cursor-not-allowed'
                    }`}
                  >
                    <span>{day}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Slot Selector */}
          <div className="space-y-3 pt-4 border-t border-stone-100">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
              {t('schedule.step2.timeSlot')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setSelectedTimeSlot('morning')}
                className={`p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between cursor-pointer ${
                  selectedTimeSlot === 'morning'
                    ? 'border-[#815133] bg-[#fdfaf6]'
                    : 'border-stone-200 bg-white hover:border-[#cca07c]'
                }`}
              >
                <div>
                  <div className="font-bold text-stone-900 text-sm">
                    {t('schedule.step2.morning')}
                  </div>
                  <div className="text-xs text-stone-500">8:00 AM – 12:00 PM</div>
                </div>
                {selectedTimeSlot === 'morning' && <CheckCircle2 className="w-5 h-5 text-[#815133]" />}
              </button>

              <button
                type="button"
                onClick={() => setSelectedTimeSlot('afternoon')}
                className={`p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between cursor-pointer ${
                  selectedTimeSlot === 'afternoon'
                    ? 'border-[#815133] bg-[#fdfaf6]'
                    : 'border-stone-200 bg-white hover:border-[#cca07c]'
                }`}
              >
                <div>
                  <div className="font-bold text-stone-900 text-sm">
                    {t('schedule.step2.afternoon')}
                  </div>
                  <div className="text-xs text-stone-500">1:00 PM – 5:00 PM</div>
                </div>
                {selectedTimeSlot === 'afternoon' && <CheckCircle2 className="w-5 h-5 text-[#815133]" />}
              </button>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-stone-100">
            <Button variant="ghost" onClick={() => setStep(1)}>
              <ChevronLeft className="w-4 h-4 mr-1" />
              <span>Back</span>
            </Button>
            <Button size="md" onClick={() => setStep(3)}>
              <span>{t('schedule.steps.step3')}</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Location, Add-ons & Contact Details */}
      {step === 3 && (
        <Card className="p-6 sm:p-8 space-y-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-950 mb-1">
              {t('schedule.step3.title')}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 font-medium">
              Provide job site location, point-of-contact info, and any specialized equipment or logistics extras.
            </p>
          </div>

          {/* Location / City Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
              {t('schedule.step3.cityLabel')}
            </label>
            <select
              value={selectedLocation.name}
              onChange={(e) => {
                const match = DENVER_LOCATIONS.find((l) => l.name === e.target.value);
                if (match) setSelectedLocation(match);
              }}
              className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 font-medium text-sm focus:outline-none focus:border-[#815133]"
            >
              {DENVER_LOCATIONS.map((loc) => (
                <option key={loc.name} value={loc.name}>
                  {loc.name} ({loc.zone === 'inner' ? 'Free Travel' : '+$25 Travel Fee'})
                </option>
              ))}
            </select>
          </div>

          {/* Street Address & Zip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Input
                label={t('schedule.step3.addressLabel')}
                name="street_address"
                value={formData.street_address}
                onChange={handleInputChange}
                placeholder="e.g. 1701 16th St, Suite 200"
                required
              />
            </div>
            <div>
              <Input
                label={t('schedule.step3.zipLabel')}
                name="zip_code"
                value={formData.zip_code}
                onChange={handleInputChange}
                placeholder="80202"
                required
              />
            </div>
          </div>

          {/* Add-ons Checkbox Grid */}
          <div className="space-y-3 pt-4 border-t border-stone-100">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
              {t('schedule.step3.addonsLabel')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {addons.map((addon) => {
                const checked = !!selectedAddonCodes[addon.code];

                return (
                  <button
                    type="button"
                    key={addon.code}
                    onClick={() => toggleAddon(addon.code)}
                    className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer flex items-start justify-between gap-3 ${
                      checked
                        ? 'border-[#815133] bg-[#fdfaf6]'
                        : 'border-stone-200 bg-white hover:border-[#cca07c]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-stone-900">{addon.name}</span>
                        <span className="text-xs font-black text-[#815133] bg-[#f7efe6] px-2 py-0.5 rounded">
                          +${Number(addon.price).toFixed(2)}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mt-1 font-medium leading-relaxed">
                        {addon.description}
                      </p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                        checked
                          ? 'bg-[#815133] border-[#815133] text-white'
                          : 'border-stone-300 bg-white'
                      }`}
                    >
                      {checked && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* On-Site Contact Fields */}
          <div className="space-y-4 pt-4 border-t border-stone-100">
            <h4 className="text-xs font-black text-stone-900 uppercase tracking-wider">
              {t('schedule.step3.contactInfo')}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={t('schedule.step3.firstName')}
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                required
              />
              <Input
                label={t('schedule.step3.lastName')}
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={t('schedule.step3.email')}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              <Input
                label={t('schedule.step3.phone')}
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                {t('schedule.step3.instructions')}
              </label>
              <textarea
                rows={3}
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="e.g. Loading dock check-in at rear, hardhats required in zone B, lockbox code 4589"
                className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 text-sm placeholder-stone-400 focus:outline-none focus:border-[#815133]"
              />
            </div>
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-stone-100">
            <Button variant="ghost" onClick={() => setStep(2)}>
              <ChevronLeft className="w-4 h-4 mr-1" />
              <span>Back</span>
            </Button>
            <Button
              size="md"
              disabled={
                !formData.first_name.trim() ||
                !formData.email.trim() ||
                !formData.phone.trim() ||
                !formData.street_address.trim()
              }
              onClick={() => setStep(4)}
            >
              <span>{t('schedule.steps.step4')}</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 4: Review, Terms & Dispatch */}
      {step === 4 && (
        <Card className="p-6 sm:p-8 space-y-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-950 mb-1">
              {t('schedule.step4.title')}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 font-medium">
              Review your labor scope, site details, and estimated total before confirming dispatch.
            </p>
          </div>

          {/* Itemized Order Breakdown */}
          <div className="bg-[#fdfaf6] border border-stone-200 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-black text-stone-950 uppercase tracking-wider">
              {t('schedule.step4.summary')}
            </h3>

            <div className="space-y-2 text-sm text-stone-700">
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500 font-medium">{t('schedule.step4.service')}</span>
                <span className="font-bold text-stone-900">
                  {t(`home.pricing.${activeRate.service_type}.name`, { defaultValue: activeRate.name })}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500 font-medium">{t('schedule.step4.sqft')}</span>
                <span className="font-bold text-stone-900">{sqft} sq ft</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500 font-medium">{t('schedule.step4.date')}</span>
                <span className="font-bold text-stone-900">{selectedDate}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500 font-medium">{t('schedule.step4.time')}</span>
                <span className="font-bold text-stone-900">
                  {selectedTimeSlot === 'morning' ? '8:00 AM – 12:00 PM' : '1:00 PM – 5:00 PM'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500 font-medium">{t('schedule.step4.location')}</span>
                <span className="font-bold text-stone-900">
                  {formData.street_address}, {selectedLocation.name} {formData.zip_code}
                </span>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="pt-2 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-stone-600 font-medium">{t('schedule.step4.basePrice')}</span>
                <span className="font-bold text-stone-900">${basePrice.toFixed(2)}</span>
              </div>
              {addonsTotal > 0 && (
                <div className="flex justify-between">
                  <span className="text-stone-600 font-medium">{t('schedule.step4.addons')}</span>
                  <span className="font-bold text-stone-900">+${addonsTotal.toFixed(2)}</span>
                </div>
              )}
              {deliveryFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-stone-600 font-medium">{t('schedule.step4.travelFee')}</span>
                  <span className="font-bold text-stone-900">+${deliveryFee.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between pt-3 border-t border-stone-300 text-lg font-black text-stone-950">
                <span>{t('schedule.step4.total')}</span>
                <span className="text-[#815133]">${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Terms & Insurance Acknowledgement */}
          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer p-4 rounded-xl bg-[#f7efe6] border border-[#e0c3a7]">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="w-4 h-4 rounded text-[#815133] focus:ring-[#815133] mt-1 shrink-0 accent-[#815133]"
              />
              <span className="text-xs sm:text-sm text-stone-800 font-medium leading-relaxed">
                {t('schedule.step4.terms')}
              </span>
            </label>

            {errorMessage && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium flex items-center gap-2">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-stone-100">
            <Button variant="ghost" onClick={() => setStep(3)}>
              <ChevronLeft className="w-4 h-4 mr-1" />
              <span>Back</span>
            </Button>
            <Button
              size="lg"
              disabled={!agreedToTerms || isSubmitting}
              onClick={handleSubmitBooking}
              className="shadow-md hover:shadow-lg"
            >
              <HardHat className="w-5 h-5 mr-2" />
              {isSubmitting ? t('common.submitting') : t('schedule.step4.confirmButton')}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
