import { Coordinates, CalculationMethod as AdhanMethod, PrayerTimes as AdhanPrayerTimes, Madhab as AdhanMadhab } from 'adhan';
import { CalculationMethod, Madhab, PrayerTimesResponse } from '../types';

const METHOD_MAP: Record<CalculationMethod, ReturnType<typeof AdhanMethod.MuslimWorldLeague>> = {
  MWL: AdhanMethod.MuslimWorldLeague(),
  ISNA: AdhanMethod.NorthAmerica(),
  Egypt: AdhanMethod.Egyptian(),
  Makkah: AdhanMethod.UmmAlQura(),
  Karachi: AdhanMethod.Karachi(),
  Tehran: AdhanMethod.Tehran(),
  Jafari: AdhanMethod.Tehran(),
};

function formatTime(date: Date, timezone: string): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: timezone,
  });
}

export function calculatePrayerTimes(
  latitude: number,
  longitude: number,
  timezone: string,
  date: Date,
  method: CalculationMethod = 'MWL',
  madhab: Madhab = 'Hanafi'
): PrayerTimesResponse {
  const coords = new Coordinates(latitude, longitude);
  const params = METHOD_MAP[method];

  params.madhab = madhab === 'Hanafi' ? AdhanMadhab.Hanafi : AdhanMadhab.Shafi;

  const prayerTimes = new AdhanPrayerTimes(coords, date, params);

  const dateStr = date.toLocaleDateString('en-CA', { timeZone: timezone });

  return {
    date: dateStr,
    fajr: formatTime(prayerTimes.fajr, timezone),
    sunrise: formatTime(prayerTimes.sunrise, timezone),
    dhuhr: formatTime(prayerTimes.dhuhr, timezone),
    asr: formatTime(prayerTimes.asr, timezone),
    maghrib: formatTime(prayerTimes.maghrib, timezone),
    isha: formatTime(prayerTimes.isha, timezone),
  };
}
