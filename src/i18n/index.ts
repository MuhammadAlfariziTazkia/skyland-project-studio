import type { Locale } from '../lib/schemas';
import en from './en';
import id from './id';

export const dicts = { en, id };
export const getDict = (locale: Locale) => dicts[locale];
export const otherLocale = (locale: Locale): Locale => (locale === 'en' ? 'id' : 'en');
