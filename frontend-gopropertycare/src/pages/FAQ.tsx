import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Search,
  X,
  ChevronDown,
  Phone,
  Mail,
  HelpCircle,
  Home,
  Building2,
  CreditCard,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { SEO } from '@/components/common/SEO';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface FaqItem {
  q: string;
  a: string;
}

type CategoryKey = 'all' | 'general' | 'residential' | 'commercial' | 'policies';

export function FAQ() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('all');
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

  // Load category arrays from translation dictionary
  const generalItems = useMemo(
    () => (t('faq.items.general', { returnObjects: true }) as FaqItem[]) || [],
    [t]
  );
  const residentialItems = useMemo(
    () => (t('faq.items.residential', { returnObjects: true }) as FaqItem[]) || [],
    [t]
  );
  const commercialItems = useMemo(
    () => (t('faq.items.commercial', { returnObjects: true }) as FaqItem[]) || [],
    [t]
  );
  const policiesItems = useMemo(
    () => (t('faq.items.policies', { returnObjects: true }) as FaqItem[]) || [],
    [t]
  );

  const categoriesConfig: {
    key: CategoryKey;
    label: string;
    icon: typeof HelpCircle;
    items: FaqItem[];
  }[] = useMemo(
    () => [
      {
        key: 'general',
        label: t('faq.categories.general', 'General Questions'),
        icon: HelpCircle,
        items: generalItems,
      },
      {
        key: 'residential',
        label: t('faq.categories.residential', 'Residential Cleaning'),
        icon: Home,
        items: residentialItems,
      },
      {
        key: 'commercial',
        label: t('faq.categories.commercial', 'Commercial Cleaning'),
        icon: Building2,
        items: commercialItems,
      },
      {
        key: 'policies',
        label: t('faq.categories.policies', 'Payments & Policies'),
        icon: CreditCard,
        items: policiesItems,
      },
    ],
    [t, generalItems, residentialItems, commercialItems, policiesItems]
  );

  // Filter items based on active search query and category
  const filteredCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return categoriesConfig
      .filter((cat) => selectedCategory === 'all' || selectedCategory === cat.key)
      .map((cat) => {
        if (!query) {
          return cat;
        }
        const filteredItems = cat.items.filter(
          (item) =>
            item.q.toLowerCase().includes(query) ||
            item.a.toLowerCase().includes(query)
        );
        return {
          ...cat,
          items: filteredItems,
        };
      })
      .filter((cat) => cat.items.length > 0);
  }, [categoriesConfig, selectedCategory, searchQuery]);

  const totalResultsCount = useMemo(
    () => filteredCategories.reduce((sum, cat) => sum + cat.items.length, 0),
    [filteredCategories]
  );

  const allItemsCount = useMemo(
    () => categoriesConfig.reduce((sum, cat) => sum + cat.items.length, 0),
    [categoriesConfig]
  );

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (value.trim().length > 1) {
      const allKeys = new Set<string>();
      categoriesConfig.forEach((cat) => {
        cat.items.forEach((_, idx) => {
          allKeys.add(`${cat.key}-${idx}`);
        });
      });
      setExpandedKeys(allKeys);
    }
  };

  const toggleItem = (key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const expandAll = () => {
    const allKeys = new Set<string>();
    filteredCategories.forEach((cat) => {
      cat.items.forEach((_, idx) => {
        allKeys.add(`${cat.key}-${idx}`);
      });
    });
    setExpandedKeys(allKeys);
  };

  const collapseAll = () => {
    setExpandedKeys(new Set());
  };

  // Schema.org FAQPage JSON-LD injection
  const faqSchema = useMemo(() => {
    const allQuestions = categoriesConfig.flatMap((cat) =>
      cat.items.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.a,
        },
      }))
    );

    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: allQuestions,
    };
  }, [categoriesConfig]);

  return (
    <div className="flex flex-col gap-10 sm:gap-14 py-4 sm:py-6 max-w-5xl mx-auto">
      <SEO
        title={t('faq.title', 'Frequently Asked Questions')}
        description={t(
          'faq.subtitle',
          'Everything you need to know about our residential, turnover, and commercial cleaning services across Denver.'
        )}
        canonical="https://gopropertycare.com/faq"
      />

      {/* JSON-LD Rich Snippet for FAQPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Hero Header */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase tracking-wider">
          <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
          {t('faq.badge', 'Help & Information Center')}
        </span>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          {t('faq.title', 'Frequently Asked Questions')}
        </h1>

        <p className="text-base sm:text-lg text-slate-700 font-medium leading-relaxed max-w-2xl mx-auto">
          {t(
            'faq.subtitle',
            'Everything you need to know about our residential, turnover, and commercial cleaning services across Denver.'
          )}
        </p>

        {/* Live Search Bar */}
        <div className="pt-3 max-w-xl mx-auto w-full">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={t('faq.searchPlaceholder', 'Search questions, services, or policies...')}
              className="w-full pl-12 pr-10 py-3.5 text-sm sm:text-base bg-white border-2 border-slate-200 rounded-2xl shadow-xs focus:outline-hidden focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 text-slate-900 placeholder:text-slate-400 font-medium transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => handleSearchChange('')}
                aria-label={t('faq.clearSearch', 'Clear search')}
                className="absolute right-3.5 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            )}
          </div>

          {searchQuery && (
            <p className="text-xs text-slate-700 mt-2 text-left px-2 font-semibold">
              {t('faq.resultsFound', { count: totalResultsCount })}
            </p>
          )}
        </div>
      </section>

      {/* Jump Menu & Action Controls */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all active:scale-98 ${
                selectedCategory === 'all'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/50'
              }`}
            >
              {t('faq.categories.all', 'All Questions')} ({allItemsCount})
            </button>

            {categoriesConfig.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all active:scale-98 ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                  <span
                    className={`ml-1 text-[11px] px-1.5 py-0.2 rounded-md ${
                      isSelected
                        ? 'bg-emerald-700 text-emerald-100'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {cat.items.length}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Expand / Collapse Controls */}
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 shrink-0">
            <button
              type="button"
              onClick={expandAll}
              className="px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {t('faq.expandAll', 'Expand All')}
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={collapseAll}
              className="px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {t('faq.collapseAll', 'Collapse All')}
            </button>
          </div>
        </div>
      </section>

      {/* Accordion Sections */}
      <section className="space-y-10">
        {filteredCategories.length === 0 ? (
          <Card className="text-center py-12 px-6 max-w-lg mx-auto bg-slate-50 border-dashed border-2 border-slate-200">
            <HelpCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              {t('faq.noResults', 'No questions matched your search for')} "{searchQuery}"
            </h3>
            <p className="text-xs text-slate-700 max-w-md mx-auto mb-5 font-medium">
              {t('faq.noResultsSuggestion', 'Try searching for terms like "supplies", "deposit", "insurance", or "pets".')}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                handleSearchChange('');
                setSelectedCategory('all');
              }}
              className="font-bold"
            >
              {t('faq.viewAll', 'View all questions')}
            </Button>
          </Card>
        ) : (
          filteredCategories.map((category) => {
            const Icon = category.icon;
            return (
              <div key={category.key} className="space-y-4">
                {/* Section Header */}
                <div className="flex items-center gap-2.5 pb-2 border-b border-emerald-100">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {category.label}
                  </h2>
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full ml-auto">
                    {category.items.length}
                  </span>
                </div>

                {/* Questions List */}
                <div className="space-y-3">
                  {category.items.map((item, index) => {
                    const itemKey = `${category.key}-${index}`;
                    const isExpanded = expandedKeys.has(itemKey);

                    return (
                      <div
                        key={itemKey}
                        className={`border rounded-2xl transition-all duration-200 overflow-hidden ${
                          isExpanded
                            ? 'bg-emerald-50/30 border-emerald-300 shadow-xs ring-1 ring-emerald-500/10'
                            : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/50 shadow-xs'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => toggleItem(itemKey)}
                          aria-expanded={isExpanded}
                          className="w-full text-left px-5 sm:px-6 py-4.5 flex items-center justify-between gap-4 cursor-pointer focus:outline-hidden"
                        >
                          <span className="font-extrabold text-sm sm:text-base text-slate-900 pr-2">
                            {item.q}
                          </span>
                          <span
                            className={`p-1.5 rounded-xl transition-all duration-200 shrink-0 ${
                              isExpanded
                                ? 'bg-emerald-600 text-white rotate-180'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                          >
                            <ChevronDown className="w-4 h-4" />
                          </span>
                        </button>

                        {isExpanded && (
                          <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-700 leading-relaxed font-medium border-t border-emerald-100/60 animate-fade-in">
                            <p>{item.a}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* 24/7 Support Direct Contact Card */}
      <section className="pt-4">
        <Card
          variant="none"
          className="p-8 sm:p-12 bg-linear-to-r from-emerald-800 to-emerald-950 text-white max-w-4xl mx-auto shadow-xl rounded-3xl"
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-emerald-700/60 border border-emerald-500/40 text-emerald-200 rounded-full text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              {t('faq.supportCard.badge', '24/7 Dedicated Support')}
            </span>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {t('faq.supportCard.title', 'Still have questions about our services?')}
            </h2>

            <p className="text-emerald-100 text-sm sm:text-base max-w-xl mx-auto font-medium leading-relaxed">
              {t(
                'faq.supportCard.subtitle',
                'Our local Denver property care specialists are available 24 hours a day, 7 days a week.'
              )}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <a
                href="tel:7205908632"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-emerald-400/80 text-white font-black text-sm bg-emerald-900/50 hover:bg-emerald-800/80 hover:scale-102 active:scale-98 transition-all shadow-md"
              >
                <Phone className="w-4 h-4 text-emerald-300" />
                <span>{t('faq.supportCard.callUs', 'Call or Text (720) 590-8632')}</span>
              </a>

              <a
                href="mailto:info@gopropertycare.com"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-emerald-400/80 text-white font-bold text-sm bg-emerald-900/40 hover:bg-emerald-800/60 hover:scale-102 active:scale-98 transition-all shadow-sm"
              >
                <Mail className="w-4 h-4 text-emerald-300" />
                <span>{t('faq.supportCard.emailUs', 'Email info@gopropertycare.com')}</span>
              </a>

              <Link to="/schedule">
                <Button
                  variant="outline"
                  size="md"
                  className="font-bold border-2 border-white/60 text-white hover:bg-white/10 hover:border-white transition-all"
                >
                  <span>{t('faq.supportCard.bookOnline', 'Book Residential Service')}</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
