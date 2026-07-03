import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  Box, Container, Typography, Card, CardContent,
  Chip, Button, Skeleton, Stack, LinearProgress, Avatar,
} from '@mui/material';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { prayerApi } from '../services/api/prayer.api';
import { PRAYER_NAMES, PRAYER_STATUS_COLORS } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import dayjs from 'dayjs';
import { PrayerName } from '../types';
import { alpha } from '@mui/material/styles';

const ARABIC_NAMES: Record<string, string> = {
  fajr: 'الفجر', dhuhr: 'الظهر', asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء',
};

export default function Dashboard() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: prayerApi.getDashboard,
  });

  const { data: streak } = useQuery({
    queryKey: ['streak'],
    queryFn: prayerApi.getStreak,
  });

  const [loadingPrayer, setLoadingPrayer] = useState<PrayerName | null>(null);

  const complete = useMutation({
    mutationFn: (prayerName: PrayerName) => prayerApi.complete({ prayerName, status: 'on_time' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['streak'] });
      setLoadingPrayer(null);
    },
    onError: () => setLoadingPrayer(null),
  });

  const todayLogs = dashboard?.today?.logs ?? [];
  const completed = dashboard?.today?.completed ?? 0;
  const progress = (completed / 5) * 100;
  const allDone = completed === 5;

  return (
    <Box>
      {/* Header banner */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #154360 0%, #1a5276 60%, #1f6f99 100%)',
          px: 2.5, pt: 2.5, pb: 2, position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Geometric pattern */}
        <Box sx={{
          position: 'absolute', inset: 0, opacity: 0.08,
          backgroundImage: `
            repeating-linear-gradient(45deg, rgba(212,172,13,1) 0 1px, transparent 1px 15px),
            repeating-linear-gradient(-45deg, rgba(212,172,13,1) 0 1px, transparent 1px 15px)
          `,
        }} />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography sx={{ color: 'rgba(255,255,255,0.65)', fontSize: 11, fontWeight: 500, mb: 0.5 }}>
            {dayjs().format('dddd, MMMM D')}
          </Typography>
          <Typography sx={{ color: '#fff', fontSize: 18, fontWeight: 800, letterSpacing: '-0.3px' }}>
            As-salamu alaykum{user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋
          </Typography>
        </Box>
      </Box>

      <Container maxWidth="sm" sx={{ mt: 2, pb: 2 }}>
        {/* Progress card */}
        <Card sx={{ mb: 2, overflow: 'hidden' }}>
          <CardContent sx={{ p: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 13, color: 'text.primary' }}>
                  Today's Prayers
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {allDone ? '🎉 All prayers completed!' : `${5 - completed} remaining`}
                </Typography>
              </Box>
              <Avatar
                sx={{
                  width: 48, height: 48,
                  background: allDone
                    ? 'linear-gradient(135deg, #1e8449, #27ae60)'
                    : 'linear-gradient(135deg, #154360, #1a5276)',
                  fontWeight: 800, fontSize: 16,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {completed}/5
              </Avatar>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 8, borderRadius: 999,
                bgcolor: alpha('#1a5276', 0.08),
                '& .MuiLinearProgress-bar': {
                  background: allDone
                    ? 'linear-gradient(90deg, #1e8449, #27ae60)'
                    : 'linear-gradient(90deg, #1f6f99, #1a5276)',
                },
              }}
            />
          </CardContent>
        </Card>

        {/* Streak card */}
        <Card
          sx={{
            mb: 2, overflow: 'hidden',
            background: 'linear-gradient(135deg, #154360 0%, #1a5276 100%)',
            position: 'relative',
          }}
        >
          <Box sx={{
            position: 'absolute', inset: 0, opacity: 0.1,
            backgroundImage: `repeating-linear-gradient(45deg, rgba(212,172,13,1) 0 1px, transparent 1px 15px)`,
          }} />
          <CardContent sx={{ p: 2.5, position: 'relative', zIndex: 1 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box sx={{
                  width: 48, height: 48, borderRadius: 3,
                  bgcolor: alpha('#d4ac0d', 0.15),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <LocalFireDepartmentIcon sx={{ color: '#d4ac0d', fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography sx={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, fontWeight: 500 }}>
                    Current Streak
                  </Typography>
                  <Typography sx={{ color: '#fff', fontSize: 24, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.5px' }}>
                    {isLoading ? '–' : streak?.currentStreak ?? 0}
                    <Typography component="span" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: 500, ml: 0.5 }}>
                      days
                    </Typography>
                  </Typography>
                </Box>
              </Stack>
              <Stack alignItems="flex-end">
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <EmojiEventsIcon sx={{ color: '#d4ac0d', fontSize: 16 }} />
                  <Typography sx={{ color: '#d4ac0d', fontSize: 12, fontWeight: 700 }}>
                    Best: {streak?.longestStreak ?? 0}d
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* Prayer list */}
        <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'text.primary', mb: 1.5, px: 0.5 }}>
          Mark Today's Prayers
        </Typography>
        <Stack spacing={1.5}>
          {isLoading
            ? Array(5).fill(0).map((_, i) => <Skeleton key={i} variant="rounded" height={72} sx={{ borderRadius: 2 }} />)
            : PRAYER_NAMES.map(({ key, label }) => {
                const log = todayLogs.find(l => l.prayerName === key);
                const isDone = !!log && log.status !== 'missed';
                const statusColor = log ? PRAYER_STATUS_COLORS[log.status] : undefined;

                return (
                  <Card
                    key={key}
                    sx={{
                      border: '1px solid',
                      borderColor: isDone ? alpha(statusColor!, 0.2) : 'rgba(26,82,118,0.08)',
                      bgcolor: isDone ? alpha(statusColor!, 0.04) : 'white',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <CardContent sx={{ py: 1.75, px: 2.5, '&:last-child': { pb: 1.75 } }}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Box sx={{
                            width: 40, height: 40, borderRadius: 2,
                            bgcolor: isDone ? alpha(statusColor!, 0.12) : alpha('#1a5276', 0.06),
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {isDone
                              ? <CheckCircleIcon sx={{ color: statusColor, fontSize: 22 }} />
                              : <RadioButtonUncheckedIcon sx={{ color: '#b0bec5', fontSize: 22 }} />
                            }
                          </Box>
                          <Box>
                            <Typography sx={{ fontWeight: 700, fontSize: 13, color: 'text.primary', lineHeight: 1.2 }}>
                              {label}
                            </Typography>
                            <Typography sx={{
                              fontFamily: "'Noto Naskh Arabic', serif",
                              fontSize: 14, color: 'text.secondary',
                              lineHeight: 1.4, mt: 0.2,
                            }}>
                              {ARABIC_NAMES[key]}
                            </Typography>
                          </Box>
                        </Stack>

                        {isDone ? (
                          <Chip
                            label={log.status.replace('_', ' ')}
                            size="small"
                            sx={{
                              bgcolor: statusColor, color: 'white',
                              fontWeight: 700, fontSize: 11,
                            }}
                          />
                        ) : (
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => { setLoadingPrayer(key); complete.mutate(key); }}
                            disabled={loadingPrayer === key}
                            sx={{
                              borderRadius: 2, fontSize: 13, fontWeight: 600,
                              px: 2, py: 0.75, minWidth: 72,
                            }}
                          >
                            Done
                          </Button>
                        )}
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
