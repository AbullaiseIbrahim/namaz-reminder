import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Container, Typography, Stack, Card, CardContent,
  Chip, Box, Skeleton, IconButton,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { prayerApi } from '../services/api/prayer.api';
import { PRAYER_NAMES, PRAYER_STATUS_COLORS } from '../constants';
import { PrayerLog } from '../types';
import { alpha } from '@mui/material/styles';
import dayjs, { Dayjs } from 'dayjs';

const ARABIC_NAMES: Record<string, string> = {
  fajr: 'الفجر', dhuhr: 'الظهر', asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء',
};
const STATUS_LABELS: Record<string, string> = {
  on_time: 'On Time', late: 'Late', qadha: 'Qadha', missed: 'Missed',
};
const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

// ── Inline Calendar ──────────────────────────────────────────
function Calendar({
  selected, onChange,
}: { selected: string; onChange: (d: string) => void }) {
  const today = dayjs();
  const selDay = dayjs(selected);
  const [view, setView] = useState(selDay.startOf('month'));

  const prevMonth = () => setView(v => v.subtract(1, 'month'));
  const nextMonth = () => setView(v => v.add(1, 'month'));
  const canGoNext = view.isBefore(today.startOf('month')) === false
    ? false
    : true;

  // Build calendar grid: start on Monday
  const firstDay = view.startOf('month');
  const startOffset = firstDay.day(); // Sunday = 0
  const daysInMonth = view.daysInMonth();
  const cells: (Dayjs | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => firstDay.add(i, 'day')),
  ];
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <Box sx={{ pt: 0.5 }}>
      {/* Month navigation */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
        <IconButton
          size="small"
          onClick={prevMonth}
          sx={{
            width: 32, height: 32, color: '#1a5276',
            '&:hover': { bgcolor: alpha('#1a5276', 0.08) },
          }}
        >
          <ChevronLeftIcon fontSize="small" />
        </IconButton>

        <Typography sx={{ fontWeight: 800, fontSize: 14, color: '#1a2733', letterSpacing: '-0.2px' }}>
          {view.format('MMMM YYYY')}
        </Typography>

        <IconButton
          size="small"
          onClick={nextMonth}
          disabled={view.isSame(today.startOf('month'), 'month')}
          sx={{
            width: 32, height: 32, color: '#1a5276',
            '&:hover': { bgcolor: alpha('#1a5276', 0.08) },
            '&.Mui-disabled': { color: alpha('#1a5276', 0.25) },
          }}
        >
          <ChevronRightIcon fontSize="small" />
        </IconButton>
      </Stack>

      {/* Day-of-week headers */}
      <Box sx={{
        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
        mb: 0.75,
      }}>
        {DAY_LABELS.map(d => (
          <Typography
            key={d}
            sx={{
              textAlign: 'center', fontSize: 11, fontWeight: 700,
              color: d === 'Fr' ? '#d4ac0d' : d === 'Su' ? alpha('#c0392b', 0.5) : alpha('#1a5276', 0.5),
              py: 0.5, textTransform: 'uppercase', letterSpacing: '0.5px',
            }}
          >
            {d}
          </Typography>
        ))}
      </Box>

      {/* Day grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.25 }}>
        {cells.map((day, idx) => {
          if (!day) return <Box key={idx} />;

          const isSelected = day.isSame(selDay, 'day');
          const isToday    = day.isSame(today, 'day');
          const isFuture   = day.isAfter(today, 'day');
          const isFriday   = day.day() === 5;

          return (
            <Box
              key={idx}
              onClick={() => !isFuture && onChange(day.format('YYYY-MM-DD'))}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 0.75,
                borderRadius: 2,
                cursor: isFuture ? 'default' : 'pointer',
                position: 'relative',
                transition: 'all 0.15s ease',

                // Selected state
                ...(isSelected && {
                  background: 'linear-gradient(135deg, #154360, #1a5276)',
                  boxShadow: '0 4px 12px rgba(21,67,96,0.35)',
                }),

                // Today (not selected)
                ...(!isSelected && isToday && {
                  border: '1.5px solid #1a5276',
                  bgcolor: alpha('#1a5276', 0.05),
                }),

                // Normal hover
                ...(!isSelected && !isFuture && {
                  '&:hover': {
                    bgcolor: alpha('#1a5276', 0.08),
                    transform: 'scale(1.05)',
                  },
                }),
              }}
            >
              <Typography sx={{
                fontSize: 13,
                fontWeight: isSelected || isToday ? 800 : isFriday ? 700 : 500,
                lineHeight: 1,
                color: isSelected
                  ? '#fff'
                  : isFuture
                    ? alpha('#1a2733', 0.2)
                    : isFriday
                      ? '#d4ac0d'
                      : '#1a2733',
              }}>
                {day.date()}
              </Typography>

              {/* Today dot */}
              {isToday && !isSelected && (
                <Box sx={{
                  width: 4, height: 4, borderRadius: '50%',
                  bgcolor: '#1a5276', mt: 0.25,
                }} />
              )}
            </Box>
          );
        })}
      </Box>

      {/* Quick-jump row */}
      <Stack direction="row" justifyContent="space-between" sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid rgba(26,82,118,0.08)' }}>
        <Typography
          onClick={() => {
            setView(dayjs().startOf('month'));
            onChange(today.format('YYYY-MM-DD'));
          }}
          sx={{
            fontSize: 12, fontWeight: 700, color: '#1a5276', cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          Today
        </Typography>
        <Typography
          onClick={() => {
            const y = today.subtract(1, 'day');
            setView(y.startOf('month'));
            onChange(y.format('YYYY-MM-DD'));
          }}
          sx={{
            fontSize: 12, fontWeight: 700, color: alpha('#1a5276', 0.6), cursor: 'pointer',
            '&:hover': { color: '#1a5276', textDecoration: 'underline' },
          }}
        >
          Yesterday
        </Typography>
        <Typography
          onClick={() => {
            const w = today.subtract(7, 'day');
            setView(w.startOf('month'));
            onChange(w.format('YYYY-MM-DD'));
          }}
          sx={{
            fontSize: 12, fontWeight: 700, color: alpha('#1a5276', 0.6), cursor: 'pointer',
            '&:hover': { color: '#1a5276', textDecoration: 'underline' },
          }}
        >
          Week ago
        </Typography>
      </Stack>
    </Box>
  );
}

// ── Main Page ────────────────────────────────────────────────
export default function History() {
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));

  const { data: logs, isLoading } = useQuery({
    queryKey: ['history', date],
    queryFn: () => prayerApi.getHistory(date),
  });

  const getLog = (prayer: string): PrayerLog | undefined =>
    logs?.find(l => l.prayerName === prayer);

  const completedCount = logs?.filter(l => l.status !== 'missed').length ?? 0;
  const isToday = dayjs(date).isSame(dayjs(), 'day');

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
            Prayer Log
          </Typography>
          <Typography sx={{ color: '#fff', fontSize: 18, fontWeight: 800, letterSpacing: '-0.3px' }}>
            History
          </Typography>
        </Box>
      </Box>

      <Container maxWidth="sm" sx={{ mt: 2 }}>
        {/* Calendar card */}
        <Card sx={{ mb: 2, overflow: 'visible' }}>
          <CardContent sx={{ p: 2, pb: '16px !important' }}>
            {/* Selected date summary */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: 16, color: '#1a2733', letterSpacing: '-0.3px' }}>
                  {isToday ? 'Today' : dayjs(date).format('dddd')}
                </Typography>
                <Typography sx={{ fontSize: 12, color: 'text.secondary', fontWeight: 500 }}>
                  {dayjs(date).format('MMMM D, YYYY')}
                </Typography>
              </Box>
              {logs && (
                <Box sx={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 52, height: 52, borderRadius: '50%',
                  background: completedCount === 5
                    ? 'linear-gradient(135deg, #27ae60, #2ecc71)'
                    : completedCount > 0
                      ? 'linear-gradient(135deg, #d4ac0d, #f0c520)'
                      : alpha('#1a5276', 0.08),
                  boxShadow: completedCount > 0 ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                }}>
                  <Typography sx={{
                    fontWeight: 900, fontSize: 13,
                    color: completedCount > 0 ? '#fff' : alpha('#1a5276', 0.4),
                  }}>
                    {completedCount}/5
                  </Typography>
                </Box>
              )}
            </Stack>

            <Calendar selected={date} onChange={setDate} />
          </CardContent>
        </Card>

        {/* Prayer logs */}
        <Stack spacing={1.5}>
          {isLoading
            ? Array(5).fill(0).map((_, i) => (
                <Skeleton key={i} variant="rounded" height={80} sx={{ borderRadius: 2 }} />
              ))
            : PRAYER_NAMES.map(({ key, label }) => {
                const log = getLog(key);
                const statusColor = log ? PRAYER_STATUS_COLORS[log.status] : undefined;
                const isDone = log && log.status !== 'missed';

                return (
                  <Card
                    key={key}
                    sx={{
                      border: '1px solid',
                      borderColor: isDone ? alpha(statusColor!, 0.2) : 'rgba(26,82,118,0.08)',
                      bgcolor: isDone ? alpha(statusColor!, 0.03) : 'white',
                    }}
                  >
                    <CardContent sx={{ py: 1.75, px: 2.5, '&:last-child': { pb: 1.75 } }}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Box sx={{
                            width: 40, height: 40, borderRadius: 2,
                            bgcolor: isDone ? alpha(statusColor!, 0.1) : alpha('#1a5276', 0.05),
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {isDone
                              ? <CheckCircleIcon sx={{ color: statusColor, fontSize: 22 }} />
                              : <RadioButtonUncheckedIcon sx={{ color: '#b0bec5', fontSize: 22 }} />
                            }
                          </Box>
                          <Box>
                            <Typography sx={{ fontWeight: 700, fontSize: 13, lineHeight: 1.2 }}>
                              {label}
                            </Typography>
                            <Stack direction="row" alignItems="center" spacing={0.75}>
                              <Typography sx={{
                                fontFamily: "'Noto Naskh Arabic', serif",
                                fontSize: 13, color: 'text.secondary',
                              }}>
                                {ARABIC_NAMES[key]}
                              </Typography>
                              {log?.completedAt && (
                                <Typography variant="caption" color="text.secondary">
                                  · {dayjs(log.completedAt).format('HH:mm')}
                                </Typography>
                              )}
                            </Stack>
                          </Box>
                        </Stack>

                        <Stack alignItems="flex-end" spacing={0.5}>
                          {log ? (
                            <>
                              <Chip
                                label={STATUS_LABELS[log.status]}
                                size="small"
                                sx={{ bgcolor: statusColor, color: 'white', fontWeight: 700, fontSize: 11 }}
                              />
                              {log.khushuRating && (
                                <Typography variant="caption" fontSize={11}>
                                  {'⭐'.repeat(log.khushuRating)}
                                </Typography>
                              )}
                            </>
                          ) : (
                            <Chip
                              label="Not logged"
                              size="small"
                              variant="outlined"
                              sx={{ borderColor: alpha('#c0392b', 0.3), color: '#c0392b', fontWeight: 600, fontSize: 11 }}
                            />
                          )}
                        </Stack>
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
