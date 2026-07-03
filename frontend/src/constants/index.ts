import { PrayerName, CalculationMethod, Madhab } from '../types';

export const PRAYER_NAMES: { key: PrayerName; label: string; arabicLabel: string }[] = [
  { key: 'fajr',    label: 'Fajr',    arabicLabel: 'الفجر' },
  { key: 'dhuhr',   label: 'Dhuhr',   arabicLabel: 'الظهر' },
  { key: 'asr',     label: 'Asr',     arabicLabel: 'العصر' },
  { key: 'maghrib', label: 'Maghrib', arabicLabel: 'المغرب' },
  { key: 'isha',    label: 'Isha',    arabicLabel: 'العشاء' },
];

export const CALCULATION_METHODS: { value: CalculationMethod; label: string }[] = [
  { value: 'MWL',    label: 'Muslim World League' },
  { value: 'ISNA',   label: 'Islamic Society of North America' },
  { value: 'Egypt',  label: 'Egyptian General Authority' },
  { value: 'Makkah', label: 'Umm Al-Qura (Makkah)' },
  { value: 'Karachi',label: 'University of Islamic Sciences, Karachi' },
  { value: 'Tehran', label: 'Institute of Geophysics, Tehran' },
];

export const MADHABS: { value: Madhab; label: string }[] = [
  { value: 'Hanafi', label: 'Hanafi' },
  { value: 'Shafi',  label: 'Shafi / Maliki / Hanbali' },
];

export const PRAYER_STATUS_COLORS: Record<string, string> = {
  on_time: '#27ae60',
  late:    '#f39c12',
  qadha:   '#8e44ad',
  missed:  '#e74c3c',
};
