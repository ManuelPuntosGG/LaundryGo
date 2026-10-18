import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { X, CheckCircle2, AlertCircle, Building2, Clock, Loader2, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthContext } from '@/providers/AuthProvider';
import api from '@/api';

interface CommercialWalkthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommercialWalkthroughModal({ isOpen, onClose }: CommercialWalkthroughModalProps) {
  const { t, i18n } = useTranslation();
  const { user } = useAuthContext();

  const userFullName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : '';

  const [name, setName] = useState(() => userFullName);
  const [phone, setPhone] = useState(() => user?.phone || '');
  const [email, setEmail] = useState(() => user?.email || '');
  const [zipCode, setZipCode] = useState(() => user?.zip_code || '');
  const [details, setDetails] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = t('commercialModal.errors.nameRequired', 'Name is required.');
    }
    if (!phone.trim()) {
      newErrors.phone = t('commercialModal.errors.phoneRequired', 'Phone number is required.');
    }
    if (!email.trim()) {
      newErrors.email = t('commercialModal.errors.emailRequired', 'Email is required.');
    } else if (!email.includes('@') || !email.includes('.')) {
      newErrors.email = t('commercialModal.errors.emailInvalid', 'Please enter a valid email address.');
    }
    if (!zipCode.trim()) {
      newErrors.zipCode = t('commercialModal.errors.zipCodeRequired', 'ZIP code is required.');
    }
    if (!details.trim()) {
      newErrors.details = t('commercialModal.errors.detailsRequired', 'Please describe your facility details and requirements.');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await api.post('/cleaning/walkthrough-inquiry/', {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        zip_code: zipCode.trim(),
        details: details.trim(),
        language: i18n.language?.startsWith('es') ? 'es' : 'en',
      });

      setIsSuccess(true);
    } catch (err: unknown) {
      console.error('[Commercial Walkthrough Inquiry Error]', err);
      const apiErr = err as { response?: { data?: { detail?: string; errors?: Record<string, string> } } };
      if (apiErr.response?.data?.errors) {
        setErrors(apiErr.response.data.errors);
      }
      setSubmitError(
        apiErr.response?.data?.detail ||
          t('common.error', 'An error occurred while submitting. Please try again or call us at (720) 590-8632.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setSubmitError('');
    setErrors({});
    if (!user) {
      setName('');
      setPhone('');
      setEmail('');
      setZipCode('');
    }
    setDetails('');
    onClose();
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-fade-in"
      onClick={handleResetAndClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="commercial-modal-title"
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-pop-in my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Banner */}
        <div className="bg-linear-to-r from-emerald-900 via-emerald-800 to-emerald-950 text-white p-5 sm:p-6 relative shrink-0">
          <button
            type="button"
            onClick={handleResetAndClose}
            aria-label={t('commercialModal.closeBtn', 'Close')}
            className="absolute top-4 right-4 text-emerald-200 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30 mb-2">
            <Clock className="w-3.5 h-3.5" />
            <span>{t('commercialModal.badge', 'Same-Day Quote')}</span>
          </div>

          <h2 id="commercial-modal-title" className="text-xl sm:text-2xl font-black text-white flex items-center gap-2 pr-8">
            <Building2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <span>{t('commercialModal.title', 'Request a Commercial Walkthrough')}</span>
          </h2>

          <p className="mt-1.5 text-xs sm:text-sm text-emerald-100 font-medium leading-relaxed">
            {t('commercialModal.subtitle', 'Fill out the form below to coordinate your free 15-minute on-site assessment. We will deliver an itemized written proposal the same business day ($0.00 upfront).')}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {isSuccess ? (
            <div className="text-center py-6 space-y-4 animate-fade-in">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h3 className="text-xl font-black text-slate-900">
                {t('commercialModal.successTitle', 'Walkthrough Request Received!')}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto font-medium">
                {t('commercialModal.successMessage', 'Thank you! Our commercial accounts manager will contact you within the same business day to coordinate your 15-minute walkthrough and prepare your tailored proposal.')}
              </p>
              <div className="pt-2">
                <Button
                  onClick={handleResetAndClose}
                  className="font-black px-8 py-2.5 shadow-md hover:scale-102 transition-transform"
                >
                  <span>{t('commercialModal.successDoneBtn', 'Done')}</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {submitError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Full Name */}
              <Input
                label={t('commercialModal.nameLabel', 'Full Name') + ' *'}
                placeholder={t('commercialModal.namePlaceholder', 'e.g., Sarah Connor')}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                }}
                error={errors.name}
                required
              />

              {/* Phone & Email Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={t('commercialModal.phoneLabel', 'Phone Number') + ' *'}
                  placeholder={t('commercialModal.phonePlaceholder', 'e.g., (720) 555-0199')}
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                  }}
                  error={errors.phone}
                  required
                />
                <Input
                  label={t('commercialModal.emailLabel', 'Email') + ' *'}
                  placeholder={t('commercialModal.emailPlaceholder', 'e.g., sarah@company.com')}
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                  }}
                  error={errors.email}
                  required
                />
              </div>

              {/* Property ZIP Code */}
              <Input
                label={t('commercialModal.zipCodeLabel', 'ZIP Code') + ' *'}
                placeholder={t('commercialModal.zipCodePlaceholder', 'e.g., 80202')}
                value={zipCode}
                onChange={(e) => {
                  setZipCode(e.target.value);
                  if (errors.zipCode) setErrors((prev) => ({ ...prev, zipCode: '' }));
                }}
                error={errors.zipCode}
                required
              />

              {/* Details Textarea */}
              <div className="w-full">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  {t('commercialModal.detailsLabel', 'Business Space & Requirements')} *
                </label>
                <textarea
                  rows={4}
                  className={`w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200 text-sm shadow-2xs resize-none ${
                    errors.details ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10' : ''
                  }`}
                  placeholder={t(
                    'commercialModal.detailsPlaceholder',
                    'Describe your space (type of business, approximate square footage, number of restrooms, preferred frequency or any special needs)...'
                  )}
                  value={details}
                  onChange={(e) => {
                    setDetails(e.target.value);
                    if (errors.details) setErrors((prev) => ({ ...prev, details: '' }));
                  }}
                  required
                />
                {errors.details && (
                  <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1 animate-fade-in">
                    <span>•</span>
                    <span>{errors.details}</span>
                  </p>
                )}
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
                <span className="text-[11px] text-slate-500 font-medium">
                  {t('commercialModal.allFieldsRequired', 'All fields are mandatory.')}
                </span>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleResetAndClose}
                    className="font-bold text-slate-600 hover:text-slate-900"
                  >
                    {t('commercialModal.closeBtn', 'Close')}
                  </Button>
                  <Button
                    type="submit"
                    size="md"
                    disabled={isSubmitting}
                    className="font-black px-6 shadow-md hover:scale-102 transition-transform w-full sm:w-auto"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        <span>{t('commercialModal.submittingBtn', 'Submitting...')}</span>
                      </>
                    ) : (
                      <>
                        <span>{t('commercialModal.submitBtn', 'Submit Walkthrough Request')}</span>
                        <ArrowRight className="w-4 h-4 ml-1.5" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
