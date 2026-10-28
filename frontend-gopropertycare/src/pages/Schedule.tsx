import { useState, useEffect, useId } from 'react';

import { useNavigate, Navigate } from 'react-router-dom';

import { useTranslation } from 'react-i18next';

import {

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

  Send,

  Building2,

  CreditCard,

  ShieldCheck,

  Flame,

  Snowflake,

  LayoutGrid,

  Grid2X2,

  Heart,

  Waves,

  Utensils,

  Shirt,

  Tag,

  X,

  LogIn,

  type LucideIcon,

} from 'lucide-react';

import { Card } from '@/components/ui/Card';

import { Button } from '@/components/ui/Button';

import { Input } from '@/components/ui/Input';

import { SEO } from '@/components/common/SEO';

import { useAuthContext } from '@/providers/AuthProvider';

import api from '@/api';

import type { CleaningServiceRate, CleaningAddon, CleaningAvailableDate, AppliedCoupon, CouponValidationResponse } from '@/types';

import { QuickAuthModal } from '@/components/common/QuickAuthModal';

import { DEFAULT_CLEANING_RATES } from '@/constants/cleaningServices';

import { PROPERTY_ADDONS } from '@/constants/cleaningAddons';

import { SERVICE_AREAS } from '@/constants/locations';

import {

  PRICING_TIERS,

  getServiceFrequencies,

  getTierBySqft,

  getTierPrice,

  type PricingTier,

  type ServiceFrequency,

  type CleaningServiceTierType,

} from '@/constants/pricingTiers';

import {

  STR_TIERS,

  STR_EXTRA_BATHROOM_PRICE,

  getSTRTierByBedrooms,

} from '@/constants/strPricing';



type Step = 1 | 2 | 3 | 4;



const ADDON_ICONS: Record<string, LucideIcon> = {

  oven: Flame,

  inside_fridge: Snowflake,

  blinds: LayoutGrid,

  inside_windows: Grid2X2,

  pets: Heart,

  str_pets: Heart,

  hot_tub: Waves,

  str_hot_tub: Waves,

  patio_grill: Utensils,

  str_patio_grill: Utensils,

  off_site_laundry: Shirt,

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

    return PRICING_TIERS[0]; // Default lowest starting Tier: 500 – 999 sq ft ($155.00)

  });



  const [serviceType, setServiceType] = useState<CleaningServiceTierType>(() => {

    const searchParams = new URLSearchParams(window.location.search);

    const tierParam = searchParams.get('tier');

    if (tierParam === 'move_in_out') return 'move_in_out';

    if (tierParam === 'deep') return 'deep';

    if (

      tierParam === 'str' ||

      tierParam === 'short_term_rental' ||

      tierParam === 'str_on_site' ||

      tierParam === 'str_off_site'

    )

      return 'str_on_site';

    return 'standard';

  });



  const isSTR = serviceType === 'str_on_site' || serviceType === 'str_off_site';



  const [frequency, setFrequency] = useState<ServiceFrequency>('biweekly'); // Default "Most Popular"



  // Sizing & Consultative Details (Lowest starting configuration: 1 Bed, 1 Bath)

  const [bedrooms, setBedrooms] = useState<number>(1);

  const [bathrooms, setBathrooms] = useState<number>(1);

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

  const [selectedAddonCodes, setSelectedAddonCodes] = useState<Record<string, boolean>>(() => {

    const searchParams = new URLSearchParams(window.location.search);

    const tierParam = searchParams.get('tier');

    const initial: Record<string, boolean> = {};

    if (tierParam === 'str_off_site') {

      initial.off_site_laundry = true;

    }

    return initial;

  });

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



  // Coupon state & Quick Auth Modal

  const [couponCodeInput, setCouponCodeInput] = useState('');

  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);

  const [couponLoading, setCouponLoading] = useState(false);

  const [couponError, setCouponError] = useState('');

  const [isQuickAuthOpen, setIsQuickAuthOpen] = useState(false);



  useEffect(() => {

    if (user) {

      setFormData((prev) => ({

        ...prev,

        first_name: prev.first_name || user.first_name || '',

        last_name: prev.last_name || user.last_name || '',

        email: prev.email || user.email || '',

        phone: prev.phone || user.phone || '',

        street_address: prev.street_address || user.street_address || '',

        city: prev.city || user.city || 'Denver',

        zip_code: prev.zip_code || user.zip_code || '',

      }));

    }

  }, [user]);



  // Stripe Elements integration for live tokenization

  const [stripePublishableKey, setStripePublishableKey] = useState<string>('');

  const [stripeInstance, setStripeInstance] = useState<any>(null);

  const [cardElement, setCardElement] = useState<any>(null);



  // Payment / Card on file state (25% Deposit + 75% Completion Hold)

  const [cardName, setCardName] = useState('');

  const [cardNumber, setCardNumber] = useState('');

  const [cardExpiry, setCardExpiry] = useState('');

  const [cardCvc, setCardCvc] = useState('');



  const formatCardNumber = (value: string) => {

    const digits = value.replace(/\D/g, '').slice(0, 16);

    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');

  };



  const formatCardExpiry = (value: string) => {

    const digits = value.replace(/\D/g, '').slice(0, 4);

    if (digits.length <= 2) return digits;

    return `${digits.slice(0, 2)}/${digits.slice(2)}`;

  };



  // Fetch Stripe config and initialize Stripe.js

  useEffect(() => {

    const fetchStripeConfig = async () => {

      try {

        const envKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

        let key = envKey;

        if (!key) {

          const res = await api.get('/stripe/config/');

          key = res.data?.publishable_key;

        }

        if (key && (key.startsWith('pk_live_') || key.startsWith('pk_test_'))) {

          setStripePublishableKey(key);

          if (!(window as any).Stripe) {

            const script = document.createElement('script');

            script.src = 'https://js.stripe.com/v3/';

            script.async = true;

            script.onload = () => {

              if ((window as any).Stripe) {

                setStripeInstance((window as any).Stripe(key));

              }

            };

            document.head.appendChild(script);

          } else {

            setStripeInstance((window as any).Stripe(key));

          }

        }

      } catch (err) {

        // Fallback to built-in form

      }

    };

    fetchStripeConfig();

  }, []);



  // Mount Stripe CardElement when step 4 is active

  useEffect(() => {

    if (step === 4 && stripeInstance && !cardElement) {

      const timer = setTimeout(() => {

        const mountNode = document.getElementById('stripe-card-mount');

        if (mountNode && !mountNode.hasChildNodes()) {

          try {

            const elements = stripeInstance.elements();

            const element = elements.create('card', {

              hidePostalCode: true,

              style: {

                base: {

                  fontSize: '14px',

                  color: '#0f172a',

                  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",

                  '::placeholder': { color: '#94a3b8' },

                },

                invalid: { color: '#e11d48' },

              },

            });

            element.mount('#stripe-card-mount');

            setCardElement(element);

          } catch (e) {

            console.warn('[Stripe mount error]', e);

          }

        }

      }, 50);

      return () => clearTimeout(timer);

    }

  }, [step, stripeInstance, cardElement]);



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

      if (isSTR) {

        return r.service_type === 'str_on_site' || r.service_type === 'short_term_rental';

      }

      if (serviceType === 'move_in_out') return r.service_type === 'move_in_out' || r.service_type === 'deep';

      if (serviceType === 'deep') return r.service_type === 'deep' || r.service_type === 'move_in_out';

      return r.service_type === 'residential' || r.service_type === 'regular';

    }) || rates[0];



  // STR Price Calculations

  const strTier = getSTRTierByBedrooms(bedrooms);

  const extraBathrooms = Math.max(0, Math.floor(bathrooms - strTier.includedBathrooms));

  const extraBathroomFee = extraBathrooms * STR_EXTRA_BATHROOM_PRICE;

  const currentOffSiteFee = strTier.externalLaundryFee;

  const isOffSiteSelected = isSTR && !!selectedAddonCodes['off_site_laundry'];



  const strCalc = {

    basePrice: strTier.basePrice,

    extraBathrooms,

    extraBathroomFee,

    externalLaundryFee: currentOffSiteFee,

    totalBeforeAddons: strTier.basePrice + extraBathroomFee,

    isCustomQuote: strTier.isCustomQuote || false,

    includedBathrooms: strTier.includedBathrooms,

    maxSqftHint: strTier.maxSqftHint,

  };



  // Pricing calculations based on Tier matrix & recurring frequency discounts

  const isCustomQuote = isSTR

    ? strCalc.isCustomQuote

    : selectedTier.isCustomQuote === true;



  const baseTierPrice = isSTR

    ? strCalc.totalBeforeAddons

    : getTierPrice(selectedTier, serviceType);



  const availableFrequencies = getServiceFrequencies(serviceType);

  const freqOption =

    availableFrequencies.find((f) => f.id === frequency) || availableFrequencies[0];

  const discountPercent = freqOption.discountPercent;

  const frequencyDiscount = Math.round(((baseTierPrice * discountPercent) / 100) * 100) / 100;

  const discountedBasePrice = Math.max(0, baseTierPrice - frequencyDiscount);



  const regularAddonsTotal = addons.reduce((sum, item) => {

    if (item.code !== 'off_site_laundry' && selectedAddonCodes[item.code]) {

      return sum + Number(item.price);

    }

    return sum;

  }, 0);



  const addonsTotal = regularAddonsTotal + (isOffSiteSelected ? currentOffSiteFee : 0);



  const subtotalBeforeCoupon = discountedBasePrice + addonsTotal;

  const couponDiscountAmount = appliedCoupon

    ? Math.round(((subtotalBeforeCoupon * appliedCoupon.discount_percentage) / 100) * 100) / 100

    : 0;

  const totalPrice = Math.max(0, Math.round((subtotalBeforeCoupon - couponDiscountAmount) * 100) / 100);

  const depositAmount = Math.round(totalPrice * 0.25 * 100) / 100;

  const remainingBalance = Math.round((totalPrice - depositAmount) * 100) / 100;



  const representativeSqft = isCustomQuote

    ? (parseInt(customQuoteSqft, 10) || (isSTR ? 4000 : 6500))

    : isSTR

    ? strCalc.maxSqftHint

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



  // Card Validation (Step 4)

  const isCardNameValid = cardName.trim().length >= 2;

  const cardDigits = cardNumber.replace(/\D/g, '');

  const isCardNumberValid = cardDigits.length === 15 || cardDigits.length === 16;



  const validateCardExpiry = (val: string): { isValid: boolean; isPast: boolean } => {

    const digits = val.replace(/\D/g, '');

    if (digits.length !== 4) return { isValid: false, isPast: false };

    const month = parseInt(digits.slice(0, 2), 10);

    const year = 2000 + parseInt(digits.slice(2, 4), 10);

    if (isNaN(month) || month < 1 || month > 12 || isNaN(year)) {

      return { isValid: false, isPast: false };

    }

    const now = new Date();

    const currentYear = now.getFullYear();

    const currentMonth = now.getMonth() + 1;

    if (year < currentYear || (year === currentYear && month < currentMonth)) {

      return { isValid: false, isPast: true };

    }

    return { isValid: true, isPast: false };

  };



  const expiryValidation = validateCardExpiry(cardExpiry);

  const isCardExpiryValid = expiryValidation.isValid;

  const isCardExpiryPast = expiryValidation.isPast;



  const cvcDigits = cardCvc.replace(/\D/g, '');

  const isCardCvcValid = cvcDigits.length === 3 || cvcDigits.length === 4;



  const isCardValid =

    (stripeInstance && cardElement)

      ? isCardNameValid

      : isCardNameValid &&

        isCardNumberValid &&

        isCardExpiryValid &&

        isCardCvcValid;



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



  const handleApplyCoupon = async () => {

    const sanitized = couponCodeInput.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

    if (!sanitized) {

      setCouponError(t('schedule.coupons.enterCodeError'));

      return;

    }

    if (sanitized.length !== 6) {

      setCouponError(t('schedule.coupons.invalidLengthError'));

      return;

    }

    if (!isAuthenticated) {

      setIsQuickAuthOpen(true);

      return;

    }



    setCouponLoading(true);

    setCouponError('');



    try {

      const res = await api.post<CouponValidationResponse>('/coupons/validate/', {

        code: sanitized,

        brand: 'gopropertycare',

      });



      if (res.data && res.data.valid) {

        setAppliedCoupon({

          code: res.data.code,

          discount_percentage: res.data.discount_percentage,

          discount_amount: 0,

        });

        setCouponCodeInput('');

      } else {

        setCouponError(res.data.message || t('schedule.coupons.invalidError'));

      }

    } catch (err: any) {

      const msg =

        err.response?.data?.message ||

        err.response?.data?.error ||

        (err.response?.status === 404

          ? t('schedule.coupons.notFoundError')

          : t('schedule.coupons.validateFailedError'));

      setCouponError(msg);

    } finally {

      setCouponLoading(false);

    }

  };



  const handleRemoveCoupon = () => {

    setAppliedCoupon(null);

    setCouponError('');

  };



  // Submit standard booking

  const handleSubmitBooking = async () => {

    if (!isCardValid || !agreedToTerms) {

      setTouchedFields((prev) => ({

        ...prev,

        cc_name: true,

        cc_number: true,

        cc_exp: true,

        cc_csc: true,

      }));

      return;

    }

    setIsSubmitting(true);

    setErrorMessage('');



    const selectedAddonsPayload = addons

      .filter((a) => a.code !== 'off_site_laundry' && selectedAddonCodes[a.code])

      .map((a) => ({

        code: a.code,

        name: a.name,

        price: Number(a.price),

      }));



    if (isSTR && selectedAddonCodes['off_site_laundry']) {

      selectedAddonsPayload.push({

        code: 'off_site_laundry',

        name: i18n.language?.startsWith('es') ? 'Lavandería Fuera de la Propiedad' : 'Off-Site Laundry Service',

        price: currentOffSiteFee,

      });

    }



    const formattedInstructions = isSTR

      ? `[STR Turnover: ${bedrooms === 0 ? 'Studio' : `${bedrooms} Beds`}, ${bathrooms} Baths • Laundry: ${selectedAddonCodes['off_site_laundry'] ? 'Off-site laundry add-on (+$' + currentOffSiteFee + ')' : 'On-site washer & dryer'} • ${t(freqOption.nameKey)}] ${specialInstructions}`.trim()

      : `[Tier ${selectedTier.tier}: ${selectedTier.label} • ${t(freqOption.nameKey)} (${freqOption.badge})] ${specialInstructions}`.trim();



    let finalPaymentMethodId = `pm_card_${cardDigits.slice(-4)}`;



    if (stripeInstance && cardElement) {

      try {

        const { paymentMethod, error } = await stripeInstance.createPaymentMethod({

          type: 'card',

          card: cardElement,

          billing_details: {

            name: cardName.trim() || `${formData.first_name} ${formData.last_name}`.trim(),

            email: formData.email.trim(),

            phone: formData.phone.trim(),

            address: {

              line1: formData.street_address.trim(),

              city: formData.city.trim() || 'Denver',

              postal_code: formData.zip_code.trim(),

              country: 'US',

            },

          },

        });



        if (error) {

          setErrorMessage(error.message || t('common.error'));

          setIsSubmitting(false);

          return;

        }



        if (paymentMethod?.id) {

          finalPaymentMethodId = paymentMethod.id;

        }

      } catch (err: any) {

        console.warn('[Stripe createPaymentMethod error, falling back]', err);

      }

    }



    const payload = {

      brand: 'gopropertycare',

      guest_email: formData.email.trim(),

      guest_first_name: formData.first_name.trim(),

      guest_last_name: formData.last_name.trim() || 'Client',

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

      payment_method_id: finalPaymentMethodId,

      ...(appliedCoupon ? { coupon_code: appliedCoupon.code } : {}),

    };



    try {

      const response = await api.post('/cleaning/orders/', payload);

      setCreatedOrderId(response.data.id);

      setIsSuccess(true);

      navigate(`/order-success?orderId=${response.data.id}`, {

        replace: true,

        state: {

          orderId: response.data.id,

          serviceType,

          selectedTier,

          freqOption,

          selectedDate,

          selectedTimeSlot,

          formData,

          depositAmount,

          remainingBalance,

          totalPrice,

          customQuoteSubmitted: false,

          bedrooms,

          bathrooms,

          isSTR,

        },

      });

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



  // Submit custom quote lead capture (> 6,100 sq ft or STR 6+ beds)

  const handleCustomQuoteSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    if (!isFirstNameValid || !isPhoneValid || !isEmailValid) {

      setTouchedFields({ first_name: true, phone: true, email: true });

      return;

    }

    setIsSubmittingCustomQuote(true);

    setErrorMessage('');



    const parsedSqft = parseInt(customQuoteSqft, 10) || (isSTR ? 4000 : 6500);

    const notes = isSTR

      ? `[CUSTOM QUOTE STR LEAD (6+ BEDS / >3,500 SQ FT) • ${bedrooms} Beds, ${bathrooms} Baths • Stated Size: ${parsedSqft} sq ft] ${customQuoteNotes}`.trim()

      : `[CUSTOM QUOTE LEAD > 6,100 SQ FT • Stated Size: ${parsedSqft} sq ft] ${customQuoteNotes}`.trim();



    // Ensure service_date is always a valid future date so same-day 12 PM cutoff rules don't block lead capture

    const todayStr = getTodayDateStr();

    const tomorrowStr = getTomorrowDateStr();

    const quoteDate = (!selectedDate || selectedDate <= todayStr) ? tomorrowStr : selectedDate;

    const quoteTime = selectedTimeSlot || '10:00 AM';



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

      service_date: quoteDate,

      time_slot: quoteTime,

      special_instructions: notes,

      language: i18n.language?.startsWith('es') ? 'es' : 'en',

    };



    try {

      const response = await api.post('/cleaning/orders/', payload);

      setCreatedOrderId(response.data.id);

      setCustomQuoteSubmitted(true);

      setIsSuccess(true);

      navigate(`/order-success?orderId=${response.data.id}&type=custom_quote`, {

        replace: true,

        state: {

          orderId: response.data.id,

          serviceType,

          selectedTier,

          freqOption,

          selectedDate: quoteDate,

          selectedTimeSlot: quoteTime,

          formData,

          depositAmount: 0,

          remainingBalance: 0,

          totalPrice: 0,

          customQuoteSubmitted: true,

          customQuoteSqft: parsedSqft,

          bedrooms,

          bathrooms,

          isSTR,

        },

      });

    } catch (err: unknown) {

      console.error('Failed to submit custom quote lead:', err);

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

      setIsSubmittingCustomQuote(false);

    }

  };



  // Redirect to dedicated independent success page

  if (isSuccess && createdOrderId) {

    return (

      <Navigate

        to={`/order-success?orderId=${createdOrderId}${customQuoteSubmitted ? '&type=custom_quote' : ''}`}

        replace

        state={{

          orderId: createdOrderId,

          serviceType,

          selectedTier,

          freqOption,

          selectedDate,

          selectedTimeSlot,

          formData,

          depositAmount: customQuoteSubmitted ? 0 : depositAmount,

          remainingBalance: customQuoteSubmitted ? 0 : remainingBalance,

          totalPrice: customQuoteSubmitted ? 0 : totalPrice,

          customQuoteSubmitted,

          customQuoteSqft: parseInt(customQuoteSqft, 10) || (isSTR ? 4000 : 6500),

          bedrooms,

          bathrooms,

          isSTR,

        }}

      />

    );

  }



  return (

    <div className="max-w-4xl mx-auto pt-4 sm:pt-8 pb-8 px-3.5 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 animate-fade-in">

      <SEO

        title={t('schedule.title')}

        description={t('schedule.subtitle')}

        canonical="https://gopropertycare.com/schedule"

      />

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

          <div className="border-b border-slate-100 pb-3">

            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">

              {t('schedule.step1Title')}

            </h2>

            <p className="text-xs text-slate-600 font-medium mt-0.5">

              {t('schedule.tierDropdownHelp')}

            </p>

          </div>



          {/* Service Type Selection Cards (4 services: Standard, Deep, STR On-Site, STR Off-Site) */}

          <div className="space-y-3">

            <label className="block text-sm font-extrabold text-slate-900">

              {t('schedule.serviceTypeLabel')}

            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

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

                  <span className="text-base sm:text-lg font-black text-slate-900 tabular-nums">

                    ${selectedTier.standardPrice.toFixed(2)}

                  </span>

                </div>

              </div>



              {/* Deep Clean */}

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

                  <span className="text-base sm:text-lg font-black text-slate-900 tabular-nums">

                    ${selectedTier.deepPrice.toFixed(2)}

                  </span>

                </div>

              </div>



              {/* Move-In / Move-Out Clean */}

              <div

                onClick={() => setServiceType('move_in_out')}

                className={`p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between hover:border-emerald-500 hover:shadow-xs active:scale-99 ${

                  serviceType === 'move_in_out'

                    ? 'border-emerald-600 bg-emerald-50/70 shadow-xs ring-2 ring-emerald-600/20'

                    : 'border-slate-200 bg-white hover:border-slate-300'

                }`}

              >

                <div className="space-y-1.5">

                  <div className="flex items-center justify-between">

                    <h3 className="font-black text-slate-900 text-sm sm:text-base">

                      {t('schedule.serviceMoveInOut')}

                    </h3>

                    <div

                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${

                        serviceType === 'move_in_out'

                          ? 'border-emerald-600 bg-emerald-600 text-white'

                          : 'border-slate-300'

                      }`}

                    >

                      {serviceType === 'move_in_out' && <Check className="w-3.5 h-3.5 animate-pop-in" />}

                    </div>

                  </div>

                  <p className="text-xs text-slate-600 font-medium">

                    {t('schedule.serviceMoveInOutDesc')}

                  </p>

                </div>



                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">

                  <span className="text-[11px] text-slate-500 font-bold">{t('schedule.baseTierPrice')}</span>

                  <span className="text-base sm:text-lg font-black text-slate-900 tabular-nums">

                    ${selectedTier.deepPrice.toFixed(2)}

                  </span>

                </div>

              </div>



              {/* Short-Term Rental Clean */}

              <div

                onClick={() => setServiceType('str_on_site')}

                className={`p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between hover:border-emerald-500 hover:shadow-xs active:scale-99 ${

                  isSTR

                    ? 'border-emerald-600 bg-emerald-50/70 shadow-xs ring-2 ring-emerald-600/20'

                    : 'border-slate-200 bg-white hover:border-slate-300'

                }`}

              >

                <div className="space-y-1.5">

                  <div className="flex items-center justify-between">

                    <h3 className="font-black text-slate-900 text-sm sm:text-base">

                      {t('schedule.serviceStr')}

                    </h3>

                    <div

                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${

                        isSTR

                          ? 'border-emerald-600 bg-emerald-600 text-white'

                          : 'border-slate-300'

                      }`}

                    >

                      {isSTR && <Check className="w-3.5 h-3.5 animate-pop-in" />}

                    </div>

                  </div>

                  <p className="text-xs text-slate-600 font-medium">

                    {t('schedule.serviceStrDesc')}

                  </p>

                </div>



                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">

                  <span className="text-[11px] text-slate-500 font-bold">{t('schedule.baseTierPrice')}</span>

                  <span className="text-base sm:text-lg font-black text-slate-900 tabular-nums">

                    ${strCalc.totalBeforeAddons.toFixed(2)}

                  </span>

                </div>

              </div>

            </div>

          </div>



          {/* Sizing & Consultative Details */}

          {isCustomQuote ? (

            <div className="bg-linear-to-b from-emerald-50/60 to-white border-2 border-emerald-300 rounded-2xl p-5 sm:p-7 space-y-5 animate-fade-in">

              <div className="flex items-start justify-between gap-3">

                <div className="flex items-start gap-3">

                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 shadow-inner">

                    <Building2 className="w-5 h-5" />

                  </div>

                  <div>

                    <h3 className="text-base sm:text-lg font-black text-slate-900">

                      {isSTR ? t('schedule.strCustomQuoteTitle') : t('schedule.customQuoteTitle')}

                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">

                      {isSTR ? t('schedule.strCustomQuoteDesc') : t('schedule.customQuoteDesc')}

                    </p>

                  </div>

                </div>



                {isSTR && bedrooms >= 6 && (

                  <button

                    type="button"

                    onClick={() => setBedrooms(2)}

                    className="text-xs text-emerald-700 hover:text-emerald-900 font-bold underline shrink-0 cursor-pointer"

                  >

                    {i18n.language?.startsWith('es') ? 'Volver a habitaciones' : 'Change bedrooms'}

                  </button>

                )}

              </div>



              <form onSubmit={handleCustomQuoteSubmit} className="space-y-4 pt-2">

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">

                  <Input

                    label={`${t('auth.firstName')} *`}

                    autoComplete="given-name"

                    value={formData.first_name}

                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}

                    onBlur={() => setTouchedFields({ ...touchedFields, first_name: true })}

                    error={touchedFields.first_name && !isFirstNameValid ? t('schedule.errFirstName') : ''}

                    placeholder={t('auth.firstName')}

                    required

                  />

                  <Input

                    label={t('auth.lastName')}

                    autoComplete="family-name"

                    value={formData.last_name}

                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}

                    placeholder={t('auth.lastName')}

                  />

                  <Input

                    label={`${t('auth.phone')} *`}

                    type="tel"

                    autoComplete="tel"

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

                    autoComplete="email"

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

                      {isSTR

                        ? (i18n.language?.startsWith('es') ? 'Pies Cuadrados Estimados (> 3,500 sq ft)' : 'Estimated Square Footage (> 3,500 sq ft)')

                        : (i18n.language?.startsWith('es') ? 'Dimensión Estimada (Sq Ft)' : 'Estimated Square Footage')}

                    </label>

                    <input

                      id="custom-sqft-input"

                      type="number"

                      min={isSTR ? 3500 : 6100}

                      value={customQuoteSqft}

                      onChange={(e) => setCustomQuoteSqft(e.target.value)}

                      placeholder={isSTR ? 'e.g. 4200' : 'e.g. 7500'}

                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10 shadow-2xs tabular-nums"

                    />

                  </div>



                  <Input

                    label={`${t('schedule.cityLabel')} *`}

                    autoComplete="address-level2"

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

                    placeholder={i18n.language?.startsWith('es')

                      ? 'ej. Villa de 7 habitaciones en Cherry Creek con hot tub y doble juego de blancos...'

                      : 'e.g. 7-bedroom luxury rental in Cherry Creek with hot tub and double linen sets...'}

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

              {/* Residential: Property Size Dropdown (Tiers 1 to 19) */}

              {!isSTR && (

                <div className="bg-slate-50 border-2 border-slate-200/90 rounded-2xl p-4 sm:p-6 space-y-3">

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">

                    <label htmlFor={tierSelectId} className="block text-sm font-extrabold text-slate-900">

                      {t('schedule.tierDropdownLabel')}

                    </label>

                    <span className="text-xs text-slate-500 font-bold self-start sm:self-auto tabular-nums">

                      {selectedTier.label}

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

                      className="w-full bg-white border-2 border-slate-300 rounded-xl px-4 py-3.5 text-xs sm:text-sm font-black text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/15 shadow-2xs appearance-none cursor-pointer pr-10 hover:border-slate-400 transition-all tabular-nums"

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

              )}



              {/* STR: Short-Term Rental Configurator (Bedrooms, Bathrooms, Washer/Dryer) */}

              {isSTR && (

                <div className="space-y-5 animate-fade-in">

                  {/* Estimated Price Notice Banner (Paso 5 del documento STR) */}

                  <div className="bg-emerald-50/80 border-2 border-emerald-200/90 rounded-2xl p-4 sm:p-5 flex items-start gap-3 shadow-2xs">

                    <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />

                    <div className="space-y-1">

                      <h4 className="text-xs sm:text-sm font-black text-emerald-950">

                        {t('schedule.strTurnoverTitle')}

                      </h4>

                      <p className="text-[11px] sm:text-xs text-emerald-800 font-medium leading-relaxed">

                        {t('schedule.estimatedPriceNotice')}

                      </p>

                    </div>

                  </div>



                  {/* Bedrooms Selector (Paso 1 del documento STR) */}

                  <div className="space-y-2">

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">

                      <label className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5">

                        <Bed className="w-4 h-4 text-emerald-600" />

                        <span>{t('schedule.bedroomsLabel')}</span>

                      </label>

                      <span className="text-[11px] text-slate-500 font-bold tabular-nums">

                        {bedrooms === 0 ? t('schedule.studio') : bedrooms >= 6 ? '6+ Beds (Custom)' : `${bedrooms} ${t('schedule.beds')}`}

                      </span>

                    </div>



                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">

                      {STR_TIERS.map((tier) => {

                        const isSelected = bedrooms === tier.bedrooms;

                        return (

                          <button

                            key={tier.bedrooms}

                            type="button"

                            onClick={() => setBedrooms(tier.bedrooms)}

                            className={`p-2.5 sm:p-3 rounded-xl border-2 text-left transition-all duration-150 cursor-pointer flex flex-col justify-between ${

                              isSelected

                                ? 'border-emerald-600 bg-emerald-50/90 ring-2 ring-emerald-600/20 shadow-xs'

                                : 'border-slate-200 bg-white hover:border-slate-300'

                            }`}

                          >

                            <div className="space-y-0.5">

                              <span className="text-xs sm:text-sm font-black text-slate-900 block truncate">

                                {tier.bedrooms === 0 ? t('schedule.studio') : tier.labelKey}

                              </span>

                              <span className="text-[10px] text-slate-500 font-medium block truncate tabular-nums">

                                {tier.bedrooms >= 6

                                  ? '> 3,500 sq ft'

                                  : `~${tier.maxSqftHint.toLocaleString()} sq ft`}

                              </span>

                            </div>

                            <div className="pt-2 mt-1.5 border-t border-slate-100/80 flex items-center justify-between">

                              <span className="text-xs font-black text-emerald-800 tabular-nums">

                                {tier.isCustomQuote ? 'Custom' : `$${tier.basePrice}`}

                              </span>

                              {isSelected && <Check className="w-3 h-3 text-emerald-700" />}

                            </div>

                          </button>

                        );

                      })}

                    </div>

                  </div>



                  {/* Bathrooms Selector (Paso 2 del documento STR) */}

                  <div className="space-y-2 pt-2 border-t border-slate-100">

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">

                      <label className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5">

                        <Bath className="w-4 h-4 text-emerald-600" />

                        <span>{t('schedule.bathroomsLabel')}</span>

                      </label>

                      <span className="text-[11px] text-slate-500 font-bold tabular-nums">

                        {bathrooms} {t('schedule.baths')} ({strCalc.includedBathrooms} {t('schedule.strIncludedBaths')})

                      </span>

                    </div>



                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">

                      {[1, 1.5, 2, 2.5, 3, 3.5, 4].map((num) => (

                        <button

                          key={num}

                          type="button"

                          onClick={() => setBathrooms(num)}

                          className={`min-h-[40px] py-1.5 px-0.5 rounded-xl text-xs font-black border transition-all cursor-pointer touch-manipulation flex items-center justify-center tabular-nums ${

                            bathrooms === num

                              ? 'border-emerald-600 bg-emerald-600 text-white shadow-2xs'

                              : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'

                          }`}

                        >

                          {num === 4 ? '4+' : num}

                        </button>

                      ))}

                    </div>



                    <div className="flex items-center justify-between text-xs pt-0.5">

                      <span className="text-slate-500 font-medium tabular-nums">

                        {strCalc.includedBathrooms} {t('schedule.baths')} {t('schedule.strIncludedBaths')}

                      </span>

                      {strCalc.extraBathrooms > 0 ? (

                        <span className="text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 tabular-nums">

                          +{strCalc.extraBathrooms} {t('schedule.extraBathFee')} (+${strCalc.extraBathroomFee.toFixed(2)})

                        </span>

                      ) : (

                        <span className="text-slate-400 font-medium text-[11px] tabular-nums">

                          {t('schedule.strExtraBaths')}

                        </span>

                      )}

                    </div>

                  </div>

                </div>

              )}



              {/* Service Frequency Selection Tabs */}

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

                  {availableFrequencies.map((freq) => {

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

                        <div>

                          <h4 className="font-black text-slate-900 text-xs sm:text-sm leading-snug">

                            {t(freq.nameKey)}

                          </h4>

                        </div>



                        <div className="pt-2 mt-2 border-t border-slate-100/80">

                          <span className="text-xs font-black text-slate-900 block tabular-nums">

                            ${freqNet.toFixed(2)}

                          </span>

                          {freq.discountPercent > 0 && (

                            <span className="text-[10px] text-emerald-700 font-bold block tabular-nums">

                              -{freq.discountPercent}% saved

                            </span>

                          )}

                        </div>

                      </button>

                    );

                  })}

                </div>

              </div>



              {/* Consultative Details (Bedrooms, Bathrooms for Residential) */}

              {!isSTR && (

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

                            className={`min-h-[40px] py-1.5 px-1 rounded-xl text-xs font-black border transition-all cursor-pointer touch-manipulation flex items-center justify-center tabular-nums ${

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

                            className={`min-h-[40px] py-1.5 px-0.5 rounded-xl text-xs font-black border transition-all cursor-pointer touch-manipulation flex items-center justify-center tabular-nums ${

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

              )}



              {/* Priced Add-ons (Integral in Step 1) */}

              <div className="space-y-3 pt-3 border-t border-slate-100">

                <div>

                  <label className="block text-sm font-extrabold text-slate-900 flex items-center gap-1.5">

                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />

                    <span>{t('schedule.addonsTitle')}</span>

                  </label>

                  <p className="text-xs text-slate-600 font-medium">

                    {t('schedule.addonsSubtitle')}

                  </p>

                </div>



                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                  {[...addons]

                    .filter((addon) => {

                      if (addon.code === 'off_site_laundry') return isSTR;

                      return true;

                    })

                    .sort((a, b) => {

                      if (isSTR) {

                        const strCodes = ['off_site_laundry', 'pets', 'hot_tub', 'patio_grill'];

                        const aIsStr = strCodes.includes(a.code);

                        const bIsStr = strCodes.includes(b.code);

                        if (aIsStr && !bIsStr) return -1;

                        if (!aIsStr && bIsStr) return 1;

                      }

                      return 0;

                    })

                    .map((addon) => {

                    const isChecked = !!selectedAddonCodes[addon.code];

                    const localizedName = t(`cleaningAddons.${addon.code}.name`, { defaultValue: addon.name });

                    const localizedDesc = t(`cleaningAddons.${addon.code}.description`, { defaultValue: addon.description });

                    const displayPrice = addon.code === 'off_site_laundry' ? currentOffSiteFee : Number(addon.price);

                    const AddonIcon = ADDON_ICONS[addon.code] || Check;



                    return (

                      <div

                        key={addon.code}

                        onClick={() => {

                          const nextVal = !isChecked;

                          setSelectedAddonCodes({

                            ...selectedAddonCodes,

                            [addon.code]: nextVal,

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

                              <AddonIcon className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />

                              <span>{localizedName}</span>

                            </span>

                            <span className="font-black text-emerald-700 text-xs sm:text-sm tabular-nums">+${displayPrice.toFixed(2)}</span>

                          </div>

                          <p className="text-slate-600 text-[11px] sm:text-xs font-medium mt-0.5 leading-relaxed">{localizedDesc}</p>

                          {addon.code === 'off_site_laundry' && (

                            <p className="text-[11px] font-semibold mt-1 text-slate-500 tabular-nums">

                              {isChecked

                                ? (i18n.language?.startsWith('es')

                                    ? `✓ Tarifa escalada para ${bedrooms === 0 ? 'Studio' : `${bedrooms} hab`}: +$${currentOffSiteFee.toFixed(2)}`

                                    : `✓ Scaled fee for ${bedrooms === 0 ? 'Studio' : `${bedrooms} bed(s)`}: +$${currentOffSiteFee.toFixed(2)}`)

                                : (i18n.language?.startsWith('es')

                                    ? '✓ Por defecto: Lavado de sábanas en la unidad ($0.00 adicional)'

                                    : '✓ Default: On-site washer & dryer linen laundering ($0.00 extra)')}

                            </p>

                          )}

                        </div>

                      </div>

                    );

                  })}

                </div>

              </div>



              {/* Step 1 Running Summary & Next Button */}

              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">

                <div className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 flex items-center justify-between sm:justify-start gap-4">

                  <div>

                    <span className="text-[11px] text-slate-500 font-semibold block">{t('schedule.totalDue')}</span>

                    <div className="flex items-baseline gap-1.5">

                      <span className="text-lg sm:text-xl font-black text-slate-900 tabular-nums">

                        ${totalPrice.toFixed(2)}

                      </span>

                      {addonsTotal > 0 && (

                        <span className="text-xs text-slate-500 font-medium tabular-nums">

                          (${discountedBasePrice.toFixed(2)} base + ${addonsTotal.toFixed(2)} extras)

                        </span>

                      )}

                      {discountPercent > 0 && (

                        <span className="text-xs text-slate-400 line-through tabular-nums">

                          ${(baseTierPrice + addonsTotal).toFixed(2)}

                        </span>

                      )}

                    </div>

                  </div>

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

                <span className="text-sm font-black text-slate-900 tabular-nums">${totalPrice.toFixed(2)}</span>

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

              autoComplete="street-address"

              value={formData.street_address}

              onChange={(e) => setFormData({ ...formData, street_address: e.target.value })}

              onBlur={() => setTouchedFields({ ...touchedFields, street_address: true })}

              error={touchedFields.street_address && !isAddressValid ? t('schedule.errAddress') : ''}

              placeholder={t('schedule.addressPlaceholder')}

            />



            <Input

              label={`${t('schedule.cityLabel')} *`}

              autoComplete="address-level2"

              value={formData.city}

              onChange={(e) => setFormData({ ...formData, city: e.target.value })}

              onBlur={() => setTouchedFields({ ...touchedFields, city: true })}

              error={touchedFields.city && !isCityValid ? t('schedule.errCity') : ''}

              placeholder={t('schedule.cityPlaceholder')}

            />



            <Input

              label={`${t('schedule.zipLabel')} *`}

              autoComplete="postal-code"

              value={formData.zip_code}

              onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}

              onBlur={() => setTouchedFields({ ...touchedFields, zip_code: true })}

              error={touchedFields.zip_code && !isZipValid ? t('schedule.errZip') : ''}

              placeholder={t('schedule.zipPlaceholder')}

            />



            <Input

              label={`${t('auth.firstName')} *`}

              autoComplete="given-name"

              value={formData.first_name}

              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}

              onBlur={() => setTouchedFields({ ...touchedFields, first_name: true })}

              error={touchedFields.first_name && !isFirstNameValid ? t('schedule.errFirstName') : ''}

              placeholder={t('auth.firstName')}

            />



            <Input

              label={`${t('auth.lastName')} *`}

              autoComplete="family-name"

              value={formData.last_name}

              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}

              onBlur={() => setTouchedFields({ ...touchedFields, last_name: true })}

              error={touchedFields.last_name && !isLastNameValid ? t('schedule.errLastName') : ''}

              placeholder={t('auth.lastName')}

            />



            <Input

              label={`${t('auth.phone')} *`}

              type="tel"

              autoComplete="tel"

              value={formData.phone}

              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}

              onBlur={() => setTouchedFields({ ...touchedFields, phone: true })}

              error={touchedFields.phone && !isPhoneValid ? t('schedule.errPhone') : ''}

              placeholder={t('schedule.phonePlaceholder')}

            />



            <Input

              label={`${t('auth.emailLabel')} *`}

              type="email"

              autoComplete="email"

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

                <span className="text-sm font-black text-slate-900 tabular-nums">${totalPrice.toFixed(2)}</span>

              </div>

              <Button

                size="md"

                disabled={!canProceedFromStep3}

                onClick={() => {

                  if (!cardName.trim()) {

                    const fullName = `${formData.first_name} ${formData.last_name}`.trim();

                    if (fullName) setCardName(fullName);

                  }

                  setStep(4);

                }}

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
        <Card key="step-4" className="p-3.5 sm:p-8 space-y-4 sm:space-y-6 animate-fade-in-up">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
              {t('schedule.step4Title')}
            </h2>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              {t('schedule.step4Subtitle')}
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 sm:p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span className="min-w-0 break-words">{errorMessage}</span>
            </div>
          )}

          {/* Summary Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-6">
            {/* Service & Schedule */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 sm:p-5 space-y-2.5 text-xs overflow-hidden">
              <h3 className="font-black text-slate-900 text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2">
                <Home className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{t('schedule.serviceDetails')}</span>
              </h3>
              <div className="flex justify-between items-start gap-2 min-w-0">
                <span className="text-slate-600 font-semibold shrink-0">{t('schedule.serviceTypeLabel')}:</span>
                <span className="font-bold text-slate-900 text-right min-w-0 break-words">
                  {serviceType === 'standard'
                    ? t('schedule.serviceStandard')
                    : serviceType === 'deep'
                    ? t('schedule.serviceDeep')
                    : serviceType === 'move_in_out'
                    ? t('schedule.serviceMoveInOut')
                    : t('schedule.serviceStr')}
                </span>
              </div>
              <div className="flex justify-between items-start gap-2 min-w-0">
                <span className="text-slate-600 font-semibold shrink-0">{t('schedule.dimensions')}:</span>
                <span className="font-bold text-slate-900 text-right min-w-0 break-words">
                  {isSTR
                    ? `${bedrooms === 0 ? t('schedule.studio') : `${bedrooms} ${t('schedule.beds')}`}, ${bathrooms} ${t('schedule.baths')} • ${selectedAddonCodes['off_site_laundry'] ? (i18n.language?.startsWith('es') ? 'Lavandería externa (Add-on)' : 'Off-site laundry (Add-on)') : (i18n.language?.startsWith('es') ? 'Lavado en propiedad' : 'On-site laundry')}`
                    : `${selectedTier.label} • ${bedrooms === 0 ? t('schedule.studio') : `${bedrooms} ${t('schedule.beds')}`}, ${bathrooms} ${t('schedule.baths')}`}
                </span>
              </div>
              <div className="flex justify-between items-start gap-2 min-w-0">
                <span className="text-slate-600 font-semibold shrink-0">{t('schedule.frequencyTitle')}:</span>
                <span className="font-bold text-slate-900 text-right min-w-0 break-words">
                  {t(freqOption.nameKey)}
                </span>
              </div>
              <div className="flex justify-between items-start gap-2 min-w-0">
                <span className="text-slate-600 font-semibold shrink-0">{t('schedule.scheduledDate')}:</span>
                <span className="font-bold text-slate-900 text-right tabular-nums shrink-0">{selectedDate}</span>
              </div>
              <div className="flex justify-between items-start gap-2 min-w-0">
                <span className="text-slate-600 font-semibold shrink-0">{t('schedule.timeSlotLabel')}:</span>
                <span className="font-bold text-slate-900 text-right tabular-nums shrink-0">{selectedTimeSlot}</span>
              </div>
            </div>

            {/* Address, Contact & Access */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 sm:p-5 space-y-2.5 text-xs overflow-hidden">
              <h3 className="font-black text-slate-900 text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{t('schedule.locationContact')}</span>
              </h3>
              <div className="flex justify-between items-start gap-2 min-w-0">
                <span className="text-slate-600 font-semibold shrink-0">{t('schedule.client')}:</span>
                <span className="font-bold text-slate-900 text-right min-w-0 truncate">{formData.first_name} {formData.last_name}</span>
              </div>
              <div className="flex justify-between items-start gap-2 min-w-0">
                <span className="text-slate-600 font-semibold shrink-0">{t('auth.phone')}:</span>
                <span className="font-bold text-slate-900 text-right tabular-nums shrink-0">{formData.phone}</span>
              </div>
              <div className="flex justify-between items-start gap-2 min-w-0">
                <span className="text-slate-600 font-semibold shrink-0">{t('schedule.addressLabel')}:</span>
                <span className="font-bold text-slate-900 text-right min-w-0 break-words">{formData.street_address}, {formData.city || 'Denver'}</span>
              </div>
              <div className="flex justify-between items-start gap-2 min-w-0">
                <span className="text-slate-600 font-semibold shrink-0">{t('schedule.accessMethod')}:</span>
                <span className="font-bold text-slate-900 text-right min-w-0 break-words">
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
                <div className="flex justify-between items-start gap-2 min-w-0">
                  <span className="text-slate-600 font-semibold shrink-0">{t('schedule.accessNote')}:</span>
                  <span className="font-medium text-slate-900 text-right min-w-0 break-words">{entryNotes}</span>
                </div>
              )}
            </div>
          </div>

          {/* Promo & Coupon Code Section */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 sm:p-5 space-y-3">
            <div className="flex items-center justify-between gap-2 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <Tag className="w-4 h-4 text-emerald-600 shrink-0" />
                <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm uppercase tracking-wider truncate">
                  {t('schedule.coupons.title')}
                </h3>
              </div>
              {appliedCoupon && (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full shrink-0">
                  {appliedCoupon.discount_percentage}% OFF
                </span>
              )}
            </div>

            {!isAuthenticated ? (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs">
                <div className="min-w-0">
                  <p className="font-bold text-emerald-950">{t('schedule.coupons.haveCoupon')}</p>
                  <p className="text-emerald-800 text-[11px] mt-0.5">{t('schedule.coupons.loginPrompt')}</p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setIsQuickAuthOpen(true)}
                  className="w-full sm:w-auto font-bold bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 cursor-pointer shadow-xs min-h-[40px] justify-center"
                >
                  <LogIn className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                  <span>{t('schedule.coupons.loginButton')}</span>
                </Button>
              </div>
            ) : appliedCoupon ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="min-w-0">
                    <span className="font-extrabold text-emerald-950 font-mono tracking-wider mr-2">
                      {appliedCoupon.code}
                    </span>
                    <span className="text-emerald-700 font-semibold text-[11px] sm:text-xs">
                      (-{appliedCoupon.discount_percentage}% = -${couponDiscountAmount.toFixed(2)})
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer hover:underline self-end sm:self-auto shrink-0"
                >
                  <X className="w-3.5 h-3.5 shrink-0" />
                  <span>{t('schedule.coupons.remove')}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    type="text"
                    value={couponCodeInput}
                    maxLength={6}
                    onChange={(e) => {
                      const clean = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
                      setCouponCodeInput(clean);
                      if (couponError) setCouponError('');
                    }}
                    placeholder={t('schedule.coupons.placeholder')}
                    className="w-full text-xs font-mono font-bold tracking-wider uppercase min-h-[42px]"
                  />
                  <Button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || couponCodeInput.length !== 6}
                    className="w-full sm:w-auto font-bold px-6 bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 cursor-pointer disabled:opacity-50 min-h-[42px] justify-center"
                  >
                    {couponLoading ? (
                      <span className="animate-spin inline-block mr-1">⌛</span>
                    ) : (
                      t('schedule.coupons.apply')
                    )}
                  </Button>
                </div>
                {couponError && (
                  <p className="text-xs text-rose-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{couponError}</span>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Dynamic Sticky Cost Breakdown Card */}
          <div className="bg-white border-2 border-emerald-200/90 rounded-2xl p-3.5 sm:p-6 space-y-3 shadow-2xs">
            <h3 className="font-black text-emerald-950 text-xs sm:text-sm uppercase tracking-wider flex items-center justify-between">
              <span>{t('schedule.costBreakdown')}</span>
            </h3>

            {/* Base Turnover or Tier Price */}
            {isSTR ? (
              <>
                <div className="flex justify-between items-start text-slate-700 text-xs font-medium gap-2">
                  <span className="min-w-0 pr-1">
                    {t('schedule.baseTierPrice')} ({bedrooms === 0 ? t('schedule.studio') : `${bedrooms} ${t('schedule.beds')}`} • {t('schedule.strIncludedBaths')} {strCalc.includedBathrooms} {t('schedule.baths')}):
                  </span>
                  <span className="font-bold text-slate-900 tabular-nums shrink-0">${strCalc.basePrice.toFixed(2)}</span>
                </div>

                {strCalc.extraBathrooms > 0 && (
                  <div className="flex justify-between items-start text-slate-700 text-xs font-medium gap-2">
                    <span className="min-w-0 pr-1">
                      {t('schedule.extraBathFee')} ({strCalc.extraBathrooms} x ${STR_EXTRA_BATHROOM_PRICE}):
                    </span>
                    <span className="font-bold text-slate-900 tabular-nums shrink-0">+${strCalc.extraBathroomFee.toFixed(2)}</span>
                  </div>
                )}
              </>
            ) : (
              <div className="flex justify-between items-start text-slate-700 text-xs font-medium gap-2">
                <span className="min-w-0 pr-1">{t('schedule.baseTierPrice')} ({selectedTier.label}):</span>
                <span className="font-bold text-slate-900 tabular-nums shrink-0">${baseTierPrice.toFixed(2)}</span>
              </div>
            )}

            {/* Recurring Frequency Discount */}
            {discountPercent > 0 && (
              <div className="flex justify-between items-center text-emerald-800 text-xs font-bold bg-emerald-50/80 p-2 sm:p-2.5 rounded-xl gap-2">
                <span className="min-w-0 pr-1">{t('schedule.frequencyDiscount')} ({t(freqOption.nameKey)}):</span>
                <span className="tabular-nums shrink-0">-${frequencyDiscount.toFixed(2)}</span>
              </div>
            )}

            {/* Off-Site Laundry Add-on (for STR when selected) */}
            {isSTR && isOffSiteSelected && (
              <div className="flex justify-between items-start text-slate-700 text-xs font-medium gap-2">
                <span className="min-w-0 pr-1">{t('schedule.offSiteLaundryAddonTitle')}:</span>
                <span className="font-bold text-slate-900 tabular-nums shrink-0">+${currentOffSiteFee.toFixed(2)}</span>
              </div>
            )}

            {/* Other Addons for STR */}
            {isSTR && regularAddonsTotal > 0 && (
              <div className="flex justify-between items-start text-slate-700 text-xs font-medium gap-2">
                <span className="min-w-0 pr-1">{t('schedule.addonsFee')}:</span>
                <span className="font-bold text-slate-900 tabular-nums shrink-0">+${regularAddonsTotal.toFixed(2)}</span>
              </div>
            )}

            {/* Addons for non-STR */}
            {!isSTR && addonsTotal > 0 && (
              <div className="flex justify-between items-start text-slate-700 text-xs font-medium gap-2">
                <span className="min-w-0 pr-1">{t('schedule.addonsFee')}:</span>
                <span className="font-bold text-slate-900 tabular-nums shrink-0">+${addonsTotal.toFixed(2)}</span>
              </div>
            )}

            {/* Coupon Discount Row */}
            {appliedCoupon && couponDiscountAmount > 0 && (
              <div className="flex justify-between items-center text-emerald-800 text-xs font-bold bg-emerald-50 border border-emerald-300 p-2.5 rounded-xl gap-2">
                <span className="flex items-center gap-1.5 min-w-0 pr-1">
                  <Tag className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span className="truncate">{t('schedule.coupons.discountRow')} ({appliedCoupon.code} -{appliedCoupon.discount_percentage}%):</span>
                </span>
                <span className="tabular-nums shrink-0">-${couponDiscountAmount.toFixed(2)}</span>
              </div>
            )}

            {/* Total Estimated Service Quote */}
            <div className="pt-3 border-t-2 border-emerald-100 flex justify-between items-baseline gap-2">
              <div className="min-w-0">
                <span className="font-black text-slate-900 text-sm sm:text-base block">{t('schedule.totalEstimatedQuote')}:</span>
                {discountPercent > 0 && (
                  <span className="text-[11px] text-emerald-700 font-bold block mt-0.5">
                    Includes {discountPercent}% recurring discount
                  </span>
                )}
              </div>
              <span className="font-bold text-slate-700 text-base sm:text-lg tabular-nums shrink-0">${totalPrice.toFixed(2)}</span>
            </div>

            {/* 25% Deposit Due Today vs 75% Balance Upon Completion Breakdown */}
            <div className="bg-emerald-50/90 border-2 border-emerald-300/80 rounded-2xl p-3.5 sm:p-5 space-y-3">
              <div className="flex flex-wrap sm:flex-nowrap justify-between items-baseline gap-2">
                <div className="min-w-0">
                  <span className="font-black text-emerald-950 text-sm sm:text-base block">{t('schedule.depositDueToday')} (25%):</span>
                  <span className="text-[11px] text-emerald-700 font-semibold block">{t('schedule.depositChargedNow')}</span>
                </div>
                <span className="font-black text-2xl sm:text-3xl text-emerald-700 tabular-nums shrink-0">${depositAmount.toFixed(2)}</span>
              </div>
              <div className="flex flex-wrap sm:flex-nowrap justify-between items-center pt-2.5 border-t border-emerald-200 text-xs text-slate-600 font-medium gap-2">
                <div className="min-w-0">
                  <span className="font-bold text-slate-800 block">{t('schedule.balanceDueUponCompletion')} (75%):</span>
                  <span className="text-[11px] text-slate-500 block">{t('schedule.balanceDueUponCompletionHelp')}</span>
                </div>
                <span className="font-bold text-slate-900 text-sm sm:text-base tabular-nums shrink-0">${remainingBalance.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-emerald-200/60 text-xs">
                <span className="font-extrabold text-emerald-900">{t('schedule.dueTodayLabel')}</span>
                <span className="font-black text-base text-emerald-800 tabular-nums">$0.00</span>
              </div>
            </div>

            {/* Estimated Price Transparency Notice */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-xs font-medium flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span className="min-w-0">{t('schedule.estimatedPriceNotice')}</span>
            </div>
          </div>

          {/* Card on File Section (Stripe 256-bit Secure Vault) */}
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-3.5 sm:p-5 space-y-3 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-black text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{t('schedule.paymentMethodTitle')}</span>
              </span>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Stripe 256-bit SSL</span>
              </div>
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              {t('schedule.cardOnFileInfo')}
            </p>
            {stripePublishableKey && stripeInstance ? (
              <div className="space-y-3 pt-1">
                <div>
                  <label htmlFor="cc-name" className="block text-[11px] font-bold text-slate-700 mb-1">
                    {t('schedule.cardholderNameLabel')} *
                  </label>
                  <input
                    id="cc-name"
                    name="cc-name"
                    type="text"
                    autoComplete="cc-name"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder={t('schedule.cardholderNamePlaceholder')}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {t('schedule.cardNumber')} &amp; {t('schedule.cardExpiry')} / {t('schedule.cardCvc')} *
                  </label>
                  <div
                    id="stripe-card-mount"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-3 focus-within:border-emerald-600 focus-within:bg-white transition-all min-h-[46px]"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Cardholder Name */}
                <div className="sm:col-span-2">
                  <label htmlFor="cc-name" className="block text-[11px] font-bold text-slate-700 mb-1">
                    {t('schedule.cardholderNameLabel')} *
                  </label>
                  <input
                    id="cc-name"
                    name="cc-name"
                    type="text"
                    autoComplete="cc-name"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    onBlur={() => setTouchedFields({ ...touchedFields, cc_name: true })}
                    placeholder={t('schedule.cardholderNamePlaceholder')}
                    className={`w-full bg-slate-50 border rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-900 font-medium focus:outline-none focus:bg-white ${
                      touchedFields.cc_name && !isCardNameValid
                        ? 'border-rose-500 focus:border-rose-600'
                        : 'border-slate-300 focus:border-emerald-600'
                    }`}
                  />
                  {touchedFields.cc_name && !isCardNameValid && (
                    <p className="mt-1 text-[11px] text-rose-600 font-semibold">{t('schedule.cardNameRequired')}</p>
                  )}
                </div>

                {/* Card Number */}
                <div className="flex flex-col justify-end">
                  <label htmlFor="cc-number" className="block text-[11px] font-bold text-slate-700 mb-1">
                    {t('schedule.cardNumber')} *
                  </label>
                  <input
                    id="cc-number"
                    name="cc-number"
                    type="text"
                    autoComplete="cc-number"
                    inputMode="numeric"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    onBlur={() => setTouchedFields({ ...touchedFields, cc_number: true })}
                    placeholder="4242 •••• •••• 4242"
                    maxLength={19}
                    className={`w-full bg-slate-50 border rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-900 font-mono tabular-nums font-medium focus:outline-none focus:bg-white ${
                      touchedFields.cc_number && !isCardNumberValid
                        ? 'border-rose-500 focus:border-rose-600'
                        : 'border-slate-300 focus:border-emerald-600'
                    }`}
                  />
                  {touchedFields.cc_number && !isCardNumberValid && (
                    <p className="mt-1 text-[11px] text-rose-600 font-semibold">{t('schedule.cardNumberInvalid')}</p>
                  )}
                </div>

                {/* Expiry & CVC */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col justify-end">
                    <label htmlFor="cc-exp" className="block text-[11px] font-bold text-slate-700">
                      {t('schedule.cardExpiry')} *
                    </label>
                    <span id="exp-hint" className="block text-[10px] text-slate-500 font-medium mb-1 truncate">
                      {t('schedule.cardFormatHint')}
                    </span>
                    <input
                      id="cc-exp"
                      name="cc-exp"
                      type="text"
                      autoComplete="cc-exp"
                      aria-describedby="exp-hint"
                      inputMode="numeric"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(formatCardExpiry(e.target.value))}
                      onBlur={() => setTouchedFields({ ...touchedFields, cc_exp: true })}
                      placeholder="MM / YY"
                      maxLength={7}
                      className={`w-full bg-slate-50 border rounded-xl px-2.5 py-2.5 text-xs sm:text-sm text-slate-900 font-mono tabular-nums font-medium focus:outline-none focus:bg-white text-center ${
                        touchedFields.cc_exp && !isCardExpiryValid
                          ? 'border-rose-500 focus:border-rose-600'
                          : 'border-slate-300 focus:border-emerald-600'
                      }`}
                    />
                    {touchedFields.cc_exp && !isCardExpiryValid && (
                      <p className="mt-1 text-[11px] text-rose-600 font-semibold">
                        {isCardExpiryPast ? t('schedule.cardExpiryPast') : t('schedule.cardExpiryInvalid')}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col justify-end">
                    <label htmlFor="cc-csc" className="block text-[11px] font-bold text-slate-700 mb-1">
                      {t('schedule.cardCvc')} *
                    </label>
                    <input
                      id="cc-csc"
                      name="cc-csc"
                      type="text"
                      autoComplete="cc-csc"
                      inputMode="numeric"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      onBlur={() => setTouchedFields({ ...touchedFields, cc_csc: true })}
                      placeholder="CVC"
                      maxLength={4}
                      className={`w-full bg-slate-50 border rounded-xl px-2.5 py-2.5 text-xs sm:text-sm text-slate-900 font-mono tabular-nums font-medium focus:outline-none focus:bg-white text-center ${
                        touchedFields.cc_csc && !isCardCvcValid
                          ? 'border-rose-500 focus:border-rose-600'
                          : 'border-slate-300 focus:border-emerald-600'
                      }`}
                    />
                    {touchedFields.cc_csc && !isCardCvcValid && (
                      <p className="mt-1 text-[11px] text-rose-600 font-semibold">{t('schedule.cardCvcInvalid')}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Terms Agreement Checkbox */}
          <div className="flex items-start gap-3 bg-white p-3.5 border border-slate-200 rounded-xl shadow-2xs">
            <input
              type="checkbox"
              id="agree-terms"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="w-4 h-4 accent-emerald-600 rounded mt-0.5 cursor-pointer shrink-0"
            />
            <label htmlFor="agree-terms" className="text-xs text-slate-700 cursor-pointer font-medium leading-relaxed select-none min-w-0">
              {t('schedule.termsAgree')}
            </label>
          </div>

          {/* Controls */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              size="md"
              onClick={() => setStep(3)}
              className="w-full sm:w-auto px-4 sm:px-5 min-h-[46px] text-xs sm:text-sm font-bold hover:scale-102 active:scale-98 transition-all duration-200 justify-center"
            >
              <ChevronLeft className="w-4 h-4 mr-1 shrink-0" />
              <span>{t('schedule.back')}</span>
            </Button>
            <Button
              size="md"
              disabled={!agreedToTerms || !isCardValid || isSubmitting}
              onClick={handleSubmitBooking}
              className="w-full sm:w-auto sm:px-8 min-h-[48px] text-xs sm:text-sm font-black shadow-md hover:shadow-lg hover:scale-102 active:scale-98 transition-all duration-200 justify-center py-3"
            >
              <CreditCard className="w-4 h-4 mr-2 shrink-0" />
              <span className="text-center font-black">
                {isSubmitting ? t('schedule.submitting') : t('schedule.payDepositAndBook')}
              </span>
            </Button>
          </div>
        </Card>
      )}\n
      <QuickAuthModal

        isOpen={isQuickAuthOpen}

        onClose={() => setIsQuickAuthOpen(false)}

      />

    </div>

  );

}

