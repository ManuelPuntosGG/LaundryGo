import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'en', label: 'EN' },
  { code: 'es', label: 'ES' },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <div className="flex items-center gap-1 bg-glass-white-10 backdrop-blur-sm border border-white/20 rounded-xl px-2 py-1">
      <Globe className="w-4 h-4 text-white/70" />
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => i18n.changeLanguage(lang.code)}
          className={`px-2 py-1 text-xs font-medium rounded-lg transition-all duration-200 ${
            i18n.language === lang.code
              ? 'bg-primary-500 text-white'
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
