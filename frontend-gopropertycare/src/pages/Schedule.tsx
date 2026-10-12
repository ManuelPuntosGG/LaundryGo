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
  ChevronDown,
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
  Tag,
  Send,
  Building2,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthContext } from '@/providers/AuthProvider';
import api from '@/api';
import type { CleaningServiceRate, CleaningAddon, CleaningAvailableDate } from '@/types';
import { DEFAULT_CLEANING_RATES } from '@/constants/cleaningServices';
import { PROPERTY_ADDONS } from '@/constants/cleaningAddons';
import { SERVICE_AREAS } from '@/constants/locations';
import {
  PRICING_TIERS,
  SERVICE_FREQUENCIES,
  getTierBySqft,
  getTierPrice,
  type PricingTier,
  type ServiceFrequency,
  type CleaningServiceTierType,
} from '@/constants/pricingTiers';

type Step = 1 | 2 | 3 | 4;

const ADDON_ICONS: Record<string, string> = {
  oven: '🔍',
  inside_fridge: '🧊',
  blinds: '🪟',
  inside_windows: '🖼️',
};

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

const formatTimeTo12Hour = (time24: string): string => {
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr || '0', 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
};

const parseTo24Hour = (time12: string): string => {
  const match = time12.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return '09:00';
  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const ampm = match[3].toUpperCase();
  if (ampm === 'PM' && h < 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

const isTimeSlotValidForToday = (timeStr: string): boolean => {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return false;
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
  const tierSelectId = useId();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthContext();

  const [step, setStep] = useState<Step>(1);
  const [rates, setRates] = useState<CleaningServiceRate[]>(DEFAULT_CLEANING_RATES);
  const [addons, setAddons] = useState<CleaningAddon[]>(PROPERTY_ADDONS);
  const [availableDates, setAvailableDates] = useState<CleaningAvailableDate[]>(() => getFallbackDates(60));

  // Step 1: Tier-Based Sizing, Service Type & Frequency
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>(PRICING_TIERS);
  const [selectedTier, setSelectedTier] = useState<PricingTier>(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const sqftParam = searchParams.get('sqft');
    if (sqftParam) {
      const parsed = parseInt(sqftParam, 10);
      if (!isNaN(parsed) && parsed >= 100) return getTierBySqft(parsed);
    }
    return PRICING_TIERS[1]; // Default Tier 2 (1,000 - 1,299 sq ft)
  });

  const [serviceType, setServiceType] = useState<CleaningServiceTierType>(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const tierParam = searchParams.get('tier');
    if (tierParam === 'move_in_out' || tierParam === 'deep') return 'deep';
    if (tierParam === 'str_on_site') return 'str_on_site';
    if (tierParam === 'str_off_site') return 'str_off_site';
    return 'standard';
  });

  const [frequency, setFrequency] = useState<ServiceFrequency>('biweekly'); // Default "Most Popular"

  // Consultative Details (no charge)
  const [bedrooms, setBedrooms] = useState<number>(2);
  const [bathrooms, setBathrooms] = useState<number>(2);
  const isOccupied = true;

  // Custom Quote Lead Capture (for Tier 19 > 6,100 sq ft)
  const [customQuoteSqft, setCustomQuoteSqft] = useState<string>('6500');
  const [customQuoteNotes, setCustomQuoteNotes] = useState<string>('');
  const [isSubmittingCustomQuote, setIsSubmittingCustomQuote] = useState(false);
  const [customQuoteSubmitted, setCustomQuoteSubmitted] = useState(false);

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
    city: user?.city || 'Denver',
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
        const userCity = user.city || 'Denver';

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
        const [ratesRes, addonsRes, datesRes, tiersRes] = await Promise.all([
          api.get('/cleaning/rates/?brand=gopropertycare').catch(() => null),
          api.get('/cleaning/addons/?brand=gopropertycare').catch(() => null),
          api.get('/cleaning/schedule/available-dates/').catch(() => null),
          api.get('/cleaning/tiers/?brand=gopropertycare').catch(() => null),
        ]);

        if (!isMounted) return;

        if (ratesRes?.data) {
          const list: CleaningServiceRate[] = Array.isArray(ratesRes.data)
            ? ratesRes.data
            : (ratesRes.data as { results?: CleaningServiceRate[] })?.results || [];
          if (list.length > 0) {
            setRates(list);
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

        if (tiersRes?.data && Array.isArray(tiersRes.data) && tiersRes.data.length > 0) {
          interface BackendTier {
            tier_number: number;
            label: string;
            min_sqft: number;
            max_sqft: number;
            standard_price: number | string;
            deep_price: number | string;
            str_on_site_price: number | string;
            str_off_site_price: number | string;
            is_custom_quote: boolean;
          }
          const mapped: PricingTier[] = (tiersRes.data as BackendTier[]).map((t) => ({
            tier: t.tier_number,
            label: t.label,
            minSqft: t.min_sqft,
            maxSqft: t.max_sqft,
            standardPrice: Number(t.standard_price),
            deepPrice: Number(t.deep_price),
            strOnSitePrice: Number(t.str_on_site_price),
            strOffSitePrice: Number(t.str_off_site_price),
            sqftEquivalent: t.label,
            propertyHint: t.label,
            isCustomQuote: t.is_custom_quote,
          }));
          setPricingTiers(mapped);
          setSelectedTier((prev) => mapped.find((m) => m.tier === prev.tier) || prev);
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

  // Determine active service rate for backend mapping
  const activeRate =
    rates.find((r) => {
      if (serviceType === 'str_on_site') return r.service_type === 'str_on_site';
      if (serviceType === 'str_off_site') return r.service_type === 'str_off_site';
      if (serviceType === 'deep') return r.service_type === 'move_in_out' || r.service_type === 'deep';
      return r.service_type === 'residential' || r.service_type === 'regular';
    }) || rates[0];

  // Pricing calculations based on Tier matrix & recurring frequency discounts
  const isCustomQuote = selectedTier.isCustomQuote === true;
  const baseTierPrice = getTierPrice(selectedTier, serviceType);

  const freqOption =
    SERVICE_FREQUENCIES.find((f) => f.id === frequency) || SERVICE_FREQUENCIES[0];
  const discountPercent = freqOption.discountPercent;
  const frequencyDiscount = Math.round(((baseTierPrice * discountPercent) / 100) * 100) / 100;
  const discountedBasePrice = Math.max(0, baseTierPrice - frequencyDiscount);

  const addonsTotal = addons.reduce((sum, item) => {
    if (selectedAddonCodes[item.code]) {
      return sum + Number(item.price);
    }
    return sum;
  }, 0);

  const totalPrice = discountedBasePrice + addonsTotal;

  const representativeSqft = isCustomQuote
    ? parseInt(customQuoteSqft, 10) || 6500
    : Math.round((selectedTier.minSqft + selectedTier.maxSqft) / 2);

  // Validation
  const isFirstNameValid = formData.first_name.trim().length >= 2;
  const isLastNameValid = formData.last_name.trim().length >= 2;
  const isPhoneValid = formData.phone.replace(/\D/g, '').length >= 10;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim());
  const isAddressValid = formData.street_address.trim().length >= 5;
  const isCityValid = formData.city.trim().length >= 2;
  const isZipValid = /^\d{5}/.test(formData.zip_code.trim());

  const canProceedFromStep3 =
    isFirstNameValid &&
    isLastNameValid &&
    isPhoneValid &&
    isEmailValid &&
    isAddressValid &&
    isCityValid &&
    isZipValid;

  // Calendar Helpers
  const calendarLocale = i18n.language?.startsWith('es') ? 'es' : 'en';
  const currentMonthYearStr = viewMonthDate.toLocaleString(calendarLocale, { month: 'long', year: 'numeric' });

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
  const canProceedFromStep2 = Boolean(
    selectedDate &&
    selectedTimeSlot &&
    (!isDateToday || isTimeSlotValidForToday(selectedTimeSlot))
  );

  // Submit standard booking
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

    const formattedInstructions = `[Tier ${selectedTier.tier}: ${selectedTier.label} • ${t(freqOption.nameKey)} (${freqOption.badge})] ${specialInstructions}`.trim();

    const payload = {
      brand: 'gopropertycare',
      guest_email: formData.email.trim(),
      guest_first_name: formData.first_name.trim(),
      guest_last_name: formData.last_name.trim(),
      guest_phone: formData.phone.trim(),
      street_address: formData.street_address.trim(),
      city: formData.city.trim() || 'Denver',
      zip_code: formData.zip_code.trim(),
      delivery_zone: 'inner' as const,
      service_rate_id: activeRate.id,
      square_feet: representativeSqft,
      frequency: frequency,
      bedrooms: bedrooms,
      bathrooms: bathrooms,
      is_occupied: isOccupied,
      entry_method: entryMethod,
      entry_notes: entryNotes.trim(),
      selected_addons: selectedAddonsPayload,
      service_date: selectedDate,
      time_slot: selectedTimeSlot,
      special_instructions: formattedInstructions,
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

  // Submit custom quote lead capture (> 6,100 sq ft)
  const handleCustomQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFirstNameValid || !isPhoneValid || !isEmailValid) {
      setTouchedFields({ first_name: true, phone: true, email: true });
      return;
    }
    setIsSubmittingCustomQuote(true);
    setErrorMessage('');

    const parsedSqft = parseInt(customQuoteSqft, 10) || 6500;
    const notes = `[CUSTOM QUOTE LEAD > 6,100 SQ FT • Stated Size: ${parsedSqft} sq ft] ${customQuoteNotes}`.trim();

    const payload = {
      brand: 'gopropertycare',
      guest_email: formData.email.trim(),
      guest_first_name: formData.first_name.trim(),
      guest_last_name: formData.last_name.trim() || 'Property Owner',
      guest_phone: formData.phone.trim(),
      street_address: formData.street_address.trim() || 'Denver Metropolitan Area',
      city: formData.city.trim() || 'Denver',
      zip_code: formData.zip_code.trim() || '80202',
      delivery_zone: 'inner' as const,
      service_rate_id: activeRate.id,
      square_feet: parsedSqft,
      frequency: frequency,
      bedrooms: bedrooms,
      bathrooms: bathrooms,
      is_occupied: isOccupied,
      entry_method: 'someone_home',
      entry_notes: 'Custom Quote Inquiry',
      selected_addons: [],
      service_date: selectedDate,
      time_slot: selectedTimeSlot,
      special_instructions: notes,
      language: i18n.language?.startsWith('es') ? 'es' : 'en',
    };

    try {
      const response = await api.post('/cleaning/orders/', payload);
      setCreatedOrderId(response.data.id);
      setCustomQuoteSubmitted(true);
      setIsSuccess(true);
    } catch (err: unknown) {
      console.error('Failed to submit custom quote lead:', err);
      setErrorMessage(t('common.error'));
    } finally {
      setIsSubmittingCustomQuote(false);
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
              {customQuoteSubmitted
                ? (i18n.language?.startsWith('es') ? '¡Solicitud de Cotización Recibida!' : 'Custom Quote Request Received!')
                : t('schedule.successTitle')}
            </h1>
            <p className="text-sm sm:text-base text-slate-600 font-medium">
              {customQuoteSubmitted
                ? t('schedule.customQuoteSuccess')
                : t('schedule.successSubtitle')}
            </p>
          </div>

          {/* Details Card */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 text-left text-xs sm:text-sm space-y-3">
            <div className="flex justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-semibold">{t('schedule.orderNumber')}</span>
              <span className="font-black text-emerald-800">GPC-#{createdOrderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">{t('schedule.serviceTypeLabel')}</span>
              <span className="font-bold text-slate-900">
                {serviceType === 'standard' && t('schedule.serviceStandard')}
                {serviceType === 'deep' && t('schedule.serviceDeep')}
                {serviceType === 'str_on_site' && t('schedule.serviceStrOnSite')}
                {serviceType === 'str_off_site' && t('schedule.serviceStrOffSite')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">{t('schedule.dimensions')}</span>
              <span className="font-bold text-slate-900">
                {selectedTier.label}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">{t('schedule.frequencyTitle')}</span>
              <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                {t(freqOption.nameKey)} ({freqOption.badge})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">{t('schedule.scheduledVisit')}</span>
              <span className="font-bold text-slate-900">{selectedDate} @ {selectedTimeSlot}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">{t('schedule.addressLabel')}</span>
              <span className="font-bold text-slate-900 text-right">
                {formData.street_address ? `${formData.street_address}, ` : ''}{formData.city || 'Denver'}
              </span>
            </div>
            {!customQuoteSubmitted && (
              <div className="flex justify-between pt-2 border-t border-slate-200">
                <span className="text-slate-900 font-extrabold text-sm sm:text-base">{t('schedule.total')}</span>
                <span className="font-black text-emerald-700 text-base sm:text-lg">${totalPrice.toFixed(2)}</span>
              </div>
            )}
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
    <div className="max-w-4xl mx-auto py-3 sm:py-8 px-3.5 sm:px-6 lg:px-8 space-y-5 sm:space-y-8 animate-fade-in">
      {/* Header & Steps Indicator */}
      <div className="text-center space-y-2.5 sm:space-y-3">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight animate-fade-in-up">
          {t('schedule.title')}
        </h1>
        <p className="text-xs sm:text-sm lg:text-base text-slate-600 font-medium animate-fade-in-up delay-75">
          {t('schedule.subtitle')}
        </p>

        {/* Steps Bar with Animated Track */}
        <div className="relative max-w-xl mx-auto pt-2 sm:pt-3">
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
                <div key={s} className="flex flex-col items-center gap-1 min-w-0">
                  <button
                    type="button"
                    disabled={!isCompleted && !isCurrent}
                    onClick={() => {
                      if (isCompleted) {
                        setStep(s as Step);
                      }
                    }}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center font-bold text-xs transition-all duration-300 shrink-0 ${
                      isCurrent
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 ring-4 ring-emerald-500/20 scale-105 cursor-default'
                        : isCompleted
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 hover:scale-105 cursor-pointer active:scale-95'
                        : 'bg-white border border-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                    aria-label={`Step ${s}`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-pop-in" /> : s}
                  </button>
                  <span
                    className={`text-[10px] sm:text-xs font-bold w-full text-center truncate transition-colors duration-300 ${
                      isCurrent ? 'text-emerald-800' : isCompleted ? 'text-slate-700' : 'text-slate-400'
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

      {/* STEP 1: Tier Dropdown, Service Type, Frequency & Property Consult */}
      {step === 1 && (
        <Card key="step-1" className="p-4 sm:p-8 space-y-6 animate-fade-in-up">
          <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                {t('schedule.step1Title')}
              </h2>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                {t('schedule.tierDropdownHelp')}
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-800 text-xs font-bold self-start sm:self-auto">
              <Tag className="w-3.5 h-3.5 text-emerald-600" />
              <span>{i18n.language?.startsWith('es') ? 'Tarifas Claras y Transparentes' : 'Transparent Upfront Pricing'}</span>
            </div>
          </div>

          {/* Size Selection Dropdown */}
          <div className="bg-slate-50 border-2 border-slate-200/90 rounded-2xl p-4 sm:p-6 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <label htmlFor={tierSelectId} className="block text-sm font-extrabold text-slate-900">
                {t('schedule.tierDropdownLabel')}
              </label>
              <span className="text-xs text-emerald-800 bg-white border border-emerald-200 px-2.5 py-0.5 rounded-md font-bold self-start sm:self-auto shadow-2xs">
                {isCustomQuote
                  ? (i18n.language?.startsWith('es') ? 'Cotización Especial' : 'Custom Quote')
                  : selectedTier.label}
              </span>
            </div>

            <div className="relative">
              <select
                id={tierSelectId}
                value={selectedTier.tier}
                onChange={(e) => {
                  const tNum = Number(e.target.value);
                  const found = pricingTiers.find((t) => t.tier === tNum);
                  if (found) setSelectedTier(found);
                }}
                className="w-full bg-white border-2 border-slate-300 rounded-xl px-4 py-3.5 text-xs sm:text-sm font-black text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/15 shadow-2xs appearance-none cursor-pointer pr-10 hover:border-slate-400 transition-all"
              >
                {pricingTiers.map((tier) => (
                  <option key={tier.tier} value={tier.tier}>
                    {tier.isCustomQuote
                      ? (i18n.language?.startsWith('es')
                          ? '6,100+ sq ft — Cotización Personalizada a Medida'
                          : '6,100+ sq ft — Custom Quote & Tailored Proposal')
                      : tier.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
              {i18n.language?.startsWith('es')
                ? 'Tarifas fijas e integrales según las dimensiones de tu inmueble. Sin costos ocultos ni cobros sorpresa por hora.'
                : 'Upfront, all-inclusive pricing based on your property size. No hidden fees or surprise hourly billing.'}
            </p>
          </div>

          {/* If Tier 19 (> 6,100 sq ft) is selected: Render Lead Capture Form */}
          {isCustomQuote ? (
            <div className="bg-linear-to-b from-emerald-50/60 to-white border-2 border-emerald-300 rounded-2xl p-5 sm:p-7 space-y-5 animate-fade-in">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 shadow-inner">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    {t('schedule.customQuoteTitle')}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
                    {t('schedule.customQuoteDesc')}
                  </p>
                </div>
              </div>

              <form onSubmit={handleCustomQuoteSubmit} className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <Input
                    label={`${t('auth.firstName')} *`}
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    onBlur={() => setTouchedFields({ ...touchedFields, first_name: true })}
                    error={touchedFields.first_name && !isFirstNameValid ? t('schedule.errFirstName') : ''}
                    placeholder={t('auth.firstName')}
                    required
                  />
                  <Input
                    label={t('auth.lastName')}
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    placeholder={t('auth.lastName')}
                  />
                  <Input
                    label={`${t('auth.phone')} *`}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    onBlur={() => setTouchedFields({ ...touchedFields, phone: true })}
                    error={touchedFields.phone && !isPhoneValid ? t('schedule.errPhone') : ''}
                    placeholder={t('schedule.phonePlaceholder')}
                    required
                  />
                  <Input
                    label={`${t('auth.emailLabel')} *`}
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    onBlur={() => setTouchedFields({ ...touchedFields, email: true })}
                    error={touchedFields.email && !isEmailValid ? t('schedule.errEmail') : ''}
                    placeholder={t('schedule.emailPlaceholder')}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label htmlFor="custom-sqft-input" className="block text-xs font-bold text-slate-700 mb-1">
                      {i18n.language?.startsWith('es') ? 'Dimensión Estimada (Sq Ft)' : 'Estimated Square Footage'}
                    </label>
                    <input
                      id="custom-sqft-input"
                      type="number"
                      min={6100}
                      value={customQuoteSqft}
                      onChange={(e) => setCustomQuoteSqft(e.target.value)}
                      placeholder="e.g. 7500"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10 shadow-2xs"
                    />
                  </div>

                  <Input
                    label={`${t('schedule.cityLabel')} *`}
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder={t('schedule.cityPlaceholder')}
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="custom-notes-area" className="block text-xs font-bold text-slate-700">
                    {i18n.language?.startsWith('es') ? 'Detalles de la propiedad o requerimientos especiales' : 'Property details & specific requirements'}
                  </label>
                  <textarea
                    id="custom-notes-area"
                    rows={3}
                    value={customQuoteNotes}
                    onChange={(e) => setCustomQuoteNotes(e.target.value)}
                    placeholder={i18n.language?.startsWith('es') ? 'ej. Mansión histórica con techos abovedados y ventanales...' : 'e.g. 8-bedroom luxury residence, high vaulted ceilings, glass staircase...'}
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10 shadow-2xs font-medium"
                  />
                </div>

                {errorMessage && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2 font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="pt-2 flex justify-end">
                  <Button
                    type="submit"
                    size="md"
                    disabled={isSubmittingCustomQuote}
                    className="w-full sm:w-auto font-black shadow-md hover:scale-102 active:scale-98 transition-all"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    <span>{isSubmittingCustomQuote ? t('schedule.submitting') : t('schedule.requestCustomQuote')}</span>
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <>
              {/* Service Type Selection Cards (4 services: Standard, Deep, STR On-Site, STR Off-Site) */}
              <div className="space-y-3">
                <label className="block text-sm font-extrabold text-slate-900">
                  {t('schedule.serviceTypeLabel')}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Standard Clean */}
                  <div
                    onClick={() => setServiceType('standard')}
                    className={`p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between hover:border-emerald-500 hover:shadow-xs active:scale-99 ${
                      serviceType === 'standard'
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-xs ring-2 ring-emerald-600/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <h3 className="font-black text-slate-900 text-sm sm:text-base">
                          {t('schedule.serviceStandard')}
                        </h3>
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            serviceType === 'standard'
                              ? 'border-emerald-600 bg-emerald-600 text-white'
                              : 'border-slate-300'
                          }`}
                        >
                          {serviceType === 'standard' && <Check className="w-3.5 h-3.5 animate-pop-in" />}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">
                        {t('schedule.serviceStandardDesc')}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 font-bold">{t('schedule.baseTierPrice')}</span>
                      <span className="text-base sm:text-lg font-black text-slate-900">
                        ${selectedTier.standardPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Deep / Move-In / Move-Out Clean */}
                  <div
                    onClick={() => setServiceType('deep')}
                    className={`p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between hover:border-emerald-500 hover:shadow-xs active:scale-99 ${
                      serviceType === 'deep'
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-xs ring-2 ring-emerald-600/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <h3 className="font-black text-slate-900 text-sm sm:text-base">
                          {t('schedule.serviceDeep')}
                        </h3>
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            serviceType === 'deep'
                              ? 'border-emerald-600 bg-emerald-600 text-white'
                              : 'border-slate-300'
                          }`}
                        >
                          {serviceType === 'deep' && <Check className="w-3.5 h-3.5 animate-pop-in" />}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">
                        {t('schedule.serviceDeepDesc')}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 font-bold">{t('schedule.baseTierPrice')}</span>
                      <span className="text-base sm:text-lg font-black text-slate-900">
                        ${selectedTier.deepPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Short Term Rental Clean (On-Site Laundry) */}
                  <div
                    onClick={() => setServiceType('str_on_site')}
                    className={`p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between hover:border-emerald-500 hover:shadow-xs active:scale-99 ${
                      serviceType === 'str_on_site'
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-xs ring-2 ring-emerald-600/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <h3 className="font-black text-slate-900 text-sm sm:text-base">
                          {t('schedule.serviceStrOnSite')}
                        </h3>
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            serviceType === 'str_on_site'
                              ? 'border-emerald-600 bg-emerald-600 text-white'
                              : 'border-slate-300'
                          }`}
                        >
                          {serviceType === 'str_on_site' && <Check className="w-3.5 h-3.5 animate-pop-in" />}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">
                        {t('schedule.serviceStrOnSiteDesc')}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 font-bold">{t('schedule.baseTierPrice')}</span>
                      <span className="text-base sm:text-lg font-black text-slate-900">
                        ${selectedTier.strOnSitePrice.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Short Term Rental Clean (Off-Site Laundry) */}
                  <div
                    onClick={() => setServiceType('str_off_site')}
                    className={`p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between hover:border-emerald-500 hover:shadow-xs active:scale-99 ${
                      serviceType === 'str_off_site'
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-xs ring-2 ring-emerald-600/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <h3 className="font-black text-slate-900 text-sm sm:text-base">
                          {t('schedule.serviceStrOffSite')}
                        </h3>
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            serviceType === 'str_off_site'
                              ? 'border-emerald-600 bg-emerald-600 text-white'
                              : 'border-slate-300'
                          }`}
                        >
                          {serviceType === 'str_off_site' && <Check className="w-3.5 h-3.5 animate-pop-in" />}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">
                        {t('schedule.serviceStrOffSiteDesc')}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 font-bold">{t('schedule.baseTierPrice')}</span>
                      <span className="text-base sm:text-lg font-black text-slate-900">
                        ${selectedTier.strOffSitePrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Frequency Selection Tabs (Weekly 20%, Bi-Weekly 15% Most Popular, Monthly 10%, One-Time) */}
              <div className="space-y-3 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <label className="block text-sm font-extrabold text-slate-900">
                    {t('schedule.frequencyTitle')}
                  </label>
                  <span className="text-xs text-slate-500 font-medium">
                    {t('schedule.frequencySubtitle')}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                  {SERVICE_FREQUENCIES.map((freq) => {
                    const isSelected = frequency === freq.id;
                    const freqDisc = Math.round(((baseTierPrice * freq.discountPercent) / 100) * 100) / 100;
                    const freqNet = baseTierPrice - freqDisc;

                    return (
                      <button
                        key={freq.id}
                        type="button"
                        onClick={() => setFrequency(freq.id)}
                        className={`p-3 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between relative hover:scale-101 active:scale-98 ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/90 shadow-sm ring-2 ring-emerald-600/20'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        {freq.isPopular && (
                          <span className="absolute -top-2.5 right-2 text-[10px] font-black uppercase tracking-wide bg-emerald-600 text-white px-2 py-0.5 rounded-full shadow-2xs">
                            {t('schedule.frequencyPopular')}
                          </span>
                        )}
                        <div>
                          <span
                            className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md inline-block mb-1.5 ${
                              freq.discountPercent > 0
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {freq.badge}
                          </span>
                          <h4 className="font-black text-slate-900 text-xs sm:text-sm leading-snug">
                            {t(freq.nameKey)}
                          </h4>
                        </div>

                        <div className="pt-2 mt-2 border-t border-slate-100/80">
                          <span className="text-xs font-black text-slate-900 block">
                            ${freqNet.toFixed(2)}
                          </span>
                          {freq.discountPercent > 0 && (
                            <span className="text-[10px] text-emerald-700 font-bold block">
                              -{freq.discountPercent}% saved
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Consultative Details (Bedrooms, Bathrooms) */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <Home className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{t('schedule.propertyDetailsTitle')}</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Bedrooms */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Bed className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t('schedule.bedroomsLabel')}</span>
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                      {[0, 1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setBedrooms(num)}
                          className={`min-h-[40px] py-1.5 px-1 rounded-xl text-xs font-black border transition-all cursor-pointer touch-manipulation flex items-center justify-center ${
                            bedrooms === num
                              ? 'border-emerald-600 bg-emerald-600 text-white shadow-2xs'
                              : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          {num === 0 ? t('schedule.studio') : num === 5 ? '5+' : num}
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
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                      {[1, 1.5, 2, 2.5, 3, 3.5, 4].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setBathrooms(num)}
                          className={`min-h-[40px] py-1.5 px-0.5 rounded-xl text-xs font-black border transition-all cursor-pointer touch-manipulation flex items-center justify-center ${
                            bathrooms === num
                              ? 'border-emerald-600 bg-emerald-600 text-white shadow-2xs'
                              : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                          } ${num === 4 ? 'col-span-2 sm:col-span-1' : ''}`}
                        >
                          {num === 4 ? '4+' : num}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 1 Running Summary & Next Button */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 flex items-center justify-between sm:justify-start gap-4">
                  <div>
                    <span className="text-[11px] text-slate-500 font-semibold block">{t('schedule.estimatedBase')}</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg sm:text-xl font-black text-slate-900">
                        ${discountedBasePrice.toFixed(2)}
                      </span>
                      {discountPercent > 0 && (
                        <span className="text-xs text-slate-400 line-through">
                          ${baseTierPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                  {discountPercent > 0 && (
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                      {freqOption.badge}
                    </span>
                  )}
                </div>

                <Button
                  size="md"
                  onClick={() => setStep(2)}
                  className="w-full sm:w-auto min-h-[44px] px-6 text-xs sm:text-sm font-extrabold hover:scale-102 active:scale-98 transition-all duration-200 shadow-sm"
                >
                  <span>{t('schedule.step2')}</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </>
          )}
        </Card>
      )}

      {/* STEP 2: Date & Arrival Time */}
      {step === 2 && (
        <Card key="step-2" className="p-4 sm:p-8 space-y-5 sm:space-y-8 animate-fade-in-up">
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
              {(i18n.language?.startsWith('es')
                ? ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá']
                : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
              ).map((d) => (
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
                        {t('schedule.todayBadge')}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Picker */}
          <div className="space-y-4 max-w-lg mx-auto">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>{t('schedule.timeSlotLabel')}</span>
              </label>
              {isDateToday && (
                <span className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md font-bold">
                  {t('schedule.min3hNotice')}
                </span>
              )}
            </div>

            {/* Custom Time Selector & Validation */}
            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-black text-slate-900 block">{t('schedule.customTime')}</span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {i18n.language?.startsWith('es') ? 'Elige cualquier hora específica de llegada' : 'Choose any specific arrival time'}
                  </span>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <input
                    type="time"
                    value={parseTo24Hour(selectedTimeSlot)}
                    onChange={(e) => {
                      if (e.target.value) {
                        setSelectedTimeSlot(formatTimeTo12Hour(e.target.value));
                      }
                    }}
                    className="bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs sm:text-sm font-black text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 shadow-2xs"
                    aria-label={t('schedule.customTime')}
                  />
                  <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-lg">
                    {selectedTimeSlot}
                  </span>
                </div>
              </div>

              {isDateToday && !isTimeSlotValidForToday(selectedTimeSlot) && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xl flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{t('schedule.noticeMinNotice')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between gap-2.5 sm:gap-4 pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              size="md"
              onClick={() => setStep(1)}
              className="shrink-0 px-3.5 sm:px-5 min-h-[44px] text-xs sm:text-sm hover:scale-102 active:scale-98 transition-all duration-200"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              <span>{t('schedule.back')}</span>
            </Button>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end text-right">
                <span className="text-[10px] text-slate-500 font-bold uppercase">{t('schedule.totalDue')}</span>
                <span className="text-sm font-black text-slate-900">${totalPrice.toFixed(2)}</span>
              </div>
              <Button
                size="md"
                disabled={!canProceedFromStep2}
                onClick={() => setStep(3)}
                className={`flex-1 sm:flex-initial sm:px-6 min-h-[44px] text-xs sm:text-sm font-extrabold hover:scale-102 active:scale-98 transition-all duration-200 shadow-sm ${
                  !canProceedFromStep2 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <span className="truncate">{t('schedule.step3')}</span>
                <ChevronRight className="w-4 h-4 ml-1 shrink-0" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* STEP 3: Location Dropdown (All Free), Address, Access & Extras */}
      {step === 3 && (
        <Card key="step-3" className="p-4 sm:p-8 space-y-5 sm:space-y-8 animate-fade-in-up">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
              {t('schedule.step3Title')}
            </h2>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              {t('schedule.step3Subtitle')}
            </p>
          </div>

          {/* Service Areas */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                {i18n.language?.startsWith('es') ? 'Áreas de Servicio' : 'Service Areas'}
              </h3>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              {SERVICE_AREAS.join(' • ')}
            </p>
          </div>

          {/* Address and Contact Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Input
              label={`${t('schedule.addressLabel')} *`}
              value={formData.street_address}
              onChange={(e) => setFormData({ ...formData, street_address: e.target.value })}
              onBlur={() => setTouchedFields({ ...touchedFields, street_address: true })}
              error={touchedFields.street_address && !isAddressValid ? t('schedule.errAddress') : ''}
              placeholder={t('schedule.addressPlaceholder')}
            />

            <Input
              label={`${t('schedule.cityLabel')} *`}
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              onBlur={() => setTouchedFields({ ...touchedFields, city: true })}
              error={touchedFields.city && !isCityValid ? t('schedule.errCity') : ''}
              placeholder={t('schedule.cityPlaceholder')}
            />

            <Input
              label={`${t('schedule.zipLabel')} *`}
              value={formData.zip_code}
              onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
              onBlur={() => setTouchedFields({ ...touchedFields, zip_code: true })}
              error={touchedFields.zip_code && !isZipValid ? t('schedule.errZip') : ''}
              placeholder={t('schedule.zipPlaceholder')}
            />

            <Input
              label={`${t('auth.firstName')} *`}
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              onBlur={() => setTouchedFields({ ...touchedFields, first_name: true })}
              error={touchedFields.first_name && !isFirstNameValid ? t('schedule.errFirstName') : ''}
              placeholder={t('auth.firstName')}
            />

            <Input
              label={`${t('auth.lastName')} *`}
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              onBlur={() => setTouchedFields({ ...touchedFields, last_name: true })}
              error={touchedFields.last_name && !isLastNameValid ? t('schedule.errLastName') : ''}
              placeholder={t('auth.lastName')}
            />

            <Input
              label={`${t('auth.phone')} *`}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              onBlur={() => setTouchedFields({ ...touchedFields, phone: true })}
              error={touchedFields.phone && !isPhoneValid ? t('schedule.errPhone') : ''}
              placeholder={t('schedule.phonePlaceholder')}
            />

            <Input
              label={`${t('auth.emailLabel')} *`}
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              onBlur={() => setTouchedFields({ ...touchedFields, email: true })}
              error={touchedFields.email && !isEmailValid ? t('schedule.errEmail') : ''}
              placeholder={t('schedule.emailPlaceholder')}
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
              <label htmlFor="schedule-entry-notes-input" className="block text-xs font-bold text-slate-700">
                {t('schedule.accessNotesLabel')}
              </label>
              <input
                id="schedule-entry-notes-input"
                type="text"
                value={entryNotes}
                onChange={(e) => setEntryNotes(e.target.value)}
                placeholder={t('schedule.accessNotesPlaceholder')}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10 shadow-2xs font-medium"
              />
            </div>
          </div>

          {/* Priced Add-ons (Fixed 4 Optional Add-ons as per Spec) */}
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
                        <span className="font-black text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                          <span className="text-sm shrink-0" aria-hidden="true">{ADDON_ICONS[addon.code] || '✨'}</span>
                          <span>{localizedName}</span>
                        </span>
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
            <label htmlFor="schedule-instructions-textarea" className="block text-xs font-bold text-slate-700">
              {t('schedule.specialInstructions')}
            </label>
            <textarea
              id="schedule-instructions-textarea"
              rows={2}
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder={t('schedule.instructionsPlaceholder')}
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10 shadow-2xs font-medium"
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between gap-2.5 sm:gap-4 pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              size="md"
              onClick={() => setStep(2)}
              className="shrink-0 px-3.5 sm:px-5 min-h-[44px] text-xs sm:text-sm hover:scale-102 active:scale-98 transition-all duration-200"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              <span>{t('schedule.back')}</span>
            </Button>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end text-right">
                <span className="text-[10px] text-slate-500 font-bold uppercase">{t('schedule.totalDue')}</span>
                <span className="text-sm font-black text-slate-900">${totalPrice.toFixed(2)}</span>
              </div>
              <Button
                size="md"
                disabled={!canProceedFromStep3}
                onClick={() => setStep(4)}
                className="flex-1 sm:flex-initial sm:px-6 min-h-[44px] text-xs sm:text-sm font-extrabold hover:scale-102 active:scale-98 transition-all duration-200 shadow-sm"
              >
                <span className="truncate">{t('schedule.step4')}</span>
                <ChevronRight className="w-4 h-4 ml-1 shrink-0" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* STEP 4: Review, Sticky Cost Breakdown & Confirm */}
      {step === 4 && (
        <Card key="step-4" className="p-4 sm:p-8 space-y-5 sm:space-y-8 animate-fade-in-up">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
              {t('schedule.step4Title')}
            </h2>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              {t('schedule.step4Subtitle')}
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
                <span>{t('schedule.serviceDetails')}</span>
              </h3>
              <div className="flex justify-between items-start gap-2">
                <span className="text-slate-600 font-semibold shrink-0">{t('schedule.serviceTypeLabel')}:</span>
                <span className="font-bold text-slate-900 text-right">
                  {serviceType === 'deep'
                    ? t('schedule.serviceDeep')
                    : serviceType === 'str_on_site'
                    ? t('schedule.serviceStrOnSite')
                    : serviceType === 'str_off_site'
                    ? t('schedule.serviceStrOffSite')
                    : t('schedule.serviceStandard')}
                </span>
              </div>
              <div className="flex justify-between items-start gap-2">
                <span className="text-slate-600 font-semibold shrink-0">{t('schedule.dimensions')}:</span>
                <span className="font-bold text-slate-900 text-right">
                  {selectedTier.label} • {bedrooms === 0 ? t('schedule.studio') : `${bedrooms} ${t('schedule.beds')}`}, {bathrooms} {t('schedule.baths')}
                </span>
              </div>
              <div className="flex justify-between items-start gap-2">
                <span className="text-slate-600 font-semibold shrink-0">{t('schedule.frequencyTitle')}:</span>
                <span className="font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-md text-right">
                  {t(freqOption.nameKey)} ({freqOption.badge})
                </span>
              </div>
              <div className="flex justify-between items-start gap-2">
                <span className="text-slate-600 font-semibold shrink-0">{t('schedule.scheduledDate')}:</span>
                <span className="font-bold text-slate-900 text-right">{selectedDate}</span>
              </div>
              <div className="flex justify-between items-start gap-2">
                <span className="text-slate-600 font-semibold shrink-0">{t('schedule.timeSlotLabel')}:</span>
                <span className="font-bold text-slate-900 text-right">{selectedTimeSlot}</span>
              </div>
            </div>

            {/* Address, Contact & Access */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-2.5 text-xs">
              <h3 className="font-black text-slate-900 text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>{t('schedule.locationContact')}</span>
              </h3>
              <div className="flex justify-between items-start gap-2">
                <span className="text-slate-600 font-semibold shrink-0">{t('schedule.client')}:</span>
                <span className="font-bold text-slate-900 text-right truncate">{formData.first_name} {formData.last_name}</span>
              </div>
              <div className="flex justify-between items-start gap-2">
                <span className="text-slate-600 font-semibold shrink-0">{t('auth.phone')}:</span>
                <span className="font-bold text-slate-900 text-right">{formData.phone}</span>
              </div>
              <div className="flex justify-between items-start gap-2">
                <span className="text-slate-600 font-semibold shrink-0">{t('schedule.addressLabel')}:</span>
                <span className="font-bold text-slate-900 text-right">{formData.street_address}, {formData.city || 'Denver'}</span>
              </div>
              <div className="flex justify-between items-start gap-2">
                <span className="text-slate-600 font-semibold shrink-0">{t('schedule.accessMethod')}:</span>
                <span className="font-bold text-slate-900 text-right">
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
                <div className="flex justify-between items-start gap-2">
                  <span className="text-slate-600 font-semibold shrink-0">{t('schedule.accessNote')}:</span>
                  <span className="font-medium text-slate-900 text-right max-w-[200px] truncate">{entryNotes}</span>
                </div>
              )}
            </div>
          </div>

          {/* Dynamic Sticky Cost Breakdown Card */}
          <div className="bg-white border-2 border-emerald-200/90 rounded-2xl p-4 sm:p-6 space-y-3 shadow-2xs">
            <h3 className="font-black text-emerald-950 text-xs sm:text-sm uppercase tracking-wider flex items-center justify-between">
              <span>{t('schedule.costBreakdown')}</span>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                {i18n.language?.startsWith('es') ? 'Tarifa Fija' : 'Flat Rate'}
              </span>
            </h3>

            {/* Base Tier Price */}
            <div className="flex justify-between text-slate-700 text-xs font-medium">
              <span>{t('schedule.baseTierPrice')} ({selectedTier.label}):</span>
              <span className="font-bold text-slate-900">${baseTierPrice.toFixed(2)}</span>
            </div>

            {/* Recurring Frequency Discount */}
            {discountPercent > 0 && (
              <div className="flex justify-between text-emerald-800 text-xs font-bold bg-emerald-50/80 p-2 rounded-xl">
                <span>{t('schedule.frequencyDiscount')} ({t(freqOption.nameKey)} - {freqOption.badge}):</span>
                <span>-${frequencyDiscount.toFixed(2)}</span>
              </div>
            )}

            {/* Addons */}
            {addonsTotal > 0 && (
              <div className="flex justify-between text-slate-700 text-xs font-medium">
                <span>{t('schedule.addonsFee')}:</span>
                <span className="font-bold text-slate-900">+${addonsTotal.toFixed(2)}</span>
              </div>
            )}

            {/* Total Due */}
            <div className="pt-3 border-t-2 border-emerald-100 flex justify-between items-baseline">
              <div>
                <span className="font-black text-slate-900 text-sm sm:text-base">{t('schedule.totalDue')}:</span>
                {discountPercent > 0 && (
                  <span className="text-[11px] text-emerald-700 font-bold block">
                    Includes {discountPercent}% recurring discount
                  </span>
                )}
              </div>
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
          <div className="flex items-center justify-between gap-2.5 sm:gap-4 pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              size="md"
              onClick={() => setStep(3)}
              className="shrink-0 px-3.5 sm:px-5 min-h-[44px] text-xs sm:text-sm hover:scale-102 active:scale-98 transition-all duration-200"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              <span>{t('schedule.back')}</span>
            </Button>
            <Button
              size="md"
              disabled={!agreedToTerms || isSubmitting}
              onClick={handleSubmitBooking}
              className="flex-1 sm:flex-initial sm:px-8 min-h-[44px] text-xs sm:text-sm font-black shadow-md hover:shadow-lg hover:scale-102 active:scale-98 transition-all duration-200"
            >
              <Sparkles className="w-4 h-4 mr-1.5 shrink-0 animate-float" />
              <span className="truncate">{isSubmitting ? t('schedule.submitting') : t('schedule.submitOrder')}</span>
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
