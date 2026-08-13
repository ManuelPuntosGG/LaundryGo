import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, Truck, Sparkles, Package, MapPin, Mail, Phone, ArrowRight, Clock, Zap, Star } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export function Home() {
  const { t } = useTranslation();

  const steps = [
    { icon: Calendar, title: t('home.howItWorks.step1.title'), description: t('home.howItWorks.step1.description') },
    { icon: Truck, title: t('home.howItWorks.step2.title'), description: t('home.howItWorks.step2.description') },
    { icon: Sparkles, title: t('home.howItWorks.step3.title'), description: t('home.howItWorks.step3.description') },
    { icon: Package, title: t('home.howItWorks.step4.title'), description: t('home.howItWorks.step4.description') },
  ];

  const services = [
    {
      icon: Package,
      name: t('home.pricing.standard.name'),
      price: t('home.pricing.standard.price'),
      delivery: t('home.pricing.standard.delivery'),
      description: t('home.pricing.standard.description'),
    },
    {
      icon: Zap,
      name: t('home.pricing.go.name'),
      price: t('home.pricing.go.price'),
      delivery: t('home.pricing.go.delivery'),
      description: t('home.pricing.go.description'),
      popular: true,
    },
    {
      icon: Star,
      name: t('home.pricing.gofurther.name'),
      price: t('home.pricing.gofurther.price'),
      delivery: t('home.pricing.gofurther.delivery'),
      description: t('home.pricing.gofurther.description'),
    },
  ];

  return (
    <div className="space-y-12 sm:space-y-16 lg:space-y-20 py-8 sm:py-12 lg:py-16">
      <section className="text-center px-5 sm:px-8 lg:px-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
          {t('home.hero.title')}
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-white/80 mb-6 sm:mb-8 max-w-2xl mx-auto">
          {t('home.hero.subtitle')}
        </p>
        <Link to="/schedule">
          <Button size="lg" className="inline-flex items-center gap-2">
            {t('home.hero.cta')}
            <ArrowRight className="w-5 h-5" />
          </Button>
        </Link>
      </section>

      <section className="px-5 sm:px-8 lg:px-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-8 sm:mb-12">
          {t('home.howItWorks.title')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {steps.map((step, index) => (
            <Card key={index} className="text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary-500/20 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <step.icon className="w-6 h-6 sm:w-7 sm:h-7 text-primary-400" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-white mb-2">{step.title}</h3>
              <p className="text-white/60 text-sm">{step.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="px-5 sm:px-8 lg:px-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-8 sm:mb-12">
          {t('home.pricing.title')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {services.map((service, index) => (
            <Card
              key={index}
              variant={service.popular ? 'glass-blue' : 'glass'}
              className={`relative ${service.popular ? 'ring-2 ring-primary-400' : ''}`}
            >
              {service.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                  Popular
                </div>
              )}
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary-500/20 flex items-center justify-center mb-3 sm:mb-4">
                <service.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-1">{service.name}</h3>
              <p className="text-xl sm:text-2xl font-bold text-primary-400 mb-2">{service.price}</p>
              <div className="flex items-center gap-1 text-white/60 text-sm mb-3">
                <Clock className="w-4 h-4" />
                <span>{service.delivery}</span>
              </div>
              <p className="text-white/60 text-sm">{service.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="px-5 sm:px-8 lg:px-12">
        <Card variant="glass-strong" className="text-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary-500/20 flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <MapPin className="w-7 h-7 sm:w-8 sm:h-8 text-primary-400" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">{t('home.serviceArea.title')}</h2>
          <p className="text-white/70 mb-4 sm:mb-6 text-sm sm:text-base">{t('home.serviceArea.description')}</p>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
            {['Denver', 'Aurora', 'Lakewood', 'Thornton', 'Arvada', 'Westminster'].map((area) => (
              <span key={area} className="bg-glass-white-10 border border-white/20 text-white/80 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm">
                {area}
              </span>
            ))}
          </div>
        </Card>
      </section>

      <section className="px-5 sm:px-8 lg:px-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-6 sm:mb-8">
          {t('home.contact.title')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary-500/20 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-primary-400" />
            </div>
            <div className="text-left min-w-0">
              <p className="text-white/60 text-xs sm:text-sm">{t('home.contact.email')}</p>
              <p className="text-white font-medium text-sm sm:text-base truncate">hello@laundrygo.com</p>
            </div>
          </Card>
          <Card className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary-500/20 flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-primary-400" />
            </div>
            <div className="text-left min-w-0">
              <p className="text-white/60 text-xs sm:text-sm">{t('home.contact.phone')}</p>
              <p className="text-white font-medium text-sm sm:text-base">(303) 555-0123</p>
            </div>
          </Card>
          <Card className="flex items-center gap-3 sm:gap-4 sm:col-span-2 lg:col-span-1">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary-500/20 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-primary-400" />
            </div>
            <div className="text-left min-w-0">
              <p className="text-white/60 text-xs sm:text-sm">{t('home.contact.address')}</p>
              <p className="text-white font-medium text-sm sm:text-base">Denver, Colorado</p>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
