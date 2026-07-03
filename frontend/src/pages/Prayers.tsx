import { useQuery } from '@tanstack/react-query';
import { Container, Typography, Card, CardContent, Stack, Skeleton, Box, Chip } from '@mui/material';
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import { prayerApi } from '../services/api/prayer.api';
import { notificationApi } from '../services/api/notification.api';
import { PRAYER_NAMES } from '../constants';
import { useNotificationScheduler } from '../hooks/useNotificationScheduler';
import dayjs from 'dayjs';
import { alpha } from '@mui/material/styles';

const ARABIC_NAMES: Record<string, string> = {
  fajr: 'الفجر', sunrise: 'الشروق', dhuhr: 'الظهر',
  asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء',
};

const ALL_PRAYERS = [
  { key: 'fajr',    label: 'Fajr',    isSunrise: false },
  { key: 'sunrise', label: 'Sunrise', isSunrise: true  },
  { key: 'dhuhr',   label: 'Dhuhr',   isSunrise: false },
  { key: 'asr',     label: 'Asr',     isSunrise: false },
  { key: 'maghrib', label: 'Maghrib', isSunrise: false },
  { key: 'isha',    label: 'Isha',    isSunrise: false },
] as const;

export default function Prayers() {
  const { data: times, isLoading } = useQuery({
    queryKey: ['prayers', 'today'],
    queryFn: prayerApi.getToday,
  });

  const { data: notifPrefs } = useQuery({
    queryKey: ['notificationPrefs'],
    queryFn: notificationApi.getPrefs,
  });

  const now = dayjs();
  const today = now.format('YYYY-MM-DD');

  useNotificationScheduler(times as Record<string, string> | null, notifPrefs, today);

  const nextPrayer = times
    ? PRAYER_NAMES.find(({ key }) => {
        const t = (times as Record<string, string>)[key];
        return t && dayjs(`${today} ${t}`).isAfter(now);
      })
    : null;

  return (
    <Box>
      {/* Header */}
      <Box sx={{
        background: 'linear-gradient(135deg, #154360 0%, #1a5276 100%)',
        px: 2.5, pt: 2.5, pb: 2, position: 'relative', overflow: 'hidden',
      }}>
        <Box sx={{
          position: 'absolute', inset: 0, opacity: 0.08,
          backgroundImage: `
            repeating-linear-gradient(45deg, rgba(212,172,13,1) 0 1px, transparent 1px 15px),
            repeating-linear-gradient(-45deg, rgba(212,172,13,1) 0 1px, transparent 1px 15px)
          `,
        }} />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography sx={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, fontWeight: 500, mb: 0.5 }}>
            {now.format('dddd, MMMM D, YYYY')}
          </Typography>
          <Typography sx={{ color: '#fff', fontSize: 18, fontWeight: 800, letterSpacing: '-0.3px' }}>
            Prayer Times
          </Typography>
          {nextPrayer && (
            <Box sx={{
              mt: 1.5, display: 'inline-flex', alignItems: 'center',
              bgcolor: alpha('#d4ac0d', 0.15), borderRadius: 2,
              px: 1.5, py: 0.5, gap: 0.75,
            }}>
              <AccessAlarmIcon sx={{ color: '#d4ac0d', fontSize: 14 }} />
              <Typography sx={{ color: '#d4ac0d', fontSize: 12, fontWeight: 600 }}>
                Next: {nextPrayer.label} at {(times as Record<string, string>)[nextPrayer.key]}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      <Container maxWidth="sm" sx={{ mt: 2 }}>
        {!isLoading && !times && (
          <Card sx={{ mb: 2, border: '1px solid', borderColor: alpha('#d4860d', 0.2), bgcolor: alpha('#d4860d', 0.04) }}>
            <CardContent>
              <Typography sx={{ color: '#d4860d', fontSize: 14, fontWeight: 500 }}>
                📍 Location not set. Please update your coordinates in Settings to see prayer times.
              </Typography>
            </CardContent>
          </Card>
        )}

        <Stack spacing={1.5}>
          {isLoading
            ? Array(6).fill(0).map((_, i) => <Skeleton key={i} variant="rounded" height={76} sx={{ borderRadius: 2 }} />)
            : ALL_PRAYERS.map(({ key, label, isSunrise }) => {
                const time = times ? (times as Record<string, string>)[key] ?? '--:--' : '--:--';
                const isNext = nextPrayer?.key === key;

                return (
                  <Card
                    key={key}
                    sx={{
                      border: '1px solid',
                      borderColor: isNext ? '#1a5276' : isSunrise ? alpha('#d4ac0d', 0.15) : 'rgba(26,82,118,0.08)',
                      bgcolor: isNext ? alpha('#1a5276', 0.04) : 'white',
                      boxShadow: isNext ? `0 4px 16px ${alpha('#1a5276', 0.12)}` : undefined,
                    }}
                  >
                    <CardContent sx={{ py: 2, px: 2.5, '&:last-child': { pb: 2 } }}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Box sx={{
                            width: 40, height: 40, borderRadius: 2,
                            bgcolor: isNext ? alpha('#1a5276', 0.08)
                              : isSunrise ? alpha('#d4ac0d', 0.1)
                              : alpha('#1a5276', 0.05),
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {isSunrise
                              ? <WbSunnyIcon sx={{ color: '#d4ac0d', fontSize: 20 }} />
                              : <AccessAlarmIcon sx={{ color: isNext ? '#1a5276' : '#b0bec5', fontSize: 20 }} />
                            }
                          </Box>
                          <Box>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Typography sx={{ fontWeight: 700, fontSize: 13, color: 'text.primary' }}>
                                {label}
                              </Typography>
                              {isNext && (
                                <Chip
                                  label="Next"
                                  size="small"
                                  sx={{ bgcolor: '#1a5276', color: 'white', fontWeight: 700, fontSize: 10, height: 18 }}
                                />
                              )}
                            </Stack>
                            <Typography sx={{
                              fontFamily: "'Noto Naskh Arabic', serif",
                              fontSize: 13, color: 'text.secondary', lineHeight: 1.4,
                            }}>
                              {ARABIC_NAMES[key]}
                            </Typography>
                          </Box>
                        </Stack>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography sx={{
                            fontWeight: 800, fontSize: 17,
                            color: isNext ? '#1a5276' : 'text.primary',
                            letterSpacing: '1px', fontVariantNumeric: 'tabular-nums',
                          }}>
                            {time}
                          </Typography>
                          {isSunrise && (
                            <Typography variant="caption" color="text.secondary" fontSize={10}>
                              Not a prayer
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                );
              })}
        </Stack>
      </Container>
    </Box>
  );
}
