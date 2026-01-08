import { createContext, useContext, ReactNode, useMemo } from 'react';
import { useUserPreferences, UserPreferences } from '@/hooks/useUserPreferences';

interface CurrencyConfig {
  symbol: string;
  code: string;
  locale: string;
}

interface PreferencesContextType {
  preferences: UserPreferences | null;
  isLoading: boolean;
  currency: CurrencyConfig;
  formatCurrency: (value: number) => string;
  formatDate: (date: Date | string) => string;
  language: string;
}

const CURRENCY_MAP: Record<string, CurrencyConfig> = {
  BRL: { symbol: 'R$', code: 'BRL', locale: 'pt-BR' },
  USD: { symbol: '$', code: 'USD', locale: 'en-US' },
  EUR: { symbol: '€', code: 'EUR', locale: 'de-DE' },
};

const LANGUAGE_LOCALE_MAP: Record<string, string> = {
  'pt-BR': 'pt-BR',
  'en-US': 'en-US',
  'es': 'es-ES',
};

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export const PreferencesProvider = ({ children }: { children: ReactNode }) => {
  const { preferences, isLoading } = useUserPreferences();

  const currency = useMemo(() => {
    const currencyCode = preferences?.currency || 'BRL';
    return CURRENCY_MAP[currencyCode] || CURRENCY_MAP.BRL;
  }, [preferences?.currency]);

  const language = useMemo(() => {
    return preferences?.language || 'pt-BR';
  }, [preferences?.language]);

  const formatCurrency = useMemo(() => {
    const locale = LANGUAGE_LOCALE_MAP[language] || 'pt-BR';
    return (value: number) => {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency.code,
      }).format(value);
    };
  }, [currency.code, language]);

  const formatDate = useMemo(() => {
    const locale = LANGUAGE_LOCALE_MAP[language] || 'pt-BR';
    return (date: Date | string) => {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return new Intl.DateTimeFormat(locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(dateObj);
    };
  }, [language]);

  return (
    <PreferencesContext.Provider 
      value={{ 
        preferences, 
        isLoading, 
        currency, 
        formatCurrency, 
        formatDate,
        language 
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
};
