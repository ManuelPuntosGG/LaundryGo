import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Calendar as CalendarIcon,
  Clock,
  User as UserIcon,
  FileText,
  Truck,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  MapPin,
  DollarSign,
  PhoneCall,
  Plus,
  Minus,
  Layers,
  ShieldCheck,
  Package,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthContext } from '@/providers/AuthProvider';
import api from '@/api';
import type { ServiceRate, AvailableDate } from '@/types';
import { DENVER_LOCATIONS } from '@/constants/locations';
import {
  CHECKBOX_ADDONS,
  BEDDING_ADDONS,
  calculateAddonsTotal,
  formatAddonsSummary,
} from '@/constants/addons';

type Step = 1 | 2 | 3 | 4;

export function Schedule() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { user, isAuthenticated } = useAuthContext();

  const [step, setStep] = useState<Step>(1);
  const [rates, setRates] = useState<ServiceRate[]>([]);
  const [availableDates, setAvailableDates] = useState<AvailableDate[]>([]);

  const [selectedDate, setSelectedDate] = useState<string>('');
  const [viewMonthDate, setViewMonthDate] = useState<Date>(() => new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<'morning' | 'afternoon'>('morning');
  const [selectedFrequency, setSelectedFrequency] = useState<string>('oneTime');
  const [selectedRate, setSelectedRate] = useState<number | null>(null);

  const [selectedCheckboxAddons, setSelectedCheckboxAddons] = useState<Record<string, boolean>>({
    scent_beads: false,
    stain_treatment: false,
  });
  const [selectedBeddingQuantities, setSelectedBeddingQuantities] = useState<Record<string, number>>({
    comforter_twin_full: 0,
    comforter_queen_king: 0,
    pillow: 0,
    mattress_cover_twin_full: 0,
    mattress_cover_queen_king: 0,
  });

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    street_address: '',
    city: 'Denver (Downtown / Central)',
    zip_code: '',
  });

  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [stepError, setStepError] = useState<string>('');

  const [selectedLocation, setSelectedLocation] = useState(DENVER_LOCATIONS[0]);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [orderDetails, setOrderDetails] = useState('');
  const [pickupInstructions, setPickupInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Read pre-filled state if coming from "Reorder" action on Dashboard
  useEffect(() => {
    if (location.state?.reorderData) {
      const { service_rate_id, order_details, pickup_instructions } = location.state.reorderData;
      if (service_rate_id) setSelectedRate(service_rate_id);
      if (order_details) setOrderDetails(order_details);
      if (pickup_instructions) setPickupInstructions(pickup_instructions);
    }
  }, [location.state]);

  // Capitalize helper
  const formatCapitalized = (str: string) => {
    return str.replace(/\b[a-z]/g, (char) => char.toUpperCase());
  };

  // Phone auto-formatter (US standard (XXX) XXX-XXXX)
  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  // Validation helpers
  const isFirstNameValid = (val: string) => val.trim().length >= 2 && /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]+$/.test(val.trim());
  const isLastNameValid = (val: string) => val.trim().length >= 2 && /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]+$/.test(val.trim());
  const isPhoneValid = (val: string) => {
    const digits = val.replace(/\D/g, '');
    return digits.length === 10 || (digits.length === 11 && digits.startsWith('1'));
  };
  const isEmailValid = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  const isAddressValid = (val: string) => val.trim().length >= 5;
  const isZipValid = (val: string) => /^\d{5}(-\d{4})?$/.test(val.trim());
  const isLocationValid = (city: string) => DENVER_LOCATIONS.some((loc) => loc.name === city);

  // Pre-fill user data & address if logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      const userCity = user.city || 'Denver (Downtown / Central)';
      const foundLocation = DENVER_LOCATIONS.find((loc) => loc.name === userCity) || DENVER_LOCATIONS[0];
      setSelectedLocation(foundLocation);

      setFormData((prev) => ({
        ...prev,
        first_name: user.first_name ? formatCapitalized(user.first_name) : prev.first_name,
        last_name: user.last_name ? formatCapitalized(user.last_name) : prev.last_name,
        phone: user.phone ? formatPhoneNumber(user.phone) : prev.phone,
        email: user.email || prev.email,
        street_address: user.street_address || prev.street_address,
        city: userCity,
        zip_code: user.zip_code || prev.zip_code,
      }));
    }
  }, [isAuthenticated, user]);

  // Fetch rates & available dates with safe array extraction & auto-selected first rate
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ratesRes, datesRes] = await Promise.all([
          api.get('/services/rates/'),
          api.get('/schedule/available-dates/'),
        ]);

        const ratesList: ServiceRate[] = Array.isArray(ratesRes.data)
          ? ratesRes.data
          : (ratesRes.data as { results?: ServiceRate[] })?.results || [];

        const datesList: AvailableDate[] = Array.isArray(datesRes.data)
          ? datesRes.data
          : (datesRes.data as { results?: AvailableDate[] })?.results || [];

        setRates(ratesList);
        setAvailableDates(datesList);

        // Safely choose default rate: Prefer 'standard' ($2.25/lb), or first available
        const defaultRate = ratesList.find((r) => r.service_type === 'standard') || ratesList[0];
        if (defaultRate && !selectedRate) {
          setSelectedRate(defaultRate.id);
        }

        if (datesList.length > 0 && !selectedDate) {
          setSelectedDate(datesList[0].date);
        }
      } catch (error) {
        console.error('Failed to fetch initial schedule data:', error);
      }
    };
    fetchData();
  }, []);

  const handleLocationChange = (cityName: string) => {
    const found = DENVER_LOCATIONS.find((loc) => loc.name === cityName) || DENVER_LOCATIONS[0];
    setSelectedLocation(found);
    setFormData((prev) => ({ ...prev, city: cityName }));
  };

  const markTouched = (field: string) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
  };

  const safeRates = Array.isArray(rates) ? rates : [];
  const safeDates = Array.isArray(availableDates) ? availableDates : [];

  const canSelectGoFurther = (date: string) => {
    if (!date || !Array.isArray(availableDates) || availableDates.length === 0) return true;
    const dateData = availableDates.find((d) => d.date === date);
    return dateData?.gofurther_available ?? true;
  };

  // Keep selectedRate valid and auto-adjust if cutoff restriction is active for selected date
  useEffect(() => {
    if (!rates || rates.length === 0) return;

    const standardRate = rates.find((r) => r.service_type === 'standard') || rates[0];

    // If no rate is selected, default to standard
    if (!selectedRate) {
      setSelectedRate(standardRate.id);
      return;
    }

    // If current rate is GoFurther, but GoFurther is disabled for the selected date, switch to standard
    const currentRate = rates.find((r) => r.id === selectedRate);
    if (currentRate?.service_type === 'gofurther' && selectedDate) {
      const isGoFurtherAllowed = canSelectGoFurther(selectedDate);
      if (!isGoFurtherAllowed) {
        setSelectedRate(standardRate.id);
        setStepError(
          i18n.language?.startsWith('es')
            ? 'El servicio mismo día no está disponible hoy después de las 12:00 PM. Se seleccionó automáticamente el servicio Estándar.'
            : 'Same-day express service is not available after 12:00 PM for today. Service automatically set to Standard.'
        );
      }
    }
  }, [selectedDate, selectedRate, rates, availableDates, i18n.language]);

  const availableDateSet = new Set(safeDates.map((d) => d.date));
  const todayStr = new Date().toISOString().split('T')[0];

  const year = viewMonthDate.getFullYear();
  const month = viewMonthDate.getMonth();

  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setViewMonthDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewMonthDate(new Date(year, month + 1, 1));
  };

  const isPrevMonthDisabled = () => {
    const now = new Date();
    return year < now.getFullYear() || (year === now.getFullYear() && month <= now.getMonth());
  };

  const monthYearLabel = viewMonthDate.toLocaleDateString(
    i18n.language?.startsWith('es') ? 'es-ES' : 'en-US',
    { month: 'long', year: 'numeric' }
  );
  const capitalizedMonthYear = monthYearLabel.charAt(0).toUpperCase() + monthYearLabel.slice(1);

  const weekDays = i18n.language?.startsWith('es')
    ? ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const calendarCells: ({ day: number; dateStr: string } | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarCells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    calendarCells.push({ day, dateStr: `${year}-${mm}-${dd}` });
  }

  const handleToggleCheckboxAddon = (id: string) => {
    setSelectedCheckboxAddons((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleBeddingQtyChange = (id: string, delta: number) => {
    setSelectedBeddingQuantities((prev) => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [id]: next };
    });
  };

  const addonsSubtotal = calculateAddonsTotal(selectedCheckboxAddons, selectedBeddingQuantities);
  const currentServiceRate = safeRates.find((r) => r.id === selectedRate);

  const validateCurrentStep = (targetStep = step): boolean => {
    setStepError('');

    if (targetStep === 1) {
      if (!selectedDate) {
        setStepError(t('schedule.errors.selectDate', { defaultValue: 'Please select a pickup date from the calendar.' }));
        return false;
      }
      if (!selectedTimeSlot) {
        setStepError(t('schedule.errors.selectTimeSlot', { defaultValue: 'Please select a pickup time slot (Morning or Afternoon).' }));
        return false;
      }
      return true;
    }

    if (targetStep === 2) {
      setTouchedFields({
        first_name: true,
        last_name: true,
        email: true,
        phone: true,
        street_address: true,
        city: true,
        zip_code: true,
        agreedToTerms: true,
      });

      if (!isFirstNameValid(formData.first_name)) {
        setStepError(t('schedule.errors.firstName', { defaultValue: 'First name must contain at least 2 characters (letters only).' }));
        return false;
      }
      if (!isLastNameValid(formData.last_name)) {
        setStepError(t('schedule.errors.lastName', { defaultValue: 'Last name must contain at least 2 characters (letters only).' }));
        return false;
      }
      if (!isPhoneValid(formData.phone)) {
        setStepError(t('schedule.errors.phone', { defaultValue: 'Please enter a valid 10-digit phone number e.g. (720) 590-8632.' }));
        return false;
      }
      if (!isEmailValid(formData.email)) {
        setStepError(t('schedule.errors.email', { defaultValue: 'Please enter a valid email address e.g. name@domain.com.' }));
        return false;
      }
      if (!isAddressValid(formData.street_address)) {
        setStepError(t('schedule.errors.address', { defaultValue: 'Please enter a complete street address (minimum 5 characters).' }));
        return false;
      }
      if (formData.zip_code && !isZipValid(formData.zip_code)) {
        setStepError(t('schedule.errors.zipCode', { defaultValue: 'Please enter a valid 5-digit zip code (e.g. 80202).' }));
        return false;
      }
      if (!isLocationValid(formData.city)) {
        setStepError(t('schedule.errors.location', { defaultValue: 'Please select a valid Denver area location.' }));
        return false;
      }
      if (!agreedToTerms) {
        setStepError(t('schedule.errors.terms', { defaultValue: 'You must agree to the Service Terms & Conditions to proceed.' }));
        return false;
      }
      return true;
    }

    if (targetStep === 3) {
      if (!selectedRate) {
        setStepError(t('schedule.errors.selectRate', { defaultValue: 'Please select a service speed tier.' }));
        return false;
      }
      const rate = safeRates.find((r) => r.id === selectedRate);
      if (rate?.service_type === 'gofurther' && !canSelectGoFurther(selectedDate)) {
        setStepError(t('schedule.errors.cutoffNotice', { defaultValue: 'Same-day express service is not available after 12:00 PM for today. Please choose Standard or Next-day service.' }));
        return false;
      }
      return true;
    }

    if (targetStep === 4) {
      if (!validateCurrentStep(1)) return false;
      if (!validateCurrentStep(2)) return false;
      if (!validateCurrentStep(3)) return false;
      return true;
    }

    return true;
  };

  const handleNextStep = () => {
    if (validateCurrentStep(step)) {
      setStepError('');
      setStep((prev) => (prev + 1) as Step);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep(4)) return;

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      if (isAuthenticated && user) {
        try {
          await api.patch('/auth/me/', {
            first_name: formData.first_name,
            last_name: formData.last_name,
            phone: formData.phone,
            street_address: formData.street_address,
            city: formData.city,
            zip_code: formData.zip_code,
          });
        } catch {
          // Non-fatal
        }
      }

      const formattedDetails = formatAddonsSummary(
        selectedCheckboxAddons,
        selectedBeddingQuantities,
        orderDetails
      );

      // Safe fallback to first rate if not selected
      const effectiveRateId = selectedRate || safeRates.find(r => r.service_type === 'standard')?.id || safeRates[0]?.id;

      const res = await api.post('/orders/', {
        service_rate: effectiveRateId,
        pickup_date: selectedDate,
        pickup_time_slot: selectedTimeSlot,
        frequency: selectedFrequency,
        order_details: formattedDetails || orderDetails || 'Standard laundry wash request',
        pickup_instructions: pickupInstructions,
        guest_email: formData.email.trim(),
        guest_first_name: formData.first_name.trim(),
        guest_last_name: formData.last_name.trim(),
        guest_phone: formData.phone.trim(),
        street_address: formData.street_address.trim(),
        city: formData.city,
        zip_code: formData.zip_code.trim(),
        delivery_zone: selectedLocation.zone,
        delivery_fee: selectedLocation.fee,
      });
      if (res.data?.id) {
        setCreatedOrderId(res.data.id);
      }
      setIsSuccess(true);
    } catch (error: any) {
      console.error('Failed to submit order:', error.response?.data || error);
      const data = error.response?.data;
      if (data && typeof data === 'object') {
        const errorList: string[] = [];
        for (const [key, val] of Object.entries(data)) {
          const valMsg = Array.isArray(val) ? val.join(', ') : String(val);
          if (key === 'service_rate') {
            errorList.push(
              i18n.language?.startsWith('es')
                ? 'Tarifa de servicio: El servicio mismo día no está disponible para hoy después de las 12:00 PM. Por favor selecciona Estándar o Día Siguiente.'
                : 'Service speed: Same-day GoFurther service for today is only available before 12:00 PM. Please choose Standard or Next-day service.'
            );
          } else if (key === 'pickup_date') {
            errorList.push(
              i18n.language?.startsWith('es')
                ? `Fecha de recolección: ${valMsg}`
                : `Pickup date: ${valMsg}`
            );
          } else if (key === 'detail' || key === 'non_field_errors') {
            errorList.push(valMsg);
          } else {
            errorList.push(`${key}: ${valMsg}`);
          }
        }
        setErrorMessage(errorList.join(' • ') || t('common.error'));
      } else {
        setErrorMessage(t('common.error'));
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center w-full animate-fade-in py-6">
        <Card variant="default" className="max-w-xl w-full text-center p-8 sm:p-12 space-y-6 shadow-md border-slate-200">
          <div className="flex flex-col items-center justify-center mx-auto gap-3">
            <img
              src="/logo.png"
              alt="LaundryGo"
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-md"
            />
            <div className="w-12 h-12 rounded-full bg-emerald-100 border-2 border-emerald-300 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="space-y-3">
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold uppercase tracking-wider">
              {createdOrderId ? t('dashboard.orderNumber', { id: createdOrderId }) : t('schedule.reviewTitle')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              {t('schedule.success.title')}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-lg mx-auto">
              {t('schedule.success.message')}
            </p>
          </div>

          {/* Details Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs sm:text-sm space-y-2">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-semibold">{t('schedule.pickupDate')}:</span>
              <span className="font-bold text-slate-900">
                {selectedDate} ({selectedTimeSlot === 'morning' ? t('schedule.morningSlot') : t('schedule.afternoonSlot')})
              </span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-semibold">{t('auth.register.streetAddress')}:</span>
              <span className="font-bold text-slate-900">{formData.street_address}, {formData.city}</span>
            </div>
            {addonsSubtotal > 0 && (
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-semibold">{t('schedule.addonsSubtotal')}:</span>
                <span className="font-bold text-blue-700">${addonsSubtotal.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-semibold">{t('schedule.deliveryFeeLabel')}:</span>
              <span className="font-bold text-blue-700">
                {selectedLocation.fee === 0 ? t('schedule.freeFee') : t('schedule.outerFee')}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs sm:text-sm flex items-center gap-3 text-left">
            <PhoneCall className="w-5 h-5 text-blue-600 shrink-0" />
            <span>
              {t('schedule.success.emailNotice')}{' '}
              <strong className="text-slate-900">{formData.email}</strong>.
            </span>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            {isAuthenticated ? (
              <Link to="/dashboard" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto font-bold">
                  {t('schedule.success.returnDashboard')}
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto font-bold">
                    {t('schedule.success.returnHome')}
                  </Button>
                </Link>
                <Link to="/login" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto font-bold">
                    {t('schedule.success.createAccount')}
                  </Button>
                </Link>
              </>
            )}
          </div>
        </Card>
      </div>
    );
  }

  const isProfileIncomplete = isAuthenticated && user && (!user.street_address || !user.phone || !user.last_name);

  return (
    <div className="max-w-6xl mx-auto w-full py-4 space-y-6 animate-fade-in pb-16 lg:pb-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl tracking-tight">
          {t('schedule.title')}
        </h1>
        <p className="text-slate-600 text-base max-w-lg mx-auto">
          {t('schedule.subtitle')}
        </p>
      </div>

      {/* Progress Steps Bar */}
      <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-3xl mx-auto">
        {[
          { num: 1, label: t('schedule.step1') },
          { num: 2, label: t('schedule.step2') },
          { num: 3, label: t('schedule.step3') },
          { num: 4, label: t('schedule.step4') },
        ].map((s) => (
          <button
            key={s.num}
            type="button"
            onClick={() => {
              if (s.num < step) setStep(s.num as Step);
            }}
            className={`flex flex-col items-center justify-center py-2.5 px-1 sm:p-3 rounded-xl transition-all border text-center cursor-pointer ${
              step === s.num
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : step > s.num
                ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                : 'bg-slate-50 text-slate-400 border-slate-200 opacity-60'
            }`}
          >
            <span className="text-xs sm:text-sm font-extrabold">{s.num}</span>
            <span className="text-[11px] sm:text-xs font-semibold leading-tight mt-0.5 line-clamp-1 sm:line-clamp-none text-center">
              {s.label}
            </span>
          </button>
        ))}
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Column */}
        <div className="lg:col-span-8">
          <Card variant="default" className="p-5 sm:p-8 shadow-sm">
            {stepError && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-medium flex items-center gap-3 animate-fade-in">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
                <span>{stepError}</span>
              </div>
            )}

            {errorMessage && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-medium flex items-center gap-3 animate-fade-in">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* STEP 1: Date, Time & Frequency */}
            {step === 1 && (
              <div className="flex flex-col gap-6 animate-fade-in w-full">
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5 pb-4 border-b border-slate-200">
                  <CalendarIcon className="w-5 h-5 text-blue-600 shrink-0" />
                  <span>{t('schedule.selectDateTime')}</span>
                </h2>

                {/* Calendar View with Accessible Min 44x44px Touch Targets */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    {t('schedule.selectDate')}
                  </label>

                  <div className="bg-slate-50/90 border border-slate-200 rounded-2xl p-3 sm:p-5 space-y-4 shadow-2xs">
                    {/* Header: Month & Navigation + Integrated Time Slot Toggle */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
                      <div className="flex items-center justify-between w-full sm:w-auto gap-2">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-5 h-5 text-blue-600 shrink-0" />
                          <h3 className="text-base sm:text-lg font-extrabold text-slate-900 capitalize">
                            {capitalizedMonthYear}
                          </h3>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={isPrevMonthDisabled()}
                            onClick={handlePrevMonth}
                            className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-white hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                            title="Previous Month"
                            aria-label="Previous Month"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={handleNextMonth}
                            className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-white hover:border-slate-300 transition-all cursor-pointer"
                            title="Next Month"
                            aria-label="Next Month"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Time Slot Toggle */}
                      <div className="bg-slate-200/80 p-1 rounded-xl border border-slate-200 grid grid-cols-2 gap-1 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => setSelectedTimeSlot('morning')}
                          className={`py-2 px-3 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            selectedTimeSlot === 'morning'
                              ? 'bg-blue-600 text-white shadow-2xs'
                              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                          }`}
                        >
                          <Clock className={`w-3.5 h-3.5 ${selectedTimeSlot === 'morning' ? 'text-white' : 'text-slate-500'}`} />
                          <span>{t('schedule.morningToggle')}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedTimeSlot('afternoon')}
                          className={`py-2 px-3 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            selectedTimeSlot === 'afternoon'
                              ? 'bg-blue-600 text-white shadow-2xs'
                              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                          }`}
                        >
                          <Clock className={`w-3.5 h-3.5 ${selectedTimeSlot === 'afternoon' ? 'text-white' : 'text-slate-500'}`} />
                          <span>{t('schedule.afternoonToggle')}</span>
                        </button>
                      </div>
                    </div>

                    {/* Days of Week Header */}
                    <div className="grid grid-cols-7 gap-1 text-center text-xs font-extrabold text-slate-500 uppercase tracking-wider py-1 border-b border-slate-200">
                      {weekDays.map((dayName, idx) => (
                        <div key={idx} className="py-0.5">{dayName}</div>
                      ))}
                    </div>

                    {/* Accessible Days Grid with Touch Target >= 44x44px */}
                    <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center items-center justify-items-center">
                      {calendarCells.map((cell, idx) => {
                        if (!cell) {
                          return <div key={`empty-${idx}`} className="h-10 w-10 sm:h-11 sm:w-11" />;
                        }

                        const isAvailable = availableDateSet.has(cell.dateStr);
                        const isSelected = selectedDate === cell.dateStr;
                        const isToday = cell.dateStr === todayStr;

                        return (
                          <button
                            key={cell.dateStr}
                            type="button"
                            disabled={!isAvailable}
                            onClick={() => setSelectedDate(cell.dateStr)}
                            aria-label={`Date ${cell.dateStr} ${isAvailable ? 'available' : 'unavailable'}`}
                            className={`h-10 w-10 sm:h-11 sm:w-11 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex flex-col items-center justify-center relative mx-auto ${
                              isSelected
                                ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-600 ring-offset-2'
                                : isAvailable
                                ? 'bg-white text-slate-900 border border-slate-200 hover:border-blue-500 hover:bg-blue-50 cursor-pointer'
                                : 'bg-slate-100/50 text-slate-300 cursor-not-allowed opacity-40 border border-transparent'
                            } ${isToday && !isSelected ? 'ring-2 ring-blue-500/40 ring-offset-1' : ''}`}
                          >
                            <span>{cell.day}</span>
                            {isToday && (
                              <span className={`text-[7px] font-bold leading-none absolute bottom-1 ${isSelected ? 'text-blue-100' : 'text-blue-600'}`}>
                                •
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Selected Date Summary Banner */}
                    {selectedDate && (
                      <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm">
                        <span className="text-slate-600 font-semibold">{t('schedule.pickupDate')}:</span>
                        <span className="font-extrabold text-blue-700 bg-blue-50 border border-blue-200 px-3.5 py-1.5 rounded-xl text-center sm:text-right text-xs sm:text-sm">
                          {new Date(selectedDate + 'T00:00:00').toLocaleDateString(
                            i18n.language?.startsWith('es') ? 'es-ES' : 'en-US',
                            { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
                          )} • ({selectedTimeSlot === 'morning' ? '8:00 AM – 11:00 AM' : '12:00 PM – 4:00 PM'})
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Frequency Selection */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      {t('schedule.frequency')}
                    </label>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border transition-all ${
                      selectedFrequency !== 'oneTime' && selectedFrequency !== ''
                        ? 'bg-blue-100 text-blue-800 border-blue-200 shadow-2xs'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {selectedFrequency !== 'oneTime' && selectedFrequency !== ''
                        ? `🔄 ${t('schedule.recurringActive')}`
                        : `📦 ${t('schedule.oneTimeDefault')}`}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { value: 'daily', label: t('schedule.daily') },
                      { value: 'weekly', label: t('schedule.weekly') },
                      { value: 'fortnightly', label: t('schedule.fortnightly') },
                      { value: 'monthly', label: t('schedule.monthly') },
                    ].map((freq) => {
                      const isSelected = selectedFrequency === freq.value;
                      return (
                        <button
                          key={freq.value}
                          type="button"
                          onClick={() => setSelectedFrequency(isSelected ? 'oneTime' : freq.value)}
                          className={`py-3 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs ring-2 ring-blue-600/20'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-blue-400 hover:bg-blue-50/50'
                          }`}
                        >
                          <span>{freq.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {selectedFrequency !== 'oneTime' && selectedFrequency !== '' && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fade-in shadow-2xs">
                      <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-semibold">{t('schedule.recurringDiscountBenefit')}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 2: Customer Information & Location */}
            {step === 2 && (
              <div className="flex flex-col gap-4 animate-fade-in w-full">
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5 pb-3 border-b border-slate-200">
                  <UserIcon className="w-5 h-5 text-blue-600 shrink-0" />
                  <span>{t('schedule.yourInfo')} & {t('schedule.deliveryAddress')}</span>
                </h2>

                {isAuthenticated ? (
                  <div className="space-y-2">
                    <div className="p-3 px-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between text-xs gap-2 font-medium">
                      <div className="flex items-center gap-2 truncate">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="truncate">Logged in as <strong>{user?.first_name || user?.email}</strong></span>
                      </div>
                      <Link to="/dashboard" className="text-emerald-700 font-bold hover:underline shrink-0 text-xs">
                        Dashboard &rarr;
                      </Link>
                    </div>

                    {isProfileIncomplete && (
                      <div className="p-3 px-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2 font-medium">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Please complete your street address and phone number for pickup delivery.</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3 px-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 flex items-center justify-between text-xs gap-2 font-medium">
                    <div className="flex items-center gap-2 truncate">
                      <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="truncate">Ordering as Guest. Want to save your info?</span>
                    </div>
                    <Link to="/login" className="text-blue-700 font-bold hover:underline shrink-0 text-xs">
                      Log In &rarr;
                    </Link>
                  </div>
                )}

                <div className="space-y-4">
                  {/* First Name & Last Name (Responsive 1-col on mobile, 2-col on desktop) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <Input
                      label={t('schedule.firstName')}
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: formatCapitalized(e.target.value) })}
                      onBlur={() => markTouched('first_name')}
                      error={
                        touchedFields.first_name && !isFirstNameValid(formData.first_name)
                          ? t('schedule.errors.firstName')
                          : undefined
                      }
                      required
                    />
                    <Input
                      label={t('schedule.lastName')}
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: formatCapitalized(e.target.value) })}
                      onBlur={() => markTouched('last_name')}
                      error={
                        touchedFields.last_name && !isLastNameValid(formData.last_name)
                          ? t('schedule.errors.lastName')
                          : undefined
                      }
                      required
                    />
                  </div>

                  {/* Phone & Email (Responsive 1-col on mobile, 2-col on desktop) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <Input
                      label={t('schedule.phone')}
                      type="tel"
                      placeholder="(720) 590-8632"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: formatPhoneNumber(e.target.value) })}
                      onBlur={() => markTouched('phone')}
                      error={
                        touchedFields.phone && !isPhoneValid(formData.phone)
                          ? t('schedule.errors.phone')
                          : undefined
                      }
                      required
                    />
                    <Input
                      label={t('schedule.email')}
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      onBlur={() => markTouched('email')}
                      error={
                        touchedFields.email && !isEmailValid(formData.email)
                          ? t('schedule.errors.email')
                          : undefined
                      }
                      required
                    />
                  </div>

                  {/* Denver Address & Zone Selector */}
                  <div className="pt-2 space-y-3 border-t border-slate-200">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>{t('schedule.deliveryAddress')}</span>
                    </h3>

                    <Input
                      label="Street Address *"
                      placeholder="1234 Blake St, Apt 4B"
                      value={formData.street_address}
                      onChange={(e) => setFormData({ ...formData, street_address: e.target.value })}
                      onBlur={() => markTouched('street_address')}
                      error={
                        touchedFields.street_address && !isAddressValid(formData.street_address)
                          ? t('schedule.errors.address')
                          : undefined
                      }
                      required
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          {t('schedule.cityLocation')} *
                        </label>
                        <select
                          value={formData.city}
                          onChange={(e) => handleLocationChange(e.target.value)}
                          className="w-full min-h-[44px] bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm shadow-2xs"
                        >
                          {DENVER_LOCATIONS.map((loc) => (
                            <option key={loc.name} value={loc.name}>
                              {loc.name} ({loc.fee === 0 ? 'FREE' : '+$25'})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-1">
                        <Input
                          label={t('schedule.zipCode')}
                          placeholder="80202"
                          value={formData.zip_code}
                          onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                          onBlur={() => markTouched('zip_code')}
                          error={
                            touchedFields.zip_code && formData.zip_code && !isZipValid(formData.zip_code)
                              ? t('schedule.errors.zipCode')
                              : undefined
                          }
                        />
                      </div>
                    </div>

                    {/* Delivery Fee Notice Badge */}
                    <div
                      className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all ${
                        selectedLocation.fee === 0
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : 'bg-amber-50 border-amber-200 text-amber-900'
                      }`}
                    >
                      <DollarSign
                        className={`w-4 h-4 shrink-0 ${
                          selectedLocation.fee === 0 ? 'text-emerald-600' : 'text-amber-600'
                        }`}
                      />
                      <span>
                        {selectedLocation.fee === 0
                          ? t('schedule.freeDelivery')
                          : t('schedule.outerZoneFee')}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className={`flex items-start gap-3 cursor-pointer group p-2 rounded-xl transition-all ${
                      touchedFields.agreedToTerms && !agreedToTerms ? 'bg-rose-50 border border-rose-200' : ''
                    }`}>
                      <input
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => {
                          setAgreedToTerms(e.target.checked);
                          markTouched('agreedToTerms');
                        }}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 shrink-0 cursor-pointer"
                      />
                      <span className="text-slate-700 text-xs sm:text-sm leading-tight group-hover:text-slate-900 transition-colors">
                        {t('schedule.terms')}
                      </span>
                    </label>
                    {touchedFields.agreedToTerms && !agreedToTerms && (
                      <p className="text-rose-600 text-xs mt-1 font-semibold pl-2">
                        {t('schedule.errors.terms')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Service Tier & Add-ons */}
            {step === 3 && (
              <div className="flex flex-col gap-5 animate-fade-in w-full">
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5 pb-3 border-b border-slate-200">
                  <Truck className="w-5 h-5 text-blue-600 shrink-0" />
                  <span>{t('schedule.serviceType')} & {t('schedule.addonsTitle')}</span>
                </h2>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      {t('schedule.selectServiceSpeed')}
                    </label>
                    <span className="text-xs text-slate-500 font-medium">
                      {t('schedule.minimumOrderNotice')}
                    </span>
                  </div>

                  {/* Service Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {safeRates.map((rate) => {
                      const isGoFurtherDisabled = rate.service_type === 'gofurther' && !canSelectGoFurther(selectedDate);
                      const isSelected = selectedRate === rate.id;

                      return (
                        <button
                          key={rate.id}
                          type="button"
                          disabled={isGoFurtherDisabled}
                          onClick={() => setSelectedRate(rate.id)}
                          className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between gap-3 relative cursor-pointer ${
                            isGoFurtherDisabled
                              ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                              : isSelected
                              ? 'bg-blue-50 border-2 border-blue-600 shadow-sm ring-2 ring-blue-600/10'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-blue-400 hover:bg-blue-50/30'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-extrabold text-slate-900 text-base">{rate.name}</h3>
                              {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />}
                            </div>
                            <p className="text-slate-500 text-xs leading-relaxed">{rate.description}</p>
                          </div>

                          <div className="flex items-baseline gap-1 pt-2 border-t border-slate-200/80 w-full justify-between">
                            <span className="text-xl font-black text-blue-600">${rate.rate_per_lb}</span>
                            <span className="text-xs text-slate-500 font-semibold">/ lb</span>
                          </div>

                          {isGoFurtherDisabled && (
                            <div className="absolute -top-2 right-2 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200 shadow-2xs">
                              {t('schedule.cutoffNotice')}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Add-ons Section */}
                <div className="space-y-4 pt-2 border-t border-slate-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        <span>{t('schedule.addonsTitle')}</span>
                      </h3>
                      <p className="text-slate-500 text-xs">
                        {t('schedule.addonsSubtitle')}
                      </p>
                    </div>
                  </div>

                  {/* 1. Checkbox Wash Treatments */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      {t('schedule.treatmentsCategory')}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {CHECKBOX_ADDONS.map((addon) => {
                        const isChecked = !!selectedCheckboxAddons[addon.id];
                        return (
                          <label
                            key={addon.id}
                            className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                              isChecked
                                ? 'bg-blue-50 border-blue-600 shadow-2xs ring-1 ring-blue-600/20'
                                : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleCheckboxAddon(addon.id)}
                              className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 shrink-0 cursor-pointer"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-bold text-xs sm:text-sm text-slate-900">
                                  {t(addon.i18nKey, { defaultValue: addon.name })}
                                </span>
                                <span className="text-xs font-extrabold text-blue-600 shrink-0">
                                  +${addon.price.toFixed(2)}{t('schedule.perOrder')}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                                {t(addon.descriptionKey, { defaultValue: addon.name })}
                              </p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Incremental Bedding & Bulky Items */}
                  <div className="space-y-2 pt-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-blue-600" />
                      <span>{t('schedule.beddingCategory')}</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {BEDDING_ADDONS.map((item) => {
                        const qty = selectedBeddingQuantities[item.id] || 0;
                        return (
                          <div
                            key={item.id}
                            className={`p-3.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                              qty > 0
                                ? 'bg-blue-50 border-blue-600 shadow-2xs'
                                : 'bg-white border-slate-200'
                            }`}
                          >
                            <div className="min-w-0 pr-1">
                              <p className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                                {t(item.i18nKey, { defaultValue: item.name })}
                              </p>
                              <p className="text-xs font-extrabold text-blue-600 mt-0.5">
                                ${item.price.toFixed(2)} <span className="text-xs text-slate-500 font-normal">{t('schedule.each')}</span>
                              </p>
                            </div>

                            {/* Stepper Controls with Accessible 40px Touch Target */}
                            <div className="flex items-center gap-1 shrink-0 bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
                              <button
                                type="button"
                                disabled={qty === 0}
                                onClick={() => handleBeddingQtyChange(item.id, -1)}
                                aria-label={`Decrease ${item.name}`}
                                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                                  qty === 0
                                    ? 'text-slate-300 cursor-not-allowed'
                                    : 'text-slate-700 hover:bg-slate-100 active:scale-95'
                                }`}
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-7 text-center font-extrabold text-sm text-slate-900">
                                {qty}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleBeddingQtyChange(item.id, 1)}
                                aria-label={`Increase ${item.name}`}
                                className="w-9 h-9 rounded-lg flex items-center justify-center text-blue-600 hover:bg-blue-50 active:scale-95 transition-all cursor-pointer"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Laundry Specific Requests & Instructions */}
                <div className="space-y-3 pt-2 border-t border-slate-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {t('schedule.orderDetails')}
                    </label>
                    <textarea
                      rows={2}
                      placeholder={t('schedule.orderDetailsPlaceholder')}
                      value={orderDetails}
                      onChange={(e) => setOrderDetails(e.target.value)}
                      className="w-full min-h-[44px] bg-white border border-slate-300 rounded-xl p-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {t('schedule.pickupInstructions')}
                    </label>
                    <textarea
                      rows={2}
                      placeholder={t('schedule.pickupInstructionsPlaceholder')}
                      value={pickupInstructions}
                      onChange={(e) => setPickupInstructions(e.target.value)}
                      className="w-full min-h-[44px] bg-white border border-slate-300 rounded-xl p-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm shadow-2xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Review & Order Confirmation */}
            {step === 4 && (
              <div className="flex flex-col gap-5 animate-fade-in w-full">
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5 pb-3 border-b border-slate-200">
                  <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                  <span>{t('schedule.reviewTitle')}</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-0.5">{t('schedule.pickupDate')}</p>
                    <p className="text-slate-900 font-extrabold text-sm sm:text-base">{selectedDate}</p>
                    <p className="text-slate-600 text-xs capitalize font-medium">
                      {selectedTimeSlot === 'morning' ? t('schedule.morningSlot') : t('schedule.afternoonSlot')}
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-0.5">{t('schedule.serviceLabel')}</p>
                    <p className="text-slate-900 font-extrabold text-sm sm:text-base">
                      {currentServiceRate?.name}
                    </p>
                    <p className="text-blue-600 font-bold text-xs">
                      ${currentServiceRate?.rate_per_lb}/lb
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-0.5">{t('schedule.frequency')}</p>
                    <p className="text-slate-900 font-extrabold text-sm sm:text-base">
                      {selectedFrequency && selectedFrequency !== 'oneTime'
                        ? t(`schedule.${selectedFrequency}`, { defaultValue: selectedFrequency })
                        : t('schedule.oneTime')}
                    </p>
                    <p className="text-slate-600 text-xs font-medium">
                      {selectedFrequency && selectedFrequency !== 'oneTime' ? t('schedule.recurring') : t('schedule.oneTimeOnly')}
                    </p>
                  </div>
                </div>

                {/* Add-ons Itemized Breakdown */}
                {addonsSubtotal > 0 && (
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 text-xs sm:text-sm">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <p className="text-slate-800 font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        <span>{t('schedule.addonsTitle')}</span>
                      </p>
                      <span className="font-extrabold text-blue-700">${addonsSubtotal.toFixed(2)}</span>
                    </div>
                    <div className="space-y-1 pt-1">
                      {CHECKBOX_ADDONS.filter((a) => selectedCheckboxAddons[a.id]).map((a) => (
                        <div key={a.id} className="flex items-center justify-between text-slate-700 text-xs">
                          <span>• {t(a.i18nKey, { defaultValue: a.name })}</span>
                          <span className="font-bold">+${a.price.toFixed(2)}</span>
                        </div>
                      ))}
                      {BEDDING_ADDONS.filter((b) => (selectedBeddingQuantities[b.id] || 0) > 0).map((b) => {
                        const qty = selectedBeddingQuantities[b.id];
                        return (
                          <div key={b.id} className="flex items-center justify-between text-slate-700 text-xs">
                            <span>• {qty}x {t(b.i18nKey, { defaultValue: b.name })}</span>
                            <span className="font-bold">+${(b.price * qty).toFixed(2)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-1.5 text-xs sm:text-sm">
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{t('schedule.customerDetails')}</p>
                  <p className="text-slate-900 font-extrabold">{formData.first_name} {formData.last_name}</p>
                  <p className="text-slate-600">{formData.email} • {formData.phone}</p>
                  <p className="text-slate-800 font-medium pt-1">
                    📍 {formData.street_address}, {formData.city} {formData.zip_code}
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-2 border-t border-slate-200 mt-2">
                    <span className="text-xs font-bold text-blue-700">
                      {t('schedule.deliveryFeeLabel')}: {selectedLocation.fee === 0 ? t('schedule.freeFee') : t('schedule.outerFee')}
                    </span>
                    <span className="text-xs text-slate-500">
                      {t('schedule.minimumOrderNotice')}
                    </span>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-950 text-xs flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{t('schedule.payUponWeight')}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{t('schedule.freeCancel')}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Stepper Nav Controls */}
            <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-200">
              {step > 1 ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setStepError('');
                    setStep((step - 1) as Step);
                  }}
                  className="font-bold"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  {t('common.back')}
                </Button>
              ) : (
                <div />
              )}

              {step < 4 ? (
                <Button onClick={handleNextStep} className="font-extrabold px-7">
                  {t('common.next')}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="font-extrabold px-8 shadow-md shadow-blue-500/20"
                >
                  {isSubmitting ? t('common.loading') : t('schedule.reserve')}
                </Button>
              )}
            </div>
          </Card>
        </div>

        {/* Live Sticky Order Summary Column (Desktop) */}
        <div className="hidden lg:block lg:col-span-4 sticky top-24 space-y-4">
          <Card variant="featured" className="p-6 space-y-4 shadow-sm border-2 border-blue-600">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-600" />
                <span>{t('schedule.liveSummaryTitle')}</span>
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                Step {step} of 4
              </span>
            </div>

            {/* Selected Service Speed */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-semibold">{t('schedule.serviceLabel')}:</span>
                <span className="font-bold text-slate-900">
                  {currentServiceRate?.name || 'Standard ($2.25/lb)'}
                </span>
              </div>

              {/* Pickup Date & Slot */}
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-semibold">{t('schedule.pickupDate')}:</span>
                <span className="font-bold text-slate-900 text-right">
                  {selectedDate ? `${selectedDate} (${selectedTimeSlot === 'morning' ? '8-11 AM' : '12-4 PM'})` : 'Select date'}
                </span>
              </div>

              {/* Location & Delivery Fee */}
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-semibold">{t('schedule.deliveryFeeLabel')}:</span>
                <span className={`font-bold ${selectedLocation.fee === 0 ? 'text-emerald-700' : 'text-blue-700'}`}>
                  {selectedLocation.fee === 0 ? '$0.00 (FREE)' : '+$25.00'}
                </span>
              </div>

              {/* Addons Total */}
              {addonsSubtotal > 0 && (
                <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                  <span className="text-slate-500 font-semibold">{t('schedule.addonsSubtotal')}:</span>
                  <span className="font-extrabold text-blue-700">+${addonsSubtotal.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Recurring 7.5% Note */}
            {selectedFrequency !== 'oneTime' && selectedFrequency !== '' && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>7.5% OFF Recurring Active</span>
              </div>
            )}

            {/* Trust Microcopy */}
            <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 space-y-1.5">
              <p className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Pay upon exact scale weighing</span>
              </p>
              <p className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Free cancellation up to 2h before</span>
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Sticky Mobile Floating Action Bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 p-3 px-4 flex items-center justify-between lg:hidden shadow-lg animate-fade-in">
        <div className="min-w-0 pr-2">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
            Step {step} of 4 • {currentServiceRate?.name || 'Standard'}
          </p>
          <p className="text-xs font-black text-slate-900 truncate">
            {selectedDate ? selectedDate : 'Select Date'} • {addonsSubtotal > 0 ? `+$${addonsSubtotal.toFixed(2)} addons` : selectedLocation.fee === 0 ? 'Free Delivery' : '+$25 Fee'}
          </p>
        </div>
        <div>
          {step < 4 ? (
            <Button size="sm" onClick={handleNextStep} className="font-extrabold px-5 shadow-sm">
              {t('common.next')}
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          ) : (
            <Button size="sm" onClick={handleSubmit} disabled={isSubmitting} className="font-extrabold px-5 shadow-sm">
              {isSubmitting ? t('common.loading') : t('schedule.reserve')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
