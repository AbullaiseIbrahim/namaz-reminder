import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Container, Typography, Card, CardContent, Stack,
  LinearProgress, Box, Chip, Skeleton, IconButton,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { prayerApi } from '../services/api/prayer.api';
import { PRAYER_NAMES } from '../constants';
import { alpha } from '@mui/material/styles';
import dayjs from 'dayjs';

const ARABIC: Record<string, string> = {
  fajr: 'الفجر', dhuhr: 'الظهر', asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء',
};
const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function heatColor(count: number): { bg: string; text: string } {
  if (count < 0)  return { bg: alpha('#1a5276', 0.05), text: alpha('#1a2733', 0.25) };
  if (count === 0) return { bg: alpha('#c0392b', 0.15), text: alpha('#c0392b', 0.7) };
  if (count <= 2)  return { bg: alpha('#d4860d', 0.2),  text: alpha('#d4860d', 0.9) };
  if (count <= 4)  return { bg: alpha('#1e8449', 0.2),  text: '#1e8449' };
  return { bg: '#1e8449', text: '#fff' };
}

export default function Statistics() {
  const today = dayjs();
  const [viewMonth, setViewMonth] = useState(today.startOf('month'));
  const month = viewMonth.format('YYYY-MM');

  const { data: stats, isLoading } = useQuery({
    queryKey: ['statistics', month],
    queryFn: () => prayerApi.getStatistics(month),
  });

  const pct       = stats?.percentage ?? 0;
  const completed = stats?.completed ?? 0;
  const total     = stats?.totalPossible ?? 0;
  const pctColor  = pct >= 80 ? '#1e8449' : pct >= 50 ? '#d4860d' : '#c0392b';

  // Build heatmap grid starting on Sunday
  const firstDay    = viewMonth.startOf('month');
  const daysInMonth = viewMonth.daysInMonth();
  const startOffset = firstDay.day(); // 0=Sun … 6=Sat

  const cells: Array<{ date: string; day: number; count: number } | null> = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => {
      const d = viewMonth.date(i + 1).format('YYYY-MM-DD');
      return { date: d, day: i + 1, count: stats?.heatmap?.[d] ?? -1 };
    }),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const isCurrentMonth = viewMonth.isSame(today, 'month');

  return (
    <Box>
      {/* ── Header ─────────────────────────────────────────── */}
      <Box sx={{
        background: 'linear-gradient(135deg, #154360 0%, #1a5276 100%)',
        px: 2.5, pt: 2.5, pb: 3, position: 'relative', overflow: 'hidden',
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
            Prayer Analytics
          </Typography>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography sx={{ color: '#fff', fontSize: 18, fontWeight: 800, letterSpacing: '-0.3px' }}>
              Statistics
            </Typography>

            {/* Month Navigator */}
            <Stack direction="row" alignItems="center" spacing={0.5}
              sx={{ bgcolor: alpha('#fff', 0.12), borderRadius: 3, px: 1, py: 0.5 }}>
              <IconButton
                size="small"
                onClick={() => setViewMonth(v => v.subtract(1, 'month'))}
                sx={{ color: 'white', width: 28, height: 28, '&:hover': { bgcolor: alpha('#fff', 0.1) } }}
              >
                <ChevronLeftIcon sx={{ fontSize: 18 }} />
              </IconButton>
              <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 13, minWidth: 90, textAlign: 'center' }}>
                {viewMonth.format('MMM YYYY')}
              </Typography>
              <IconButton
                size="small"
                disabled={isCurrentMonth}
                onClick={() => setViewMonth(v => v.add(1, 'month'))}
                sx={{
                  color: 'white', width: 28, height: 28,
                  '&:hover': { bgcolor: alpha('#fff', 0.1) },
                  '&.Mui-disabled': { color: alpha('#fff', 0.25) },
                }}
              >
                <ChevronRightIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Stack>
          </Stack>
        </Box>
      </Box>

      <Container maxWidth="sm" sx={{ mt: '-20px', position: 'relative', zIndex: 1 }}>

        {/* ── Summary cards row ──────────────────────────────── */}
        <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
          {/* Completion rate */}
          <Card sx={{ flex: 1, background: 'linear-gradient(135deg, #154360, #1a5276)', color: 'white' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography sx={{ color: 'rgba(255,255,255,0.65)', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Completion
                  </Typography>
                  {isLoading
                    ? <Skeleton width={50} height={36} sx={{ bgcolor: alpha('#fff', 0.2) }} />
                    : <Typography sx={{ color: '#fff', fontSize: 28, fontWeight: 900, lineHeight: 1.1, letterSpacing: '-1px' }}>
                        {pct}<Typography component="span" sx={{ fontSize: 14, fontWeight: 600 }}>%</Typography>
                      </Typography>
                  }
                  <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: 10 }}>
                    {completed}/{total} prayers
                  </Typography>
                </Box>
                <Box sx={{
                  width: 36, height: 36, borderRadius: 2,
                  bgcolor: alpha('#fff', 0.12),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <TrendingUpIcon sx={{ fontSize: 20, color: '#d4ac0d' }} />
                </Box>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={isLoading ? 0 : pct}
                sx={{
                  mt: 1.5, height: 4, borderRadius: 999,
                  bgcolor: alpha('#fff', 0.15),
                  '& .MuiLinearProgress-bar': {
                    bgcolor: pct >= 80 ? '#2ecc71' : pct >= 50 ? '#f0c520' : '#e74c3c',
                    borderRadius: 999,
                  },
                }}
              />
            </CardContent>
          </Card>

          {/* On-time rate */}
          <Card sx={{ flex: 1 }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography sx={{ color: 'text.secondary', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    On Time
                  </Typography>
                  {isLoading
                    ? <Skeleton width={50} height={36} />
                    : <Typography sx={{ color: '#1e8449', fontSize: 28, fontWeight: 900, lineHeight: 1.1, letterSpacing: '-1px' }}>
                        {stats?.byPrayer
                          ? Math.round((stats.byPrayer.reduce((s, p) => s + (p.onTime ?? 0), 0) / Math.max(total, 1)) * 100)
                          : 0}
                        <Typography component="span" sx={{ fontSize: 14, fontWeight: 600, color: '#1e8449' }}>%</Typography>
                      </Typography>
                  }
                  <Typography sx={{ color: 'text.secondary', fontSize: 10 }}>
                    this month
                  </Typography>
                </Box>
                <Box sx={{
                  width: 36, height: 36, borderRadius: 2,
                  bgcolor: alpha('#1e8449', 0.1),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <CheckCircleOutlineIcon sx={{ fontSize: 20, color: '#1e8449' }} />
                </Box>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={isLoading ? 0 : Math.round((stats?.byPrayer?.reduce((s, p) => s + (p.onTime ?? 0), 0) ?? 0) / Math.max(total, 1) * 100)}
                sx={{
                  mt: 1.5, height: 4, borderRadius: 999,
                  bgcolor: alpha('#1e8449', 0.1),
                  '& .MuiLinearProgress-bar': { bgcolor: '#1e8449', borderRadius: 999 },
                }}
              />
            </CardContent>
          </Card>
        </Stack>

        {/* ── Heatmap ───────────────────────────────────────── */}
        <Card sx={{ mb: 2 }}>
          <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: 14, color: '#1a2733' }}>
                  Monthly Heatmap
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {viewMonth.format('MMMM YYYY')} · prayers per day
                </Typography>
              </Box>
              <LocalFireDepartmentIcon sx={{ color: '#d4860d', fontSize: 22 }} />
            </Stack>

            {/* Day-of-week headers */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', mb: 0.5 }}>
              {DAY_LABELS.map(d => (
                <Typography key={d} sx={{
                  textAlign: 'center', fontSize: 10, fontWeight: 700,
                  color: d === 'Fr' ? '#d4ac0d' : d === 'Su' ? alpha('#c0392b', 0.5) : alpha('#1a5276', 0.4),
                  py: 0.5, textTransform: 'uppercase', letterSpacing: '0.3px',
                }}>
                  {d}
                </Typography>
              ))}
            </Box>

            {/* Calendar grid */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px' }}>
              {cells.map((cell, idx) => {
                if (!cell) return <Box key={idx} sx={{ aspectRatio: '1' }} />;
                const { bg, text } = heatColor(cell.count);
                const isToday = dayjs(cell.date).isSame(today, 'day');
                return (
                  <Box
                    key={cell.date}
                    title={cell.count >= 0 ? `${cell.date}: ${cell.count}/5 prayers` : cell.date}
                    sx={{
                      aspectRatio: '1',
                      borderRadius: 1.5,
                      bgcolor: bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      border: isToday ? '1.5px solid #1a5276' : '1.5px solid transparent',
                      cursor: 'default',
                      transition: 'transform 0.12s',
                      '&:hover': { transform: 'scale(1.15)', zIndex: 1 },
                    }}
                  >
                    <Typography sx={{ fontSize: 10, fontWeight: isToday ? 800 : 600, color: text, lineHeight: 1 }}>
                      {cell.day}
                    </Typography>
                  </Box>
                );
              })}
            </Box>

            {/* Legend */}
            <Stack direction="row" spacing={2} mt={2} sx={{
              pt: 1.5, borderTop: '1px solid rgba(26,82,118,0.07)',
              flexWrap: 'wrap', rowGap: 1,
            }}>
              {[
                ['0/5', alpha('#c0392b', 0.15)],
                ['1–2/5', alpha('#d4860d', 0.2)],
                ['3–4/5', alpha('#1e8449', 0.2)],
                ['5/5', '#1e8449'],
              ].map(([label, color]) => (
                <Stack key={label} direction="row" alignItems="center" spacing={0.75}>
                  <Box sx={{ width: 12, height: 12, borderRadius: 0.75, bgcolor: color, flexShrink: 0 }} />
                  <Typography sx={{ fontSize: 11, color: 'text.secondary', fontWeight: 500 }}>{label}</Typography>
                </Stack>
              ))}
            </Stack>
          </CardContent>
        </Card>

        {/* ── Per-prayer breakdown ──────────────────────────── */}
        <Typography sx={{ fontWeight: 800, fontSize: 14, mb: 1.5, color: '#1a2733', letterSpacing: '-0.2px' }}>
          By Prayer
        </Typography>
        <Stack spacing={1.25} sx={{ mb: 3 }}>
          {isLoading
            ? Array(5).fill(0).map((_, i) => (
                <Skeleton key={i} variant="rounded" height={76} sx={{ borderRadius: 2 }} />
              ))
            : PRAYER_NAMES.map(({ key, label }) => {
                const stat   = stats?.byPrayer?.find(p => p.prayer === key);
                const p      = stat?.percentage ?? 0;
                const onTime = stat?.onTime ?? 0;
                const late   = (stat?.completed ?? 0) - onTime;
                const color  = p >= 80 ? '#1e8449' : p >= 50 ? '#d4860d' : '#c0392b';

                return (
                  <Card key={key} sx={{ border: `1px solid ${alpha(color, 0.15)}` }}>
                    <CardContent sx={{ py: 1.75, px: 2, '&:last-child': { pb: 1.75 } }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                        <Stack direction="row" alignItems="center" spacing={1.25}>
                          <Box sx={{
                            width: 36, height: 36, borderRadius: 1.5,
                            bgcolor: alpha(color, 0.1),
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                          }}>
                            <Typography sx={{ fontSize: 10, fontWeight: 900, color, lineHeight: 1 }}>
                              {p}%
                            </Typography>
                          </Box>
                          <Box>
                            <Stack direction="row" alignItems="center" spacing={0.75}>
                              <Typography sx={{ fontWeight: 800, fontSize: 13, color: '#1a2733' }}>
                                {label}
                              </Typography>
                              <Typography sx={{
                                fontFamily: "'Noto Naskh Arabic', serif",
                                fontSize: 12, color: 'text.secondary',
                              }}>
                                {ARABIC[key]}
                              </Typography>
                            </Stack>
                            <Stack direction="row" spacing={1} mt={0.25}>
                              {onTime > 0 && (
                                <Typography sx={{ fontSize: 10, color: '#1e8449', fontWeight: 600 }}>
                                  ✓ {onTime} on time
                                </Typography>
                              )}
                              {late > 0 && (
                                <Typography sx={{ fontSize: 10, color: '#d4860d', fontWeight: 600 }}>
                                  · {late} late
                                </Typography>
                              )}
                            </Stack>
                          </Box>
                        </Stack>

                        <Chip
                          label={`${stat?.completed ?? 0}/${stat?.total ?? 0}`}
                          size="small"
                          sx={{
                            bgcolor: alpha(color, 0.1), color,
                            fontWeight: 700, fontSize: 11, height: 24,
                          }}
                        />
                      </Stack>

                      {/* Segmented progress bar */}
                      <Box sx={{ position: 'relative', height: 6, borderRadius: 999, bgcolor: alpha('#1a5276', 0.07) }}>
                        <Box sx={{
                          position: 'absolute', left: 0, top: 0, bottom: 0,
                          width: `${p}%`, borderRadius: 999,
                          background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.7)})`,
                          transition: 'width 0.6s ease',
                        }} />
                      </Box>
                    </CardContent>
                  </Card>
                );
              })}
        </Stack>
      </Container>
    </Box>
  );
}
