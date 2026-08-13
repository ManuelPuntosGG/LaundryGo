import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'en', label: 'EN' },
  { code: 'es', label: 'ES' },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const currentLang = i18n.language?.substring(0, 2) || 'en';

  return (
    <div className="inline-flex items-center gap-1.5 p-1 bg-slate-100/90 border border-slate-200/80 rounded-xl shrink-0">
      <div className="pl-2 pr-0.5 text-slate-500 shrink-0 flex items-center justify-center">
        <Globe className="w-4 h-4 text-slate-500" />
      </div>
      <div className="flex items-center gap-1">
        {languages.map((lang) => {
          const isSelected = currentLang === lang.code;

          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => i18n.changeLanguage(lang.code)}
              className={`w-10 h-7 text-xs sm:text-sm font-extrabold rounded-lg transition-colors duration-200 ease-in-out flex items-center justify-center cursor-pointer select-none ${
                isSelected
                  ? 'bg-white text-blue-600 shadow-2xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              {lang.code.toUpperCase()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
