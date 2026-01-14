import { Locale, Translations } from './types'
import viTranslations from './locales/vi.json'
import enTranslations from './locales/en.json'
import jaTranslations from './locales/ja.json'

export type { Locale }
export type { Translations }
export const locales: Locale[] = ['vi', 'en', 'ja']

export const translations: Record<Locale, Translations> = {
  vi: viTranslations as Translations,
  en: enTranslations as Translations,
  ja: jaTranslations as Translations,
}

export const defaultLocale: Locale = 'vi'

export function getTranslations(locale: Locale): Translations {
  return translations[locale] || translations[defaultLocale]
}
