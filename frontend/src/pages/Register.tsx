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
  name: z.string().min(2, 'At least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'At least 8 characters'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});
type FormData = z.infer<typeof schema>;

export default function Register() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      setError('');
      await registerUser({ name: data.name, email: data.email, password: data.password });
      navigate('/');
    } catch {
      setError('Registration failed. Email may already be in use.');
    }
  };

  return (
    <Card sx={{ overflow: 'hidden' }}>
      <Box sx={{
        background: 'linear-gradient(135deg, #154360 0%, #1a5276 100%)',
        px: 3, py: 3, position: 'relative', overflow: 'hidden',
      }}>
        <Box sx={{
          position: 'absolute', inset: 0, opacity: 0.1,
          backgroundImage: `repeating-linear-gradient(45deg, rgba(212,172,13,1) 0 1px, transparent 1px 15px)`,
        }} />
        <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: 20, position: 'relative', zIndex: 1 }}>
          Create account
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, position: 'relative', zIndex: 1, mt: 0.25 }}>
          Start tracking your Salah today
        </Typography>
      </Box>

      <CardContent sx={{ p: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2, fontSize: 13 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2}>
            <TextField label="Full name" fullWidth {...register('name')} error={!!errors.name} helperText={errors.name?.message} />
            <TextField label="Email address" type="email" fullWidth {...register('email')} error={!!errors.email} helperText={errors.email?.message} />
            <TextField label="Password" type="password" fullWidth {...register('password')} error={!!errors.password} helperText={errors.password?.message} />
            <TextField label="Confirm password" type="password" fullWidth {...register('confirmPassword')} error={!!errors.confirmPassword} helperText={errors.confirmPassword?.message} />
            <Button
              type="submit" variant="contained" fullWidth size="large"
              disabled={isSubmitting} sx={{ py: 1.5, fontSize: 15 }}
              startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : null}
            >
              {isSubmitting ? 'Creating account…' : 'Create account'}
            </Button>
          </Stack>
        </Box>

        <Box sx={{ mt: 2.5, pt: 2.5, borderTop: `1px solid ${alpha('#1a5276', 0.08)}`, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?{' '}
            <Link component={RouterLink} to="/login" sx={{ fontWeight: 700, color: '#1a5276' }}>
              Sign in
            </Link>
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
