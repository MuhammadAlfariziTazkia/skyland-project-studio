import { LOCALES, type Locale } from '../lib/schemas';
import en from './en';
import id from './id';
import ja from './ja';

export const dicts: Record<Locale, typeof en> = { en, id, ja };
export const getDict = (locale: Locale) => dicts[locale];

/**
 * The other languages this page is available in. Replaces the old binary `otherLocale`, which could only
 * ever flip between two and silently mapped a third locale onto English.
 */
export const otherLocales = (locale: Locale): Locale[] => LOCALES.filter((l) => l !== locale);
