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
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthContext } from '@/providers/AuthProvider';
import api from '@/api';
import type { ServiceRate, AvailableDate } from '@/types';
import { DENVER_LOCATIONS } from '@/constants/locations';

type Step = 1 | 2 | 3 | 4;

export function Schedule() {
  const { t } = useTranslation();
  const location = useLocation();
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

  // Validation helpers
  const isFirstNameValid = (val: string) => val.trim().length >= 2 && /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]+$/.test(val.trim());
  const isLastNameValid = (val: string) => val.trim().length >= 2 && /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]+$/.test(val.trim());
  const isPhoneValid = (val: string) => /^(\+?1\s*[-.]?)?(\(?\d{3}\)?[\s.-]?)?\d{3}[\s.-]?\d{4}$/.test(val.trim());
  const isEmailValid = (val: string) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val.trim());
  const isAddressValid = (val: string) => val.trim().length >= 5;
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
        phone: user.phone || prev.phone,
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

        if (ratesList.length > 0 && !selectedRate) {
          setSelectedRate(ratesList[0].id);
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
    if (!date || safeDates.length === 0) return true;
    const dateData = safeDates.find((d) => d.date === date);
    return dateData?.gofurther_available ?? true;
  };

  const validateCurrentStep = (): boolean => {
    setStepError('');
    if (step === 1) {
      if (!selectedDate || !selectedTimeSlot) {
        setStepError('Please select a pickup date and time slot.');
        return false;
      }
      return true;
    }

    if (step === 2) {
      // Touch all Step 2 fields
      setTouchedFields((prev) => ({
        ...prev,
        first_name: true,
        last_name: true,
        email: true,
        phone: true,
        street_address: true,
        city: true,
      }));

      if (!isFirstNameValid(formData.first_name)) {
        setStepError('First name must start with a capital letter and be at least 2 characters.');
        return false;
      }
      if (!isLastNameValid(formData.last_name)) {
        setStepError('Last name must start with a capital letter and be at least 2 characters.');
        return false;
      }
      if (!isPhoneValid(formData.phone)) {
        setStepError('Please enter a valid 10-digit phone number e.g. (303) 555-0123.');
        return false;
      }
      if (!isEmailValid(formData.email)) {
        setStepError('Please enter a valid email address e.g. name@domain.com.');
        return false;
      }
      if (!isAddressValid(formData.street_address)) {
        setStepError('Please enter a complete street address (minimum 5 characters).');
        return false;
      }
      if (!isLocationValid(formData.city)) {
        setStepError('Please select a valid Denver area location.');
        return false;
      }
      if (!agreedToTerms) {
        setStepError('You must agree to the Service Terms to proceed.');
        return false;
      }
      return true;
    }

    if (step === 3) {
      if (!selectedRate) {
        setStepError('Please select a service speed tier.');
        return false;
      }
      if (!orderDetails.trim()) {
        setStepError('Please enter details about your laundry items.');
        return false;
      }
      return true;
    }

    return true;
  };

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      setStepError('');
      setStep((prev) => (prev + 1) as Step);
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      // If user is authenticated, save updated address/phone to profile silently
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
          // Ignore non-fatal profile update errors
        }
      }

      const res = await api.post('/orders/', {
        service_rate: selectedRate,
        pickup_date: selectedDate,
        pickup_time_slot: selectedTimeSlot,
        frequency: selectedFrequency,
        order_details: orderDetails,
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
        const errorMessages = Object.entries(data)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
          .join(' | ');
        setErrorMessage(errorMessages || t('common.error'));
      } else {
        setErrorMessage(t('common.error'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center w-full animate-fade-in py-6">
        <Card variant="default" className="max-w-xl w-full text-center p-8 sm:p-12 space-y-6 shadow-md border-slate-200">
          <div className="w-20 h-20 rounded-full bg-emerald-100 border-2 border-emerald-300 text-emerald-600 flex items-center justify-center mx-auto shrink-0 shadow-xs">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-3">
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold uppercase tracking-wider">
              {createdOrderId ? `Pedido #${createdOrderId}` : 'Solicitud Recibida'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              ¡Solicitud de Recolección Enviada con Éxito!
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-lg mx-auto">
              Hemos recibido tu pedido correctamente. Nuestro equipo procesará los detalles y pronto se pondrá en contacto contigo para gestionar la recolección de tu ropa.
            </p>
          </div>

          {/* Details Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs sm:text-sm space-y-2">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-semibold">Fecha de Recolección:</span>
              <span className="font-bold text-slate-900">{selectedDate} ({selectedTimeSlot === 'morning' ? '8AM - 11AM' : '12PM - 4PM'})</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-semibold">Dirección:</span>
              <span className="font-bold text-slate-900">{formData.street_address}, {formData.city}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-semibold">Tarifa de Envío:</span>
              <span className="font-bold text-blue-700">
                {selectedLocation.fee === 0 ? 'GRATIS ($0.00)' : '$25.00 (Zona Exterior)'}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs sm:text-sm flex items-center gap-3 text-left">
            <PhoneCall className="w-5 h-5 text-blue-600 shrink-0" />
            <span>Se ha enviado una notificación de confirmación al correo <strong>manuelpuntosss@gmail.com</strong>.</span>
          </div>

          <div className="pt-2">
            <Link to="/dashboard">
              <Button className="w-full sm:w-auto">
                Volver al Panel de Control
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const isProfileIncomplete = isAuthenticated && user && (!user.street_address || !user.phone || !user.last_name);

  return (
    <div className="max-w-4xl mx-auto w-full py-4 space-y-6 animate-fade-in">
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
      <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-2xl mx-auto">
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
            className={`flex flex-col items-center p-2 rounded-xl transition-all border text-center ${
              step === s.num
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : step > s.num
                ? 'bg-blue-50 text-blue-700 border-blue-200 cursor-pointer hover:bg-blue-100'
                : 'bg-slate-50 text-slate-400 border-slate-200 opacity-60'
            }`}
          >
            <span className="text-xs sm:text-sm font-extrabold">{s.num}</span>
            <span className="text-[10px] sm:text-xs font-semibold truncate w-full">{s.label}</span>
          </button>
        ))}
      </div>

      {/* Main Form Card */}
      <Card variant="default" className="p-6 sm:p-8 shadow-sm">
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
          <div className="flex flex-col gap-6 animate-in fade-in duration-200 w-full">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5 pb-4 border-b border-slate-200/80">
              <CalendarIcon className="w-5 h-5 text-blue-600 shrink-0" />
              <span>{t('schedule.selectDateTime')}</span>
            </h2>

            {/* Available Pickup Dates horizontal selector */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                {t('schedule.selectDate')}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5 max-h-60 overflow-y-auto p-1 border border-slate-200 rounded-xl bg-slate-50/50">
                {safeDates.map((d) => {
                  const isSelected = selectedDate === d.date;
                  const dateObj = new Date(d.date + 'T00:00:00');
                  const dayName = d.day_name || dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                  const monthName = d.formatted_date ? d.formatted_date.split(',')[0] : dateObj.toLocaleDateString('en-US', { month: 'short' });

                  return (
                    <button
                      key={d.date}
                      type="button"
                      onClick={() => setSelectedDate(d.date)}
                      className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-slate-800 border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                        {dayName}
                      </span>
                      <span className="text-base font-extrabold">{d.date.split('-')[2]}</span>
                      <span className="text-[10px] font-semibold opacity-75">{monthName}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Slot Selection */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                {t('schedule.timeSlot')}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedTimeSlot('morning')}
                  className={`p-5 rounded-xl border text-left transition-all flex items-start gap-4 ${
                    selectedTimeSlot === 'morning'
                      ? 'bg-blue-50/80 border-2 border-blue-600 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-base">{t('schedule.morning')}</p>
                    <p className="text-slate-500 text-xs mt-0.5">8:00 AM - 11:00 AM</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedTimeSlot('afternoon')}
                  className={`p-5 rounded-xl border text-left transition-all flex items-start gap-4 ${
                    selectedTimeSlot === 'afternoon'
                      ? 'bg-blue-50/80 border-2 border-blue-600 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-base">{t('schedule.afternoon')}</p>
                    <p className="text-slate-500 text-xs mt-0.5">12:00 PM - 4:00 PM</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Frequency Selection */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                {t('schedule.frequency')}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {[
                  { value: 'oneTime', label: t('schedule.oneTime') },
                  { value: 'daily', label: t('schedule.daily') },
                  { value: 'weekly', label: t('schedule.weekly') },
                  { value: 'fortnightly', label: t('schedule.fortnightly') },
                  { value: 'monthly', label: t('schedule.monthly') },
                ].map((freq) => (
                  <button
                    key={freq.value}
                    type="button"
                    onClick={() => setSelectedFrequency(freq.value)}
                    className={`py-2.5 px-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border ${
                      selectedFrequency === freq.value
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {freq.label}
                  </button>
                ))}
              </div>
            </div>

            {!isAuthenticated && (
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center gap-3 text-xs sm:text-sm text-blue-900">
                <Sparkles className="w-5 h-5 text-blue-600 shrink-0" />
                <span>
                  {t('schedule.loginPrompt')}{' '}
                  <Link to="/login" className="text-blue-700 font-bold hover:underline">
                    {t('schedule.loginLink')}
                  </Link>
                </span>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Customer Information & Location */}
        {step === 2 && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-200 w-full">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5 pb-4 border-b border-slate-200/80">
              <UserIcon className="w-5 h-5 text-blue-600 shrink-0" />
              <span>{t('schedule.yourInfo')} & Delivery Location</span>
            </h2>

            {/* Profile Pre-fill Banner */}
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between text-xs sm:text-sm gap-2">
                  <div className="flex items-center gap-2.5 font-semibold">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>Logged in as <strong>{user?.first_name || user?.email}</strong> ({user?.email}) — Info pre-filled.</span>
                  </div>
                  <Link to="/dashboard" className="text-emerald-700 font-bold hover:underline shrink-0">
                    Dashboard &rarr;
                  </Link>
                </div>

                {isProfileIncomplete && (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-center gap-2.5 font-medium">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                    <span>Please complete your street address and phone number below for pickup delivery.</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 flex items-center justify-between text-xs sm:text-sm gap-2">
                <div className="flex items-center gap-2.5 font-semibold">
                  <Sparkles className="w-5 h-5 text-blue-600 shrink-0" />
                  <span>Ordering as Guest. Want to save your address & track orders in a dashboard?</span>
                </div>
                <Link to="/login" className="text-blue-700 font-bold hover:underline shrink-0">
                  Log In / Register &rarr;
                </Link>
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={t('schedule.firstName')}
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: formatCapitalized(e.target.value) })}
                  onBlur={() => markTouched('first_name')}
                  error={
                    touchedFields.first_name && !isFirstNameValid(formData.first_name)
                      ? 'Must start with a capital letter and be at least 2 characters.'
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
                      ? 'Must start with a capital letter and be at least 2 characters.'
                      : undefined
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={t('schedule.phone')}
                  type="tel"
                  placeholder="(303) 555-0123"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  onBlur={() => markTouched('phone')}
                  error={
                    touchedFields.phone && !isPhoneValid(formData.phone)
                      ? 'Please enter a valid 10-digit phone number e.g. (303) 555-0123.'
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
                      ? 'Please enter a valid email address e.g. name@domain.com.'
                      : undefined
                  }
                  required
                />
              </div>

              {/* Denver Address & Zone Selector */}
              <div className="pt-2 space-y-4 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>Denver Delivery Address & Zone</span>
                </h3>

                <Input
                  label="Street Address *"
                  placeholder="1234 Blake St, Apt 4B"
                  value={formData.street_address}
                  onChange={(e) => setFormData({ ...formData, street_address: e.target.value })}
                  onBlur={() => markTouched('street_address')}
                  error={
                    touchedFields.street_address && !isAddressValid(formData.street_address)
                      ? 'Please enter a complete street address e.g. 1234 Blake St.'
                      : undefined
                  }
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                      Denver Area Location *
                    </label>
                    <select
                      value={formData.city}
                      onChange={(e) => handleLocationChange(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 text-sm shadow-2xs"
                    >
                      {DENVER_LOCATIONS.map((loc) => (
                        <option key={loc.name} value={loc.name}>
                          {loc.name} ({loc.fee === 0 ? 'FREE Delivery' : '+$25 Fee'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <Input
                    label="Zip Code"
                    placeholder="80202"
                    value={formData.zip_code}
                    onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                  />
                </div>

                {/* Delivery Fee Notice Box */}
                <div
                  className={`p-4 rounded-xl border flex items-start gap-3 text-xs sm:text-sm transition-all ${
                    selectedLocation.fee === 0
                      ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                      : 'bg-amber-50/80 border-amber-200 text-amber-900'
                  }`}
                >
                  <DollarSign
                    className={`w-5 h-5 shrink-0 mt-0.5 ${
                      selectedLocation.fee === 0 ? 'text-emerald-600' : 'text-amber-600'
                    }`}
                  />
                  <div className="space-y-0.5">
                    <p className="font-bold text-sm">
                      {selectedLocation.fee === 0 ? 'FREE Delivery Included!' : '+$25.00 Outer Zone Service Fee'}
                    </p>
                    <p className="text-xs leading-relaxed opacity-90">
                      {selectedLocation.fee === 0
                        ? 'We offer FREE delivery within roughly 8 miles of Downtown Denver.'
                        : 'Locations outside 8 miles of Downtown Denver incur a $25 service fee.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 shrink-0"
                  />
                  <span className="text-slate-600 text-xs sm:text-sm leading-relaxed group-hover:text-slate-900 transition-colors">
                    {t('schedule.terms')}
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Service Tier & Details */}
        {step === 3 && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-200 w-full">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5 pb-4 border-b border-slate-200/80">
              <Truck className="w-5 h-5 text-blue-600 shrink-0" />
              <span>{t('schedule.serviceType')} & Details</span>
            </h2>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Select Service Speed
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {safeRates.map((rate) => {
                  const isGoFurtherDisabled = rate.service_type === 'gofurther' && !canSelectGoFurther(selectedDate);
                  const isSelected = selectedRate === rate.id;

                  return (
                    <button
                      key={rate.id}
                      type="button"
                      disabled={isGoFurtherDisabled}
                      onClick={() => setSelectedRate(rate.id)}
                      className={`p-5 rounded-xl border text-left transition-all flex flex-col justify-between gap-4 relative ${
                        isGoFurtherDisabled
                          ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-65'
                          : isSelected
                          ? 'bg-blue-50/90 border-2 border-blue-600 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-extrabold text-slate-900 text-lg">{rate.name}</h3>
                          {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />}
                        </div>
                        <p className="text-slate-500 text-xs leading-relaxed">{rate.description}</p>
                      </div>

                      <div className="pt-3 border-t border-slate-200/80 flex items-baseline justify-between">
                        <span className="text-2xl font-black text-blue-600">${rate.rate_per_lb}</span>
                        <span className="text-xs text-slate-500 font-semibold">/ lb</span>
                      </div>

                      {isGoFurtherDisabled && (
                        <div className="absolute top-2 right-2 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
                          Unavailable after 12PM
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  {t('schedule.orderDetails')} *
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. 2 bags of darks & lights, 1 comforter. Delicate wash cold."
                  value={orderDetails}
                  onChange={(e) => setOrderDetails(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm shadow-2xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  {t('schedule.pickupInstructions')}
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Leave bags by the front porch or gate code #1234."
                  value={pickupInstructions}
                  onChange={(e) => setPickupInstructions(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm shadow-2xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Review & Order Confirmation */}
        {step === 4 && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-200 w-full">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5 pb-4 border-b border-slate-200/80">
              <FileText className="w-5 h-5 text-blue-600 shrink-0" />
              <span>{t('schedule.reviewTitle')}</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="text-slate-500 text-xs font-semibold uppercase mb-1">{t('schedule.pickupDate')}</p>
                <p className="text-slate-900 font-bold text-base">{selectedDate}</p>
                <p className="text-slate-500 text-xs capitalize">Slot: {selectedTimeSlot}</p>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="text-slate-500 text-xs font-semibold uppercase mb-1">{t('schedule.serviceLabel')}</p>
                <p className="text-slate-900 font-bold text-base">
                  {safeRates.find((r) => r.id === selectedRate)?.name} — ${safeRates.find((r) => r.id === selectedRate)?.rate_per_lb}/lb
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="text-slate-500 text-xs font-semibold uppercase mb-1">{t('schedule.frequency')}</p>
                <p className="text-slate-900 font-bold text-base capitalize">{selectedFrequency}</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-1">
              <p className="text-slate-500 text-xs font-semibold uppercase mb-1">Customer & Address Details</p>
              <p className="text-slate-900 font-bold">{formData.first_name} {formData.last_name}</p>
              <p className="text-slate-600 text-sm">{formData.email} • {formData.phone}</p>
              <p className="text-slate-800 text-sm font-medium pt-1">
                📍 {formData.street_address}, {formData.city} {formData.zip_code}
              </p>
              <p className="text-xs font-bold text-blue-700 mt-1">
                Delivery Fee: {selectedLocation.fee === 0 ? 'FREE ($0.00)' : '$25.00 (Outer Zone Service Fee)'}
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <p className="text-slate-500 text-xs font-semibold uppercase mb-1">{t('schedule.orderDetailsSummary')}</p>
              <p className="text-slate-800 text-sm whitespace-pre-wrap">{orderDetails}</p>
              {pickupInstructions && (
                <p className="text-slate-500 text-xs mt-2 italic">Instructions: {pickupInstructions}</p>
              )}
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200/80">
          {step > 1 ? (
            <Button variant="outline" onClick={() => { setStepError(''); setStep((step - 1) as Step); }}>
              <ChevronLeft className="w-4 h-4" />
              {t('common.back')}
            </Button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <Button onClick={handleNextStep}>
              {t('common.next')}
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? t('common.loading') : t('schedule.reserve')}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
