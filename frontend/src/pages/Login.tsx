import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Card, CardContent, TextField, Button, Typography,
  Link, Alert, Box, CircularProgress, Stack,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import { alpha } from '@mui/material/styles';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});
type FormData = z.infer<typeof schema>;

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      setError('');
      await login(data.email, data.password);
      navigate('/');
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 401) {
        setError('no-account');
      } else {
        setError('Something went wrong. Please try again.');
      }
    }
  };

  return (
    <Card sx={{ overflow: 'hidden' }}>
      {/* Card header stripe */}
      <Box sx={{
        background: 'linear-gradient(135deg, #154360 0%, #1a5276 100%)',
        px: 3, py: 3, position: 'relative', overflow: 'hidden',
      }}>
        <Box sx={{
          position: 'absolute', inset: 0, opacity: 0.1,
          backgroundImage: `repeating-linear-gradient(45deg, rgba(212,172,13,1) 0 1px, transparent 1px 15px)`,
        }} />
        <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: 20, position: 'relative', zIndex: 1 }}>
          Welcome back
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, position: 'relative', zIndex: 1, mt: 0.25 }}>
          Sign in to your account
        </Typography>
      </Box>

      <CardContent sx={{ p: 3 }}>
        {error === 'no-account' && (
          <Alert
            severity="warning"
            sx={{ mb: 2, borderRadius: 2, fontSize: 13 }}
            action={
              <Button
                color="inherit"
                size="small"
                sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}
                onClick={() => navigate('/register')}
              >
                Sign up
              </Button>
            }
          >
            No account found. Create one?
          </Alert>
        )}
        {error && error !== 'no-account' && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2, fontSize: 13 }}>{error}</Alert>
        )}
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2}>
            <TextField
              label="Email address"
              type="email"
              fullWidth
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={isSubmitting}
              sx={{ py: 1.5, fontSize: 15 }}
              startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : null}
            >
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </Stack>
        </Box>

        <Box sx={{ mt: 2.5, pt: 2.5, borderTop: `1px solid ${alpha('#1a5276', 0.08)}`, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Don't have an account?{' '}
            <Link component={RouterLink} to="/register" sx={{ fontWeight: 700, color: '#1a5276' }}>
              Create account
            </Link>
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
