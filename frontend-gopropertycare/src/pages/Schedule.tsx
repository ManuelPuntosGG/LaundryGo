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
  Bed,
  Bath,
  Key,
  KeyRound,
  DoorOpen,
  Lock,
  UserCheck,
  Calendar as CalendarIcon,
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

const TIME_SLOTS = [
  '08:00 AM',
  '08:30 AM',
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '12:00 PM',
  '12:30 PM',
  '01:00 PM',
  '01:30 PM',
  '02:00 PM',
  '02:30 PM',
  '03:00 PM',
  '03:30 PM',
  '04:00 PM',
  '04:30 PM',
  '05:00 PM',
];

const getTodayDateStr = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getTomorrowDateStr = (): string => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const isSameDayAllowed = (): boolean => {
  const now = new Date();
  return now.getHours() < 12;
};

const isTimeSlotValidForToday = (timeStr: string): boolean => {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return true;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridiem = match[3].toUpperCase();
  if (meridiem === 'PM' && hours < 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;

  const slotDate = new Date();
  slotDate.setHours(hours, minutes, 0, 0);

  const minDate = new Date();
  minDate.setHours(minDate.getHours() + 3);

  return slotDate >= minDate;
};

const getFallbackDates = (count = 60): CleaningAvailableDate[] => {
  const list: CleaningAvailableDate[] = [];
  const today = new Date();
  const startOffset = isSameDayAllowed() ? 0 : 1;
  for (let i = startOffset; i <= count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    list.push({
      date: `${y}-${m}-${day}`,
      available: true,
      is_today: i === 0,
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
  const [availableDates, setAvailableDates] = useState<CleaningAvailableDate[]>(() => getFallbackDates(60));

  // Step 1: Size, Service & Inquiry Details
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

  const [bedrooms, setBedrooms] = useState<number>(2);
  const [bathrooms, setBathrooms] = useState<number>(2);
  const [isOccupied, setIsOccupied] = useState<boolean>(true);

  // Step 2: Date & Arrival Time
  const sameDayAvailable = isSameDayAllowed();
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return sameDayAvailable ? getTodayDateStr() : getTomorrowDateStr();
  });

  const [viewMonthDate, setViewMonthDate] = useState<Date>(() => {
    const d = new Date();
    if (!sameDayAvailable) {
      d.setDate(d.getDate() + 1);
    }
    return d;
  });

  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>(() => {
    if (sameDayAvailable) {
      const firstValid = TIME_SLOTS.find((s) => isTimeSlotValidForToday(s));
      return firstValid || '02:00 PM';
    }
    return '09:00 AM';
  });

  // Step 3: Location, Contact, Access & Priced Addons
  const [selectedLocation, setSelectedLocation] = useState(() => {
    if (user?.city) {
      return DENVER_LOCATIONS.find((l) => l.name === user.city) || DENVER_LOCATIONS[0];
    }
    return DENVER_LOCATIONS[0];
  });

  const [entryMethod, setEntryMethod] = useState<string>('someone_home');
  const [entryNotes, setEntryNotes] = useState<string>('');
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

  // Pre-fill user data if auth loads asynchronously
  useEffect(() => {
    if (isAuthenticated && user) {
      queueMicrotask(() => {
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
      });
    }
  }, [isAuthenticated, user]);



  // Fetch rates, addons and available dates from backend API
  useEffect(() => {
    let isMounted = true;
    const fetchApiData = async () => {
      try {
        const [ratesRes, addonsRes, datesRes] = await Promise.all([
          api.get('/cleaning/rates/?brand=gopropertycare').catch(() => null),
          api.get('/cleaning/addons/?brand=gopropertycare').catch(() => null),
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
          const firstAvailable = datesRes.data.find((d) => d.available);
          if (firstAvailable) {
            setSelectedDate(firstAvailable.date);
          }
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
  const rawBase = sqft * (Number(activeRate?.rate_per_sqft) || 0.125);
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

  const isDayAvailable = (day: number) => {
    const y = viewMonthDate.getFullYear();
    const m = String(viewMonthDate.getMonth() + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;
    const match = availableDates.find((item) => item.date === dateStr);
    if (match) return match.available;

    const minDateStr = isSameDayAllowed() ? getTodayDateStr() : getTomorrowDateStr();
    return dateStr >= minDateStr;
  };

  const handleDateSelect = (day: number) => {
    const y = viewMonthDate.getFullYear();
    const m = String(viewMonthDate.getMonth() + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;

    const minDateStr = isSameDayAllowed() ? getTodayDateStr() : getTomorrowDateStr();
    if (dateStr < minDateStr) {
      return;
    }
    setSelectedDate(dateStr);

    if (dateStr === getTodayDateStr()) {
      if (!isTimeSlotValidForToday(selectedTimeSlot)) {
        const firstValid = TIME_SLOTS.find((s) => isTimeSlotValidForToday(s));
        if (firstValid) {
          setSelectedTimeSlot(firstValid);
        }
      }
    }
  };

  const isDateToday = selectedDate === getTodayDateStr();

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
      brand: 'gopropertycare',
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
      bedrooms: bedrooms,
      bathrooms: bathrooms,
      is_occupied: isOccupied,
      entry_method: entryMethod,
      entry_notes: entryNotes.trim(),
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
      <div className="max-w-2xl mx-auto py-8 sm:py-12 px-4 animate-fade-in-up">
        <Card className="p-6 sm:p-10 text-center border-emerald-200/90 shadow-xl space-y-6">
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
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 text-left text-xs sm:text-sm space-y-3">
            <div className="flex justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-semibold">{t('schedule.orderNumber')}</span>
              <span className="font-black text-emerald-800">GPC-#{createdOrderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">{t('schedule.step1')}</span>
              <span className="font-bold text-slate-900">
                {t(`home.pricing.${activeRate.service_type}.name`, { defaultValue: activeRate.name })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Dimensions</span>
              <span className="font-bold text-slate-900">
                {sqft} sq ft • {bedrooms === 0 ? 'Studio' : `${bedrooms} Beds`}, {bathrooms} Baths
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Scheduled Visit</span>
              <span className="font-bold text-slate-900">{selectedDate} @ {selectedTimeSlot}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Address</span>
              <span className="font-bold text-slate-900 text-right">{formData.street_address}, {selectedLocation.name}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-200">
              <span className="text-slate-900 font-extrabold text-sm sm:text-base">Total</span>
              <span className="font-black text-emerald-700 text-base sm:text-lg">${totalPrice.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1 hover:scale-102 active:scale-98 transition-all"
              onClick={() => navigate('/')}
            >
              {t('schedule.backHome')}
            </Button>
            <Button
              variant="primary"
              className="flex-1 font-bold hover:scale-102 active:scale-98 transition-all"
              onClick={() => navigate('/dashboard')}
            >
              {t('schedule.viewDashboard')}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8 px-4 space-y-6 sm:space-y-8 animate-fade-in">
      {/* Header & Steps Indicator */}
      <div className="text-center space-y-3">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight animate-fade-in-up">
          {t('schedule.title')}
        </h1>
        <p className="text-xs sm:text-sm lg:text-base text-slate-600 font-medium animate-fade-in-up delay-75">
          {t('schedule.subtitle')}
        </p>

        {/* Steps Bar with Animated Track */}
        <div className="relative max-w-xl mx-auto pt-3">
          <div className="absolute top-[28px] left-[12%] right-[12%] h-1 bg-slate-200 rounded-full -z-0">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            />
          </div>
          <div className="grid grid-cols-4 gap-1 sm:gap-4 relative z-10">
            {[1, 2, 3, 4].map((s) => {
              const isCompleted = step > s;
              const isCurrent = step === s;
              return (
                <div key={s} className="flex flex-col items-center gap-1">
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                      isCurrent
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 ring-4 ring-emerald-500/20 scale-105'
                        : isCompleted
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-white border border-slate-200 text-slate-400'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-pop-in" /> : s}
                  </div>
                  <span
                    className={`text-[11px] sm:text-xs font-bold truncate max-w-[70px] sm:max-w-none transition-colors duration-300 ${
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

      {/* STEP 1: Size, Service & Property Details */}
      {step === 1 && (
        <Card key="step-1" className="p-5 sm:p-8 space-y-6 sm:space-y-8 animate-fade-in-up">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
              {t('schedule.step1Title')}
            </h2>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              {t('schedule.sqftHelp')}
            </p>
          </div>

          {/* Sq Ft Controls */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label htmlFor={sqftSliderId} className="block text-sm font-extrabold text-slate-900">
                  {t('schedule.sqftLabel')}
                </label>
                <span className="text-xs text-slate-500 font-medium">
                  {t('schedule.sqftHelp')}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-xl px-3.5 py-1.5 shadow-2xs self-start sm:self-auto">
                <input
                  id="schedule-sqft-number-input"
                  aria-label={t('schedule.sqftLabel')}
                  type="number"
                  min={100}
                  max={8000}
                  step={50}
                  value={sqft}
                  onChange={(e) => setSqft(Math.max(100, Number(e.target.value) || 100))}
                  className="w-20 text-right font-black text-emerald-700 text-lg focus:outline-none"
                />
                <span className="text-slate-600 font-bold text-xs sm:text-sm">sq ft</span>
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

            <div className="flex justify-between text-[11px] sm:text-xs text-slate-500 font-semibold">
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

          {/* Service Tiers Grid */}
          <div className="space-y-3">
            <label className="block text-sm font-extrabold text-slate-900">
              {t('schedule.selectTier')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {rates.map((rate) => {
                const isSelected = selectedRateId === rate.id;
                const estPrice = Math.max(sqft * Number(rate.rate_per_sqft), Number(rate.min_order_amount));
                const localizedName = t(`home.pricing.${rate.service_type}.name`, { defaultValue: rate.name });
                const localizedDesc = t(`home.pricing.${rate.service_type}.description`, { defaultValue: rate.description });

                return (
                  <div
                    key={rate.id}
                    onClick={() => setSelectedRateId(rate.id)}
                    className={`p-4 sm:p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-md active:scale-99 ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-2 ring-emerald-600/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-2.5 py-0.5 rounded-md">
                          ${rate.rate_per_sqft} / sq ft
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
                      <h3 className="font-black text-slate-900 text-sm sm:text-base leading-snug">
                        {localizedName}
                      </h3>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed line-clamp-2">
                        {localizedDesc}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] sm:text-xs text-slate-500 font-semibold">Estimated Base</span>
                      <span className="text-base sm:text-lg font-black text-slate-900">
                        ${estPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Consultative Details (Bedrooms, Bathrooms, Occupancy) */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Home className="w-4 h-4 text-emerald-600" />
              <span>{t('schedule.propertyDetailsTitle')}</span>
              <span className="text-[10px] text-slate-400 font-normal uppercase tracking-wider">(Inquiry details - no extra charge)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Bedrooms */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Bed className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t('schedule.bedroomsLabel')}</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[0, 1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setBedrooms(num)}
                      className={`flex-1 min-w-[38px] py-1.5 px-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                        bedrooms === num
                          ? 'border-emerald-600 bg-emerald-600 text-white shadow-2xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      {num === 0 ? 'Studio' : num === 5 ? '5+' : num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bathrooms */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Bath className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t('schedule.bathroomsLabel')}</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[1, 1.5, 2, 2.5, 3, 3.5, 4].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setBathrooms(num)}
                      className={`flex-1 min-w-[34px] py-1.5 px-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                        bathrooms === num
                          ? 'border-emerald-600 bg-emerald-600 text-white shadow-2xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      {num === 4 ? '4+' : num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Occupancy Status */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <DoorOpen className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t('schedule.occupancyLabel')}</span>
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsOccupied(true)}
                    className={`py-1.5 px-2.5 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer ${
                      isOccupied
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-black ring-1 ring-emerald-500/30'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    🏠 {t('schedule.occupied')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOccupied(false)}
                    className={`py-1.5 px-2.5 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer ${
                      !isOccupied
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-black ring-1 ring-emerald-500/30'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    📦 {t('schedule.vacant')}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Next Button */}
          <div className="flex justify-end pt-4 border-t border-slate-100">
            <Button size="lg" onClick={() => setStep(2)} className="w-full sm:w-auto hover:scale-102 active:scale-98 transition-all duration-200 shadow-sm">
              <span>{t('schedule.step2')}</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 2: Date & Arrival Time */}
      {step === 2 && (
        <Card key="step-2" className="p-5 sm:p-8 space-y-6 sm:space-y-8 animate-fade-in-up">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
              {t('schedule.step2Title')}
            </h2>
            {sameDayAvailable ? (
              <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                <span>{t('schedule.sameDayNotice')}</span>
              </div>
            ) : (
              <p className="text-xs text-slate-600 font-medium mt-1">
                {t('schedule.futureDateNotice')}
              </p>
            )}
          </div>

          {/* Month Navigation & Calendar */}
          <div className="max-w-md mx-auto bg-white border-2 border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="font-black text-slate-900 capitalize text-sm sm:text-base flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-emerald-600" />
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
                  aria-label="Previous Month"
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
                  aria-label="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                <div key={d} className="font-black text-slate-600 py-1 text-[11px]">
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
                const isTodayDate = dateStr === getTodayDateStr();

                return (
                  <button
                    key={dateStr}
                    type="button"
                    disabled={!available}
                    onClick={() => handleDateSelect(day)}
                    className={`py-2 rounded-xl font-bold transition-all duration-150 text-xs cursor-pointer relative ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-xs font-black scale-105 animate-pop-in ring-2 ring-emerald-600/30'
                        : available
                        ? 'hover:bg-emerald-50 text-slate-900 hover:scale-105 active:scale-95'
                        : 'text-slate-300 cursor-not-allowed'
                    }`}
                  >
                    <span>{day}</span>
                    {isTodayDate && (
                      <span className="block text-[8px] font-black leading-none text-emerald-600 uppercase mt-0.5">
                        Today
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Picker */}
          <div className="space-y-3 max-w-lg mx-auto">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>{t('schedule.timeSlotLabel')}</span>
              </label>
              {isDateToday && (
                <span className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md font-bold">
                  Min. 3h notice required
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {TIME_SLOTS.map((slot) => {
                const isSelected = selectedTimeSlot === slot;
                const isValidForToday = !isDateToday || isTimeSlotValidForToday(slot);

                return (
                  <button
                    key={slot}
                    type="button"
                    disabled={!isValidForToday}
                    onClick={() => setSelectedTimeSlot(slot)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? 'border-2 border-emerald-600 bg-emerald-600 text-white shadow-xs font-black ring-2 ring-emerald-600/30 scale-102'
                        : isValidForToday
                        ? 'border border-slate-200 bg-white hover:border-slate-300 hover:bg-emerald-50/50 text-slate-800'
                        : 'border border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
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

      {/* STEP 3: Location, Access & Extras */}
      {step === 3 && (
        <Card key="step-3" className="p-5 sm:p-8 space-y-6 sm:space-y-8 animate-fade-in-up">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
              {t('schedule.step3Title')}
            </h2>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              Specify your property address, access method, and any deep cleaning add-ons.
            </p>
          </div>

          {/* Location / Zone Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-extrabold text-slate-900">
              {t('schedule.citySelect')}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {DENVER_LOCATIONS.map((loc) => {
                const isSelected = selectedLocation.name === loc.name;
                return (
                  <button
                    key={loc.name}
                    type="button"
                    onClick={() => setSelectedLocation(loc)}
                    className={`p-2.5 rounded-xl border-2 text-left text-xs font-bold transition-all duration-150 flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 shadow-xs ring-2 ring-emerald-600/20'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
                    }`}
                  >
                    <span className="font-extrabold text-slate-900 text-xs truncate">{loc.name}</span>
                    <span
                      className={`text-[10px] mt-1 self-start px-1.5 py-0.5 rounded-md font-extrabold ${
                        loc.zone === 'inner'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {loc.zone === 'inner' ? 'Free Travel' : '+$25'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Address and Contact Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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

          {/* Access / Entry Method Section */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div>
              <label className="block text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-emerald-600" />
                <span>{t('schedule.accessTitle')}</span>
              </label>
              <p className="text-xs text-slate-600 font-medium">
                {t('schedule.accessSubtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {[
                { id: 'someone_home', icon: UserCheck, label: t('schedule.entry_someone_home') },
                { id: 'keypad', icon: Lock, label: t('schedule.entry_keypad') },
                { id: 'lockbox', icon: Key, label: t('schedule.entry_lockbox') },
                { id: 'unlocked', icon: DoorOpen, label: t('schedule.entry_unlocked') },
                { id: 'other', icon: KeyRound, label: t('schedule.entry_other') },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = entryMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setEntryMethod(m.id)}
                    className={`p-3 rounded-xl border-2 text-left text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-black ring-1 ring-emerald-500/20'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-emerald-700' : 'text-slate-400'}`} />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Access Notes */}
            <div className="space-y-1 pt-1">
              <label className="block text-xs font-bold text-slate-700">
                {t('schedule.accessNotesLabel')}
              </label>
              <input
                type="text"
                value={entryNotes}
                onChange={(e) => setEntryNotes(e.target.value)}
                placeholder={t('schedule.accessNotesPlaceholder')}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10 shadow-2xs font-medium"
              />
            </div>
          </div>

          {/* Priced Add-ons (Strictly 4) */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div>
              <label className="block text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>{t('schedule.addonsTitle')}</span>
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
                    className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer flex items-start gap-3 hover:-translate-y-0.5 hover:shadow-xs active:scale-99 ${
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
                        <span className="font-black text-slate-900 text-xs sm:text-sm">{localizedName}</span>
                        <span className="font-black text-emerald-700 text-xs sm:text-sm">+${Number(addon.price).toFixed(2)}</span>
                      </div>
                      <p className="text-slate-600 text-[11px] sm:text-xs font-medium mt-0.5 leading-relaxed">{localizedDesc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Special Instructions */}
          <div className="space-y-1.5 pt-2">
            <label className="block text-xs font-bold text-slate-700">
              {t('schedule.specialInstructions')}
            </label>
            <textarea
              rows={2}
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. Friendly dog in laundry room, please focus on kitchen grout..."
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10 shadow-2xs font-medium"
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
        <Card key="step-4" className="p-5 sm:p-8 space-y-6 sm:space-y-8 animate-fade-in-up">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Service & Schedule */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-2.5 text-xs">
              <h3 className="font-black text-slate-900 text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2">
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
                <span className="text-slate-600 font-semibold">Dimensions:</span>
                <span className="font-bold text-slate-900">
                  {sqft} sq ft • {bedrooms === 0 ? 'Studio' : `${bedrooms} Beds`}, {bathrooms} Baths
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-semibold">Occupancy:</span>
                <span className="font-bold text-slate-900">
                  {isOccupied ? t('schedule.occupied') : t('schedule.vacant')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-semibold">Scheduled Date:</span>
                <span className="font-bold text-slate-900">{selectedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-semibold">Arrival Time:</span>
                <span className="font-bold text-slate-900">{selectedTimeSlot}</span>
              </div>
            </div>

            {/* Address, Contact & Access */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-2.5 text-xs">
              <h3 className="font-black text-slate-900 text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Location & Access</span>
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
                <span className="text-slate-600 font-semibold">Address:</span>
                <span className="font-bold text-slate-900 text-right">{formData.street_address}, {selectedLocation.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-semibold">Access:</span>
                <span className="font-bold text-slate-900">
                  {entryMethod === 'someone_home'
                    ? t('schedule.entry_someone_home')
                    : entryMethod === 'keypad'
                    ? t('schedule.entry_keypad')
                    : entryMethod === 'lockbox'
                    ? t('schedule.entry_lockbox')
                    : entryMethod === 'unlocked'
                    ? t('schedule.entry_unlocked')
                    : t('schedule.entry_other')}
                </span>
              </div>
              {entryNotes && (
                <div className="flex justify-between">
                  <span className="text-slate-600 font-semibold">Access Note:</span>
                  <span className="font-medium text-slate-900 text-right max-w-[200px] truncate">{entryNotes}</span>
                </div>
              )}
            </div>
          </div>

          {/* Pricing Breakdown Card */}
          <div className="bg-white border-2 border-emerald-200/90 rounded-2xl p-4 sm:p-6 space-y-3 shadow-2xs">
            <h3 className="font-black text-emerald-950 text-xs sm:text-sm uppercase tracking-wider">
              Cost Breakdown
            </h3>
            <div className="flex justify-between text-slate-700 text-xs font-medium">
              <span>{t('schedule.basePrice')} ({sqft} sqft @ ${activeRate.rate_per_sqft}/sqft):</span>
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
              <span className="font-black text-slate-900 text-sm sm:text-base">{t('schedule.totalDue')}:</span>
              <span className="font-black text-xl sm:text-2xl text-emerald-700">${totalPrice.toFixed(2)}</span>
            </div>
          </div>

          {/* Terms Agreement Checkbox */}
          <div className="flex items-start gap-3 bg-white p-3.5 border border-slate-200 rounded-xl shadow-2xs">
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
              className="font-black text-sm sm:text-base shadow-md hover:shadow-lg hover:scale-102 active:scale-98 transition-all duration-200"
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
