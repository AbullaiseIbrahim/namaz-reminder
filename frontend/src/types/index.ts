export type PrayerName = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
export type PrayerStatus = 'on_time' | 'late' | 'qadha' | 'missed';
export type CalculationMethod = 'MWL' | 'ISNA' | 'Egypt' | 'Makkah' | 'Karachi' | 'Tehran' | 'Jafari';
export type Madhab = 'Hanafi' | 'Shafi';

export interface User {
  id: string;
  name: string;
  email: string;
  timezone: string;
  latitude?: number;
  longitude?: number;
  calculationMethod: CalculationMethod;
  madhab: Madhab;
  createdAt: string;
}

export interface PrayerTimes {
  date: string;
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

export interface PrayerLog {
  id: string;
  userId: string;
  date: string;
  prayerName: PrayerName;
  status: PrayerStatus;
  completedAt?: string;
  notes?: string;
  khushuRating?: number;
}

export interface Streak {
  currentStreak: number;
  longestStreak: number;
}

export interface Achievement {
  id: string;
  achievement: string;
  earnedAt: string;
}

export interface MonthlyStats {
  yearMonth: string;
  totalPossible: number;
  completed: number;
  percentage: number;
  byPrayer: {
    prayer: PrayerName;
    completed: number;
    total: number;
    percentage: number;
  }[];
  heatmap: Record<string, number>;
}

export interface DashboardData {
  today: {
    date: string;
    completed: number;
    total: number;
    logs: PrayerLog[];
  };
  streak: Streak;
  achievements: Achievement[];
}
