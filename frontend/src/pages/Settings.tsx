import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Container, Typography, Card, CardContent, TextField,
  Button, MenuItem, Stack, Alert, Divider, Box,
  Dialog, DialogContent, DialogActions,
  IconButton, Tooltip, CircularProgress, Snackbar, Switch,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { userApi } from '../services/api/user.api';
import { notificationApi, NotificationPref } from '../services/api/notification.api';
import { usePushSubscription } from '../hooks/usePushSubscription';
import { useAuth } from '../contexts/AuthContext';
import { CALCULATION_METHODS, MADHABS } from '../constants';
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { alpha } from '@mui/material/styles';

const schema = z.object({
  name: z.string().min(2).optional(),
  timezone: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  calculationMethod: z.enum(['MWL', 'ISNA', 'Egypt', 'Makkah', 'Karachi', 'Tehran', 'Jafari']).optional(),
  madhab: z.enum(['Hanafi', 'Shafi']).optional(),
});
type FormData = z.infer<typeof schema>;

interface DetectedCoords { lat: number; lng: number; timezone: string; }

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      bgcolor: alpha('#1a5276', 0.05), borderRadius: 2,
      border: '1px solid', borderColor: alpha('#1a5276', 0.12),
      px: 2, py: 1.25,
    }}>
      <Box>
        <Typography variant="caption" color="text.secondary" fontWeight={600}>{label}</Typography>
        <Typography fontWeight={700} fontSize={16} sx={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '0.5px' }}>
          {value}
        </Typography>
      </Box>
      <Tooltip title={copied ? 'Copied!' : 'Copy'}>
        <IconButton size="small" onClick={copy} sx={{ color: copied ? 'success.main' : 'primary.main' }}>
          {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
        </IconButton>
      </Tooltip>
    </Box>
  );
}

export default function Settings() {
  const { user, logout, refreshUser } = useAuth();
  const qc = useQueryClient();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [detecting, setDetecting] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [coords, setCoords] = useState<DetectedCoords | null>(null);
  const [snackbar, setSnackbar] = useState('');
  const [notifPrefs, setNotifPrefs] = useState<NotificationPref[]>([]);
  const [savingNotifs, setSavingNotifs] = useState(false);

  // Trigger push subscription when user has at least one enabled alarm
  const hasEnabledPrefs = notifPrefs.some(p => p.enabled);
  const { status: pushStatus } = usePushSubscription(hasEnabledPrefs);

  const { data: fetchedNotifPrefs } = useQuery({
    queryKey: ['notificationPrefs'],
    queryFn: notificationApi.getPrefs,
  });

  useEffect(() => {
    if (fetchedNotifPrefs) setNotifPrefs(fetchedNotifPrefs);
  }, [fetchedNotifPrefs]);

  const { register, handleSubmit, control, setValue, watch, reset, formState: { isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name ?? '',
      timezone: user?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
      latitude: user?.latitude ?? undefined,
      longitude: user?.longitude ?? undefined,
      calculationMethod: user?.calculationMethod ?? 'MWL',
      madhab: user?.madhab ?? 'Hanafi',
    },
  });

  const latValue = watch('latitude');
  const lngValue = watch('longitude');
  const tzValue = watch('timezone');

  const onSubmit = async (data: FormData) => {
    try {
      setError('');
      await userApi.updateProfile(data);
      await refreshUser();
      reset(data);
      qc.invalidateQueries({ queryKey: ['prayers'] });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError('Failed to save settings');
    }
  };

  const handleSaveNotifs = async () => {
    setSavingNotifs(true);
    try {
      const updated = await notificationApi.updatePrefs(
        notifPrefs.map(p => ({ prayerName: p.prayerName, enabled: p.enabled, offsetMinutes: p.offsetMinutes }))
      );
      setNotifPrefs(updated);
      qc.invalidateQueries({ queryKey: ['notificationPrefs'] });
      setSnackbar('Notification preferences saved!');
    } catch {
      setSnackbar('Failed to save notification preferences');
    } finally {
      setSavingNotifs(false);
    }
  };

  const handleDetectLocation = () => {
    setDetecting(true);
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        setCoords({
          lat: parseFloat(pos.coords.latitude.toFixed(6)),
          lng: parseFloat(pos.coords.longitude.toFixed(6)),
          timezone,
        });
        setDetecting(false);
      },
      (err) => {
        setDetecting(false);
        setLocationError(
          err.code === 1
            ? 'Location permission denied. Please allow location access in your browser.'
            : 'Could not detect location. Please enter coordinates manually.'
        );
      },
      { timeout: 10000 }
    );
  };

  const handleApplyCoords = () => {
    if (!coords) return;
    setValue('latitude', coords.lat);
    setValue('longitude', coords.lng);
    setValue('timezone', coords.timezone);
    setCoords(null);
    setSnackbar('Location applied! Save settings to confirm.');
  };

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
            Preferences
          </Typography>
          <Typography sx={{ color: '#fff', fontSize: 18, fontWeight: 800, letterSpacing: '-0.3px' }}>
            Settings
          </Typography>
        </Box>
      </Box>

      <Container maxWidth="sm" sx={{ mt: 2 }}>
        {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>Settings saved!</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
        {locationError && <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>{locationError}</Alert>}

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          {/* Profile */}
          <Card sx={{ mb: 2 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography fontWeight={700} fontSize={13} mb={2}>Profile</Typography>
              <Stack spacing={2}>
                <TextField label="Full name" fullWidth {...register('name')} />
                <TextField label="Email" fullWidth value={user?.email ?? ''} disabled />
              </Stack>
            </CardContent>
          </Card>

          {/* Location */}
          <Card sx={{ mb: 2 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Box>
                  <Typography fontWeight={700} fontSize={13}>Location</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Required for accurate prayer times
                  </Typography>
                </Box>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={detecting
                    ? <CircularProgress size={14} color="inherit" />
                    : <MyLocationIcon fontSize="small" />
                  }
                  onClick={handleDetectLocation}
                  disabled={detecting}
                  sx={{ borderRadius: 2, fontWeight: 600 }}
                >
                  {detecting ? 'Detecting…' : 'Detect'}
                </Button>
              </Stack>
              <Stack spacing={2}>
                <TextField
                  label="Timezone"
                  fullWidth
                  {...register('timezone')}
                  InputLabelProps={{ shrink: !!tzValue }}
                />
                <Stack direction="row" spacing={2}>
                  <TextField
                    label="Latitude"
                    type="number"
                    fullWidth
                    {...register('latitude', { valueAsNumber: true })}
                    inputProps={{ step: 'any' }}
                    InputLabelProps={{ shrink: latValue !== undefined && !isNaN(latValue) }}
                  />
                  <TextField
                    label="Longitude"
                    type="number"
                    fullWidth
                    {...register('longitude', { valueAsNumber: true })}
                    inputProps={{ step: 'any' }}
                    InputLabelProps={{ shrink: lngValue !== undefined && !isNaN(lngValue) }}
                  />
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          {/* Calculation */}
          <Card sx={{ mb: 2 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography fontWeight={700} fontSize={13} mb={2}>Calculation Method</Typography>
              <Stack spacing={2}>
                <Controller
                  name="calculationMethod"
                  control={control}
                  render={({ field }) => (
                    <TextField select label="Method" fullWidth {...field}>
                      {CALCULATION_METHODS.map(m => (
                        <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                      ))}
                    </TextField>
                  )}
                />
                <Controller
                  name="madhab"
                  control={control}
                  render={({ field }) => (
                    <TextField select label="Madhab (Asr time)" fullWidth {...field}>
                      {MADHABS.map(m => (
                        <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Stack>
            </CardContent>
          </Card>

          <Button type="submit" variant="contained" fullWidth size="large" disabled={isSubmitting}
            sx={{ py: 1.5, fontSize: 15, mb: 2 }}>
            {isSubmitting ? <CircularProgress size={20} color="inherit" /> : 'Save Settings'}
          </Button>
        </Box>

        {/* Notifications */}
        <Card sx={{ mb: 2 }}>
          <CardContent sx={{ p: 2.5 }}>
            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
              <NotificationsIcon sx={{ color: '#1a5276', fontSize: 20 }} />
              <Box flex={1}>
                <Typography fontWeight={700} fontSize={13}>Prayer Alarms</Typography>
                <Typography variant="caption" color="text.secondary">
                  {pushStatus === 'subscribed'  && '✅ Push notifications active — works when app is closed'}
                  {pushStatus === 'denied'       && '🚫 Notifications blocked — enable in browser settings'}
                  {pushStatus === 'unsupported'  && '⚠️ Push not supported on this browser'}
                  {pushStatus === 'subscribing'  && '⏳ Requesting notification permission…'}
                  {(pushStatus === 'idle')       && 'Get notified before, at, or after each prayer time'}
                </Typography>
              </Box>
            </Stack>

            <Stack spacing={1.5}>
              {(['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const).map(prayerName => {
                const pref = notifPrefs.find(p => p.prayerName === prayerName);
                const enabled = pref?.enabled ?? false;
                const offset = pref?.offsetMinutes ?? 0;

                const ARABIC: Record<string, string> = {
                  fajr: 'الفجر', dhuhr: 'الظهر', asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء',
                };
                const LABEL: Record<string, string> = {
                  fajr: 'Fajr', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha',
                };

                const updatePref = (field: 'enabled' | 'offsetMinutes', value: boolean | number) => {
                  setNotifPrefs(prev => {
                    const existing = prev.find(p => p.prayerName === prayerName);
                    if (existing) {
                      return prev.map(p => p.prayerName === prayerName ? { ...p, [field]: value } : p);
                    }
                    return [...prev, { id: '', prayerName, enabled: false, offsetMinutes: 0, [field]: value }];
                  });
                };

                return (
                  <Box key={prayerName} sx={{
                    border: '1px solid',
                    borderColor: enabled ? alpha('#1a5276', 0.2) : alpha('#1a5276', 0.08),
                    borderRadius: 2, px: 2, py: 1.25,
                    bgcolor: enabled ? alpha('#1a5276', 0.03) : 'transparent',
                  }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Switch
                          size="small"
                          checked={enabled}
                          onChange={e => updatePref('enabled', e.target.checked)}
                          sx={{ '& .MuiSwitch-thumb': { width: 14, height: 14 } }}
                        />
                        <Box>
                          <Typography fontWeight={700} fontSize={13} lineHeight={1.2}>{LABEL[prayerName]}</Typography>
                          <Typography sx={{ fontFamily: "'Noto Naskh Arabic', serif", fontSize: 12, color: 'text.secondary' }}>
                            {ARABIC[prayerName]}
                          </Typography>
                        </Box>
                      </Stack>

                      <TextField
                        select
                        size="small"
                        disabled={!enabled}
                        value={offset}
                        onChange={e => updatePref('offsetMinutes', Number(e.target.value))}
                        sx={{ width: 130, '& .MuiInputBase-root': { fontSize: 12 } }}
                      >
                        <MenuItem value={-10}>10 min before</MenuItem>
                        <MenuItem value={-5}>5 min before</MenuItem>
                        <MenuItem value={-2}>2 min before</MenuItem>
                        <MenuItem value={0}>At prayer time</MenuItem>
                        <MenuItem value={2}>2 min after</MenuItem>
                        <MenuItem value={5}>5 min after</MenuItem>
                        <MenuItem value={10}>10 min after</MenuItem>
                      </TextField>
                    </Stack>
                  </Box>
                );
              })}
            </Stack>

            <Button
              variant="outlined"
              fullWidth
              onClick={handleSaveNotifs}
              disabled={savingNotifs}
              sx={{ mt: 2, borderRadius: 2, fontWeight: 600 }}
            >
              {savingNotifs ? <CircularProgress size={16} color="inherit" /> : 'Save Alarm Settings'}
            </Button>
          </CardContent>
        </Card>

        <Divider sx={{ my: 2 }} />

        <Button variant="outlined" color="error" fullWidth startIcon={<LogoutIcon />} onClick={logout}
          sx={{ py: 1.25 }}>
          Sign out
        </Button>
      </Container>

      {/* Location detected dialog */}
      <Dialog
        open={!!coords}
        onClose={() => setCoords(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
      >
        <Box sx={{
          background: 'linear-gradient(135deg, #154360 0%, #1a5276 100%)',
          px: 3, py: 2.5, position: 'relative', overflow: 'hidden',
        }}>
          <Box sx={{
            position: 'absolute', inset: 0, opacity: 0.1,
            backgroundImage: `repeating-linear-gradient(45deg, rgba(212,172,13,1) 0 1px, transparent 1px 15px)`,
          }} />
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ position: 'relative', zIndex: 1 }}>
            <MyLocationIcon sx={{ color: '#d4ac0d' }} />
            <Box>
              <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>Location Detected</Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.65)', fontSize: 12 }}>
                Copy or apply to your settings
              </Typography>
            </Box>
          </Stack>
        </Box>

        <DialogContent sx={{ p: 2.5 }}>
          <Stack spacing={1.5}>
            <CopyField label="Latitude" value={coords?.lat.toString() ?? ''} />
            <CopyField label="Longitude" value={coords?.lng.toString() ?? ''} />
            <CopyField label="Timezone" value={coords?.timezone ?? ''} />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 2.5, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setCoords(null)} variant="outlined" sx={{ flex: 1, borderRadius: 2 }}>
            Cancel
          </Button>
          <Button onClick={handleApplyCoords} variant="contained" sx={{ flex: 1, borderRadius: 2, fontSize: 13, whiteSpace: 'nowrap' }}>
            Apply to form
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success snackbar */}
      <Snackbar
        open={!!snackbar}
        autoHideDuration={3000}
        onClose={() => setSnackbar('')}
        message={snackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}
